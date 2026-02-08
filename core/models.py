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
    vote_count = models.IntegerField()
    timestamp = models.DateTimeField(auto_now=True)

class Anomaly(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    previous_votes = models.IntegerField()
    current_votes = models.IntegerField()
    detected_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=200)

    def __str__(self):
        return self.reason
