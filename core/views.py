from django.shortcuts import render
from .models import Election, VoteRecord, Candidate, Alert
from django.db.models import Sum

def dashboard(request):
    elections = Election.objects.all()
    selected_election_id = request.GET.get('election')

    if selected_election_id:
        selected_election = Election.objects.get(id=selected_election_id)
        candidates = Candidate.objects.filter(election=selected_election)
        vote_records = VoteRecord.objects.filter(candidate__election=selected_election)
    else:
        candidates = Candidate.objects.all()
        vote_records = VoteRecord.objects.all()

    total_votes = vote_records.aggregate(total=Sum('votes'))['total'] or 0

    candidate_votes = (
        vote_records
        .values('candidate__name', 'candidate__party')
        .annotate(total_votes=Sum('votes'))
    )

    context = {
        'elections': elections.count(),
        'elections_list': elections,
        'selected_election_id': int(selected_election_id) if selected_election_id else None,
        'candidates': candidates.count(),
        'votes': total_votes,
        'alerts': Alert.objects.filter(status='Active').count(),
        'recent_alerts': Alert.objects.order_by('-created_at')[:5],
        'candidate_votes': candidate_votes
    }

    return render(request, 'dashboard.html', context)


def alerts_page(request):
    alerts = Alert.objects.all().order_by('-created_at')
    return render(request, 'alerts.html', {'alerts': alerts})