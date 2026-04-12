## 🔐 FORGOT PASSWORD - VISUAL WORKFLOW DIAGRAM

### **Complete User Journey**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                        START: LOGIN PAGE                                   ║
║                     /public/login.html                                      ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────┐      ║
║  │ 📧 Email: user@university.edu                                   │      ║
║  │ 🔐 Password: ••••••                                             │      ║
║  │                                                                  │      ║
║  │ [LOGIN]              [❓ Forgot Password?] ◄────────────────┐  │      ║
║  └──────────────────────────────────────────────────────────────────┘      ║
║                                   │                               │         ║
║                                   │                               │         ║
╚═══════════════════════════════════╪═══════════════════════════════╪═════════╝
                                    │                               │
                                    ▼                               │
╔════════════════════════════════════════════════════════════════════════════╗
║                  FORGOT PASSWORD PAGE                                       ║
║                  /public/forgot-password.html                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────┐      ║
║  │                  Forgot your password?                            │      ║
║  │                                                                  │      ║
║  │ Enter your email and we'll send you a reset link                │      ║
║  │                                                                  │      ║
║  │ Email: ______________________________________                  │      ║
║  │                                                                  │      ║
║  │           [SEND RESET LINK]                                    │      ║
║  │                                                                  │      ║
║  │ Or [← Back to Login]                                            │      ║
║  └──────────────────────────────────────────────────────────────────┘      ║
║                                   │                                         ║
║                    Form Submit: POST /api/auth/forgot-password              ║
║                    Body: { email: "user@university.edu" }                   ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    │
        ┌───────────────────────────┕───────────────────────────┐
        │                                                         │
        ▼ Valid Email                                    ✗ Invalid Email
┌──────────────────────┐                          ┌──────────────────────┐
│ User Found in DB     │                          │ Show Error Message   │
│                      │                          │ "User not found"     │
│ Generate Reset Token │                          └──────────────────────┘
│ Hash Token: SHA256   │
│ Set Expiration: 1hr  │
│ Save to DB           │
│                      │
│ Log Token to Console │◄─── For Testing & Email
│ (or Send Email)      │
│                      │
│ Show Success Message │
│ ✓ "Check your email" │
└──────────────────────┘
        │
        │ Token logged to server console:
        │ "Password Reset Link: 
        │  http://localhost:3000/reset-password?
        │  token=abc123def456...&
        │  email=user@university.edu"
        │
        ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                     USER GETS RESET LINK                                    ║
║                                                                              ║
║  Development: Copy from console/terminal                                    ║
║  Production: Email sent with clickable link                                 ║
║                                                                              ║
║  Link Format:                                                                ║
║  /reset-password?token=XXXXX&email=user@university.edu                      ║
╚════════════════════════════════════════════════════════════════════════════╝
        │
        │ User clicks link or pastes URL
        │
        ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                 RESET PASSWORD PAGE                                         ║
║                 /public/reset-password.html?token=XXXXX&email=...           ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ON PAGE LOAD:                                                              ║
║  ├─ Extract token & email from URL                                          ║
║  ├─ POST /api/auth/verify-reset-token (auto)                                ║
║  ├─ Validate token not expired                                              ║
║  └─ Fill email field automatically                                          ║
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────┐      ║
║  │              Reset Your Password                                  │      ║
║  │                                                                  │      ║
║  │ Email:  user@university.edu (auto-filled)                       │      ║
║  │                                                                  │      ║
║  │ New Password: ________________                                  │      ║
║  │ Strength: [████████░░░░░░░░░░░]  Strong                         │      ║
║  │                                                                  │      ║
║  │ Confirm Password: ________________                              │      ║
║  │                                                                  │      ║
║  │           [RESET PASSWORD]                                     │      ║
║  │                                                                  │      ║
║  │ Or [← Back to Login]                                            │      ║
║  └──────────────────────────────────────────────────────────────────┘      ║
║                                   │                                         ║
║  REAL-TIME PASSWORD STRENGTH:    │  (as user types)                        ║
║  ┌──────────────────────────────────────────┐                             ║
║  │ pass      → ░░░░░░░░ Very Weak (Red)    │                             ║
║  │ Pass123   → ████░░░░ Medium (Orange)     │                             ║
║  │ P@ss123x  → ████████ Strong (Green)      │                             ║
║  └──────────────────────────────────────────┘                             ║
║                                   │                                         ║
║                    Form Validation:                                          ║
║                    ├─ Password ≥ 6 characters                                ║
║                    ├─ Password === Confirm Password                          ║
║                    └─ Email matches URL parameter                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    │
                        Form Submit: POST /api/auth/reset-password           
        ┌────────────────────────────┕────────────────────────────┐
        │                                                          │
        ▼ Valid Request                               ✗ Invalid Token/Expired
┌──────────────────────────────────┐        ┌──────────────────────────────┐
│ Hash Token Again: SHA256         │        │ Show Error Message:          │
│ Find User:                       │        │ ✗ "Invalid or Expired Link" │
│  - Email matches                 │        │                              │
│  - Token matches                 │        │ Hide Form                    │
│  - Not expired                   │        └──────────────────────────────┘
│                                  │
│ Hash New Password: bcrypt        │
│ Update User:                     │
│  - password = hashed password    │
│  - resetPasswordToken = null     │
│  - resetPasswordExpires = null   │
│  - Save to DB                    │
│                                  │
│ Send Notification (optional)     │
│ "✓ Password Reset Successfully"  │
│                                  │
│ Show Success:                    │
│ ✓ Green banner message           │
│ Auto-redirect to login in 3 sec  │
└──────────────────────────────────┘
        │
        │ 3 second countdown...
        │
        ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                        AUTO REDIRECT                                        ║
║                     Back to LOGIN PAGE                                      ║
╠════════════════════════════════════════════════════════════════════════════╣
║  Redirects to: /public/login.html                                           ║
║  Status: User can now login with new password                               ║
╚════════════════════════════════════════════════════════════════════════════╝
        │
        ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                        FINAL LOGIN                                          ║
║                     /public/login.html                                      ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────┐      ║
║  │ 📧 Email: user@university.edu                                    │      ║
║  │ 🔐 Password: (NEW PASSWORD ENTERED)                             │      ║
║  │                                                                  │      ║
║  │ [LOGIN]              [Forgot Password?]                         │      ║
║  └──────────────────────────────────────────────────────────────────┘      ║
║                                   │                                         ║
║                    POST /api/auth/login                                     ║
║                    Compare password with bcrypt                             ║
║                                   │                                         ║
║                    ✓ Password matches!                                      ║
║                    Generate JWT token                                       ║
║                    Store in localStorage                                    ║
║                    Redirect to Dashboard                                    ║
║                                   │                                         ║
║                                   ▼                                         ║
║                          ✅ PASSWORD RESET COMPLETE! ✅                    ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## **Error Flow Diagram**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          ERROR SCENARIOS                                    ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  SCENARIO 1: Email doesn't exist                                            ║
║  ┌────────────────────────────────────┐                                    ║
║  │ User enters: admin@nonexistent.com │                                    ║
║  │ Submit forgot password form        │                                    ║
║  │ ↓                                   │                                    ║
║  │ ✗ "No user found with this email"  │                                    ║
║  │ Form remains on page               │                                    ║
║  │ [User can try again]               │                                    ║
║  └────────────────────────────────────┘                                    ║
║                                                                              ║
║  SCENARIO 2: Token expired                                                  ║
║  ┌────────────────────────────────────┐                                    ║
║  │ User waits more than 1 hour        │                                    ║
║  │ Clicks reset link                  │                                    ║
║  │ ↓                                   │                                    ║
║  │ ✗ "Invalid or expired reset token" │                                    ║
║  │ Form hidden                        │                                    ║
║  │ [User must request new reset]      │                                    ║
║  └────────────────────────────────────┘                                    ║
║                                                                              ║
║  SCENARIO 3: Token tampered/invalid                                         ║
║  ┌────────────────────────────────────┐                                    ║
║  │ User modifies token in URL         │                                    ║
║  │ Page loads                         │                                    ║
║  │ ↓                                   │                                    ║
║  │ ✗ "Invalid or expired reset token" │                                    ║
║  │ Form hidden                        │                                    ║
║  │ Can go back to login               │                                    ║
║  └────────────────────────────────────┘                                    ║
║                                                                              ║
║  SCENARIO 4: Passwords don't match                                          ║
║  ┌────────────────────────────────────┐                                    ║
║  │ Password: MyP@ssw0rd               │                                    ║
║  │ Confirm:  MyP@swword (typo)        │                                    ║
║  │ Click Reset                        │                                    ║
║  │ ↓                                   │                                    ║
║  │ ✗ "Passwords do not match"         │                                    ║
║  │ Form stays on page                 │                                    ║
║  │ [User can fix typo]                │                                    ║
║  └────────────────────────────────────┘                                    ║
║                                                                              ║
║  SCENARIO 5: Password too short                                             ║
║  ┌────────────────────────────────────┐                                    ║
║  │ Password: pass (4 chars)           │                                    ║
║  │ Strength: ░░░░░░░░ Very Weak       │                                    ║
║  │ Click Reset                        │                                    ║
║  │ ↓                                   │                                    ║
║  │ ✗ "Password must be 6+ chars"      │                                    ║
║  │ Form stays on page                 │                                    ║
║  │ [User must enter longer password]  │                                    ║
║  └────────────────────────────────────┘                                    ║
║                                                                              ║
║  SCENARIO 6: Server error                                                   ║
║  ┌────────────────────────────────────┐                                    ║
║  │ Database connection fails          │                                    ║
║  │ Unexpected server error            │                                    ║
║  │ ↓                                   │                                    ║
║  │ ✗ "Error sending reset email" or   │                                    ║
║  │ ✗ "Error resetting password"       │                                    ║
║  │ [Logs in console for admin/developer] │                                ║
║  │ [User can retry]                   │                                    ║
║  └────────────────────────────────────┘                                    ║
║                                                                              ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## **Database State During Flow**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    DATABASE STATE PROGRESSION                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  STEP 1: Initial User State (Normal)                                        ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ {                                                            │            ║
║  │   _id: ObjectId("123..."),                                  │            ║
║  │   email: "user@university.edu",                             │            ║
║  │   password: "$2a$10$abcdef...",  (hashed)                  │            ║
║  │   resetPasswordToken: null,       ◄── Initially null        │            ║
║  │   resetPasswordExpires: null,     ◄── Initially null        │            ║
║  │   ...                                                        │            ║
║  │ }                                                            │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                            │                                                ║
║                     User clicks "Forgot Password?"                          ║
║                            │                                                ║
║                            ▼                                                ║
║                                                                              ║
║  STEP 2: Reset Requested (Token Generated)                                  ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ {                                                            │            ║
║  │   _id: ObjectId("123..."),                                  │            ║
║  │   email: "user@university.edu",                             │            ║
║  │   password: "$2a$10$abcdef...",  (unchanged)               │            ║
║  │   resetPasswordToken:                                       │            ║
║  │     "7f3c9b2a1d...",  ◄── Hashed token stored              │            ║
║  │   resetPasswordExpires:                                     │            ║
║  │     "2026-04-12T15:30:00Z",  ◄── 1 hour from now           │            ║
║  │   ...                                                        │            ║
║  │ }                                                            │            ║
║  │                                                              │            ║
║  │ NOTE: Plain token sent only in email, never stored!         │            ║
║  │       Only hashed version stored in DB                      │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                            │                                                ║
║                   User opens reset link & submits form                      ║
║                            │                                                ║
║                            ▼                                                ║
║                                                                              ║
║  STEP 3: After Reset (Token Cleared)                                        ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ {                                                            │            ║
║  │   _id: ObjectId("123..."),                                  │            ║
║  │   email: "user@university.edu",                             │            ║
║  │   password: "$2a$10$xyz789...",  ◄── NEW password hashed   │            ║
║  │   resetPasswordToken: null,       ◄── Cleared              │            ║
║  │   resetPasswordExpires: null,     ◄── Cleared              │            ║
║  │   ...                                                        │            ║
║  │ }                                                            │            ║
║  │                                                              │            ║
║  │ Old password hash is completely replaced                    │            ║
║  │ Reset token fields are nulled out                          │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                            │                                                ║
║                      User can login with NEW password                       ║
║                                                                              ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## **Security Flow Diagram**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                      SECURITY MEASURES                                      ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  1. TOKEN GENERATION & STORAGE                                              ║
║     ┌─────────────────────────────────────────────────┐                    ║
║     │ Generate: crypto.randomBytes(32).toString('hex')│                    ║
║     │ Result: abc123def456...xyz789 (64 chars)       │                    ║
║     │          (SENT in email ONLY)                   │                    ║
║     │                                                 │                    ║
║     │ Hash: crypto.createHash('sha256')               │                    ║
║     │       .update(token).digest('hex')              │                    ║
║     │ Result: 7f3c9b2a1d... (stored in DB)           │                    ║
║     │          (NEVER sent to user again)             │                    ║
║     └─────────────────────────────────────────────────┘                    ║
║     ✅ Even if DB compromised, tokens remain secure                         ║
║                                                                              ║
║                                                                              ║
║  2. TOKEN EXPIRATION                                                        ║
║     ┌─────────────────────────────────────────────────┐                    ║
║     │ Requested at: 14:30 (2:30 PM)                   │                    ║
║     │ Expires at:   15:30 (3:30 PM)  [+1 hour]        │                    ║
║     │                                                 │                    ║
║     │ Query: resetPasswordExpires { $gt: Date.now() } │                    ║
║     │ After expiration, token becomes unusable        │                    ║
║     │ User must request new reset link                │                    ║
║     └─────────────────────────────────────────────────┘                    ║
║     ✅ Time-limited access reduces brute force risk                         ║
║                                                                              ║
║                                                                              ║
║  3. PASSWORD HASHING                                                        ║
║     ┌─────────────────────────────────────────────────┐                    ║
║     │ Plain password: MyPassword123                    │                    ║
║     │ Bcrypt hash: $2a$10$abcdef...xyz (60 chars)    │                    ║
║     │                                                 │                    ║
║     │ New password never stored in plaintext          │                    ║
║     │ Only irreversible hash stored in DB             │                    ║
║     │ Login compares plaintext hash to stored hash    │                    ║
║     └─────────────────────────────────────────────────┘                    ║
║     ✅ Even with DB leak, passwords remain secure                           ║
║                                                                              ║
║                                                                              ║
║  4. EMAIL VERIFICATION                                                      ║
║     ┌─────────────────────────────────────────────────┐                    ║
║     │ Attacker tries: forgot-password with victim email│                   ║
║     │ Reset link sent to VICTIM's email               │                    ║
║     │ Only VICTIM can access the link                 │                    ║
║     │ Victim immediately notified of attempt          │                    ║
║     └─────────────────────────────────────────────────┘                    ║
║     ✅ Email ownership verified                                             ║
║                                                                              ║
║                                                                              ║
║  5. SINGLE-USE TOKEN                                                        ║
║     ┌─────────────────────────────────────────────────┐                    ║
║     │ User1: Request reset → Token A generated        │                    ║
║     │ User2: Request reset → Token B generated        │                    ║
║     │                                                 │                    ║
║     │ User1 uses Token A → DB cleared (success)       │                    ║
║     │ User1 tries Token A again → INVALID (rejected)  │                    ║
║     │                                                 │                    ║
║     │ Each request generates new token                │                    ║
║     │ Old token made invalid after use                │                    ║
║     └─────────────────────────────────────────────────┘                    ║
║     ✅ Replay attacks prevented                                             ║
║                                                                              ║
║                                                                              ║
║  6. VALIDATION ON BOTH CLIENT & SERVER                                      ║
║     ┌─────────────────────────────────────────────────┐                    ║
║     │ CLIENT SIDE:                                    │                    ║
║     │ ├─ Email format validation                      │                    ║
║     │ ├─ Password length check (6+ chars)             │                    ║
║     │ └─ Password match verification                  │                    ║
║     │                                                 │                    ║
║     │ SERVER SIDE (ALWAYS ENFORCED):                  │                    ║
║     │ ├─ Email format validation                      │                    ║
║     │ ├─ User exists check                            │                    ║
║     │ ├─ Token hash verification                      │                    ║
║     │ ├─ Token expiration check                       │                    ║
║     │ ├─ Password length check (6+ chars)             │                    ║
║     │ └─ Password match verification                  │                    ║
║     └─────────────────────────────────────────────────┘                    ║
║     ✅ Never trust client, server is authoritative                          ║
║                                                                              ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## **API Flow Diagram**

```
CLIENT                                  SERVER                              DATABASE
  │                                       │                                      │
  │  POST /api/auth/forgot-password       │                                      │
  ├──────────────────────────────────────>│                                      │
  │  { email: "user@uni.edu" }           │                                      │
  │                                       ├─ Validate email                      │
  │                                       ├─ Find user by email                  │
  │                                       │<─────────────────────────────────────│
  │                                       │  Found: {id, email, ...}             │
  │                                       │─────────────────────────────────────>│
  │                                       ├─ Generate random token               │
  │                                       ├─ Hash token (SHA256)                 │
  │                                       ├─ Set expiration (+1hr)               │
  │                                       ├─ Update user record                  │
  │                                       │  {resetPasswordToken, ...Expires}    │
  │                                       │─────────────────────────────────────>│
  │                                       │                                      │
  │                                       ├─ Log/Send email with token           │
  │<──────────────────────────────────────│                                      │
  │  { message: "Check your email",       │                                      │
  │    email: "user@uni.edu" }            │                                      │
  │  Show: "Reset link sent" ✓            │                                      │
  │                                       │                                      │
  │  [Copy link from console]             │                                      │
  │  /reset-password?token=...&email=...  │                                      │
  │                                       │                                      │
  │  POST /api/auth/verify-reset-token    │                                      │
  ├──────────────────────────────────────>│                                      │
  │  { token: "...", email: "..." }       │                                      │
  │                                       ├─ Hash token                          │
  │                                       ├─ Query DB for matching token         │
  │                                       │<─────────────────────────────────────│
  │                                       │  Found if token valid & not expired  │
  │<──────────────────────────────────────│                                      │
  │  { valid: true }                      │                                      │
  │  Show password reset form              │                                      │
  │                                       │                                      │
  │  POST /api/auth/reset-password        │                                      │
  ├──────────────────────────────────────>│                                      │
  │  { token, email, password,            │                                      │
  │    confirmPassword }                  │                                      │
  │                                       ├─ Validate inputs                     │
  │                                       ├─ Hash token again                    │
  │                                       ├─ Find user with matching token       │
  │                                       │<─────────────────────────────────────│
  │                                       │  Found if valid & not expired        │
  │                                       ├─ Hash new password (bcrypt)          │
  │                                       ├─ Update:                             │
  │                                       │  - password = new hash               │
  │                                       │  - resetPasswordToken = null         │
  │                                       │  - resetPasswordExpires = null       │
  │                                       ├─ Trigger notification (optional)     │
  │                                       │─────────────────────────────────────>│
  │                                       │                                      │
  │<──────────────────────────────────────│                                      │
  │  { message: "Password reset!",        │                                      │
  │    success: true }                    │                                      │
  │  Show: "Success! Redirecting..." ✓    │                                      │
  │  Auto-redirect to login (3 sec)       │                                      │
  │                                       │                                      │
  ▼                                       ▼                                      ▼
```

---

**This visual guide helps understand the complete password reset flow from start to finish!**
