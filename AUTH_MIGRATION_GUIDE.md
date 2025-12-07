# Authentication System Migration Guide

## Overview
Successfully migrated from simple ID-based login to **Supabase email/password authentication** with JWT tokens. This provides better security, user management, and scalability.

## What Changed

### Backend Changes

#### 1. **schemas/login_schema.py** - Updated
- **Old**: Simple `LoginRequest` with `id_number` field
- **New**: Complete auth schemas:
  - `LoginRequest`: email (EmailStr), password (min 8 chars)
  - `SignupRequest`: full_name, email (EmailStr), password
  - `TokenResponse`: access_token, token_type, user data
  - `UserResponse`: id, email, full_name
  - `AuthResponse`: success, message, data, error

#### 2. **services/auth_service.py** - Completely Replaced
- **Old**: Simple password hashing utilities (bcrypt)
- **New**: Supabase Auth integration:
  - `AuthService.signup()`: Register new user with Supabase
  - `AuthService.login()`: Login with email/password
  - `AuthService.logout()`: Backend logout handling
  - Password validation (8+ chars, uppercase, lowercase, special char)
  - JWT token extraction and return

#### 3. **routes/auth_routes.py** - Created (NEW)
Three main endpoints:
- **POST /api/auth/signup**: Register new parent
  - Input: full_name, email, password
  - Returns: access_token, user info
  - Validates password strength
  - Handles duplicate emails

- **POST /api/auth/login**: Login existing parent
  - Input: email, password
  - Returns: access_token, user info
  - Error handling for invalid credentials

- **POST /api/auth/logout**: Logout user
  - Returns: success message
  
- **GET /api/auth/health**: Health check

#### 4. **main.py** - Updated
Added new auth router import and inclusion:
```python
from routes.auth_routes import router as auth_router
app.include_router(auth_router)
```

### Frontend Changes

#### 1. **src/services/supabase.ts** - Created (NEW)
Supabase client configuration with:
- Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Session storage: Uses sessionStorage (tab-specific sessions)
- Auto token refresh: Keeps session alive in current tab
- Email verification: detectSessionInUrl for confirmation links

#### 2. **src/services/auth.ts** - Completely Replaced
Supabase authentication service:
- `AuthService.login()`: Email/password login
- `AuthService.signup()`: User registration with validation
- `AuthService.logout()`: Logout and session cleanup
- `AuthService.isAuthenticated()`: Check if user has valid session
- `initAuthListener()`: Listen to auth state changes across tabs

#### 3. **src/pages/Login.tsx** - Completely Replaced
New email/password login UI:
- Email and password input fields
- Show/hide password toggle
- Remember me checkbox
- Error handling and display
- "Forgot password?" link (placeholder)
- Link to signup page
- Uses `authService.login()` from new auth service

#### 4. **src/api/parentApi.ts** - Updated
Added auth token support:
- `getAuthHeaders()`: Helper to add Authorization header with JWT
- All API calls now include Bearer token automatically:
  ```typescript
  const headers = getAuthHeaders();
  ```
- Added new functions:
  - `fetchParentBankAccount()`: GET bank account (with auth)
  - `saveBankAccount()`: POST bank account (with auth)

#### 5. **frontend/.env** - Created (NEW)
Environment configuration:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api
```

## Authentication Flow

### Login Flow
```
1. User enters email + password on Login.tsx
2. Frontend calls authService.login(email, password)
3. authService sends request to Supabase
4. Supabase validates credentials and returns JWT token + user data
5. Frontend stores token in localStorage:
   - access_token: JWT for API calls
   - token_type: "bearer"
   - user_id, user_email, user_name
6. Frontend redirects to /parent-dashboard
7. All subsequent API calls include Authorization header with token
```

### Signup Flow
```
1. User enters full_name, email, password on signup page
2. Frontend calls authService.signup()
3. authService validates password strength
4. Supabase creates new user account
5. Email confirmation link sent to user email
6. User confirms email via link
7. Session activated, user can login
```

### API Request Flow
```
1. Frontend calls parentApi function (e.g., fetchParentStudents)
2. getAuthHeaders() adds Bearer token to request
3. Backend receives request with Authorization header
4. Backend validates JWT token
5. Backend processes request with authenticated user ID
6. Response returned to frontend
```

## Key Features

### Security
- ✅ Supabase-managed user authentication
- ✅ JWT tokens with expiration
- ✅ Password hashing (bcrypt via Supabase)
- ✅ Password validation (8+ chars, uppercase, lowercase, special char)
- ✅ No plaintext passwords stored
- ✅ Token-based API authorization

### Session Management
- ✅ Tab-specific sessions (sessionStorage)
- ✅ Auto token refresh in active tab
- ✅ Survives page refresh within same tab
- ✅ Email verification link handling

### User Experience
- ✅ Email/password (more familiar than ID-based)
- ✅ "Remember me" option
- ✅ Real-time error feedback
- ✅ Password visibility toggle
- ✅ Loading states during auth

### Error Handling
- ✅ Invalid credentials: "Invalid email or password"
- ✅ Duplicate email: "Email already registered"
- ✅ Password validation: Specific error messages
- ✅ Missing Supabase config: Clear error with instructions

## Database Changes Required

### Supabase Auth (Automatic)
When users signup/login via Supabase Auth:
- `auth.users` table created automatically
- User ID generated (UUID)
- Email stored (unique)
- Metadata can store full_name

### Optional: Create `parents` Table (For Application Data)
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

This links Supabase Auth users to your parents table.

## Environment Setup

### Backend (.env)
Already configured with:
- SUPABASE_URL
- SUPABASE_KEY

No changes needed.

### Frontend (.env)
Create with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api
```

Get these from your Supabase project settings:
1. Go to Project Settings → API
2. Copy "Project URL" → VITE_SUPABASE_URL
3. Copy "anon public" key → VITE_SUPABASE_ANON_KEY

## Dependencies Added

### Backend
Already installed:
- supabase (python client)
- pydantic (validation)
- email-validator (email validation)
- PyJWT (JWT handling)

### Frontend
Already installed:
- @supabase/supabase-js (Supabase client)

No new packages needed!

## Migration Steps

1. ✅ **Backend**: Replaced auth_service.py and created auth_routes.py
2. ✅ **Backend**: Updated schemas/login_schema.py with new auth schemas
3. ✅ **Backend**: Updated main.py to include auth router
4. ✅ **Frontend**: Created supabase.ts with Supabase client config
5. ✅ **Frontend**: Created auth.ts with authentication service
6. ✅ **Frontend**: Replaced Login.tsx with email/password login
7. ✅ **Frontend**: Updated parentApi.ts to include auth headers
8. ✅ **Frontend**: Created .env with Supabase credentials

## Testing Checklist

- [ ] Signup: Create new parent account with email/password
- [ ] Login: Login with created email/password
- [ ] Token Storage: Verify token stored in localStorage
- [ ] API Calls: Verify auth header sent in subsequent requests
- [ ] Logout: Clear token and redirect to login
- [ ] Password Validation: Test password strength requirements
- [ ] Error Handling: Test invalid credentials, duplicate emails
- [ ] Session Persistence: Refresh page, verify still logged in (same tab)
- [ ] Bank Account: Save/fetch bank account (uses new auth)

## Rollback (If Needed)

Old ID-based system still available at:
- Backend: `routes/login_routes.py` (still exists)
- Frontend: Old `loginParent()` API function still available

To revert:
1. Update `frontend/src/pages/Login.tsx` to use old ID-based form
2. Use old `loginParent(id_number)` from parentApi
3. Comment out new auth routes in main.py

## Next Steps

1. **Update UpdateDetails Page**: Should now use auth token instead of parent_id_number
2. **Update Other Pages**: All pages should use `user_id` from localStorage instead of `parent_id_number`
3. **Create Signup Page**: Implement full parent registration flow
4. **Add Password Reset**: "Forgot password" functionality via Supabase
5. **Create Parents Table**: Link auth.users to parents table in database
6. **Add Profile Management**: Allow users to update their full_name

## Reference Files

| File | Type | Status |
|------|------|--------|
| backend/schemas/login_schema.py | Updated | ✅ Done |
| backend/services/auth_service.py | Replaced | ✅ Done |
| backend/routes/auth_routes.py | New | ✅ Created |
| backend/main.py | Updated | ✅ Done |
| frontend/src/services/supabase.ts | New | ✅ Created |
| frontend/src/services/auth.ts | Replaced | ✅ Done |
| frontend/src/pages/Login.tsx | Replaced | ✅ Done |
| frontend/src/api/parentApi.ts | Updated | ✅ Done |
| frontend/.env | New | ✅ Created |

## Support

For issues:
1. Check Supabase project settings
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Check backend logs for auth validation errors
5. Verify JWT token format in localStorage
