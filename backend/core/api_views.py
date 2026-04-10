from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

from .models import Election, Candidate, VoteRecord, Anomaly, Alert, ActivityLog
from .serializers import (
    ElectionSerializer, CandidateSerializer, VoteRecordSerializer,
    AnomalySerializer, AlertSerializer, ActivityLogSerializer
)

class ElectionViewSet(viewsets.ModelViewSet):
    queryset = Election.objects.all().order_by('-start_date')
    serializer_class = ElectionSerializer

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Returns complex aggregation data for the Elections Hub"""
        elections = self.get_queryset()
        data = []
        for e in elections:
            candidates_count = Candidate.objects.filter(election=e).count()
            total_votes = VoteRecord.objects.filter(candidate__election=e, status='Approved').aggregate(total=Sum('votes'))['total'] or 0
            alerts_count = Alert.objects.filter(anomaly__candidate__election=e, status="Active").count()
            
            from django.utils import timezone
            today = timezone.now().date()
            total_days = (e.end_date - e.start_date).days
            progress = 100 if total_days <= 0 else max(0, min(100, ((today - e.start_date).days / total_days) * 100))

            data.append({
                'id': e.id,
                'name': e.name,
                'status': e.status,
                'start_date': e.start_date,
                'end_date': e.end_date,
                'candidates_count': candidates_count,
                'total_votes': total_votes,
                'alerts_count': alerts_count,
                'progress': progress
            })
        return Response(data)

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer

    @action(detail=False, methods=['get'])
    def rankings(self, request):
        """Returns candidates mapped with their total votes and vote share"""
        candidate_votes = (
            VoteRecord.objects.filter(status='Approved')
            .values('candidate__id', 'candidate__name', 'candidate__party')
            .annotate(total_votes=Sum('votes'))
            .order_by('-total_votes')
        )

        candidate_votes = list(candidate_votes)
        total_votes = sum((c['total_votes'] or 0) for c in candidate_votes)
        
        for i, c in enumerate(candidate_votes):
            c['rank'] = i + 1
            c['total_votes'] = c['total_votes'] or 0
            c['percentage'] = round((c['total_votes'] / total_votes) * 100, 2) if total_votes else 0
            name_parts = c['candidate__name'].split()
            c['initials'] = ''.join([part[0] for part in name_parts[:2]]).upper()

        return Response(candidate_votes)

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer

    @action(detail=True, methods=['post'])
    def investigate(self, request, pk=None):
        """Dedicated endpoint to process an admin investigation submission"""
        alert = self.get_object()
        anomaly = alert.anomaly
        candidate = anomaly.candidate

        verification_note = request.data.get('verification_note', '')
        status_choice = request.data.get('status', 'Active')
        action_choice = request.data.get('action', 'none')

        alert.verification_note = verification_note
        alert.status = status_choice

        action_taken_str = "Status updated"

        if action_choice == "approve":
            if anomaly.vote_record:
                anomaly.vote_record.status = 'Approved'
                anomaly.vote_record.save()
            action_taken_str = "Approved Pending Votes"
        elif action_choice == "reject":
            if anomaly.vote_record:
                anomaly.vote_record.status = 'Rejected'
                anomaly.vote_record.save()
            action_taken_str = "Rejected Fraudulent Votes"
        elif action_choice == "flag":
            action_taken_str = "Flagged for further review"

        alert.action_taken = action_taken_str
        alert.save()

        ActivityLog.objects.create(
            action=f"System Admin investigated Alert #{alert.id} ({candidate.name}) - {action_taken_str}"
        )

        return Response({"message": "Investigation saved successfully."})

class AnalyticsViewSet(viewsets.ViewSet):
    def list(self, request):
        """Returns the dashboard/analytics top level metric aggregates"""
        analytics_data = (
            VoteRecord.objects.filter(status='Approved')
            .values('candidate__name', 'candidate__party')
            .annotate(total_votes=Sum('votes'))
            .order_by('-total_votes')
        )
        
        party_data = {}
        for item in analytics_data:
            party = item['candidate__party']
            votes = item['total_votes'] or 0
            party_data[party] = party_data.get(party, 0) + votes
                
        sorted_parties = dict(sorted(party_data.items(), key=lambda item: item[1], reverse=True))

        return Response({
            "total_votes": sum((item['total_votes'] or 0) for item in analytics_data),
            "total_candidates": len(analytics_data),
            "leader": analytics_data[0]['candidate__name'] if analytics_data else "N/A",
            "leading_party": list(sorted_parties.keys())[0] if sorted_parties else "N/A",
            "bar_chart": {
                "labels": [item['candidate__name'] for item in analytics_data][:10],
                "data": [item['total_votes'] or 0 for item in analytics_data][:10]
            },
            "doughnut_chart": {
                "labels": list(sorted_parties.keys()),
                "data": list(sorted_parties.values())
            }
        })

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-created_at')
    serializer_class = ActivityLogSerializer
