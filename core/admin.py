from django.contrib import admin
from .models import Election, Candidate, VoteRecord, Anomaly, Alert


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date')
    search_fields = ('name',)


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('name', 'party', 'election')
    search_fields = ('name', 'party')
    list_filter = ('party',)


@admin.register(VoteRecord)
class VoteRecordAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'votes', 'timestamp')
    list_filter = ('timestamp',)


@admin.register(Anomaly)
class AnomalyAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'previous_votes', 'current_votes', 'reason', 'detected_at')
    list_filter = ('detected_at',)
    search_fields = ('reason',)


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('message', 'severity', 'status', 'created_at')
    list_filter = ('severity', 'status')
    search_fields = ('message',)
