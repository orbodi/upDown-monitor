from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/devices/', views.devices_status_api, name='devices_api'),
    path('api/devices/update/', views.update_devices_status, name='devices_update_api'),
]
