import csv
import os

#import flask_excel

from celery import shared_task
from celery import Celery
from flask_mail import Message
from datetime import datetime
from flask import render_template

from application.data.model import *
from application.jobs.email import *

@shared_task(ignore_result = True)
def send_daily_reminder():
    """Send daily reminder to professionals with pending service requests."""
    
    professionals = Professional.query.all()

    for professional in professionals:
        if professional.service_requests.service_status == "pending":
        # Prepare reminder message
            reminder_message = "Reminder: You have pending service requests. Please visit or take action."

            # Send email as a fallback
            if professional.user.email:
                msg = Message(
                    'Daily Reminder',
                    sender='your-email@gmail.com',
                    recipients=[professional.user.email]
                )
                msg.body = reminder_message
                mail.send(msg)
@shared_task(ignore_result = True)
def send_monthly_reports():
    first_of_month = datetime(datetime.now().year, datetime.now().month, 1)
    customers = Customer.query.all()

    for customer in customers:
        service_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.date_of_request >= first_of_month
        ).all()

        if not service_requests:
            continue

        rendered_report = render_template(
            'monthly_report.html',
            customer=customer,
            services=service_requests
        )

        send_email(
            subject="Your Monthly Activity Report",
            recipients=[customer.user.email],
            body="Please find your activity report attached.",
            html=rendered_report
        )

