# NutriLoop - Food Donation Platform

NutriLoop connects food donors with volunteers so surplus food can be collected before it expires.

## Features

- Email/password signup and sign-in
- Google sign-in for users who have already registered
- Protected pages redirect unauthenticated users to the signup page
- Donor food-post creation and volunteer pickup workflow
- Automatic removal of expired donations
- Donation history and admin tracking

## Tech stack

- Frontend: React, Vite, Redux Toolkit, Mantine
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JSON Web Tokens and Google OAuth

## Prerequisites

- Node.js 18 or later
- MongoDB database (local MongoDB or MongoDB Atlas)
- Google OAuth web client ID if Google sign-in is enabled

## Setup

Install dependencies in both applications:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

Create a `backend/.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=use_a_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CORS_ORIGINS=http://localhost:5173
```

Create a `frontend/.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:3000/api
```

Never commit either `.env` file or any real credentials.

## Run locally

Start the backend in one terminal:

```powershell
cd backend
npm run dev
```

Start the frontend in another terminal:

```powershell
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Authentication behavior

- Visitors opening protected pages such as the feed, profile, donation form, history, or admin dashboard are redirected to `/signup` if they are not signed in.
- A Google account must already have a NutriLoop account. Otherwise, Google sign-in redirects the visitor to signup instead of automatically creating an account.

## Donation expiry

Each donation requires a future `useByTime`. Expired donations are excluded from the volunteer feed immediately. MongoDB also removes them automatically using a TTL index; TTL cleanup is asynchronous and can take roughly a minute after expiry.
