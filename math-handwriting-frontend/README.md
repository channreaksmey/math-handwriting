# Frontend - Math Handwriting (Next.js)

## Overview

This is the frontend application for the Math Handwriting Data Collection System. It's built with Next.js and provides an interactive interface for students to solve math problems by handwriting on a digital canvas.

## Tech Stack

* **Framework:** Next.js 16
* **UI:** React 19, TypeScript
* **Styling:** Tailwind CSS 4
* **Canvas Drawing:** perfect-freehand
* **Build Tool:** Turbopack (via Next.js)

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── game/              # Game/capture page
│   ├── play/              # Play mode pages
│   ├── review/            # Review session results
│   ├── setup/             # Session setup
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── canvas/           # Canvas-related components
├── hooks/                 # Custom React hooks
│   └── useStrokeCapture.ts  # Stroke capture logic
├── lib/                   # Utility libraries
│   ├── api.ts            # API client for backend communication
│   └── problemGenerator.ts  # Math problem generation
├── types/                 # TypeScript type definitions
│   └── strokes.ts        # Stroke-related types
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── .env                  # Environment variables (if any)
```

## Getting Started

### Prerequisites

* Node.js 18+ 
* npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in this directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This points to your backend API URL. For production deployment, set this to your deployed backend URL.

## Available Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production
* `npm run start` - Start production server
* `npm run lint` - Run ESLint

## Backend Dependency

This frontend requires the backend API to be running. By default, it connects to `http://localhost:8000`. Make sure the backend is started before using the frontend.

See the backend README at `../backend/README.md` for backend setup instructions.

## Key Features

* **Interactive Canvas:** Draw math problems using a digital canvas
* **Stroke Capture:** Records detailed stroke-level behavior including timing, pressure, and movement
* **Problem Generation:** Generates math problems by difficulty and type
* **Session Management:** Track and review handwriting sessions
* **Backend Integration:** Sends captured data to the backend for storage and analysis

## Deployment

### Vercel

The easiest way to deploy this Next.js app is on [Vercel](https://vercel.com/).

1. Push your code to GitHub
2. Import the repository to Vercel
3. Set the `NEXT_PUBLIC_API_URL` environment variable to your backend URL
4. Deploy

Make sure your backend is deployed separately and accessible via the URL you configure.
