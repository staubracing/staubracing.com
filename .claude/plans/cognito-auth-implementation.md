# Cognito JWT Authentication for Admin Pages

**Status:** ✅ Complete
**Last Updated:** 2026-02-23

## Overview

Replace the simple API key authentication in admin pages with AWS Cognito JWT authentication. This enables user-scoped API calls and proper session management.

## Context

**Previous State:**
- `/admin/login` — Simple form that stores an API key in localStorage
- `/admin/maintenance` — Uses `x-api-key` header for all API calls
- No actual authentication — just a shared secret

**Current State:**
- `/admin/login` — Username/password form authenticating against Cognito
- `/admin/maintenance` — Uses `Authorization: Bearer <jwt>` header
- Proper user sessions with token refresh handled by Amplify

## Cognito Configuration

```
Region: us-east-1
User Pool ID: us-east-1_Ea3Vj7Klq
Client ID: 5gb5iivvi7e38q49iuu0js2kj5
API Endpoint: https://api.staubracing.com
```

---

## Implementation Summary

### Packages Installed

```bash
yarn add @aws-amplify/auth @aws-amplify/core
```

### Files Created/Modified

| File | Action | Status |
|------|--------|--------|
| `package.json` | Add `@aws-amplify/auth` and `@aws-amplify/core` dependencies | ✅ |
| `src/services/auth.ts` | **Create** — Auth configuration and helper functions | ✅ |
| `src/pages/admin/login.astro` | **Update** — Username/password form, Cognito sign-in | ✅ |
| `src/pages/admin/maintenance.astro` | **Update** — JWT bearer token auth for API calls | ✅ |

### Auth Service API

The auth service at `src/services/auth.ts` exports:

- `configureAuth()` — Initialize Cognito (call once at app startup)
- `signIn(username, password)` — Authenticate user
- `getJwtToken()` — Get current JWT for API Authorization header
- `isAuthenticated()` — Check if user has valid session
- `signOut()` — Clear session

### Important: Amplify v6 API

The implementation uses AWS Amplify v6, which has a **different API than v5**:

```typescript
// v5 (old) - class-based
import { Auth } from '@aws-amplify/auth';
Auth.signIn({ username, password });
Auth.currentSession();

// v6 (new) - functional exports
import { signIn, fetchAuthSession } from '@aws-amplify/auth';
signIn({ username, password });
fetchAuthSession();
```

The configuration structure also changed:

```typescript
// v6 configuration
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: '...',
      userPoolClientId: '...',  // Note: clientId, not webClientId
    },
  },
});
```

---

## Verification Checklist

- [x] `yarn install` completes without errors
- [x] `yarn build` completes without errors
- [ ] Login page shows username/password fields (manual test)
- [ ] Valid credentials redirect to maintenance page (manual test)
- [ ] Invalid credentials show error message (manual test)
- [ ] API requests include `Authorization: Bearer` header (check DevTools Network tab)
- [ ] Logout redirects to login page (manual test)
- [ ] Direct access to `/admin/maintenance` redirects to login when not authenticated (manual test)

---

## Session Notes

### Session 1 (2026-02-23)
- Created implementation plan
- Read existing code in both repos
- Installed `@aws-amplify/auth` and `@aws-amplify/core` packages
- Created `src/services/auth.ts` with v6 API (had to fix imports for v6)
- Updated `src/pages/admin/login.astro` with username/password form
- Updated `src/pages/admin/maintenance.astro` with JWT bearer auth
- Build successful
- **Pending:** Manual testing with real Cognito credentials
