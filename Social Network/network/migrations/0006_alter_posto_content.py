# Generated by Django 4.2.1 on 2023-05-20 22:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_rename_post_posto'),
    ]

    operations = [
        migrations.AlterField(
            model_name='posto',
            name='content',
            field=models.CharField(max_length=512),
        ),
    ]
