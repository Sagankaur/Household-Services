import csv
import os
from flask import current_app
from application.jobs.email import mail 

from celery import shared_task
from datetime import datetime
from flask import render_template
from sqlalchemy import and_

from application.data.model import *

@shared_task(ignore_result=True)
def send_daily_reminder():
    """Send daily reminder to professionals with pending service requests."""
    
    professionals = Professional.query.all()

    for professional in professionals:
        pending_requests = [req for req in professional.service_requests if req.service_status == "pending"]
        if pending_requests and professional.user.email:
            mail(
                to=professional.user.email,
                subject="Daily Reminder",
                content="Reminder: You have pending service requests."
            )

@shared_task(ignore_result=True)
def send_monthly_reports():
    """Generate and send monthly reports to customers with their service request details."""
    
    first_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    customers = Customer.query.all()

    for customer in customers:
        service_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.date_of_request >= first_of_month
        ).all()

        if not service_requests:
            continue  # Skip if no requests

        services_data = [service.to_dict() for service in service_requests]

        rendered_report = render_template(
            'monthly_report.html',
            customer=customer.user.to_dict(),
            services=services_data
        )

        mail(
            to=customer.user.email,
            subject="Your Monthly Activity Report",
            content=rendered_report
        )

@shared_task(ignore_result=False)
def export_closed_requests(professional_id):
    with current_app.app_context():  
        service_requests = ServiceRequest.query.filter_by(
            professional_id=professional_id,
            service_status='closed'
        ).all()

        if not service_requests:
            return None

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_path = os.path.join("application", "jobs", "User_downloads", f"service_requests_{professional_id}.csv")
        
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

        print(file_path)
        
        with open(file_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Service ID', 'Customer ID', 'Professional ID', 'Date of Request', 'Review'])
            for request in service_requests:
                writer.writerow([request.id, request.customer_id, request.professional_id, request.date_of_request, request.review])

        mail(
            to= professional.user.email,
            subject="CSV Export Completed",
            content=f"The CSV export for professional {professional_id} is complete. Download it here: {file_path}"
        )
        return file_path

