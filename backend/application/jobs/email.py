import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import datetime

SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'admin@study.iitm'
SENDER_PASSWORD = ''

def mail(to, subject, content):
    msg = MIMEMultipart()
    
    if isinstance(to, list):  # Allow multiple recipients
        msg['To'] = ', '.join(to)
    else:
        msg['To'] = to

    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL

    msg.attach(MIMEText(content, 'html'))

    # with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
    #     client.send_message(msg)
    #     client.quit()

    try:
        with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
            client.send_message(msg)
            client.quit()
    except ConnectionRefusedError:
        print("⚠️ No SMTP server found. Install MailHog or check server!")
        # Fallback: Save email to file
        with open('debug_emails.log', 'a') as f:
            f.write(f"{datetime.now()} | To: {professional.user.email}\n"
                    f"Subject: CSV Export Ready\n"
                    f"Download: {download_url}\n\n")