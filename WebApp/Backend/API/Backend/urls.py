from django.urls import path, include
from . import views

urlpatterns = [
    #App views
    path( 'login/', views.login, name='login'),

    # PolicyMaker & Regulator routes
    path('list-companies/', views.get_all_companies, name='get_all_companies'),
    path('get-company/<int:company_id>/', views.get_company_by_id, name='get_company_by_id'),
    path('get-certifications/', views.get_all_certifications, name='get_all_certifications'),
    path('get-company-audits&certifications/<int:company_id>/', views.get_company_audits_and_certifications, name='get_company_audits_and_certifications'),
    path('get-active-certifications/<int:company_id>/', views.get_active_certifications, name='get_active_certifications'),
    path('get-product-certifications/<int:company_id>/', views.get_product_certifications, name='get_product_certifications'),
    path('get-company-details/<int:company_id>/', views.get_company_details, name='get_company_details'),
    path('dashboard/summary/', views.dashboard_summary, name='dashboard-summary'),
    path('report/zones/', views.get_company_counties, name='get_company_counties'),
    path('report/by-region/', views.report_by_region, name='report_by_region'),
    path('company-details/<int:company_id>/', views.company_details, name='company_details'),
    path('company-charts-data/<int:company_id>/', views.company_charts_data, name='company_charts_data'),
    # Company routes
    path('list-employees/<int:company_id>/', views.list_employees, name='list_employees'),
    path('get-company-by-userid/<int:user_id>/', views.get_company_by_user, name='get_company_by_user_id'),
    path('get-employee/<int:employee_id>/', views.get_employee_by_id, name='get_employee_by_id'),
    path('count-employees/<int:company_id>/', views.count_employees, name='count_employees'),
    path('get-employees-by-process/<int:process_id>/', views.get_employees_by_process, name='get_employees_by_process'),
    path('get-all-processes/<int:company_id>/', views.get_all_processes, name='get_all_processes'),
    path('get-processes-by-type/<int:company_id>/<int:process_type_id>', views.get_processes_by_type, name='get_processes_by_type'),
    path('get-raw-product-usage-by-process/<int:process_id>/', views.get_raw_product_usage_by_process, name='get_raw_product_usage_by_process'),
    path('get-processes-by-product/<int:product_id>/', views.get_processes_by_product, name='get_processes_by_product'),
    path('get-machine-details-by-process/<int:process_id>/', views.get_machine_details_by_process, name='get_machine_details_by_process'),
    path('get-alerts-by-process/<int:process_id>/', views.get_alerts_by_process, name='get_alerts_by_process'),
    path('get-triggered-alerts-by-process/<int:process_id>/', views.get_triggered_alerts_by_process, name='get_triggered_alerts_by_process'),
    path('get-all-products/<int:company_id>/', views.get_all_products, name='get_all_products'),
    path('get-company-homepage/<int:user_id>/', views.company_homepage, name='get_company_homepage'),
    path("get-process-by-reference/<str:reference>/", views.get_process_by_reference, name="get_process_by_reference"),
    path('get-company-process-history/<int:user_id>/', views.get_company_process_history, name='get_company_process_history'),
]