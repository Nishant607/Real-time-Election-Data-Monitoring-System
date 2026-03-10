from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Group
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum
from io import BytesIO

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from .models import Election, VoteRecord, Candidate, Alert
from .models import ActivityLog
from django.db.models import Q


# ==============================
# Dashboard
# ==============================
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

    # Total Votes
    total_votes = vote_records.aggregate(total=Sum('votes'))['total'] or 0

    # Candidate Aggregation
    candidate_votes = (
        vote_records
        .values('candidate__id', 'candidate__name', 'candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    candidate_votes = list(candidate_votes)

    # Add Rank + Percentage
    for index, c in enumerate(candidate_votes, start=1):

        c['rank'] = index

        if total_votes > 0:
            c['percentage'] = round((c['total_votes'] / total_votes) * 100, 2)
        else:
            c['percentage'] = 0

    # Leading Candidate
    leading_candidate = candidate_votes[0] if candidate_votes else None

    # Chart Data
    chart_labels = [c['candidate__name'] for c in candidate_votes]
    chart_data = [c['total_votes'] for c in candidate_votes]
    recent_activity = ActivityLog.objects.order_by('-created_at')[:5]

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
    'chart_data': chart_data,
    'recent_activity': recent_activity
}

    return render(request, 'dashboard.html', context)


# ==============================
# Alerts Page
# ==============================
@login_required
def alerts_page(request):

    alerts = Alert.objects.all().order_by('-created_at')

    status_filter = request.GET.get('status')
    severity_filter = request.GET.get('severity')

    if status_filter and status_filter != "All":
        alerts = alerts.filter(status=status_filter)

    if severity_filter and severity_filter != "All":
        alerts = alerts.filter(severity=severity_filter)

    is_admin = request.user.groups.filter(name='Admin').exists()

    context = {
        "alerts": alerts,
        "is_admin": is_admin,
        "selected_status": status_filter,
        "selected_severity": severity_filter
    }

    return render(request, "alerts.html", context)


# ==============================
# Resolve Alert
# ==============================
@login_required
def resolve_alert(request, alert_id):

    if not request.user.groups.filter(name='Admin').exists():
        return redirect('alerts')

    alert = get_object_or_404(Alert, id=alert_id)
    alert.status = "Resolved"
    alert.save()

    ActivityLog.objects.create(
        action=f"Alert resolved for {alert.anomaly.candidate.name}"
    )

    return redirect('alerts')


# ==============================
# Login
# ==============================
def login_view(request):

    if request.method == "POST":

        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect('dashboard')

        return render(request, "login.html", {"error": "Invalid Credentials"})

    return render(request, "login.html")


# ==============================
# Logout
# ==============================
def logout_view(request):

    logout(request)
    return redirect('login')


# ==============================
# Vote Data API (for chart auto update)
# ==============================
def vote_data_api(request):

    data = (
        VoteRecord.objects
        .values('candidate__name')
        .annotate(total_votes=Sum('votes'))
    )

    labels = []
    votes = []

    for item in data:
        labels.append(item['candidate__name'])
        votes.append(item['total_votes'])

    return JsonResponse({
        "labels": labels,
        "votes": votes
    })


# ==============================
# Export Election Report PDF
# ==============================
@login_required
def export_report_pdf(request):

    if not request.user.groups.filter(name='Admin').exists():
        return HttpResponse("Unauthorized", status=403)

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer, pagesize=A4)

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Election Vote Report", styles['Title']))
    elements.append(Spacer(1, 20))

    data = (
        VoteRecord.objects
        .values('candidate__name', 'candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    table_data = [["Candidate", "Party", "Total Votes"]]

    for row in data:
        table_data.append([
            row['candidate__name'],
            row['candidate__party'],
            row['total_votes']
        ])

    table = Table(table_data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("ALIGN", (2, 1), (2, -1), "CENTER")
    ]))

    elements.append(table)

    doc.build(elements)

    pdf = buffer.getvalue()
    buffer.close()

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="election_report.pdf"'

    return response





@login_required
def analytics_page(request):

    analytics_data = (
        VoteRecord.objects
        .values('candidate__name')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    labels = []
    votes = []

    for item in analytics_data:
        labels.append(item['candidate__name'])
        votes.append(item['total_votes'])

    total_votes = sum(votes)

    total_candidates = len(analytics_data)

    leader = analytics_data[0]['candidate__name'] if analytics_data else "N/A"

    context = {
        "labels": labels,
        "votes": votes,
        "analytics_data": analytics_data,
        "total_votes": total_votes,
        "total_candidates": total_candidates,
        "leader": leader
    }

    return render(request,"analytics.html",context)






@login_required
def search_page(request):

    query = request.GET.get("q")

    candidates = []
    elections = []
    alerts = []

    if query:

        candidates = Candidate.objects.filter(
            Q(name__icontains=query) |
            Q(party__icontains=query)
        )

        elections = Election.objects.filter(
            name__icontains=query
        )

        alerts = Alert.objects.filter(
            message__icontains=query
        )

    context = {
        "query": query,
        "candidates": candidates,
        "elections": elections,
        "alerts": alerts
    }

    return render(request,"search.html",context)


@login_required
def elections_page(request):

    elections = Election.objects.all()

    return render(request,"elections.html",{
        "elections":elections
    })


@login_required
def candidates_page(request):

    candidate_votes = (
        VoteRecord.objects
        .values('candidate__id','candidate__name','candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    candidate_votes = list(candidate_votes)

    total_votes = sum(c['total_votes'] for c in candidate_votes)

    for i, c in enumerate(candidate_votes):
        c['rank'] = i + 1
        c['percentage'] = round((c['total_votes'] / total_votes) * 100,2) if total_votes else 0

    chart_labels = [c['candidate__name'] for c in candidate_votes]
    chart_data = [c['total_votes'] for c in candidate_votes]

    context = {
        "candidates": candidate_votes,
        "chart_labels": chart_labels,
        "chart_data": chart_data
    }

    return render(request,"candidates.html",context)


@login_required
def reports_page(request):

    total_elections = Election.objects.count()
    total_candidates = Candidate.objects.count()
    total_votes = VoteRecord.objects.aggregate(total=Sum('votes'))['total'] or 0
    total_alerts = Alert.objects.count()

    context = {
        "elections": total_elections,
        "candidates": total_candidates,
        "votes": total_votes,
        "alerts": total_alerts
    }

    return render(request,"reports.html",context)