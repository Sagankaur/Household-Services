from celery.schedules import crontab
#from flask import current_app
#from application import create_app
from .tasks import send_daily_reminder, send_monthly_reports

def register_periodic_tasks(celery_app):
    """Register periodic tasks with Celery."""
    #celery_app = current_app.extensions['celery']  # Access the Celery instance

    @celery_app.on_after_configure.connect
    def setup_periodic_tasks(sender, **kwargs):
        # Schedule daily reminders at 6 PM
        sender.add_periodic_task(
            crontab(hour=18, minute=0),
            send_daily_reminder.s(),  # Use the task function without additional arguments
            name='Send daily reminders to professionals'
        )

        # Schedule monthly reports at 8 AM on the first day of each month
        sender.add_periodic_task(
            crontab(day_of_month=1, hour=8, minute=0),
            send_monthly_reports.s(),
            name='Send monthly reports to customers'
        )

        sender.add_periodic_task(
            crontab(hour=0, minute=0),
            cleanup_old_charts.s(),
            name='Cleanup old charts'
        )

