import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")

def send_account_created_email(to_email: str, user_name: str):
    subject = "Your Account Has Been Created"
    html_content = f"""
    <h2>Hello {user_name},</h2>
    <p>Your account has been created successfully.</p>
    <p>You can now log in using your email and password.</p>
    <br/>
    <p>Thank you,<br/>Your Application Team</p>
    """
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Email sent: {response.status_code}")
    except Exception as e:
        print(f"Error sending email: {e}")
        raise e


def send_registration_completion_email(to_email: str, parent_name: str, student_names: list, selected_plan: str):
    """Send confirmation email after successful re-registration"""
    student_list = ", ".join(student_names)
    subject = "Student Re-Registration Confirmation 2024"
    html_content = f"""
    <h2>Hello {parent_name},</h2>
    <p>Your student re-registration has been completed successfully!</p>
    
    <h3>Registration Details:</h3>
    <ul>
    <li><strong>Students Registered:</strong> {student_list}</li>
    <li><strong>Payment Plan:</strong> {selected_plan}</li>
    <li><strong>Date:</strong> {str(__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M'))}</li>
    </ul>
    
    <p>Your registration is now complete. You will receive further communication regarding payment and any additional requirements.</p>
    
    <h3>Next Steps:</h3>
    <ul>
    <li>Review your selected payment plan</li>
    <li>Ensure payment is made by the due date</li>
    <li>Keep this confirmation email for your records</li>
    </ul>
    
    <p>If you have any questions, please contact our admissions office.</p>
    <br/>
    <p>Thank you,<br/>School Admissions Team</p>
    """
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Registration completion email sent to {to_email}: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Error sending registration email: {type(e).__name__}: {str(e)}")
        # Log the error but don't fail - email is optional for registration to complete
        print(f"📧 Email service error (non-blocking): {str(e)}")
        print(f"📧 Email was intended for: {to_email}")
        print(f"📧 Subject: {subject}")
        # Return True anyway to not block registration
        return True
