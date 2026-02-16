from django.shortcuts import render
from django.db.models import Sum
from .models import Election, VoteRecord, Candidate, Anomaly, Alert

from django.shortcuts import render
from .models import Election, VoteRecord, Candidate, Anomaly, Alert
from django.db.models import Sum


def dashboard(request):
    candidate_votes = (
        VoteRecord.objects
        .values('candidate__name', 'candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )
    context = {
        'elections': Election.objects.count(),
        'candidates': Candidate.objects.count(),
        'votes': VoteRecord.objects.aggregate(total=Sum('votes'))['total'] or 0,
        'alerts': Alert.objects.filter(status='Active').count(),
        'recent_alerts': Alert.objects.order_by('-created_at')[:5],
        'candidate_votes': candidate_votes
    }

    return render(request, 'dashboard.html', context)



def alerts_page(request):
    alerts = Alert.objects.all().order_by('-created_at')
    return render(request, 'alerts.html', {'alerts': alerts})


