# Email Integration Testing Guide

## Quick Test Flow (5 minutes)

### Option 1: Full End-to-End Test via UI

1. **Start both servers** (if not already running):
   ```powershell
   # Terminal 1: Backend
   cd backend
   uvicorn main:app --reload --port 8000
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Open browser and navigate to**: `http://localhost:8081`

3. **Follow this flow**:
   - Click "Register as Parent" (or "Login" if you have existing parent)
   - Complete parent registration with valid email (use your real email to receive test email)
   - Select students to re-register
   - Update student details
   - Choose financing plan (e.g., "Monthly Debit Order")
   - Review and click "Complete Registration"
   - **Check your email** - You should receive confirmation email in 10-30 seconds

4. **Verify email contains**:
   - ✅ Your name
   - ✅ Student names
   - ✅ Payment plan selected
   - ✅ Registration date
   - ✅ Next steps

---

## Option 2: API Testing with Postman

### Test Email Endpoint Directly

1. **Open Postman** (or use curl)

2. **Create POST request**:
   ```
   URL: http://localhost:8000/api/parents/0707155260099/send-registration-email
   Method: POST
   Headers: Content-Type: application/json
   ```

3. **Body (raw JSON)**:
   ```json
   {
     "parent_email": "your.email@gmail.com",
     "parent_name": "John Doe",
     "student_names": ["Jane Doe", "Jack Doe"],
     "selected_plan": "Monthly Debit Order - R2000/month"
   }
   ```

4. **Send request**

5. **Check response**:
   - Should see: `{"message": "Registration email sent successfully", "sent": true}`
   - Check backend terminal for: `📧 [send_registration_email] ===== END =====`

6. **Check your email** - Email should arrive within 30 seconds

---

## Option 3: Backend Console Testing

### Watch Terminal Logs During Registration

1. **Terminal 1 - Backend logs**:
   ```
   Look for these log messages:
   
   📧 [send_registration_email] ===== START =====
   📧 [send_registration_email] Received request for parent_id='0707155260099'
   📧 [send_registration_email] Email data: {...}
   ✅ Email sent successfully
   📧 [send_registration_email] ===== END =====
   ```

2. **Terminal 2 - Frontend console** (Browser DevTools F12):
   ```
   Look for:
   ✅ Registration email sent successfully
   
   OR
   
   ❌ Failed to send registration email: [error message]
   ```

---

## Option 4: Using curl from PowerShell

```powershell
# Test email sending via curl
$body = @{
    parent_email = "your.email@gmail.com"
    parent_name = "Test Parent"
    student_names = @("Student One")
    selected_plan = "Monthly Debit Order"
} | ConvertTo-Json

curl -X POST `
  -H "Content-Type: application/json" `
  -d $body `
  http://localhost:8000/api/parents/0707155260099/send-registration-email
```

---

## Troubleshooting

### Email Not Received After 1 Minute

**Check 1: Backend logs show error?**
```
❌ [send_registration_email] Error: [error message]
```
- Fix: Check SENDGRID_API_KEY is correct in `.env`
- Verify FROM_EMAIL is a verified sender in SendGrid

**Check 2: Look for wrong email address**
- Ensure "parent_email" in request is correct
- Check for typos (common issue: gmail.com vs gamil.com)

**Check 3: Check spam folder**
- SendGrid emails might go to spam if domain not verified
- Add the email address as contact to mark as safe

**Check 4: Verify backend is running**
- Terminal should show: `Application startup complete`
- If not, restart with: `python -m uvicorn main:app --reload --port 8000`

**Check 5: API endpoint responding?**
```powershell
# Quick test - should return 200
curl -X GET http://localhost:8000/docs
```

### Email Sent But Missing Data

- Missing parent name? → Check parent object is in localStorage
- Missing student names? → Verify students array is populated
- Missing plan? → Check `fetchSelectedPlan()` returned data

---

## Expected Test Results

### Success Scenario
```
FRONTEND CONSOLE:
✅ Registration email sent successfully

BACKEND CONSOLE:
📧 [send_registration_email] ===== START =====
📧 [send_registration_email] Received request for parent_id='0707155260099'
📧 [send_registration_email] Email data: {'parent_email': 'user@gmail.com', ...}
✅ Email sent successfully
📧 [send_registration_email] ===== END =====

EMAIL RECEIVED:
Subject: Registration Confirmation - Knit Edu
From: noreply@knitedi.co.za
Content: Student names, payment plan, date, next steps
```

### Failure Scenario - Missing API Key
```
BACKEND CONSOLE:
📧 [send_registration_email] ===== START =====
❌ [send_registration_email] Error: Invalid API key provided
```
→ **Fix**: Set `SENDGRID_API_KEY` in `.env` file

---

## Test Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 8081
- [ ] SENDGRID_API_KEY set in environment
- [ ] FROM_EMAIL set correctly
- [ ] Email address in test is valid and accessible
- [ ] No errors in browser console
- [ ] Backend logs show success messages
- [ ] Email received within 30 seconds
- [ ] Email contains all expected information
- [ ] Email looks good in email client

---

## Quick Debug Script

Save as `test_email.ps1`:

```powershell
# Test SendGrid connection
Write-Host "Testing Email Integration..." -ForegroundColor Cyan

# Check if backend is running
try {
    $response = curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs
    if ($response -eq "200") {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot reach backend" -ForegroundColor Red
}

# Check if frontend is running
try {
    $response = curl -s -o /dev/null -w "%{http_code}" http://localhost:8081
    if ($response -eq "200") {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot reach frontend" -ForegroundColor Red
}

Write-Host "`nTesting email endpoint..." -ForegroundColor Cyan

$body = @{
    parent_email = "test@gmail.com"
    parent_name = "Test User"
    student_names = @("Test Student")
    selected_plan = "Monthly Plan"
} | ConvertTo-Json

try {
    $response = curl -X POST `
      -H "Content-Type: application/json" `
      -d $body `
      http://localhost:8000/api/parents/test/send-registration-email
    
    Write-Host "Email endpoint response:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Email endpoint error: $_" -ForegroundColor Red
}
```

Run with:
```powershell
. .\test_email.ps1
```

---

## Production Verification

Once deployed to Render, test by:
1. Using actual domain instead of localhost
2. Verifying CORS headers allow frontend domain
3. Testing with real parent email
4. Confirming SSL certificate (HTTPS) works
5. Checking SendGrid logs for delivery status
