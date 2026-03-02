from django.shortcuts import render
from .models import Election, VoteRecord, Candidate, Alert
from django.db.models import Sum
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect
from django.contrib.auth.models import Group

@login_required
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

    # 🔥 Total Votes
    total_votes = vote_records.aggregate(total=Sum('votes'))['total'] or 0

    # 🔥 Candidate Vote Aggregation
    candidate_votes = (
        vote_records
        .values('candidate__id', 'candidate__name', 'candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    # 🔥 Convert to list (important for modification)
    candidate_votes = list(candidate_votes)

    # 🔥 Add Percentage
    for c in candidate_votes:
        if total_votes > 0:
            c['percentage'] = round((c['total_votes'] / total_votes) * 100, 2)
        else:
            c['percentage'] = 0

    # 🔥 Leading Candidate
    leading_candidate = candidate_votes[0] if candidate_votes else None

    # 🔥 Chart Data
    chart_labels = [c['candidate__name'] for c in candidate_votes]
    chart_data = [c['total_votes'] for c in candidate_votes]

    context = {
        'elections': elections.count(),
        'elections_list': elections,
        'selected_election_id': int(selected_election_id) if selected_election_id else None,
        'candidates': candidates.count(),
        'votes': total_votes,
        'alerts': Alert.objects.filter(status='Active').count(),
        'recent_alerts': Alert.objects.order_by('-created_at')[:5],
        'candidate_votes': candidate_votes,
        'leading_candidate': leading_candidate,
        'chart_labels': chart_labels,
        'chart_data': chart_data
    }

    return render(request, 'dashboard.html', context)


def alerts_page(request):
    alerts = Alert.objects.all().order_by('-created_at')
    return render(request, 'alerts.html', {'alerts': alerts})


def resolve_alert(request, alert_id):
    alert = Alert.objects.get(id=alert_id)
    alert.status = "Resolved"
    alert.save()
    return redirect('alerts')



def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid Credentials'})

    return render(request, 'login.html')


def logout_view(request):
    logout(request)
    return redirect('login')