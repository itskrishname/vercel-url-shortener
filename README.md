# Universal Link Manager & Shortener

A specialized URL shortener and redirector application built with Next.js (App Router), MongoDB, and Tailwind CSS. Designed to be hosted on Vercel.

## Features

- **Admin Dashboard**: Secure login to manage links.
- **External API Access**: Programmatic access to generate links from other applications or scripts.
- **Dual-Layer Shortening**:
  1. Input a Long URL and External API credentials (e.g., Adfly, Bitly).
  2. Generates a local "Vercel Token" link (e.g., `your-app.vercel.app/start/xyz`).
  3. User visits Vercel link -> Sees "Secret Bot Updates" Timer Page -> Redirects to External Short Link -> Destination.
- **Glassmorphism UI**: High-quality, responsive design for the public redirection page.
- **Bot Protection/Timer**: 5-second countdown on the landing page before redirection.
- **Analytics**: Tracks generated links in MongoDB.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB (Mongoose)
- **Deployment**: Vercel

## Environment Variables

To run this application, you must set the following environment variables.

Create a `.env.local` file in the root directory:

```bash
MONGODB_URI=mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/
```

> **Note**: The MongoDB URI is pre-configured as requested, but ensure the database user has correct permissions if issues arise.

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   - Home/Admin Login: `http://localhost:3000/login`
   - Dashboard: `http://localhost:3000/admin` (after login)

## Deployment on Vercel

1. **Push to GitHub**: Commit and push this code to a GitHub repository.
2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New** > **Project**.
   - Select your repository.
3. **Configure Environment Variables**:
   - In the "Environment Variables" section of the Vercel deployment screen, add:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/`
4. **Deploy**: Click **Deploy**.

## Admin Credentials

- **Username**: `admin`
- **Password**: `admin12345`

## Usage Guide

### 1. Dashboard (Manual)
1. Log in to the `/login` page.
2. Go to the Dashboard.
3. Enter the **Original Long URL** (the final destination).
4. Enter the **External API Config**:
   - **API URL**: The base URL of the external shortener's API (e.g., `https://api.gplinks.com/api`).
   - **API Token**: Your API key for that service.
5. Click **Generate**.
6. Share the generated **Vercel Token** link.

### 2. External API (Programmatic)
You can generate links programmatically from another script (e.g., a Telegram bot) using the API endpoint.

**Endpoint:** `POST /api/generate`

**Headers:**
- `Content-Type`: `application/json`
- `x-api-key`: `admin12345` (Use the admin password)

**Body:**
```json
{
  "longUrl": "https://example.com/destination",
  "apiUrl": "https://external-shortener.com/api",
  "apiToken": "YOUR_EXTERNAL_API_TOKEN"
}
```

**Example (cURL):**
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin12345" \
  -d '{
    "longUrl": "https://google.com",
    "apiUrl": "https://example-shortener.com/api",
    "apiToken": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "x8s7d9f0",
  "externalShortUrl": "https://short.com/xyz",
  "vercelLink": "https://your-app.vercel.app/start/x8s7d9f0"
}
```
