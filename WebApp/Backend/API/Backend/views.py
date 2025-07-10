from rest_framework.decorators import api_view
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.db import DatabaseError
import traceback
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from django.db.models import Sum
from django.db.models.functions import TruncMonth
import logging
from collections import defaultdict
from django.shortcuts import get_object_or_404
from django.db.models.functions import ExtractYear, ExtractMonth
from django.http import Http404
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from django.utils import timezone
import json


logger = logging.getLogger(__name__)

JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600  # 1 hora

#Done and tested
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email e password são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

    if password != user.password:
        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

    # Identificar o tipo de utilizador
    user_type = None
    company_type = None

    if hasattr(user, 'company'):
        user_type = 'Company'
        #query company where user = user
        try:
            company = Company.objects.get(user=user)
        except Company.DoesNotExist:
            return Response({'error': 'Empresa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        if company.type == 'producer':
            company_type = 'Producer'
        elif company.type == 'manufacturer':
            company_type = 'Manufacturer'
        elif company.type == 'seller':
            company_type = 'Seller'
        elif company.type == 'mixed':
            company_type = 'Mixed'

    elif hasattr(user, 'regulator'):
        user_type = 'Regulator'
    elif hasattr(user, 'policy_maker'):
        user_type = 'PolicyMaker'
    else:
        user_type = 'Unknown'

    # Criar token manualmente
    payload = {
        'user_id': user.id,
        'user_type': user_type,
        'company_type': company_type if user_type == 'Company' else None,
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return Response({
        'token': token,
        'user_id': user.id,
        'user_type': user_type,
        'company_type': company_type if user_type == 'Company' else None,
    }, status=status.HTTP_200_OK)

# View to get the list of All Companies
#Done and tested
@api_view(['GET'])
def get_all_companies(request):
    try:
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Ocorreu um erro inesperado.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get a Company by ID
@api_view(['GET'])
def get_company_by_id(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Company.DoesNotExist:
        return Response({'error': 'Empresa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar a empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# get company by user_id
@api_view(['GET'])
def get_company_by_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        company = Company.objects.get(user=user)
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    except Company.DoesNotExist:
        return Response({'error': 'Empresa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar a empresa do utilizador.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get the details of a company 
@api_view(['GET'])
def get_company_details(request, company_id):
    # this function must return the company details such as name, location, total energy consumption, total water consumption and ecological footprint calculated based on the informations we have stored
    try:
        company = Company.objects.get(id=company_id)
        serializer = CompanySerializer(company)

        # Calculate total energy consumption, total water consumption and ecological footprint
        # there are no fields in Company Model with this info so we will calculate the energy and water consumption based on the processes used in the company
        processes = Process.objects.filter(process_type__manufacturer=company)
        total_energy_consumption = sum(process.energy_consumption for process in processes)
        total_water_consumption = sum(process.water_consumption for process in processes)
        # calculate the ecological footprint in gha
        ecological_footprint = (total_energy_consumption + total_water_consumption) / 1000  # Example calculation, adjust as needed

        return Response({
            'company_details': serializer.data,
            'total_energy_consumption': total_energy_consumption,
            'total_water_consumption': total_water_consumption,
            'ecological_footprint': ecological_footprint
        }, status=status.HTTP_200_OK)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os detalhes da empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to list all employees of a company
@api_view(['GET'])
def list_employees(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar a empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        employees = Employee.objects.filter(company=company)
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao obter os funcionários.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao listar os funcionários.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get a specific employee by ID
@api_view(['GET'])
def get_employee_by_id(request, employee_id):
    try:
        employee = Employee.objects.get(id=employee_id)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar o funcionário.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to count the number of employees in a company (give the total number of employees and the number of employees of each gender)
@api_view(['GET'])
def count_employees(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar a empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    try:
        employees = Employee.objects.filter(company=company)
        total_employees = employees.count()

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao obter os funcionários.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao contar os funcionários.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    # Count the number of employees
    male_employees = employees.filter(gender='Male').count()
    female_employees = employees.filter(gender='Female').count()

    return Response({
        'total_employees': total_employees,
        'male_employees': male_employees,
        'female_employees': female_employees
    }, status=status.HTTP_200_OK)

# View to get the list of Employees used in a specific process
@api_view(['GET'])
def get_employees_by_process(request, process_id):
    try:
        process = Process.objects.get(id=process_id)
    except Process.DoesNotExist:
        return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        employee_processes = EmployeeProcessList.objects.filter(process=process)
        employees = [ep.employee for ep in employee_processes]

        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os funcionários do processo.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

#View to get all list of Certifications
@api_view(['GET'])
def get_all_certifications(request):
    try:
        certifications = Certification.objects.all()
        serializer = CertificationSerializer(certifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar as certificações.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

# View get the Audits of a Company and the Certifications of a Company
@api_view(['GET'])
def get_company_audits_and_certifications(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        audits = Audit.objects.filter(company=company)
        certifications = CompanyCertificationsList.objects.filter(company=company)

        # search the Certifications model by certification_id in the certifications queryset
        certification_ids = certifications.values_list('certification_id', flat=True)
        certifications = Certification.objects.filter(id__in=certification_ids)


        audit_serializer = AuditSerializer(audits, many=True)
        certification_serializer = CertificationSerializer(certifications, many=True)

        return Response({
            'audits': audit_serializer.data,
            'certifications': certification_serializer.data
        }, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os dados da empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get all the active certifications of a company
@api_view(['GET'])
def get_active_certifications(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        certifications = CompanyCertificationsList.objects.filter(company=company)

        # search the Certifications model by certification_id in the certifications queryset evaluating the end_date (if end_date = Null then the certification is active)
        certification_ids = certifications.values_list('certification_id', flat=True)
        active_certifications = CompanyCertificationsList.objects.filter(id__in=certification_ids, end_date__isnull=True)

        serializer = CompanyCertificationsListSerializer(active_certifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar as certificações ativas da empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# View to get all processes of a company
@api_view(['GET'])
def get_all_processes(request, company_id):
    # Get all the process types of a company and then get all the processes of those process types
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar a empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    try:
        process_types = ProcessType.objects.filter(manufacturer=company)
        processes = Process.objects.filter(process_type__in=process_types)

        process_serializer = ProcessSerializer(processes, many=True)
        return Response(process_serializer.data, status=status.HTTP_200_OK)
    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder aos processos.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os processos.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get all the processes of a company by process type
@api_view(['GET'])
def get_processes_by_type(request, company_id, process_type_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar a empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        process_type = ProcessType.objects.get(id=process_type_id, manufacturer=company)
        processes = Process.objects.filter(process_type=process_type)

        process_serializer = ProcessSerializer(processes, many=True)
        return Response(process_serializer.data, status=status.HTTP_200_OK)

    except ProcessType.DoesNotExist:
        return Response({'error': 'Process type not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder aos processos.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os processos.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )       
    
# View to get all the RawProductUsage by process
@api_view(['GET'])
def get_raw_product_usage_by_process(request, process_id):
    try:
        process = Process.objects.get(id=process_id)
        raw_product_usages = RawProductUsage.objects.filter(process=process)

        serializer = RawProductUsageSerializer(raw_product_usages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Process.DoesNotExist:
        return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os dados do processo.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )    

# View to get all the processes of a product
@api_view(['GET'])
def get_processes_by_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        product_processes = ProductProcessList.objects.filter(product=product)

        processes = [pp.process for pp in product_processes]
        serializer = ProcessSerializer(processes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os processos do produto.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get the machina details of a process
@api_view(['GET'])
def get_machine_details_by_process(request, process_id):
    try:
        process = Process.objects.get(id=process_id)
        machine_processes = MachineProcessList.objects.filter(process=process)

        # get the IoTNodes associated with the machines in the machine_processes, then get the IoTNodeParameters of each IoTNodes and finally get the MachineDetails of each IoTNodeParameters
        machines = [mp.machine for mp in machine_processes]
        machine_details = []
        for machine in machines:
            iot_nodes = IoTNode.objects.filter(machine=machine)
            for iot_node in iot_nodes:
                iot_node_parameters = IoTNodeParameter.objects.filter(iot_node=iot_node)
                for parameter in iot_node_parameters:
                    try:
                        details = MachineDetails.objects.get(parameter=parameter)
                        machine_details.append(details)
                    except MachineDetails.DoesNotExist:
                        continue  # Skip if no details found for this parameter
        serializer = MachineDetailsSerializer(machine_details, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Process.DoesNotExist:
        return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os detalhes da máquina.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get the list of alerts for all IoTNodeParameters/IoTNodes of a process
@api_view(['GET'])
def get_alerts_by_process(request, process_id):
    try:
        process = Process.objects.get(id=process_id)
        machine_processes = MachineProcessList.objects.filter(process=process)

        # get the IoTNodes associated with the machines in the machine_processes, then get the IoTNodeParameters of each IoTNodes and finally get the Alerts of each IoTNodeParameters
        machines = [mp.machine for mp in machine_processes]
        alerts = []
        for machine in machines:
            iot_nodes = IoTNode.objects.filter(machine=machine)
            for iot_node in iot_nodes:
                iot_node_parameters = IoTNodeParameter.objects.filter(iot_node=iot_node)
                for parameter in iot_node_parameters:
                    parameter_alerts = Alert.objects.filter(parameter=parameter)
                    alerts.extend(parameter_alerts)

        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Process.DoesNotExist:
        return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os alertas.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View that verifies which alerts are triggered (example temperature is out of the range defined in the Alert model for that Parameter) and returns the list of triggered alerts
# restrict to a specific process
@api_view(['GET'])
def get_triggered_alerts_by_process(request, process_id):
    try:
        process = Process.objects.get(id=process_id)
        machine_processes = MachineProcessList.objects.filter(process=process)

        triggered_alerts = []
        for machine_process in machine_processes:
            iot_nodes = IoTNode.objects.filter(machine=machine_process.machine)
            for iot_node in iot_nodes:
                iot_node_parameters = IoTNodeParameter.objects.filter(iot_node=iot_node)
                for parameter in iot_node_parameters:
                    alerts = Alert.objects.filter(parameter=parameter)

                    #check if the last value of the parameter is outside the range defined in the Alert model
                    if alerts.exists():
                        last_value = parameter.last_value
                        if last_value is not None:
                            for alert in alerts:
                                if alert.min_value is not None and last_value < alert.min_value:
                                    triggered_alerts.append(alert)
                                elif alert.max_value is not None and last_value > alert.max_value:
                                    triggered_alerts.append(alert)

        # Remove duplicates from triggered_alerts
        triggered_alerts = list({alert.id: alert for alert in triggered_alerts}.values())
        # Serialize the triggered alerts
        if not triggered_alerts:
            return Response({'message': 'No triggered alerts found for this process'}, status=status.HTTP_200_OK)

        serializer = AlertSerializer(triggered_alerts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Process.DoesNotExist:
        return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os alertas acionados.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# View to get the list of all Products of a Company
@api_view(['GET'])
def get_all_products(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        products = Product.objects.filter(company=company)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os produtos da empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# View to get the list of all Product Certifications of a given Company
@api_view(['GET'])
def get_product_certifications(request, company_id):
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        # get the list of Products of the Company through ProductType
        product_types = ProductType.objects.filter(manufacturer=company)
        products = Product.objects.filter(product_type__in=product_types)
        product_certifications = ProductCertificationList.objects.filter(product__in=products)

        serializer = ProductCertificationListSerializer(product_certifications, many=True)

        if not serializer.data:
            return Response({'message': 'No product certifications found for this company'}, status=status.HTTP_200_OK)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar as certificações dos produtos da empresa.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def dashboard_summary(request):
    try:
        meses_pt = ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

        # Summary
        producers = Company.objects.filter(type='producer').count()
        manufacturers = Company.objects.filter(type='manufacturer').count()
        sellers = Company.objects.filter(type='seller').count()
        companies = producers + manufacturers + sellers

        jobs = Employee.objects.count()
        femaleEmployees = Employee.objects.filter(gender__iexact='female').count()
        maleEmployees = Employee.objects.filter(gender__iexact='male').count()

        water = int(Process.objects.aggregate(total=Sum('water_consumption'))['total'] or 0)
        energy = int(Process.objects.aggregate(total=Sum('energy_consumption'))['total'] or 0)
        footprint = int(Process.objects.aggregate(total=Sum('waste_generation'))['total'] or 0)
        revenue = int(Product.objects.filter(status='sold').aggregate(total=Sum('price'))['total'] or 0)

        summary = {
            "empresas": companies,
            "postos de trabalho": jobs,
            "female Employees": femaleEmployees,
            "male Employees": maleEmployees,
            "água consumida": water,
            "energia consumida": energy,
            "Resíduos gerados": footprint,
            "receita gerada": revenue,
        }

        # --- Timeline de empregos e receita agrupada por ano ---
        timeline_by_year = defaultdict(lambda: [ {'month': meses_pt[i], 'jobs': 0, 'revenue': 0, 'female': 0, 'male': 0} for i in range(12) ])
        sold_products = Product.objects.filter(status='sold')

        for emp in Employee.objects.prefetch_related('processes__process'):
            for proc in emp.processes.all():
                if proc.process and proc.process.start_date:
                    ano = proc.process.start_date.year
                    mes = proc.process.start_date.month - 1
                    timeline_by_year[ano][mes]['jobs'] += 1
                    if emp.gender.lower() == 'female':
                        timeline_by_year[ano][mes]['female'] += 1
                    elif emp.gender.lower() == 'male':
                        timeline_by_year[ano][mes]['male'] += 1

        for prod in sold_products:
            if prod.sell_date:
                ano = prod.sell_date.year
                mes = prod.sell_date.month - 1
                timeline_by_year[ano][mes]['revenue'] += int(prod.price or 0)

        timeline = [{'year': ano, 'data': dados} for ano, dados in sorted(timeline_by_year.items())]

        # --- Resource Consumption por ano/mês ---
        processes = Process.objects.annotate(month=TruncMonth('start_date'))
        resource_by_month = processes.values('month').annotate(
            total_water=Sum('water_consumption'),
            total_energy=Sum('energy_consumption')
        )

        resource_by_year = defaultdict(lambda: [ {'month': meses_pt[i], 'water': 0, 'energy': 0} for i in range(12) ])
        for row in resource_by_month:
            mes = row['month']
            if mes:
                ano = mes.year
                idx = mes.month - 1
                resource_by_year[ano][idx]['water'] = int(row['total_water'] or 0)
                resource_by_year[ano][idx]['energy'] = int(row['total_energy'] or 0)

        resourceConsumption = [
            {'year': ano, 'data': dados}
            for ano, dados in sorted(resource_by_year.items())
        ]

        # --- Company Distribution ---
        companyDistribution = [
            {"name": "Produtores", "value": producers},
            {"name": "Queijarias", "value": manufacturers},
            {"name": "Vendedores", "value": sellers},
        ]

        # --- Eco Footprint Timeline por ano/mês ---
        processes_by_month = processes.values('month').annotate(
            total_waste=Sum('waste_generation')
        )

        eco_by_year = defaultdict(lambda: [ {'month': meses_pt[i], 'footprint': 0} for i in range(12) ])
        for row in processes_by_month:
            mes = row['month']
            if mes:
                ano = mes.year
                idx = mes.month - 1
                eco_by_year[ano][idx]['footprint'] = int(row['total_waste'] or 0)

        ecoFootprintTimeline = [
            {'year': ano, 'data': dados}
            for ano, dados in sorted(eco_by_year.items())
        ]

        # --- Eco By Company ---
        ecoByCompany = [
            {
                "name": "Produtores",
                "value": int(Process.objects.filter(
                    process_type__manufacturer__type='producer'
                ).aggregate(total=Sum('waste_generation'))['total'] or 0)
            },
            {
                "name": "Queijarias",
                "value": int(Process.objects.filter(
                    process_type__manufacturer__type='manufacturer'
                ).aggregate(total=Sum('waste_generation'))['total'] or 0)
            },
            {
                "name": "Vendedores",
                "value": int(Process.objects.filter(
                    process_type__manufacturer__type='seller'
                ).aggregate(total=Sum('waste_generation'))['total'] or 0)
            }
        ]

        return Response({
            "summary": summary,
            "timeline": timeline,
            "resourceConsumption": resourceConsumption,
            "companyDistribution": companyDistribution,
            "ecoFootprintTimeline": ecoFootprintTimeline,
            "ecoByCompany": ecoByCompany
        }, status=200)

    except Exception as e:
        logger.exception("Erro ao gerar o dashboard summary.")
        return Response({
            "error": "Erro ao gerar dados do dashboard.",
            "details": str(e)
        }, status=500)

#view to get the list of Counties of the Companies
#assume that County is one of the fields in location of the Company model
@api_view(['GET'])
def get_company_counties(request):
    try:
        counties = Company.objects.values_list('location__county', flat=True).distinct()
        counties_list = list(counties)

        if not counties_list:
            return Response({'message': 'No counties found for companies'}, status=status.HTTP_200_OK)

        return Response(counties_list, status=status.HTTP_200_OK)

    except DatabaseError as db_error:
        return Response(
            {'error': 'Erro ao aceder à base de dados.', 'details': str(db_error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': 'Erro inesperado ao procurar os condados das empresas.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# View to get the details of the companies from a specific county
@api_view(['GET'])
def report_by_region(request):
    concelho = request.GET.get('concelho')
    if not concelho:
        return Response({'error': 'Parâmetro "concelho" é obrigatório.'}, status=400)

    try:
        companies = Company.objects.filter(location__county__iexact=concelho)
        employees = Employee.objects.filter(company__in=companies)
        processes = Process.objects.filter(process_type__manufacturer__in=companies)
        products = Product.objects.filter(product_type__manufacturer__in=companies)

        summary = {
            'producers': companies.filter(type='producer').count(),
            'manufacturers': companies.filter(type='manufacturer').count(),
            'sellers': companies.filter(type='seller').count(),
            'jobs': employees.count(),
            'water': int(processes.aggregate(w=Sum('water_consumption'))['w'] or 0),
            'energy': int(processes.aggregate(e=Sum('energy_consumption'))['e'] or 0),
            'waste': int(processes.aggregate(f=Sum('waste_generation'))['f'] or 0),
            'revenue': int(products.filter(status='sold').aggregate(r=Sum('price'))['r'] or 0)
        }

        company_distribution = [
            {'name': 'Produtores', 'value': summary['producers']},
            {'name': 'Queijarias', 'value': summary['manufacturers']},
            {'name': 'Vendedores', 'value': summary['sellers']}
        ]

        eco_by_company = []
        eco_company_timeline = []
        revenue_by_company_timeline = []
        meses_pt = ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

        for company in companies:
            pegada_total = Process.objects.filter(process_type__manufacturer=company).aggregate(
                total=Sum('waste_generation')
            )['total'] or 0

            eco_by_company.append({
                'name': company.name,
                'type': company.type,
                'value': float(pegada_total)
            })

            # Eco footprint agrupado por ano
            processos_empresa = Process.objects.filter(process_type__manufacturer=company)
            eco_por_ano = defaultdict(lambda: [0] * 12)
            for proc in processos_empresa:
                if proc.start_date:
                    ano = proc.start_date.year
                    mes = proc.start_date.month
                    eco_por_ano[ano][mes - 1] += proc.waste_generation or 0

            timeline_eco = []
            for ano, valores in sorted(eco_por_ano.items()):
                timeline_eco.append({
                    'year': ano,
                    'data': [
                        {'month': meses_pt[i], 'value': int(valores[i])}
                        for i in range(12)
                    ]
                })

            eco_company_timeline.append({
                'name': company.name,
                'timeline': timeline_eco
            })

            # Revenue agrupado por ano
            produtos_empresa = Product.objects.filter(product_type__manufacturer=company, status='sold')
            revenue_por_ano = defaultdict(lambda: [0] * 12)
            for produto in produtos_empresa:
                if produto.sell_date:
                    ano = produto.sell_date.year
                    mes = produto.sell_date.month
                    revenue_por_ano[ano][mes - 1] += produto.price or 0

            timeline_revenue = []
            for ano, valores in sorted(revenue_por_ano.items()):
                timeline_revenue.append({
                    'year': ano,
                    'data': [
                        {'month': meses_pt[i], 'value': int(valores[i])}
                        for i in range(12)
                    ]
                })

            revenue_by_company_timeline.append({
                'name': company.name,
                'timeline': timeline_revenue
            })

        # Novo agrupamento para resourceConsumption no formato { year, data: [ {month, water, energy} ]}
        resource_by_month = processes.annotate(mes=TruncMonth('start_date')).values('mes') \
            .annotate(water=Sum('water_consumption'), energy=Sum('energy_consumption'))

        resource_by_year = defaultdict(lambda: [ {'month': m, 'water': 0, 'energy': 0} for m in meses_pt ])
        for item in resource_by_month:
            mes = item['mes']
            if mes:
                ano = mes.year
                indice_mes = mes.month - 1
                resource_by_year[ano][indice_mes]['water'] = int(item['water'] or 0)
                resource_by_year[ano][indice_mes]['energy'] = int(item['energy'] or 0)

        resource_consumption = [
            {'year': ano, 'data': dados}
            for ano, dados in sorted(resource_by_year.items())
        ]

        # ✅ ecoFootprintTimeline ajustado para agrupar por ano e mês
        eco_monthly = processes.annotate(mes=TruncMonth('start_date')).values('mes') \
            .annotate(waste=Sum('waste_generation'))

        eco_by_year = defaultdict(lambda: [ {'month': m, 'waste': 0} for m in meses_pt ])
        for item in eco_monthly:
            mes = item['mes']
            if mes:
                ano = mes.year
                indice_mes = mes.month - 1
                eco_by_year[ano][indice_mes]['waste'] = int(item['waste'] or 0)

        eco_footprint_timeline = [
            {'year': ano, 'data': dados}
            for ano, dados in sorted(eco_by_year.items())
        ]

        company_list = [
            {'id': company.id, 'name': company.name, 'type': company.type, 'location': company.location}
            for company in companies
        ]

        return Response({
            'summary': summary,
            'companyDistribution': company_distribution,
            'ecoByCompany': eco_by_company,
            'ecoCompanyTimeline': eco_company_timeline,
            'revenueByCompanyTimeline': revenue_by_company_timeline,
            'resourceConsumption': resource_consumption,
            'ecoFootprintTimeline': eco_footprint_timeline,
            'companyList': company_list
        })

    except Exception as e:
        return Response({
            'error': 'Erro ao gerar relatório.',
            'details': str(e),
            'trace': traceback.format_exc()
        }, status=500)
    
# View to get the details of a company
@api_view(['GET'])
def company_details(request, company_id):
    company = get_object_or_404(Company, id=company_id)

    date = datetime.now()
    current_year = date.today().year

    employees_qs = Employee.objects.filter(company=company)
    total_employees = employees_qs.count()
    male_employees = Employee.objects.filter(company=company, gender="Male").count()
    female_employees = Employee.objects.filter(company=company, gender="Female").count()

    # Produtos produzidos no ano atual
    products_qs = Product.objects.filter(
        product_type__manufacturer=company,
        production_date__year=current_year
    )
    annual_quantity = products_qs.count()

    # Nº de produtos por tipo
    products_by_type = defaultdict(int)
    for product in products_qs:
        products_by_type[product.product_type.type] += 1

    # get the raw products used by the company
    # You must search all the processes of the Company and then get the raw products used in those processes searching the RawProductUsage model
    raw_products_qs = RawProductUsage.objects.filter(process__process_type__manufacturer=company)

    #serialize the raw products
    raw_products = RawProductUsageSerializer(raw_products_qs, many=True)

    data = {
        "id": company.id,
        "name": company.name,
        "type": company.type,
        "location": company.location,
        "user": {
            "id": company.user.id,
            "username": company.user.username,
            "email": company.user.email,
        },
        "certifications": [
            {
                "id": c.certification.id,
                "name": c.certification.name,
                "start_date": c.start_date,
                "end_date": c.end_date,
            } for c in company.certifications.select_related('certification').all()
        ],
        "audits": [
            {
                "id": audit.id,
                "certification": audit.certification.name,
                "regulator": audit.regulator.name,
                "audit_date": audit.audit_date,
                "evaluation_percentage": audit.evaluation_percentage,
                "evaluation_decision": audit.evaluation_decision,
                "report_url": audit.report_url,
            } for audit in company.audits.select_related('certification', 'regulator').all()
        ],
        "employees": [
            {
                "id": emp.id,
                "name": emp.name,
                "role": emp.role,
                "gender": emp.gender,
                "price_per_hour": float(emp.price_per_hour),
            } for emp in employees_qs
        ],
        "employee_stats": {
            "total": total_employees,
            "male": male_employees,
            "female": female_employees,
        },
        "annual_production_quantity": annual_quantity,
        "production_by_type": dict(products_by_type),
        "raw_products": raw_products.data,
        "product_types": [
            {
                "id": pt.id,
                "type": pt.type,
                "products": [
                    {
                        "id": p.id,
                        "product_reference": p.product_reference,
                        "production_date": p.production_date,
                        "expiration_date": p.expiration_date,
                        "status": p.status,
                        "price": float(p.price),
                        "production_location": p.production_location,
                    } for p in pt.products.all()
                ]
            } for pt in company.product_types.prefetch_related('products').all()
        ]
    }
    print("Company Details Data:")
    print(data)
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
def company_charts_data(request, company_id):
    month_abbr = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Abr',
    5: 'Mai',
    6: 'Jun',
    7: 'Jul',
    8: 'Ago',
    9: 'Set',
    10: 'Out',
    11: 'Nov',
    12: 'Dez'
    }

    try:
        company = get_object_or_404(Company, id=company_id)

        # Função auxiliar para preencher meses faltantes com zero
        def fill_missing_months(timeline, keys_with_default_zero):
            # Obtém todos os anos da timeline
            years = set(entry['year'] for entry in timeline)

            filled_timeline = []

            for year in sorted(years):
                # Cria um dict dos dados por mês para esse ano
                data_by_month = {entry['month']: entry for entry in timeline if entry['year'] == year}

                # Garante que todos os meses (1 a 12) estão presentes
                for month_num in range(1, 13):
                    month_name = month_abbr[month_num]
                    if month_name not in data_by_month:
                        # Monta um entry com zero para cada key, exceto 'year' e 'month'
                        zero_entry = {'year': year, 'month': month_name}
                        for key in keys_with_default_zero:
                            if key not in ['year', 'month']:
                                zero_entry[key] = 0
                        filled_timeline.append(zero_entry)
                    else:
                        filled_timeline.append(data_by_month[month_name])

            # Ordena por ano e mês (mês convertido para número)
            def month_to_num(m):
                try:
                    return list(month_abbr).index(m)
                except ValueError:
                    return 0

            filled_timeline.sort(key=lambda x: (x['year'], month_to_num(x['month'])))
            return filled_timeline

        # Receita
        revenue_qs = Product.objects.filter(
            product_type__manufacturer=company,
            status='sold',
            sell_date__isnull=False
        ).annotate(
            year=ExtractYear('sell_date'),
            month=ExtractMonth('sell_date')
        ).values('year', 'month').annotate(
            total_revenue=Sum('price')
        ).order_by('year', 'month')

        revenue_timeline = []
        for item in revenue_qs:
            revenue_timeline.append({
                'year': item['year'],
                'month': month_abbr[item['month']],
                'value': float(item['total_revenue'])
            })
        revenue_timeline = fill_missing_months(revenue_timeline, ['month', 'value'])

        # Pegada Ecológica
        eco_qs = Process.objects.filter(
            process_type__manufacturer=company,
            status='completed'
        ).annotate(
            year=ExtractYear('start_date'),
            month=ExtractMonth('start_date')
        ).values('year', 'month').annotate(
            total_waste=Sum('waste_generation')
        ).order_by('year', 'month')

        eco_footprint_timeline = []
        for item in eco_qs:
            eco_footprint_timeline.append({
                'year': item['year'],
                'month': month_abbr[item['month']],
                'value': float(item['total_waste']) if item['total_waste'] else 0
            })
        eco_footprint_timeline = fill_missing_months(eco_footprint_timeline, ['month', 'value'])

        # Consumo de Recursos
        resource_qs = Process.objects.filter(
            process_type__manufacturer=company,
            status='completed'
        ).annotate(
            year=ExtractYear('start_date'),
            month=ExtractMonth('start_date')
        ).values('year', 'month').annotate(
            total_energy=Sum('energy_consumption'),
            total_water=Sum('water_consumption')
        ).order_by('year', 'month')

        resource_consumption_timeline = []
        for item in resource_qs:
            resource_consumption_timeline.append({
                'year': item['year'],
                'month': month_abbr[item['month']],
                'energy': float(item['total_energy']) if item['total_energy'] else 0,
                'water': float(item['total_water']) if item['total_water'] else 0
            })
        resource_consumption_timeline = fill_missing_months(resource_consumption_timeline, ['month', 'energy', 'water'])

        # Organizar dados no formato esperado pelo frontend, agrupando por ano
        def group_by_year(timeline, keys):
            grouped = {}
            for entry in timeline:
                year = entry['year']
                if year not in grouped:
                    grouped[year] = []
                data_point = {k: entry[k] for k in keys if k != 'year'}
                grouped[year].append(data_point)
            return [{'year': year, 'data': data} for year, data in grouped.items()]

        response_data = {
            'revenue_timeline': group_by_year(revenue_timeline, ['month', 'value']),
            'eco_footprint_timeline': group_by_year(eco_footprint_timeline, ['month', 'value']),
            'resource_consumption_timeline': group_by_year(resource_consumption_timeline, ['month', 'energy', 'water']),
        }

        return Response(response_data, status=200)

    except Company.DoesNotExist:
        return Response({'error': 'Company not found.'}, status=404)
    except Exception as e:
        print(f"Erro na view company_charts_data: {str(e)}")
        return Response({'error': 'Erro ao obter os dados.'}, status=500)


@api_view(['GET'])
def company_homepage(request, user_id):

    try:
        user = User.objects.get(id=user_id)
        company = Company.objects.get(user=user)
    except Company.DoesNotExist:
        return Response({"detail": "Company not found for this user."}, status=404)

    # 1. Métricas
    num_employees = Employee.objects.filter(company=company).count()

    one_year_ago = now().date() - timedelta(days=365)

    process_types = company.process_types.all()
    recent_processes = Process.objects.filter(
        process_type__in=process_types,
        start_date__date__gte=one_year_ago
    )

    total_water_consumption = sum(p.water_consumption for p in recent_processes)
    total_energy_consumption = sum(p.energy_consumption for p in recent_processes)
    total_waste_generation = sum(p.waste_generation for p in recent_processes)

    # 2. Boards
    product_types = company.product_types.all()
    product_types_data = []

    for pt in product_types:
        proc_type_links = ProcTypeProdTypeList.objects.filter(product_type=pt).order_by('chain_position')

        proc_types_data = []
        for link in proc_type_links:
            proc_type = link.process_type
            # Filtra apenas processos ativos (status = 'in_progress')
            processes = Process.objects.filter(
                process_type=proc_type,
                status='in_progress'
            ).order_by('-start_date')

            process_data = []
            for proc in processes:
                products_number = ProductProcessList.objects.filter(process=proc).count()
                product = ProductProcessList.objects.filter(process=proc).first()

                batch_number = product.product.batch_number if product else ""

                process_data.append({
                    "reference": proc.reference,
                    "start_date": proc.start_date,
                    "end_date": proc.end_date,
                    "status": proc.status,
                    "energy_consumption": float(proc.energy_consumption),
                    "water_consumption": float(proc.water_consumption),
                    "waste_generation": float(proc.waste_generation),
                    "products_number": products_number,
                    "batch": batch_number,
                })

            proc_types_data.append({
                "process_type": proc_type.type,
                "description": proc_type.description,
                "chain_position": link.chain_position,
                "processes": process_data,
            })

        product_types_data.append({
            "type": pt.type,
            "description": pt.description,
            "process_types": proc_types_data,
        })

    response = {
        "metrics": {
            "jobs": num_employees,
            "water_last_year": float(total_water_consumption),
            "energy_last_year": float(total_energy_consumption),
            "waste_last_year": float(total_waste_generation),
        },
        "boards": {
            "product_types": product_types_data
        }
    }

    return Response(response)


@api_view(['GET'])
def get_process_by_reference(request, reference):

    try:
        process = Process.objects.get(reference=reference)
        print(process)
        
        # Obter produtos via ProductProcessList
        product_process_entries = process.products.all()  # Isto é ProductProcessList queryset
        
        products_data = []
        for entry in product_process_entries:
            product = entry.product
            name = f"{product.product_type.type}-{product.id}-{product.batch_number}"
            products_data.append({
                "id": product.id,
                "name": name,
                "reference": product.product_reference,
                "type": product.product_type.type,
                "status": product.status,
                "price": float(product.price),
                "expiration_date": product.expiration_date,
                "location": product.production_location,
                "batch_number": product.batch_number,
            })

        product_type = product_process_entries.first().product.product_type if product_process_entries else None

        object = ProcTypeProdTypeList.objects.filter(process_type=process.process_type, product_type=product_type).first()
        print(object)
        chain_position = object.chain_position if object else None

        data = {
            "reference": process.reference,
            "type": process.process_type.type,
            "description": process.process_type.description,
            "manufacturer": process.process_type.manufacturer.name,
            "status": process.status,
            "start_date": process.start_date,
            "end_date": process.end_date,
            "energy_consumption": float(process.energy_consumption),
            "water_consumption": float(process.water_consumption),
            "waste_generation": float(process.waste_generation),
            "chain_position": chain_position,
            "raw_materials": [
                {
                    "name": usage.raw_product.name,
                    "quantity_used": usage.quantity_used,
                    "used_on": usage.usage_date,
                    "producer": usage.raw_product.producer.name,
                    "buy_date": usage.raw_product.buy_date,
                    "price": float(usage.raw_product.price),
                    "location": usage.raw_product.production_location,
                }
                for usage in process.raw_product_usages.all()
            ],
            "employees": [
                {
                    "name": ep.employee.name,
                    "role": ep.employee.role,
                    "gender": ep.employee.gender,
                    "price_per_hour": float(ep.employee.price_per_hour),
                }
                for ep in process.employee_process_list.all()
            ],
            "products": products_data,
            "machines": list({
                mpl.machine.type: {
                    "type": mpl.machine.type,
                    "manufacturer": mpl.machine.manufacturer.name,
                    "iot_nodes": [
                        {
                            "name": node.name,
                            "status": node.status,
                            "battery": float(node.batery_level),
                            "type": node.type,
                            "installation_date": node.installation_date,
                            "parameters": [
                                {
                                    "name": param.parameter_name,
                                    "unit": param.parameter_unit,
                                    "last_value": float(param.last_value),
                                    "last_update": param.last_update,
                                    "alerts": [
                                        {
                                            "type": alert.alert_type,
                                            "msg": alert.alert_msg,
                                            "min": float(alert.min_value),
                                            "max": float(alert.max_value)
                                        }
                                        for alert in param.alerts.all()
                                    ],
                                    "history": [
                                        {
                                            "timestamp": detail.timestamp,
                                            "value": float(detail.value)
                                        }
                                        for detail in param.machine_details.order_by("-timestamp")[:50][::-1]  # últimos 50, ordenados do mais antigo ao mais recente
                                    ]
                                }
                                for param in node.parameters.all()
                            ]
                        }
                        for node in mpl.machine.iot_nodes.all()
                    ]
                }
                for mpl in process.process_type.machines.all()
            }.values()),  # Evitar máquinas duplicadas
        }

        return Response(data, status=status.HTTP_200_OK)

    except Process.DoesNotExist:
        return Response({'error': 'Process not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error retrieving process by reference: {str(e)}")
        return Response({'error': 'An error occurred while retrieving the process.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_company_process_history(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        company = Company.objects.get(user=user)
        
        # Filtrar processos da empresa com status "completed"
        processes = Process.objects.filter(
            process_type__manufacturer=company,
            status='completed'
        ).order_by('-start_date')
        
        # Serializar os processos
        serializer = ProcessSerializer(processes, many=True)
        serialized_data = serializer.data
        
        # Anexar batch_number de um produto associado (se existir)
        for i, process in enumerate(processes):
            product_link = ProductProcessList.objects.filter(process=process).first()
            if product_link:
                batch_number = product_link.product.batch_number
            else:
                batch_number = None
            
            # Adiciona ao JSON de resposta
            serialized_data[i]['batch_number'] = batch_number

        return Response(serialized_data, status=status.HTTP_200_OK)
    
    except Company.DoesNotExist:
        return Response({"error": "Company not found."}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error retrieving company process history: {str(e)}")
        return Response({"error": "An error occurred while retrieving the process history."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
@csrf_exempt
def advance_process(request):
    if request.method != 'POST':
        return Response({"error": "Método não permitido."}, status=405)

    try:
        data = json.loads(request.body)

        process_ref = data.get("process_reference")
        selected_products = data.get("selected_products", [])  # Lista de product_reference
        water_used = data.get("water_used")
        energy_used = data.get("energy_used")
        waste_generated = data.get("waste_generated")

        if not all([process_ref, water_used, energy_used, waste_generated]):
            return Response({"error": "Campos obrigatórios faltando."}, status=400)

        process = Process.objects.get(reference=process_ref)
        current_process_type = process.process_type

        # Atualizar dados ambientais
        process.water_consumption = water_used
        process.energy_consumption = energy_used
        process.waste_generation = waste_generated

        all_products = Product.objects.filter(product_process_list__process=process).distinct()

        if not selected_products:
            process.status = 'completed'
            products_to_advance = all_products
            process.end_date = timezone.now()
        else:
            process.status = 'in_progress'
            products_to_advance = all_products.exclude(product_reference__in=selected_products)

        process.save()

        if products_to_advance.exists():
            for product in products_to_advance:
                product.chain_position += 1
                product.save()

            # 🔍 Buscar próximo tipo de processo para os produtos
            # Assumimos que todos os produtos têm o mesmo tipo (simplificação)
            product_type = products_to_advance.first().product_type
            current_link = ProcTypeProdTypeList.objects.filter(
                process_type=current_process_type,
                product_type=product_type
            ).first()

            if current_link:
                next_link = ProcTypeProdTypeList.objects.filter(
                    product_type=product_type,
                    chain_position=current_link.chain_position + 1
                ).first()

                if next_link:
                    next_process_type = next_link.process_type

                    # Criar novo processo do tipo correto
                    new_process = Process.objects.create(
                        process_type=next_process_type,
                        start_date=timezone.now(),
                        status='in_progress',
                        reference=f"{process.reference}-step{process.id}",
                        energy_consumption=0,
                        water_consumption=0,
                        waste_generation=0,
                    )

                    for product in products_to_advance:
                        ProductProcessList.objects.create(
                            product=product,
                            process=new_process
                        )

        return Response({"message": "Processo atualizado com sucesso."})

    except Process.DoesNotExist:
        return Response({"error": "Processo não encontrado."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


