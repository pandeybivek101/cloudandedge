# Generated by Django 4.1.1 on 2023-02-22 11:40

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Trash',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source', models.CharField(max_length=500)),
                ('current_path', models.CharField(max_length=500)),
                ('deleted_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
    ]
