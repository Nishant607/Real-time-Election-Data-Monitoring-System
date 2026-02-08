from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VoteRecord, Anomaly

THRESHOLD = 100

@receiver(post_save, sender=VoteRecord)
def detect_anomaly(sender, instance, **kwargs):
    candidate = instance.candidate
    current_votes = instance.votes

    # Get previous VoteRecord using ID (reliable)
    previous_record = (
        VoteRecord.objects
        .filter(candidate=candidate, id__lt=instance.id)
        .order_by('-id')
        .first()
    )

    if not previous_record:
        return

    previous_votes = previous_record.votes

    if current_votes - previous_votes >= THRESHOLD:
        Anomaly.objects.create(
            candidate=candidate,
            previous_votes=previous_votes,
            current_votes=current_votes,
            reason="Sudden spike in vote count detected"
        )
