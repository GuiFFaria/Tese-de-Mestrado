from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.db import DatabaseError
import jwt
from django.conf import settings
from datetime import datetime, timedelta


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