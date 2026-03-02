from django.urls import path
from .views import dashboard, alerts_page, resolve_alert, login_view, logout_view

urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("alerts/", alerts_page, name="alerts"),
    path("resolve/<int:alert_id>/", resolve_alert, name="resolve_alert"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
]