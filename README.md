# Universal Shortener / Bridge

A multi-user URL shortener and bridge application built with Next.js and MongoDB. This application allows users to manage their own external URL shortener configurations (like GPLinks) through a unified interface.

## Features

- **Multi-User System**: Users register with their own accounts.
- **External Integration**: Users configure their own External Shortener API (e.g., GPLinks).
- **Deep Link Management**: The app generates an intermediate link that redirects to the original URL, allowing you to "wrap" links with external monetization providers while keeping a persistent entry point.
- **Admin Dashboard**: Special owner login to view registered users.
- **User Dashboard**: Manage links and view analytics.

## Deployment

1. **Environment Variables**:
   Set the following in Vercel or your `.env.local` file:
   ```env
   MONGODB_URI="mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/"
   JWT_SECRET="your-secure-random-secret"
   ADMIN_INVITE_CODE="12345"
   ```

2. **Deploy to Vercel**:
   - Push to GitHub.
   - Import project to Vercel.
   - Add Environment Variables.
   - Deploy.

## API Usage (Bridge)

Use the following endpoint to shorten URLs via your configured external provider:

```http
GET /api/shorten?api=YOUR_APP_API_KEY&url=TARGET_URL
```

**Response:**
```json
{
  "status": "success",
  "shortenedUrl": "https://gplinks.com/xyz",
  "original_url": "https://target.com"
}
```

## Admin Access

- **Login URL**: `/owner/login`
- **Username**: `admin`
- **Password**: `admin12345`

## User Access

- **Register**: `/register` (Requires Admin Invite Code)
- **Login**: `/login`
