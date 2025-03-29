import csv
import os
from pathlib import Path
from flask import url_for
from flask import current_app
from application.jobs.email import mail 
from celery import shared_task
from datetime import datetime
from flask import render_template
from sqlalchemy import and_
from application.jobs.workers import celery  
from application.data.model import *
from application.controllers.controllers import download_csv
# BASE_DIR = Path(__file__).resolve().parent.parent.parent
@shared_task(ignore_result=True)
def send_daily_reminder():
    """Send daily reminder to professionals with pending service requests."""
    professionals = Professional.query.all()
    for professional in professionals:
        pending_requests = [req for req in professional.service_requests if req.service_status == "pending"]
        if pending_requests and professional.user.email:
            request_ids = ", ".join(str(req.id) for req in pending_requests)
            mail(
                to=professional.user.email,
                subject=f"{professional.user.name}: Pending Requests",
                content=f"Reminder: You have pending service requests ID: [{request_ids}] . Please A to Z Household Service to visit/accept/reject the service request"
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
            subject=f"{customer.user.name}: Monthly Activity Report",
            content=rendered_report
        )


# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# app.config["DOWNLOAD_FOLDER"] = os.path.join(BASE_DIR, "application", "jobs", "User_downloads")

@celery.task(bind=True, max_retries=3)
def export_closed_requests(self, professional_id):
    try:
        professional = Professional.query.get(professional_id)
        if not professional:
            raise ValueError(f"Professional with ID {professional_id} not found.")
        
        requests = ServiceRequest.query.filter_by(
            professional_id=professional_id,
            service_status='closed'
        ).all()
        if not requests:
            mail(
            to=[professional.user.email],
            subject=f"CSV Export Ready for {professional.user.name}",
            content=f"There are no Service requests associated with {professional.user.name}"
            )
            return "No requests for this professional"
        # Ensure export directory matches Flask route directory
        export_dir = os.path.abspath(os.path.join(os.getcwd(), "static", "User_downloads"))
        # export_dir = os.path.join("backend", "static", "User_downloads")
        os.makedirs(export_dir, exist_ok=True)  

        filename = f"service_requests_{professional_id}.csv"
        file_path = os.path.join(export_dir, filename)
        # os.makedirs(os.path.dirname(file_path), exist_ok=True)
        print("filename:", filename,"file_path:",file_path)

        try:
            with open(file_path, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow([
                    'Service Request ID', 'Service ID', 'Customer ID', 'Professional ID', 
                    'Date of Request', 'Date of Completion', 'Service Status', 
                    'Remarks', 'Review', 'Rating'
                ])
                for req in requests:
                    row = [
                        req.id, req.service_id, req.customer_id, req.professional_id,
                        req.date_of_request.isoformat() if req.date_of_request else "",
                        req.date_of_completion.isoformat() if req.date_of_completion else "",
                        req.service_status, req.remarks or "",
                        req.review or "", req.rating if req.rating is not None else ""
                    ]
                    writer.writerow(row)
                    # print(f"Row written: {row}")
            print(f"✅ File written successfully: {file_path}")
        except Exception as e:
            print(f"❌ Failed to write CSV: {e}")

        server_name = "http://127.0.0.1:5000"  # Update for production
        download_url = f"{server_name}/static/User_downloads/{filename}"
        print("download_url",download_url)
        mail(
            to=[professional.user.email],
            subject=f"CSV Export Ready for {professional.user.name}",
            content=f"Download your export: {download_url}"
        )

        print(f"Download URL: {download_url}")
        return download_url
    except Exception as e:
        self.retry(exc=e, countdown=60)
