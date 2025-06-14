# Talent Search AI Recruitment Platform

A modern, AI-powered talent recruitment platform that generates job descriptions and optimizes candidate search using LinkedIn Sales Navigator filters and OpenAI.

---

## 📚 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [API Limitations & Sample Data](#api-limitations--sample-data)
- [Screenshots](#screenshots)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Assumptions & Notes](#assumptions--notes)
- [License](#license)

---

## 🧩 Overview

This project is a full-stack assignment for HumanBit, simulating a real-world AI recruitment workflow.  
It combines a dark, glassmorphic UI, Gemini-powered job description generation, and LinkedIn-style candidate filtering with professional error handling and state management.

---

## ✨ Features

### 🔹 AI Job Description Generator
- Enter job details and generate a professional job description using Gemini.

### 🔹 Manual & AI-Optimized Candidate Filtering
- Search and select job titles, companies, and locations (via LinkedIn Sales Navigator API on RapidAPI).
- Add filters as "Include" (must-have) or "Exclude" (must-not-have).
- Chips/tags for filter management with real-time removal and state sync.
- AI agent iteratively optimizes filters for best candidate results.

### 🔹 Candidate Results Display
- Paginated, responsive grid of candidate cards (sample/mock data).
- Clean, accessible, and mobile-friendly UI.

### 🔹 Error Handling
- All API, loading, and empty states are gracefully managed.

### 🔹 Deployment
- Vercel-hosted with environment variables for API keys.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+, TypeScript, Tailwind CSS  
- **AI:** Gemini API (GPT-3.5 / GPT-4)  
- **External APIs:** RapidAPI LinkedIn Sales Navigator (for filter suggestions)  
- **Deployment:** Vercel  

---

## ⚙️ Setup & Installation

### 🔸 Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 🔸 Install Dependencies

```bash
npm install
```

### 🔸 Configure Environment Variables

Create a `.env.local` file and add the following:

```env
OPENAI_API_KEY=your-openai-key
RAPIDAPI_KEY=your-rapidapi-key
```

⚠️ **Do not commit your `.env.local` file.**

### 🔸 Start the Development Server

```bash
npm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 🧑‍💻 Usage Guide

### 🔹 Landing Page
- Click **“Find Talent”** to begin.

### 🔹 Job Description
- Fill out job title, company, location, skills, and experience.
- Click **“Generate Job Description”** to use AI.

### 🔹 Filter Suggestions
- Use search fields to get dynamic suggestions for job title, company, and location.
- Add filters as Include or Exclude; manage them as chips/tags.

### 🔹 AI Optimization
- If too few candidates are found, the system iteratively adjusts filters to improve results.

### 🔹 Candidate Results
- View paginated, professional candidate cards.
- All candidate data is mock/sample for demo purposes.

---

## 🚫 API Limitations & Sample Data

Due to LinkedIn API restrictions:
- **Real candidate profiles cannot be fetched**
- All candidate results use a realistic **sample dataset**:  
  `./data/candidates.json`  
  Fields: name, role, company, location, skills, etc.

➡️ All filter logic and AI workflows are fully implemented using this dataset.

---

## API Limitations & Rate Limits

> **Important Note:**  
> The LinkedIn Sales Navigator filter suggestion feature in this app uses RapidAPI’s free tier, which allows only **25 requests per day** per account.  
> If you see errors like “Failed to optimize filters” or “You have exceeded the rate limit,” it means the daily quota has been reached.  
> The quota resets every 24 hours (midnight UTC), or you can use a new RapidAPI account/key for more testing.  
> For production or extended demos, upgrading to a paid RapidAPI plan is recommended.

**How this affects the demo:**
- If the quota is exceeded, filter suggestions (job title, company, location) will not work until the quota resets or a new API key is used.
- All other features (AI job description, candidate filtering, sample data display) will continue to work.

**What to do if you hit the limit:**
- Wait until the next day for the quota to reset,
- or use a different RapidAPI account/key,
- or contact the project owner for a demo/pro key.
  
---

## 🧪 Development Workflow

- **Git:** Conventional commits (`feat:`, `fix:`, `chore:` etc.)
- **Pull Requests:** Used for all major features/bugfixes
- **TypeScript:** All components and logic are fully typed
- **Error Handling:** All API and UI errors are caught and shown to the user

---

## 🚀 Deployment

### 🔹 Vercel
- Here is the deployed link (https://talent-search-application.vercel.app/)
- Environment variables set in Vercel dashboard

### 🔹 Production Build

```bash
npm run build
npm start
```

---

## 📝 Assumptions & Notes

- **LinkedIn API:** Only filter suggestions are available via RapidAPI. Candidate search uses mock data.
- **AI Agent:** Filter optimization logic is simulated (adjusting filters based on results).
- **Design:** Fully responsive, accessible, and styled as per spec (glassmorphism, gradients, Nunito & Encode Sans fonts).
- **Testing:** All user flows and edge cases are manually tested.

---

## 📄 License

MIT License  
