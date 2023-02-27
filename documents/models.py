from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone

# Create your models here.
class Trash(models.Model):
    source=models.CharField(max_length=500)
    current_path=models.CharField(max_length=500)
    deleted_at=models.DateTimeField(default=timezone.now)