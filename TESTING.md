# Testing Guide - Choose API Page

## Overview

The "Choose API" page (`/choose-api`) allows users to select between:
1. **Unofficial API** - Redirects to `https://salvazap.com/autenticar`
2. **Official API (WABA)** - Starts Meta Embedded Signup flow

## Manual Testing Steps

### 1. Test Public Access (Unauthenticated)

1. **Navigate to Choose API page**:
   ```
   http://localhost:5173/choose-api
   ```

2. **Verify UI Elements**:
   - ✅ Page loads without requiring login
   - ✅ Two cards are visible: "Unofficial API" and "Official API (WABA)"
   - ✅ Warning message shows: "You need to be logged in to use the Official API"
   - ✅ "Use Official API" button is disabled

3. **Test Unofficial API Button**:
   - Click "Use Unofficial API" button
   - ✅ Should redirect to `https://salvazap.com/autenticar`
   - ✅ Button shows "Redirecting..." state

### 2. Test Official API (Authenticated)

1. **Login First**:
   - Navigate to `/login`
   - Login with valid credentials
   - Should redirect to dashboard

2. **Navigate to Choose API**:
   ```
   http://localhost:5173/choose-api
   ```

3. **Verify Authenticated State**:
   - ✅ No warning message about login
   - ✅ "Use Official API" button is enabled
   - ✅ Button shows loading state while fetching shop data

4. **Test Official API Button**:
   - Click "Use Official API" button
   - ✅ Should fetch embedded signup URL from backend
   - ✅ Should redirect to Meta OAuth page
   - ✅ URL should contain `client_id`, `redirect_uri`, `scope`, `state`

### 3. Test OAuth Callback Flow

1. **Complete Meta Authorization**:
   - After clicking "Use Official API", authorize on Meta
   - Meta redirects to: `/onboarding/callback?code=...&state=...`

2. **Verify Callback Processing**:
   - ✅ Frontend receives callback
   - ✅ Backend exchanges code for token
   - ✅ WABA account is created in database
   - ✅ User is redirected to `/onboarding`
   - ✅ Connected account appears in onboarding page

### 4. Test Edge Cases

#### No Shop Available
- If user is authenticated but has no shops:
  - ✅ Error message: "No shop found. Please create a shop first."
  - ✅ Button remains disabled

#### Backend API Unavailable
- If backend is down or unreachable:
  - ✅ Error toast appears
  - ✅ Button shows error state

#### Network Errors
- Simulate network failure:
  - ✅ Appropriate error messages display
  - ✅ UI doesn't break

## Automated Testing (Future)

Consider adding:
- Unit tests for ChooseApi component
- Integration tests for OAuth flow
- E2E tests with Playwright/Cypress

## Checklist

- [x] Page is publicly accessible
- [x] Unofficial API button redirects correctly
- [x] Official API button requires authentication
- [x] ShopId is fetched and used correctly
- [x] Embedded signup URL is generated
- [x] OAuth callback flow works end-to-end
- [x] Error handling for all edge cases
- [x] Loading states display correctly
- [x] UI is responsive and accessible

## Browser Console Checks

When testing, check browser console for:
- ✅ No React errors
- ✅ API calls succeed (check Network tab)
- ✅ No CORS errors
- ✅ Proper error messages in console

## Network Tab Verification

1. **Unofficial API Click**:
   - Should see redirect (301/302) to `salvazap.com/autenticar`

2. **Official API Click**:
   - Should see `GET /waba/embedded/start?shopId=...`
   - Response should contain `{ url: "https://www.facebook.com/..." }`
   - Then redirect to Meta OAuth URL

3. **OAuth Callback**:
   - Should see `GET /auth/embedded/callback?code=...&state=...`
   - Response should be successful
   - Then redirect to `/onboarding`

