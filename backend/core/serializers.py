from rest_framework import serializers
from .models import Election, Candidate, VoteRecord, Anomaly, Alert, ActivityLog

class ElectionSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField() # Expose the dynamic property
    class Meta:
        model = Election
        fields = ['id', 'name', 'start_date', 'end_date', 'status']

class CandidateSerializer(serializers.ModelSerializer):
    election_name = serializers.CharField(source='election.name', read_only=True)
    class Meta:
        model = Candidate
        fields = ['id', 'election', 'election_name', 'name', 'party']

class VoteRecordSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    class Meta:
        model = VoteRecord
        fields = ['id', 'candidate', 'candidate_name', 'votes', 'timestamp']

class AnomalySerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    class Meta:
        model = Anomaly
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    anomaly = AnomalySerializer(read_only=True)
    vote_history = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = '__all__'

    def get_vote_history(self, obj):
        # Match the logic from the old alert_detail view
        candidate = obj.anomaly.candidate
        history = VoteRecord.objects.filter(candidate=candidate).order_by('-timestamp')[:15]
        return VoteRecordSerializer(reversed(history), many=True).data

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
