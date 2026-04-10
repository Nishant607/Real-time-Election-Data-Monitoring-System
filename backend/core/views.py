from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Group, User
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
        vote_records = VoteRecord.objects.filter(candidate__election=selected_election, status='Approved')
    else:
        candidates = Candidate.objects.all()
        vote_records = VoteRecord.objects.filter(status='Approved')

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
# Investigate Alert (replaces basic resolve)
# ==============================
@login_required
def alert_detail(request, alert_id):
    if not request.user.groups.filter(name='Admin').exists():
        return redirect('alerts')

    alert = get_object_or_404(Alert, id=alert_id)
    anomaly = alert.anomaly
    candidate = anomaly.candidate

    # Get recent vote history for chart
    vote_history = VoteRecord.objects.filter(candidate=candidate, status='Approved').order_by('-timestamp')[:15]
    vote_history = list(reversed(vote_history))

    chart_labels = [v.timestamp.strftime("%H:%M:%S") for v in vote_history]
    chart_data = [v.votes for v in vote_history]

    # Get recent activity log regarding this candidate
    recent_activity = ActivityLog.objects.filter(
        action__icontains=candidate.name
    ).order_by('-created_at')[:10]

    if request.method == "POST":
        verification_note = request.POST.get('verification_note', '')
        status = request.POST.get('status', 'Active')
        action = request.POST.get('action', 'None')

        alert.verification_note = verification_note
        alert.status = status

        action_taken_str = "Status updated"

        if action == "approve":
            if anomaly.vote_record:
                anomaly.vote_record.status = 'Approved'
                anomaly.vote_record.save()
            action_taken_str = "Approved Pending Votes"
        elif action == "reject":
            if anomaly.vote_record:
                anomaly.vote_record.status = 'Rejected'
                anomaly.vote_record.save()
            action_taken_str = "Rejected Fraudulent Votes"
        elif action == "flag":
            action_taken_str = "Flagged for further review"

        alert.action_taken = action_taken_str
        alert.save()

        ActivityLog.objects.create(
            action=f"Admin {request.user.username} investigated Alert #{alert.id} ({candidate.name}) - {action_taken_str}"
        )

        return redirect('alerts')

    context = {
        'alert': alert,
        'anomaly': anomaly,
        'candidate': candidate,
        'chart_labels': chart_labels,
        'chart_data': chart_data,
        'recent_activity': recent_activity,
        'vote_difference': anomaly.current_votes - anomaly.previous_votes,
        'status_choices': [s[0] for s in Alert.STATUS_CHOICES]
    }
    return render(request, "alert_detail.html", context)

# ==============================
# Export Specific Alert PDF
# ==============================
@login_required
def export_alert_pdf(request, alert_id):
    if not request.user.groups.filter(name='Admin').exists():
        return HttpResponse("Unauthorized", status=403)

    alert = get_object_or_404(Alert, id=alert_id)
    anomaly = alert.anomaly

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Incident Report: Alert #{alert.id}", styles['Title']))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph(f"<b>Candidate:</b> {anomaly.candidate.name}", styles['Normal']))
    elements.append(Paragraph(f"<b>Detection Time:</b> {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Paragraph(f"<b>Severity:</b> {alert.severity}", styles['Normal']))
    elements.append(Paragraph(f"<b>Status:</b> {alert.status}", styles['Normal']))
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("<b>Investigation Details:</b>", styles['Heading3']))
    
    table_data = [
        ["Metric", "Value"],
        ["Previous Votes", str(anomaly.previous_votes)],
        ["Current Votes", str(anomaly.current_votes)],
        ["Vote Difference", str(anomaly.current_votes - anomaly.previous_votes)],
        ["System Reason", anomaly.reason]
    ]

    table = Table(table_data, colWidths=[150, 250])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("<b>Admin Notes & Actions:</b>", styles['Heading3']))
    elements.append(Paragraph(f"<b>Verification Note:</b> {alert.verification_note or 'None provided'}", styles['Normal']))
    elements.append(Paragraph(f"<b>Action Taken:</b> {alert.action_taken or 'None'}", styles['Normal']))

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="alert_report_{alert.id}.pdf"'
    return response


# ==============================
# Login
# ==============================
    return render(request, "login.html")


from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

@ensure_csrf_cookie
@login_required
def current_user(request):
    user = request.user
    role = "Admin" if user.groups.filter(name='Admin').exists() else "Viewer"
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "role": role,
        "email": user.email
    })


@csrf_exempt
@ensure_csrf_cookie
def api_login(request):
    if request.method == "POST":
        import json
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except:
            username = request.POST.get("username")
            password = request.POST.get("password")

        if not username or not password:
            return JsonResponse({"status": "error", "message": "Username and password required"}, status=400)

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            role = "Admin" if user.groups.filter(name='Admin').exists() else "Viewer"
            return JsonResponse({
                "status": "success",
                "user": {
                    "username": user.username,
                    "role": role
                }
            })
        return JsonResponse({"status": "error", "message": "Login failed: Invalid credentials"}, status=401)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)


def api_logout(request):
    logout(request)
    return JsonResponse({"status": "success"})


# ==============================
# Vote Data API (for chart auto update)
# ==============================
def vote_data_api(request):

    data = (
        VoteRecord.objects.filter(status='Approved')
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
        VoteRecord.objects.filter(status='Approved')
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


# ==============================
# Technical Data Stream Exports
# ==============================

@login_required
def export_candidates_json(request):
    if not request.user.groups.filter(name='Admin').exists():
        return JsonResponse({"error": "Unauthorized"}, status=403)

    candidates = Candidate.objects.all().values('id', 'name', 'party', 'election__name')
    data = list(candidates)
    
    import json
    response = HttpResponse(json.dumps(data, indent=4), content_type="application/json")
    response["Content-Disposition"] = 'attachment; filename="candidates_database.json"'
    return response


@login_required
def export_voters_csv(request):
    if not request.user.groups.filter(name='Admin').exists():
        return HttpResponse("Unauthorized", status=403)

    import csv
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="voter_participation_log.csv"'

    writer = csv.writer(response)
    writer.writerow(['Timestamp', 'Candidate', 'Party', 'Election', 'Votes Recorded'])

    records = VoteRecord.objects.select_related('candidate', 'candidate__election').filter(status='Approved').order_by('-timestamp')
    for r in records:
        writer.writerow([
            r.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            r.candidate.name,
            r.candidate.party,
            r.candidate.election.name,
            r.votes
        ])

    return response


@login_required
def export_network_health_pdf(request):
    if not request.user.groups.filter(name='Admin').exists():
        return HttpResponse("Unauthorized", status=403)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("System Network Health Report", styles['Title']))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("This report provides a status summary of the election monitoring network nodes and connectivity metrics.", styles['Normal']))
    elements.append(Spacer(1, 15))

    # Dummy metric data
    data = [
        ["Metric", "Status", "Value"],
        ["Primary Node Connectivity", "Stable", "99.9% Up"],
        ["Database Replication Lag", "Nominal", "42ms"],
        ["Anomaly Engine Latency", "Operational", "120ms"],
        ["Admin Panel Sync", "Healthy", "OK"],
        ["Public Observer API", "Active", "No Issues"]
    ]

    table = Table(data, colWidths=[200, 100, 100])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="network_health_report.pdf"'
    return response


@login_required
def export_events_wav(request):
    """Returns a simple dummy WAV file for the anomalous event feed."""
    if not request.user.groups.filter(name='Admin').exists():
        return HttpResponse("Unauthorized", status=403)

    # Simple 1-second silent WAV file header + data
    # (Simplified for demonstration, providing a minimal valid WAV structure)
    import struct
    
    sample_rate = 8000
    duration = 1 # second
    num_samples = sample_rate * duration
    
    # WAV Header
    header = b'RIFF'
    header += struct.pack('<L', 36 + num_samples * 2) # Total size
    header += b'WAVEfmt '
    header += struct.pack('<L', 16) # Subchunk1Size
    header += struct.pack('<H', 1)  # AudioFormat (PCM)
    header += struct.pack('<H', 1)  # NumChannels (Mono)
    header += struct.pack('<L', sample_rate)
    header += struct.pack('<L', sample_rate * 2) # ByteRate
    header += struct.pack('<H', 2) # BlockAlign
    header += struct.pack('<H', 16) # BitsPerSample
    header += b'data'
    header += struct.pack('<L', num_samples * 2) # Subchunk2Size
    
    # Zero samples (silence)
    data = b'\x00\x00' * num_samples
    
    response = HttpResponse(header + data, content_type="audio/wav")
    response["Content-Disposition"] = 'attachment; filename="anomalous_event_feed.wav"'
    return response


@login_required
def export_elections_pdf(request):
    if not (request.user.is_superuser or request.user.groups.filter(name='Admin').exists()):
        return HttpResponse("Unauthorized", status=403)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("Elections Registry Hub Summary", styles['Title']))
    elements.append(Spacer(1, 20))

    # Data
    elections = Election.objects.all().order_by('-start_date')
    table_data = [["ID", "Election Name", "Start Date", "End Date", "Status"]]
    
    for e in elections:
        table_data.append([
            str(e.id),
            e.name,
            str(e.start_date),
            str(e.end_date),
            e.status
        ])

    table = Table(table_data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor('#10b981')), # Emerald-500
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), 'Helvetica-Bold'),
        ("SIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("TOPPADDING", (0, 0), (-1, 0), 12),
        ("ALIGN", (0, 0), (-1, -1), 'CENTER'),
    ]))

    elements.append(table)
    doc.build(elements)

    pdf = buffer.getvalue()
    buffer.close()
    
    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="elections_registry.pdf"'
    return response


@login_required
def export_alerts_pdf(request):
    if not (request.user.is_superuser or request.user.groups.filter(name='Admin').exists()):
        return HttpResponse("Unauthorized", status=403)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("Security Alerts History Report", styles['Title']))
    elements.append(Spacer(1, 20))

    # Data
    alerts = Alert.objects.all().order_by('-created_at')
    table_data = [["Timestamp", "Status", "Candidate", "Reason"]]
    
    for a in alerts:
        table_data.append([
            a.created_at.strftime("%Y-%m-%d %H:%M"),
            a.status,
            a.anomaly.candidate.name if a.anomaly else "N/A",
            a.anomaly.reason if a.anomaly else "N/A"
        ])

    table = Table(table_data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor('#f97316')), # Orange-500
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), 'Helvetica-Bold'),
        ("SIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("TOPPADDING", (0, 0), (-1, 0), 12),
        ("ALIGN", (0, 0), (-1, -1), 'CENTER'),
    ]))

    elements.append(table)
    doc.build(elements)

    pdf = buffer.getvalue()
    buffer.close()
    
    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="security_alerts_history.pdf"'
    return response







@login_required
def analytics_page(request):
    analytics_data = (
        VoteRecord.objects.filter(status='Approved')
        .values('candidate__name', 'candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )
    
    # Calculate Party Distribution for Doughnut Chart
    party_data = {}
    for item in analytics_data:
        party = item['candidate__party']
        votes = item['total_votes'] or 0
        if party in party_data:
            party_data[party] += votes
        else:
            party_data[party] = votes
            
    # Sort parties by vote count
    sorted_parties = dict(sorted(party_data.items(), key=lambda item: item[1], reverse=True))

    labels = [item['candidate__name'] for item in analytics_data][:10] # Top 10 for bar chart
    votes = [item['total_votes'] or 0 for item in analytics_data][:10]
    
    party_labels = list(sorted_parties.keys())
    party_votes = list(sorted_parties.values())

    total_votes = sum(votes)
    total_candidates = len(analytics_data)
    leader = analytics_data[0]['candidate__name'] if analytics_data else "N/A"
    leading_party = party_labels[0] if party_labels else "N/A"

    context = {
        "labels": labels,
        "votes": votes,
        "party_labels": party_labels,
        "party_votes": party_votes,
        "analytics_data": analytics_data,
        "total_votes": total_votes,
        "total_candidates": total_candidates,
        "leader": leader,
        "leading_party": leading_party
    }

    return render(request, "analytics.html", context)






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
    elections = Election.objects.all().order_by('-start_date')
    
    processed_elections = []
    for e in elections:
        candidates_count = Candidate.objects.filter(election=e).count()
        total_votes = VoteRecord.objects.filter(candidate__election=e, status='Approved').aggregate(total=Sum('votes'))['total'] or 0
        alerts_count = Alert.objects.filter(anomaly__candidate__election=e, status="Active").count()
        
        # Calculate progress percentage safely
        from django.utils import timezone
        today = timezone.now().date()
        total_days = (e.end_date - e.start_date).days
        if total_days <= 0:
            progress = 100
        else:
            days_passed = (today - e.start_date).days
            progress = max(0, min(100, (days_passed / total_days) * 100))

        processed_elections.append({
            'election': e,
            'status': e.status, # utilizing our new model property
            'candidates_count': candidates_count,
            'total_votes': total_votes,
            'alerts_count': alerts_count,
            'progress': progress
        })

    return render(request, "elections.html", {
        "elections_data": processed_elections
    })


@login_required
def candidates_page(request):
    candidate_votes = (
        VoteRecord.objects.filter(status='Approved')
        .values('candidate__id','candidate__name','candidate__party')
        .annotate(total_votes=Sum('votes'))
        .order_by('-total_votes')
    )

    candidate_votes = list(candidate_votes)
    total_votes = sum((c['total_votes'] or 0) for c in candidate_votes)
    
    # Get all unique parties for filtering
    parties = set(c['candidate__party'] for c in candidate_votes if c['candidate__party'])

    for i, c in enumerate(candidate_votes):
        c['rank'] = i + 1
        c['total_votes'] = c['total_votes'] or 0
        c['percentage'] = round((c['total_votes'] / total_votes) * 100, 2) if total_votes else 0
        # Generate initials for the avatar (e.g., "John Doe" -> "JD")
        name_parts = c['candidate__name'].split()
        c['initials'] = ''.join([part[0] for part in name_parts[:2]]).upper()

    context = {
        "candidates": candidate_votes,
        "parties": sorted(list(parties))
    }

    return render(request, "candidates.html", context)


@login_required
def reports_page(request):

    total_elections = Election.objects.count()
    total_candidates = Candidate.objects.count()
    total_votes = VoteRecord.objects.filter(status='Approved').aggregate(total=Sum('votes'))['total'] or 0
    total_alerts = Alert.objects.count()

    context = {
        "elections": total_elections,
        "candidates": total_candidates,
        "votes": total_votes,
        "alerts": total_alerts
    }

    return render(request,"reports.html",context)