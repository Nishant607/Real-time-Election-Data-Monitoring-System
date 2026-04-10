from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals
        
        # Auto-seed users requested by the user
        try:
            from django.contrib.auth.models import User, Group
            
            def setup_user(username, role, password):
                user, created = User.objects.get_or_create(username=username)
                user.set_password(password)
                user.is_staff = (role == "Admin")
                user.is_superuser = (role == "Admin")
                user.save()
                
                group, _ = Group.objects.get_or_create(name=role)
                user.groups.clear()
                user.groups.add(group)

            # Passwords updated based on user's manual edits
            setup_user("Nishant", "Admin", "nishant2004")
            setup_user("Tannu", "Admin", "tannu2004")
            setup_user("Mannu", "Viewer", "mannu2004")
        except Exception:
            pass # Avoid breaking migrations/startup if DB isn't ready
