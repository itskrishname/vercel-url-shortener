# Universal Link Manager & Shortener

A specialized URL shortener and redirector application built with Next.js (App Router), MongoDB, and Tailwind CSS. Designed to be hosted on Vercel.

## Features

- **Admin Dashboard**: Secure login to manage links.
- **External API Access**: Programmatic access to generate links from other applications or scripts.
- **Dual-Layer Shortening**:
  1. Input a Long URL and External API credentials (e.g., Adfly, Bitly).
  2. Generates a local "Vercel Token" link (e.g., `your-app.vercel.app/start/xyz`).
  3. User visits Vercel link -> Sees "Secret Bot Updates" Timer Page -> Redirects to External Short Link -> Destination.
- **Cyberpunk UI**: A "Cyberpunk / Anime" aesthetic verification page with:
  - Neon glowing elements.
  - "BOT IS ONLINE" status.
  - Interactive timer and animations.
- **Bot Protection/Timer**:
  - **10-Second Timer**: Visual countdown with rotating rings.
  - **Auto Redirect**: Smooth transition after verification.
- **Analytics**: Tracks generated links in MongoDB.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: MongoDB (Mongoose)
- **Deployment**: Vercel

## Environment Variables

To run this application, you must set the following environment variables.

Create a `.env.local` file in the root directory:

```bash
# This is the connection string for your specific MongoDB cluster
MONGODB_URI=mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/

# The base URL of your application (use your Vercel URL in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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

## Deployment on Vercel (Step-by-Step)

This application is optimized for Vercel. Follow these exact steps:

1. **Push to GitHub**:
   - Commit your code and push it to a new GitHub repository.

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New** > **Project**.
   - Select the GitHub repository you just created.

3. **Configure Environment Variables (Important!)**:
   - On the deployment screen, look for the **"Environment Variables"** section.
   - You **MUST** add the database connection string here for the app to work.
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/`
   - Click **Add**.

4. **Deploy**:
   - Click the **Deploy** button.
   - Wait for the build to complete.
   - Once done, your URL shortener is live!

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

**Response:**
```json
{
  "success": true,
  "token": "x8s7d9f0",
  "externalShortUrl": "https://short.com/xyz",
  "vercelLink": "https://your-app.vercel.app/start/x8s7d9f0"
}
```
