from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Device
import subprocess
from threading import Thread


def dashboard(request):
    return render(request, 'monitor/dashboard_v2.html')

def devices_status_api(request):
    devices = Device.objects.all()
    data = [
        {
            'name': d.name,
            'ip_address': d.ip_address,
            'status': d.status,
            #'last_check': d.last_check.strftime('%Y-%m-%d %H:%M:%S'),
        }
        for d in devices
    ]
    return JsonResponse(data, safe=False)


@csrf_exempt
def update_devices_status(request):
    def ping_all_devices():
        for device in Device.objects.all():
            try:
                result = subprocess.run(
                    ["ping", "-c", "1", "-w", "1", device.ip_address], # Use "-c" and "-W" for Unix-based systems like Linux and macOS (e.g., Linux, macOS)# Use "-n" and "-w" for Windows (e.g., Windows)
                    stdout=subprocess.DEVNULL 
                )
                device.status = "UP" if result.returncode == 0 else "DOWN"
                device.save()
            except Exception:
                device.status = "DOWN"
                device.save()

    Thread(target=ping_all_devices).start()
    return JsonResponse({'status': 'update started'})
