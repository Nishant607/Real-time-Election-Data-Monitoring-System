import os
import django
import sys

# Setup Django environment
sys.path.append(r'c:\Users\hp\Desktop\election_project\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'election_monitor.settings')
django.setup()

from django.contrib.auth.models import User, Group

def setup_user(username, role, password="nishant@2004"):
    user, created = User.objects.get_or_create(username=username)
    user.set_password(password)
    user.is_staff = (role == "Admin")
    user.save()
    
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.clear()
    user.groups.add(group)
    
    status = "Created" if created else "Updated"
    print(f"{status} user: {username} | Role: {role} | Password: {password}")

print("--- RESETTING SYSTEM CREDENTIALS ---")
setup_user("Nishant", "Admin","nishant2004")
setup_user("Tannu", "Admin","tannu2004")
setup_user("Mannu", "Viewer","mannu2004")
print("--- SUCCESS ---")
