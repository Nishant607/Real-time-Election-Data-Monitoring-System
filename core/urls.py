from django.urls import path
from .views import dashboard, alerts_page, resolve_alert, login_view, logout_view
from .views import vote_data_api
from .views import export_report_pdf
from .views import analytics_page
from .views import search_page,elections_page,candidates_page,reports_page

urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("alerts/", alerts_page, name="alerts"),
    path("resolve/<int:alert_id>/", resolve_alert, name="resolve_alert"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path('api/votes/', vote_data_api, name='vote_api'),
    path("export-report/", export_report_pdf, name="export_report"),
    path("analytics/", analytics_page, name="analytics"),
    path("search/", search_page, name="search"),
    path("elections/", elections_page, name="elections"),
    path("candidates/", candidates_page, name="candidates"),
    path("reports/", reports_page, name="reports"),
]