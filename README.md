# NutriLoop - Food Donation Platform

NutriLoop connects food donors with volunteers so surplus food can be collected before it expires.

## Feature list - what users can do

### Visitors

1. View the NutriLoop home page and learn how food donation works.
2. Create an account using email and password.
3. Sign in with an existing email/password account or an already registered Google account.
4. Get redirected to the signup page when trying to open protected pages without an account.

### Donors

1. Select the Donor role after signing in.
2. Post surplus food with the food name, quantity, pickup location, contact details, description, and use-by time.
3. View their donation history and the current status of each donation.
4. Remove a donation they no longer want to offer.
5. See donations progress from Pending to Assigned and Fulfilled.

### Volunteers

1. Select the Volunteer role after signing in.
2. View available, unexpired food donations in the donation feed.
3. Search for donations by location and use location information to find suitable pickups.
4. Claim an available donation for collection.
5. View assigned pickups and their matching details, including urgency, distance, and estimated travel duration.
6. Mark a completed pickup as fulfilled.
7. View their pickup history.

### Administrators

1. Open the admin dashboard.
2. View overall donation and volunteer statistics.
3. Track donations, their statuses, and volunteer assignments.
4. Remove donations when moderation is required.

### Automatic food-safety handling

1. Prevent donors from posting food with a use-by time in the past.
2. Hide expired food from the volunteer feed immediately.
3. Automatically delete expired donations from the database.

## User roles and how to use each page

### Donor page - post surplus food

**Purpose:** The Donor page is for people, restaurants, shops, or organizations that have safe surplus food to share instead of wasting it.

**What a donor can do:**

1. Create a food donation with the food item name and quantity.
2. Add the pickup location, contact information, and any special instructions.
3. Set a use-by time so volunteers know how urgently the food must be collected.
4. Review posted donations in **My History**.
5. Delete a donation if it is no longer available.
6. Track whether a donation is Pending, Assigned to a volunteer, or Fulfilled.

**How to use it:**

1. Sign in and select **Donor** on the home page.
2. Open **Post Donation** from the navigation menu.
3. Complete the donation form and choose a future use-by time.
4. Submit the form. The donation becomes visible to volunteers while it is still valid.
5. Open **My History** to monitor or remove your posts.

### Volunteer page - find and collect food

**Purpose:** The Volunteer page helps food-rescue volunteers find nearby donations and coordinate pickup before food expires.

**What a volunteer can do:**

1. Browse available, unexpired food donations.
2. Search by location to find suitable pickups.
3. Review food details, pickup location, use-by time, distance, and urgency.
4. Claim a donation that they can collect.
5. See claimed donations under **My Pickups**.
6. Mark a pickup as fulfilled once the food has been collected and delivered.
7. Review completed pickups in **My History**.

**How to use it:**

1. Sign in and select **Volunteer** on the home page.
2. Open **Available Donations** from the navigation menu.
3. Enter your location, review suitable food posts, and select a donation to claim.
4. Complete the pickup before its use-by time.
5. Return to **My Pickups** and mark it as fulfilled after completion.

### Admin page - monitor the platform

**Purpose:** The Admin page gives platform administrators an overview of donation activity and helps them keep the platform trustworthy and organized.

**What an administrator can do:**

1. View key platform statistics, including total donations, active volunteers, and fulfilled pickups.
2. Review all food donations, donors, statuses, and posting details.
3. Track volunteer assignments, including urgency, distance, and travel duration.
4. Remove a donation when moderation or cleanup is needed.

**How to use it:**

1. Sign in with an account that has the **Admin** role.
2. Open **Admin Dashboard** from the home page or navigation menu.
3. Use the donation tracker to monitor active posts and their progress.
4. Review assignment details to understand volunteer activity.
5. Remove invalid or unsuitable posts when necessary.

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
