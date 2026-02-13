from django.contrib import admin
from .models import Election, Candidate, VoteRecord, Anomaly, Alert
admin.site.register(Election)
admin.site.register(Candidate)
admin.site.register(VoteRecord)
admin.site.register(Anomaly)
admin.site.register(Alert)
