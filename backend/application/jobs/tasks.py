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

@shared_task(ignore_result = False) # Remove bind=True
def export_closed_requests(professional_id): #admin trigerred
    service_requests = ServiceRequest.query.filter_by(
        professional_id=professional_id,
        service_status='closed'
    ).all()

    if not service_requests:
        return None

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_path = os.path.join('celery', 'User_downloads', f'service_requests_{professional_id}_{timestamp}.csv')
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Service ID', 'Customer ID', 'Professional ID', 'Date of Request', 'Review'])
        for request in service_requests:
            writer.writerow([request.id, request.customer_id, request.professional_id, request.date_of_request, request.review])

    send_email(
        subject="CSV Export Completed",
        recipients=['admin@example.com'],
        body=f"The CSV export for professional {professional_id} is complete. Download it here: {file_path}"
    )
    return file_path

@shared_task(ignore_result=True)
def cleanup_old_charts():
    chart_dir = "static/charts"
    if not os.path.exists(chart_dir):
        return
    
    current_time = datetime.now()
    for filename in os.listdir(chart_dir):
        file_path = os.path.join(chart_dir, filename)
        file_modified = datetime.fromtimestamp(os.path.getmtime(file_path))
        if (current_time - file_modified).days > 1:
            os.remove(file_path)
