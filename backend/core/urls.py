from django.shortcuts import redirect
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import api_login, api_logout, current_user, vote_data_api, export_report_pdf, export_alert_pdf, \
    export_candidates_json, export_voters_csv, export_network_health_pdf, export_events_wav, \
    export_elections_pdf, export_alerts_pdf
from .api_views import ElectionViewSet, CandidateViewSet, AlertViewSet, AnalyticsViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'elections', ElectionViewSet, basename='election')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'activity', ActivityLogViewSet, basename='activity')

def redirect_to_frontend(request):
    """Fallback redirect to Vite dev server."""
    return redirect('http://localhost:5173/')

urlpatterns = [
    # Legacy Page Redirects -> New Frontend
    path("", redirect_to_frontend, name="dashboard"),
    path("login/", redirect_to_frontend, name="login"),
    path("alerts/", redirect_to_frontend, name="alerts"),
    path("analytics/", redirect_to_frontend, name="analytics"),
    path("candidates/", redirect_to_frontend, name="candidates"),
    path("elections/", redirect_to_frontend, name="elections"),
    path("reports/", redirect_to_frontend, name="reports"),
    path("search/", redirect_to_frontend, name="search"),
    
    # API endpoints (Active)
    path("api/login/", api_login, name="api_login"),
    path("api/logout/", api_logout, name="api_logout"),
    path("api/me/", current_user, name="current_user"),
    path('api/votes/', vote_data_api, name='vote_api'),
    path("api/v1/", include(router.urls)),
    
    # Functional / PDF Export routes
    path("export-report/", export_report_pdf, name="export_report"),
    path("export-candidates/", export_candidates_json, name="export_candidates"),
    path("export-voters/", export_voters_csv, name="export_voters"),
    path("export-network-health/", export_network_health_pdf, name="export_network_health"),
    path("export-events/", export_events_wav, name="export_events"),
    path("export-elections/", export_elections_pdf, name="export_elections_pdf"),
    path("export-alerts/", export_alerts_pdf, name="export_alerts_pdf"),
    path("investigate/alert/<int:alert_id>/export/", export_alert_pdf, name="export_alert_pdf"),
]