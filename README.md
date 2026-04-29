# Orbin Mail OS

Orbin Mail OS is a Gmail or Outlook-inspired email workspace MVP built with Next.js and MongoDB-ready storage.

It is designed to help teams:

- view inbox, sent, drafts, archive, and trash in one place
- search and sort messages
- mark mail as read, unread, starred, or important
- organize messages with categories and labels
- compose new messages and save drafts
- run in demo mode even before MongoDB is connected

## What this project is right now

This is a strong product prototype, not a full production-grade Gmail replacement yet.

Included now:

- modern mail dashboard UI
- mailbox navigation
- compose modal
- sample seeded messages
- MongoDB persistence when `MONGODB_URI` is provided
- fallback in-memory mode when MongoDB is not configured
- API routes for listing, creating, and updating messages

Not included yet:

- real user authentication
- real SMTP sending
- IMAP sync from Gmail or Outlook
- attachments
- threaded conversations
- team permissions and roles
- spam detection and advanced automations

## Tech stack

- Next.js
- React
- Mongoose
- MongoDB optional for persistence

## Project structure

- `pages/index.js`: main dashboard
- `components/MailApp.js`: full mail workspace UI
- `pages/api/messages/*`: message APIs
- `pages/api/mailboxes.js`: sidebar and dashboard counts
- `lib/messageStore.js`: shared storage logic
- `lib/sampleMessages.js`: starter mailbox data
- `models/Message.js`: MongoDB schema

## Run locally

1. Open a terminal in this folder:

```powershell
cd C:\Users\mfspa\Documents\Codex\2026-04-29\files-mentioned-by-the-user-orbin\orbin-ai-main
```

2. Install dependencies:

```powershell
npm.cmd install
```

3. Optional: create your environment file:

```powershell
copy .env.example .env.local
```

4. If you want real persistence, put your MongoDB connection string into `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string_here
```

5. Start the app:

```powershell
npm.cmd run dev
```

6. Open:

`http://localhost:3000`

## Demo mode vs MongoDB mode

If `MONGODB_URI` is missing, the app still works using starter sample data in memory.

That is helpful for design and testing, but:

- new messages are not saved permanently
- changes reset when the server restarts

If `MONGODB_URI` is present, the app stores messages in MongoDB.

## API routes

- `GET /api/messages`: list messages
- `POST /api/messages`: create a sent message or draft
- `GET /api/messages/:id`: get one message
- `PATCH /api/messages/:id`: update mailbox, read state, star state, labels, category
- `GET /api/mailboxes`: get sidebar and dashboard counts

You can also still use the older compatibility routes:

- `GET /api/get`
- `POST /api/send`

## Useful next upgrades

If you want to turn this into a real business product, the next best steps are:

1. add authentication with Clerk or NextAuth
2. connect real outgoing mail with Resend, SendGrid, or SMTP
3. add inbound mail sync with Gmail and Outlook APIs
4. add attachments and rich text editing
5. add threaded conversations and team assignments
6. add AI-powered triage, summaries, and suggested replies

## Build for production

Run:

```powershell
npm.cmd run build
```

If the build succeeds, the project is ready for deployment to Vercel.
