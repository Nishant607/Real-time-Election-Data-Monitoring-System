from django.shortcuts import render
from .models import Election, VoteRecord, Candidate, Alert
from django.db.models import Sum
from django.shortcuts import redirect , get_object_or_404
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


from django.contrib.auth.decorators import login_required

from django.contrib.auth.decorators import login_required
from .models import Alert

from django.contrib.auth.decorators import login_required
from .models import Alert

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


@login_required
def resolve_alert(request, alert_id):

    # 🔐 Only Admin can resolve
    if not request.user.groups.filter(name='Admin').exists():
        return redirect('alerts')

    alert = get_object_or_404(Alert, id=alert_id)
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




from django.http import JsonResponse
from django.db.models import Sum
from .models import VoteRecord

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


    
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO
from .models import VoteRecord


@login_required
def export_report_pdf(request):

    # Only Admin group can export
    if not request.user.groups.filter(name='Admin').exists():
        return HttpResponse("Unauthorized", status=403)

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer, pagesize=A4)

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Election Vote Report", styles['Title']))
    elements.append(Spacer(1,20))

    data = (
        VoteRecord.objects
        .values('candidate__name','candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    table_data = [["Candidate","Party","Total Votes"]]

    for row in data:
        table_data.append([
            row['candidate__name'],
            row['candidate__party'],
            row['total_votes']
        ])

    table = Table(table_data)

    table.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),colors.grey),
        ("TEXTCOLOR",(0,0),(-1,0),colors.white),
        ("GRID",(0,0),(-1,-1),1,colors.black),
        ("ALIGN",(2,1),(2,-1),"CENTER")
    ]))

    elements.append(table)

    doc.build(elements)

    pdf = buffer.getvalue()
    buffer.close()

    response = HttpResponse(pdf,content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="election_report.pdf"'

    return response