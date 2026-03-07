from django.db import models
from django.core.mail import send_mail
from datetime import timedelta


class Election(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name


class Candidate(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    party = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class VoteRecord(models.Model):

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    votes = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        is_new = self.pk is None
        super().save(*args, **kwargs)

        # 🔥 Activity Log
        ActivityLog.objects.create(
            action=f"Vote updated for {self.candidate.name} ({self.votes} votes)"
        )

        if not is_new:
            return

        previous_record = (
            VoteRecord.objects
            .filter(candidate=self.candidate)
            .exclude(id=self.id)
            .order_by('-id')
            .first()
        )

        if previous_record:

            vote_diff = self.votes - previous_record.votes

            if previous_record.votes > 0:
                percentage_increase = (vote_diff / previous_record.votes) * 100
            else:
                percentage_increase = 0

            time_diff = (self.timestamp - previous_record.timestamp).seconds

            if percentage_increase >= 50 or time_diff < 60:

                anomaly = Anomaly.objects.create(
                    candidate=self.candidate,
                    previous_votes=previous_record.votes,
                    current_votes=self.votes,
                    reason="Suspicious voting spike detected"
                )

                Alert.objects.create(
                    anomaly=anomaly,
                    message=f"Suspicious voting spike detected for {self.candidate.name}",
                    severity="High"
                )

                # 🔥 Email Alert
                send_mail(
                    "Election Alert",
                    f"Suspicious voting spike detected for {self.candidate.name}. Previous votes: {previous_record.votes}, Current votes: {self.votes}",
                    "nc798803@gmail.com",
                    ["nc798803@gmail.com"],
                    fail_silently=True,
                )

    def __str__(self):
        return f"{self.candidate.name} - {self.votes}"


class Anomaly(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    previous_votes = models.IntegerField()
    current_votes = models.IntegerField()
    detected_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=200)

    def __str__(self):
        return self.reason


class Alert(models.Model):
    anomaly = models.ForeignKey(Anomaly, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, default="High")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="Active")

    def __str__(self):
        return self.message


class ActivityLog(models.Model):

    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.action