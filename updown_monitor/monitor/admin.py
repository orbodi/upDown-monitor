from django.contrib import admin
from .models import Device

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'ip_address', 'status', 'last_check')
    list_filter = ('status',)
    search_fields = ('name', 'ip_address')
    readonly_fields = ('last_check', 'status')  # empêche modification manuelle du status