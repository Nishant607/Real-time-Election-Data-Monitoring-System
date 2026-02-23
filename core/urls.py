from django.urls import path
from .views import dashboard,alerts_page


urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("alerts/",alerts_page, name="alerts"),\
]
