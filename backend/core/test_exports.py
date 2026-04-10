from django.test import TestCase, Client
from django.contrib.auth.models import User, Group
from django.urls import reverse
from core.models import Election, Candidate, VoteRecord
import json

class ExportTests(TestCase):
    def setUp(self):
        # Create Admin user and group
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@test.com')
        self.admin_group, _ = Group.objects.get_or_create(name='Admin')
        self.admin_user.groups.add(self.admin_group)
        
        # Create Viewer user
        self.viewer_user = User.objects.create_user(username='viewer', password='password')
        
        # Create sample data
        self.election = Election.objects.create(name="Test Election", start_date="2026-01-01", end_date="2026-12-31")
        self.candidate = Candidate.objects.create(election=self.election, name="Test Candidate", party="Test Party")
        VoteRecord.objects.create(candidate=self.candidate, votes=100)

        self.client = Client()

    def test_export_report_pdf_admin(self):
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_report'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_export_candidates_json_admin(self):
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_candidates'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')
        data = json.loads(response.content)
        self.assertTrue(any(c['name'] == 'Test Candidate' for c in data))

    def test_export_voters_csv_admin(self):
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_voters'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn(b'Test Candidate', response.content)

    def test_export_network_health_pdf_admin(self):
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_network_health'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_export_events_wav_admin(self):
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_events'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'audio/wav')

    def test_export_elections_pdf_admin(self):
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_elections_pdf'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_export_alerts_pdf_admin(self):
        # Create an alert to test
        from core.models import Anomaly, Alert
        anomaly = Anomaly.objects.create(candidate=self.candidate, previous_votes=0, current_votes=100, reason="Test")
        Alert.objects.create(anomaly=anomaly, message="Test Alert")
        
        self.client.login(username='admin', password='password')
        response = self.client.get(reverse('export_alerts_pdf'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_unauthorized_access(self):
        self.client.login(username='viewer', password='password')
        # PDF exports return 403 HttpResponse
        response = self.client.get(reverse('export_report'))
        self.assertEqual(response.status_code, 403)
        
        # JSON export returns 403 JsonResponse
        response = self.client.get(reverse('export_candidates'))
        self.assertEqual(response.status_code, 403)
