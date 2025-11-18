# Email Integration Guide

## Overview
Email notifications are sent to parents when they complete the student re-registration process. The system uses SendGrid to send HTML-formatted confirmation emails.

## Architecture

### Backend Components

#### 1. Email Service (`backend/services/email_service.py`)
- **Function**: `send_registration_completion_email(to_email, parent_name, student_names, selected_plan)`
- **Purpose**: Sends HTML email with registration details
- **Features**:
  - HTML-formatted email template
  - Student list in email body
  - Payment plan details
  - Automatic date formatting
  - Next steps guidance
  - SendGrid integration with error handling

#### 2. Parent Routes (`backend/routes/parent_routes.py`)
- **Endpoint**: `POST /api/parents/{parent_id}/send-registration-email`
- **Request Body**:
  ```json
  {
    "parent_email": "parent@example.com",
    "parent_name": "John Doe",
    "student_names": ["Student One", "Student Two"],
    "selected_plan": "Monthly Debit Order"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Registration email sent successfully",
    "sent": true
  }
  ```

### Frontend Components

#### 1. Parent API (`frontend/src/api/parentApi.ts`)
- **Function**: `sendRegistrationEmail(parentId, emailData)`
- **Purpose**: Calls backend endpoint to send email
- **Usage**:
  ```typescript
  const response = await sendRegistrationEmail(parentId, {
    parent_email: "parent@example.com",
    parent_name: "John Doe",
    student_names: ["Student One"],
    selected_plan: "Monthly Debit Order"
  });
  ```

#### 2. Registration Success Page (`frontend/src/pages/RegistrationSuccess.tsx`)
- **Trigger**: Automatically sends email when page loads
- **Data Flow**:
  1. Page receives `parentId`, `students`, and `parentData` from navigation state
  2. `useEffect` hook triggers on component mount
  3. Fetches selected payment plan via `fetchSelectedPlan()`
  4. Calls `sendRegistrationEmail()` with all required data
  5. Logs success/error to console

#### 3. Login Page Update (`frontend/src/pages/Login.tsx`)
- **Change**: Now stores complete parent object in `localStorage` as `parent_data`
- **Benefit**: Allows all pages to access parent email and name

#### 4. Review Submit Page Update (`frontend/src/pages/ReviewSubmit.tsx`)
- **Change**: Fetches parent data from localStorage and passes to success page
- **Data Flow**: 
  - Retrieves parent data from localStorage on component mount
  - Passes `parentData` through navigation state to RegistrationSuccess

## Data Flow Diagram

```
User completes registration on ReviewSubmit
    ↓
Clicks "Complete Registration" button
    ↓
Navigates to RegistrationSuccess with parentId + students + parentData
    ↓
useEffect hook triggers on RegistrationSuccess mount
    ↓
Fetches selected payment plan from backend
    ↓
Calls sendRegistrationEmail() API function
    ↓
Frontend sends POST request to /api/parents/{parent_id}/send-registration-email
    ↓
Backend endpoint receives request
    ↓
Calls email_service.send_registration_completion_email()
    ↓
SendGrid sends HTML email to parent
    ↓
Logs success/error to console
```

## Environment Variables

The following environment variables must be set for email to work:

```
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@knitedi.co.za
```

## Email Template

The email includes:
- Welcome message with parent name
- List of all registered students
- Selected payment plan details
- Registration date
- Next steps and contact information
- Knit Edu branding

## Testing

### Manual Test via Postman
```
POST http://localhost:8000/api/parents/0707155260099/send-registration-email
Content-Type: application/json

{
  "parent_email": "test@example.com",
  "parent_name": "John Doe",
  "student_names": ["Jane Doe", "Jack Doe"],
  "selected_plan": "Monthly Debit Order"
}
```

### Console Logs
Watch the backend terminal for:
```
📧 [send_registration_email] ===== START =====
📧 [send_registration_email] Received request for parent_id='...'
📧 [send_registration_email] Email data: {...}
✅ Email sent successfully
📧 [send_registration_email] ===== END =====
```

## Error Handling

- **Missing Email**: Email endpoint returns 500 with error message
- **SendGrid API Error**: Exception caught and logged, user not blocked
- **Network Error**: Frontend logs to console, registration still completes

## Future Enhancements

1. **Email Templates**: Move HTML template to separate file
2. **Async Processing**: Queue emails for async sending (Celery)
3. **Email History**: Store sent emails in database
4. **Retry Logic**: Automatically retry failed emails
5. **Email Tracking**: Add open/click tracking via SendGrid webhooks
6. **Unsubscribe**: Add unsubscribe link to emails
7. **Translations**: Send emails in parent's preferred language

## Troubleshooting

### Emails not sending
1. Check SENDGRID_API_KEY is set correctly
2. Verify FROM_EMAIL is a verified sender in SendGrid
3. Check email address in request is valid
4. Check backend logs for error messages

### Email appears in spam
1. Add sender email to SPF/DKIM records
2. Use verified domain in FROM_EMAIL
3. Check email content for spam triggers

### User data not in email
1. Verify parentData is being stored in localStorage
2. Check that fetchSelectedPlan() returns valid plan object
3. Verify student_names array is populated correctly
