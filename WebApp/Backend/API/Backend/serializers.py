from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        depth = 1

class RegulatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regulator
        fields = '__all__'
        depth = 1

class PolicyMakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyMaker
        fields = '__all__'
        depth = 1

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'

class RegulatorCertificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegulatorCertificationList
        fields = '__all__'
        depth = 1

class CompanyCertificationsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyCertificationsList
        fields = '__all__'
        depth = 1

class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = '__all__'
        depth = 1

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        depth = 1

class RawProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawProduct
        fields = '__all__'
        depth = 1

class ProcessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessType
        fields = '__all__'
        depth = 1

class ProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Process
        fields = '__all__'
        depth = 1

class RawProductUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawProductUsage
        fields = '__all__'
        depth = 2

class EmployeeProcessListSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProcessList
        fields = '__all__'
        depth = 1

class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = '__all__'
        depth = 1

class ProcTypeProdTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcTypeProdTypeList
        fields = '__all__'
        depth = 1

class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = '__all__'
        depth = 1

class MachineProcessListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineProcessList
        fields = '__all__'
        depth = 1

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        depth = 1

class ProductProcessListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductProcessList
        fields = '__all__'
        depth = 1

class ProductCertificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCertificationList
        fields = '__all__'
        depth = 1

class IoTNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IoTNode
        fields = '__all__'
        depth = 1

class IoTNodeParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = IoTNodeParameter
        fields = '__all__'
        depth = 1

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'
        depth = 1

class MachineDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineDetails
        fields = '__all__'
        depth = 1
