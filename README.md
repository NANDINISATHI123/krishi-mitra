# Krishi Mitra – AI-Powered Organic Farming Companion

Krishi Mitra is a full-stack, AI-powered Progressive Web App (PWA) designed to assist small-scale and tribal farmers with organic farming practices. It combines modern technology with community wisdom, offering multilingual support, full offline capabilities, AI crop diagnosis, and much more.

This project is built as a hackathon-ready, deployable application with a focus on user experience, accessibility, and real-world utility for farmers in low-connectivity areas.

## ✨ Features

- **AI Crop Diagnosis**: Upload a photo of a crop to get an instant diagnosis, treatment recommendations, and an explanation.
- **Multilingual Support**: Fully translated interface in English and Telugu, including Text-to-Speech for audio instructions.
- **Persistent Cloud Data**: All user data is securely stored in a Supabase backend, ensuring it's available across all devices.
- **PWA with Offline Access**: As a PWA, the core application shell works without an internet connection after the first visit.
- **Role-Based Dashboards**: Separate, secure dashboards for regular users (Employees) and an Administrator, powered by Supabase Auth.
- **Admin Content Management**: The admin can add, edit, and delete tutorials and supplier information directly from their dashboard.
- **Seasonal Advisory Calendar**: Month-by-month organic farming tasks that can be marked as complete.
- **Community Feed**: A space for farmers to share knowledge, ask questions, and upload photos.
- **Success Tracker**: Log the outcomes of applied treatments to build a personal history of what works.
- **Resource Directories**: Access to video tutorials and a directory of a local organic suppliers.
- **Feedback System**: Users can submit feedback directly to the admin.
- **Light & Dark Mode**: A theme toggle for user comfort, with the preference saved locally.
- **Adjustable Font Size**: Users can increase or decrease the font size for better readability.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript (without a build step, using ES modules)
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS (via CDN)
- **AI Service**: Google Gemini API
- **PWA**: Implemented with a custom Service Worker and a Web App Manifest.
- **PDF Generation**: `html2canvas` and `jspdf` for client-side report downloads.
- **Speech**: Native Web Speech API for voice recognition and synthesis.

## 🚀 Getting Started

This project consists of a static frontend and a Supabase backend. Follow these steps to get everything running.

### 1. Set Up the Supabase Backend

Before running the frontend, you need to create the database tables and storage.

1.  **Create a Supabase Project**:
    *   Go to [supabase.com](https://supabase.com) and create a new project.
    *   Once the project is created, go to **Project Settings** (the gear icon in the left sidebar) -> **API**.
    *   Save your **Project URL** and **anon public key**.

2.  **Run the Database Schema Script**:
    *   In your Supabase project dashboard, find the **SQL Editor** in the left sidebar (it has a database icon).
    *   Click **"+ New query"**.
    *   Open the `supabase/schema.sql` file that is included in this project.
    *   Copy the **entire contents** of that file.
    *   Paste the script into the Supabase SQL Editor.
    *   Click the green **"RUN"** button. This will create all the necessary tables, relationships, and security policies in a few seconds.

3.  **Update Frontend with Supabase Keys**:
    *   Open the `lib/supabaseClient.ts` file in your code editor.
    *   Replace the placeholder `supabaseUrl` and `supabaseAnonKey` with the actual keys you saved in the first step.

### 2. Run the Frontend Locally

This project does not require a complex local build step.

1.  **Clone the repository or download the files.**
2.  If you have VS Code with the **Live Server** extension:
    -   Right-click on `index.html`.
    -   Select "Open with Live Server".
3.  Alternatively, use any simple HTTP server. For example, with Python:
    ```bash
    # Make sure you are in the project's root directory
    python -m http.server
    ```
4.  Open your browser and navigate to the local address provided (e.g., `http://localhost:8000`).

## 🎭 Demo Mode & Usage

The application has two user roles. You will need to create your own users in your Supabase project.

### Creating an Admin User

By default, all new users are registered with the 'employee' role. To create an admin:
1.  Register a new user through the app's 'Register' page.
2.  Go to your Supabase project dashboard and navigate to **Table Editor** > **profiles**.
3.  Find the new user you just created and change their `role` from `employee` to `admin`.
4.  Log in with this user to access the Admin Dashboard.

### Employee (Farmer) User

1.  Navigate to the **Register** page.
2.  Fill in a name, email, and password.
3.  After successful registration, log in with the new credentials to access the farmer dashboard.

## ☁️ Deployment to Netlify

Deploying this static application is simple.

1.  **Create a Git Repository**: Push the project files to a new repository on GitHub, GitLab, or Bitbucket.
2.  **Sign up/Log in to Netlify**.
3.  On your Netlify dashboard, click **"Add new site"** -> **"Import an existing project"**.
4.  **Connect to your Git provider** and select the repository.
5.  **Deployment Settings**: Leave the build settings empty.
    -   **Build command**: (leave blank)
    -   **Publish directory**: (leave blank, or set to `/`)
6.  Click **"Deploy site"**. Netlify will deploy your `index.html` and all other assets, giving you a live URL.