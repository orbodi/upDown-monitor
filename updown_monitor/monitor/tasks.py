import subprocess
from .models import Device

def ping_all_devices():
    for device in Device.objects.all():
        try:
            result = subprocess.run(
                ["ping", "-n", "1", device.ip_address],  # -n 1 pour Windows (1 ping) ou -c 1 pour Linux/Mac
                stdout=subprocess.DEVNULL
            )
            device.status = "UP" if result.returncode == 0 else "DOWN"
            device.save()
        except Exception:
            device.status = "DOWN"
            device.save()
