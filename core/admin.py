from django.contrib import admin
from .models import Election
from .models import Candidate
from .models import VoteRecord
from .models import Anomaly
admin.site.register(Anomaly)
admin.site.register(VoteRecord)
admin.site.register(Election)
admin.site.register(Candidate)
