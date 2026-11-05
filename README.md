# Our Love Story — Proposal Website

A romantic React + Vite frontend with an Express backend that emails you when a visitor chooses either proposal response.

## 1. Requirements
- Node.js 20 or newer (LTS recommended)
- npm
- A Gmail account for sending notification emails

## 2. Project setup

Open a terminal in this project folder.

### Backend
```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set:
- `EMAIL_USER`: the Gmail address that sends notifications
- `EMAIL_APP_PASSWORD`: a Google App Password (not your normal Gmail password)
- `NOTIFY_EMAIL`: the address where you want to receive the notification
- `FRONTEND_URL`: `http://localhost:5173` while testing locally

Start the backend:
```bash
npm run dev
```
It runs at `http://localhost:5000`.

### Frontend
Open a second terminal in the project folder:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the local URL printed by Vite (normally `http://localhost:5173`).

## 3. Gmail App Password
1. Turn on 2-Step Verification for the Google account used to send mail.
2. Open your Google Account security settings.
3. Find **App passwords** and create one for this project.
4. Paste the generated 16-character password into `backend/.env`.
5. Never put the app password in the frontend, commit it to Git, or share it.

If Google does not show App passwords for your account, use another supported email provider or an email service with SMTP credentials.

## 4. Personalize the website
- Replace the sample image files in `frontend/public/memories/` with your own photos. Keep the same filenames, or update the paths in `frontend/src/App.jsx`.
- Optional background music: add an MP3 at `frontend/public/music/romantic-song.mp3`. The browser may require the visitor to press Play before music starts.
- Edit the story and letter text in `frontend/src/App.jsx`. Search for `EDIT YOUR STORY` and `EDIT YOUR LETTER`.

## 5. Test the email
1. Keep both backend and frontend terminals running.
2. Open the Vite site.
3. Click either proposal response.
4. You should see a success message and receive an email at `NOTIFY_EMAIL`. Check Spam/Junk too.
5. The backend logs errors if SMTP credentials are incorrect.

The email provider accepting a message does not guarantee inbox delivery.

## 6. Deployment (optional)
Deploy frontend and backend separately.

### Backend (for example, Render)
- Create a Web Service from the `backend` folder (Root Directory: `backend`).
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `backend/.env.example`.
- Set `FRONTEND_URL` to your deployed frontend URL, e.g. `https://your-site.vercel.app`.

### Frontend (for example, Vercel)
- Import the project and set Root Directory to `frontend`.
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` with your deployed backend URL, e.g. `https://your-api.onrender.com`.

After deploying, update the backend `FRONTEND_URL` to the exact deployed frontend origin and redeploy/restart the backend.

## Important privacy note
This is a simple public response endpoint. Rate limiting and input validation are included, but anyone who discovers the endpoint could still send requests. Do not use it for sensitive information. For stronger abuse prevention, add CAPTCHA/Turnstile before publishing the link widely.
