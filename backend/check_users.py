import os
import django
import sys

# Add backend to sys.path
sys.path.append(r'c:\Users\hp\Desktop\election_project\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'election_monitor.settings')
django.setup()

from django.contrib.auth.models import User

print("--- SYSTEM USERS ---")
users = User.objects.all()
if not users.exists():
    print("No users found in database.")
else:
    for u in users:
        groups = [g.name for g in u.groups.all()]
        print(f"Username: {u.username}")
        print(f"Role/Groups: {groups}")
        print(f"Is Staff/Admin: {u.is_staff}")
        print("-" * 20)
