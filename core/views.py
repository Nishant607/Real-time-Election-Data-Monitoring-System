from django.shortcuts import render
from django.db.models import Sum
from .models import Election, VoteRecord, Candidate, Anomaly, Alert

from django.shortcuts import render
from .models import Election, VoteRecord, Candidate, Anomaly, Alert
from django.db.models import Sum


def dashboard(request):
    candidate_votes = (
        Candidate.objects
        .annotate(total_votes=Sum('voterecord__votes'))
    )

    context = {
        'elections': Election.objects.count(),
        'candidates': Candidate.objects.count(),
        'votes': VoteRecord.objects.count(),
        'alerts': Alert.objects.filter(status='Active').count(),
        'recent_alerts': Alert.objects.order_by('-created_at')[:5],
        'candidate_votes': candidate_votes
    }

    return render(request, 'dashboard.html', context)



def alerts_page(request):
    alerts = Alert.objects.all().order_by('-created_at')
    return render(request, 'alerts.html', {'alerts': alerts})


