from django.db import models

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
        from .models import Anomaly

        is_new = self.pk is None
        super().save(*args, **kwargs)

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
            if self.votes - previous_record.votes >= 100:
                Anomaly.objects.create(
                    candidate=self.candidate,
                    previous_votes=previous_record.votes,
                    current_votes=self.votes,
                    reason="Sudden spike in vote count detected"
                )


class Anomaly(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    previous_votes = models.IntegerField()
    current_votes = models.IntegerField()
    detected_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=200)

    def __str__(self):
        return self.reason
