
import sys
import os

BACKEND_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

# Add backend directory to sys.path
sys.path.insert(0, BACKEND_PATH)

from celery import Celery
from application.config import LocalDevelopmentConfig
from celery.schedules import crontab

celery = Celery(__name__, broker=LocalDevelopmentConfig.CELERY_BROKER_URL)
celery.conf.update(
    broker_url=LocalDevelopmentConfig.CELERY_BROKER_URL,
    result_backend=LocalDevelopmentConfig.CELERY_RESULT_BACKEND,
    timezone="Asia/Kolkata",
    broker_connection_retry_on_startup=True,
    beat_schedule={
        "send-daily-alert": {
            "task": "application.jobs.tasks.send_daily_reminder", 
            "schedule": crontab(hour=20, minute=46),
        },
        "send-monthly-alert": {
            "task": "application.jobs.tasks.send_monthly_reports",
            "schedule": crontab(day_of_month='18', hour=20, minute=47),
        },
    }
)



class ContextTask(celery.Task):
    """Make Celery tasks work with Flask app context."""
    def __call__(self, *args, **kwargs):
        from main import app
        with app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask

# ✅ Auto-discover tasks
celery.autodiscover_tasks(["application.jobs"])