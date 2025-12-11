# Token-Based URL Shortener (Vercel)

A clean, user-friendly URL shortener application designed to be hosted on Vercel. It features a "Bridge" system that allows you to manage multiple external URL shortener providers (like GPLinks, etc.) while providing a unified, token-based API for your bots or users.

## Features

*   **Cyberpunk-Themed UI:** A modern, responsive interface.
*   **Admin Dashboard:** Secure login to manage generated links and configure external API providers.
*   **Token-Based API:** A unified API endpoint that accepts a "Virtual Key" (Provider ID) and returns a short link.
*   **Deep Link Management:** Wraps external short links with a local "Vercel" link to ensure traffic flows through your domain first.
*   **Auto-Token Generation:** Automatically generates unique tokens for every link.
*   **MongoDB Integration:** Stores all links and provider configurations.

## Deployment

### 1. Vercel Deployment

This application is optimized for Vercel.

1.  Push this code to a GitHub repository.
2.  Import the project into Vercel.
3.  **Environment Variables:** You must configure the `MONGODB_URI` environment variable in Vercel.

### 2. Database Configuration

You can use the following MongoDB connection string (as provided):

```
MONGODB_URI="mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/"
```

**Security Note:** It is highly recommended to use environment variables for sensitive credentials. In Vercel Project Settings > Environment Variables, add:
*   Key: `MONGODB_URI`
*   Value: `mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/` (Ensure you append the database name if needed, e.g., `/shortener`).

### 3. Admin Credentials

*   **Login URL:** `/login`
*   **Username:** `admin`
*   **Password:** `admin12345`

## API Usage

The application provides an API endpoint compatible with bots expecting a specific format (similar to GPLinks).

**Endpoint:** `https://your-domain.vercel.app/api`

**Request Parameters:**

*   `Api` (or `api`): The **Provider ID** (Virtual Key) from your Admin Dashboard. This tells the system which external shortener account to use.
*   `url`: The destination URL you want to shorten.

**Example Request:**
```http
GET https://your-domain.vercel.app/api?Api=YOUR_PROVIDER_ID&url=https://destination.com
```

**Success Response:**
```json
{
  "status": "success",
  "shortenedUrl": "https://your-domain.vercel.app/start/TOKEN"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description here"
}
```

## How it Works

1.  **Configure a Provider:** Log in to the Admin Dashboard and add a new "API Provider" (e.g., your GPLinks account with its API URL and Token).
2.  **Get the ID:** Copy the `_id` of the created provider.
3.  **Use the API:** Send requests to `/api` using that `_id` as the `Api` token.
4.  **Result:** The system will:
    *   Call the external provider (e.g., GPLinks) to shorten the destination URL.
    *   Save the external short link in the database.
    *   Generate a local "Bridge" link (`/start/TOKEN`).
    *   Return the local link.
5.  **Visiting the Link:** When a user visits the local link, they see a loading screen (Bridge) which then redirects them to the external shortener, and finally to the destination.
