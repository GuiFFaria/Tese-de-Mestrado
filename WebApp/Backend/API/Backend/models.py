from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.username
    
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=50, choices=[
        ('producer', 'Producer'),
        ('manufacturer', 'Manufacturer'),
        ('seller', 'Seller'),
        ('mixed', 'Mixed')  # For companies that engage in multiple roles
    ], default="")
    location = models.JSONField()  # Assuming location is a JSON object with latitude and longitude
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company')

    def __str__(self):
        return self.name
    

class Regulator(models.Model):
    name = models.CharField(max_length=255, unique=True)
    institution = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='regulator')

    def __str__(self):
        return self.name
    
class PolicyMaker(models.Model):
    name = models.CharField(max_length=255, unique=True)
    institution = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    location = models.JSONField()
    regulations_list_url = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='policy_maker')

    def __str__(self):
        return self.name
    
class Certification(models.Model):
    name = models.CharField(max_length=255, unique=True)
    certification_standards_url = models.CharField(max_length=255)  # URL to the certification standards
    audit_form_url = models.CharField(max_length=255)  # URL to the audit form
    recommended_audit_frequency = models.CharField(max_length=100)  # e.g., "annually", "bi-annually"

    def __str__(self):
        return self.name
    
class RegulatorCertificationList(models.Model):
    regulator = models.ForeignKey(Regulator, on_delete=models.CASCADE, related_name='certifications')
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='regulators')

    start_date = models.DateField()  # Date when the certification was started
    end_date = models.DateField(blank=True, null=True)  # Date when the certification ended, if applicable

    def __str__(self):
        return f"{self.regulator.name} - {self.certification.name}"
    
class CompanyCertificationsList(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='certifications')
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='companies')

    start_date = models.DateField()  # Date when the certification was started
    end_date = models.DateField(blank=True, null=True)  # Date when the certification ended, if applicable

    def __str__(self):
        return f"{self.company.name} - {self.certification.name}"
    
    
class Audit(models.Model):
    regulator = models.ForeignKey(Regulator, on_delete=models.CASCADE, related_name='audits')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='audits')
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='audits')
    audit_date = models.DateField()
    report_url = models.CharField(max_length=255, blank=True, null=True)  # URL to the audit report
    evaluation_percentage = models.IntegerField()
    evaluation_decision = models.CharField(max_length=50, choices=[
        ('compliant', 'Compliant'),
        ('non_compliant', 'Non-Compliant'),
        ('pending', 'Pending')
    ])
    def __str__(self):
        return f"Audit for {self.company.name} - {self.certification.name} on {self.audit_date}"
    
class Employee(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    gender = models.CharField(max_length=10)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
    
class RawProduct(models.Model):
    name = models.CharField(max_length=255)
    production_location = models.JSONField()  # Assuming location is a JSON object with latitude and longitude
    expiration_date = models.DateField()
    production_date = models.DateField()
    buy_date = models.DateField()
    inicial_quantity = models.IntegerField()
    producer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='raw_products')
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
    
class ProcessType(models.Model):
    type = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    manufacturer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='process_types')

    def __str__(self):
        return f"{self.type} Process by {self.manufacturer.name}"
    
class Process(models.Model):
    process_type = models.ForeignKey(ProcessType, on_delete=models.CASCADE, related_name='processes')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)  # Optional end date for
    status = models.CharField(max_length=50, choices=[
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ])
    reference = models.CharField(max_length=255, unique=True)  # Unique reference for the process
    energy_consumption = models.DecimalField(max_digits=10, decimal_places=2)  # Energy consumed in kWh
    water_consumption = models.DecimalField(max_digits=10, decimal_places=2)  # Water consumed in liters
    waste_generation = models.DecimalField(max_digits=10, decimal_places=2)  # Waste generated in kg


    def __str__(self):
        return f"{self.process_type.type} Process - {self.reference}"
    
class RawProductUsage(models.Model):
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='raw_product_usages')
    raw_product = models.ForeignKey(RawProduct, on_delete=models.CASCADE, related_name='process_usages')
    quantity_used = models.IntegerField()  # Quantity of raw product used in the process
    usage_date = models.DateTimeField()  # Date when the raw product was used in the process

    def __str__(self):
        return f"{self.raw_product.name} used in {self.process.reference}"
    
class EmployeeProcessList(models.Model):
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='employee_process_list')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='processes')

    def __str__(self):
        return f"{self.employee.name} worked on process {self.process.reference}"

class ProductType(models.Model):
    type = models.CharField(max_length=255, unique=True)
    manufacturer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='product_types')

    def __str__(self):
        return f"{self.type} Product by {self.manufacturer.name}"
    
class ProcTypeProdTypeList(models.Model):
    process_type = models.ForeignKey(ProcessType, on_delete=models.CASCADE, related_name='product_types')
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE, related_name='process_types')
    chain_position = models.IntegerField()  # Position in the production chain, e.g., 1 for first step, 2 for second step, etc.

    def __str__(self):
        return f"{self.process_type.type} can produce {self.product_type.type}"
    
class Machine(models.Model):
    type = models.CharField(max_length=255)
    manufacturer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='machines')

    def __str__(self):
        return f"{self.type} Machine by {self.manufacturer.name}"
    


class MachineProcessList(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='processes')
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='machines')

    def __str__(self):
        return f"{self.machine.type} used in process {self.process.reference}"
    
class Product(models.Model):
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE, related_name='products')
    production_location = models.JSONField()  # Assuming location is a JSON object with latitude and longitude
    production_date = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price of the product
    sell_date = models.DateTimeField(blank=True, null=True)  # Optional sell date
    status = models.CharField(max_length=50, choices=[
        ('in_stock', 'In Stock'),
        ('sold', 'Sold'),
        ('production', 'Production'),
        ('stored', 'Stored')
    ])
    product_reference = models.CharField(max_length=255, unique=True)  # Unique reference for the product
    expiration_date = models.DateField()  # Date when the product expires

    def __str__(self):
        return f"{self.product_type.type} Product - {self.product_reference} by {self.product_type.manufacturer.name}"
    
class ProductProcessList(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_process_list')
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='products')

    def __str__(self):
        return f"{self.product.product_reference} in process {self.process.reference}"
    
class ProductCertificationList(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_certifications')
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='products')

    date = models.DateField()  # Date when the certification was started
    reference = models.CharField(max_length=255, unique=True)  # Unique reference for the certification

    def __str__(self):
        return f"{self.product.product_reference} - {self.certification.name}"
    
class IoTNode(models.Model):
    name = models.CharField(max_length=255)
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='iot_nodes')
    type = models.CharField(max_length=50)
    installation_date = models.DateTimeField()
    status = models.CharField(max_length=50, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance')
    ])
    batery_level = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)  # Battery level in percentage

    def __str__(self):
        return f"IoT Node {self.name} for {self.machine.type} - Status: {self.status}"
    

class IoTNodeParameter(models.Model):
    iot_node = models.ForeignKey(IoTNode, on_delete=models.CASCADE, related_name='parameters')
    parameter_name = models.CharField(max_length=255)
    parameter_unit = models.CharField(max_length=255)
    last_value = models.DecimalField(max_digits=10, decimal_places=2)  # Last recorded value of the parameter
    last_update = models.DateTimeField(auto_now_add=True)  # Timestamp when the parameter was recorded

    def __str__(self):
        return f"{self.parameter_name} for {self.iot_node.name} at {self.last_update}"
    
class Alert(models.Model):
    parameter = models.ForeignKey(IoTNodeParameter, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=50, choices=[
        ('warning', 'Warning'),
        ('critical', 'Critical')
    ])
    max_value = models.DecimalField(max_digits=10, decimal_places=2)  # Maximum value for the alert
    min_value = models.DecimalField(max_digits=10, decimal_places=2)  # Minimum value for the alert
    alert_msg = models.CharField(max_length=255)  # Message to be sent when the alert is triggered


    def __str__(self):
        return f"{self.alert_type} Alert for {self.parameter.parameter_name} - {self.alert_msg}"
    
class MachineDetails(models.Model):
    value = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)  # Timestamp when the detail was recorded
    parameter = models.ForeignKey(IoTNodeParameter, on_delete=models.CASCADE, related_name='machine_details')

    def __str__(self):
        return f"Reading {self.parameter.parameter_name} at {self.timestamp} - Value: {self.value}"