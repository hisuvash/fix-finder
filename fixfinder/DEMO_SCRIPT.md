# FixFinder Demo Script (1–2 minutes)
## Roles: **Driver** (screen-share) · **Speaker** (narrates)

---

## Before You Start (do this off-camera)

**Driver:**
- [ ] Backend running: `cd backend && npx nodemon server.js`
- [ ] Frontend running: `npm start` → press **w** for web
- [ ] Optional: seed past handymen so profile has cards: `node scripts/seed-past-handymen.js` (from `backend`)
- [ ] Optional: seed **demo handymen** (varied skills + cities for **Search**): `node scripts/seed-demo-handymen.js` — password for those accounts: `DemoHandy1!`
- [ ] Close extra tabs; zoom browser so layout looks good
- [ ] Start screen share; have app at `http://localhost:8081` (or your URL) on Home or Login

**Speaker:** Have this script open on a second screen or printed. Glance at the next section before each part.

---

## INTRO (5–10 seconds)

**Speaker:**  
*“We’re going to walk you through FixFinder — a platform that connects users with handymen. I’ll talk you through it while [Driver name] drives the app.”*

**Driver:**  
- Show the app home page briefly (or the page you’re starting on). No need to click yet.

---

## 1. LOGIN (15–20 seconds)

**Speaker:**  
*“First, logging in. Users sign in with their email and password.”*

**Driver:**  
- Click **Login** in the top navigation.

**Speaker:**  
*“Here’s the login form — email and password, plus options like forgot password and sign up.”*

**Driver:**  
- Enter a valid email and password (e.g. your test account).
- Click **Login**.

**Speaker:**  
*“Once we’re in, we’re taken to the main app — in our case we’ll go straight to the profile to show the next part.”*

**Driver:**  
- Wait for redirect. If you land on Home, click **Profile** (or the profile link in the nav).

---

## 2. SIGN UP & TWO USER TYPES (25–35 seconds)

**Speaker:**  
*“Before we look at the profile, let’s quickly show how sign-up works — and that we support two kinds of users.”*

**Driver:**  
- Click **Logout** (if you’re logged in).
- Click **Sign up** (or go to the Register page).

**Speaker:**  
*“On the registration form you enter the usual details — name, email, password, location — and crucially, you choose your user type.”*

**Driver:**  
- Scroll so the form is visible; focus on the **User type** (or role) dropdown.

**Speaker:**  
*“We have two options: **Normal** — that’s a regular user who might need a handyman — and **Handyman**, for the service providers. So the same sign-up flow serves both sides of the platform.”*

**Driver:**  
- Open the dropdown and show **Normal** and **Handyman**.
- Option A: Select **Handyman**, then say you’re not actually creating a new account for the demo.
- Option B: Quickly fill the form and register as **Normal**, then log out and log back in with your main demo account.

**Speaker:**  
*“Once you’re registered, you use the same login we just showed. For the rest of the demo we’re logged in as a normal user.”*

**Driver:**  
- If you logged out to show sign-up, log back in with the account that has a profile (and past handymen if you seeded).

---

## 3. PROFILE & PAST HANDYMEN (25–35 seconds)

**Speaker:**  
*“Now the profile. This is where we bring everything together.”*

**Driver:**  
- Go to **Profile** (click it in the nav if you’re not already there).

**Speaker:**  
*“On the left you see the user’s own details — name, email, location, user type — and an option to edit profile. On the right we have a section called **Past handymen you have worked with**.”*

**Driver:**  
- Scroll or position the window so both the left card and the right “Past handymen” section are visible.

**Speaker:**  
*“These are handymen this user has worked with before. Each card shows the handyman’s name and, when we have it, a profile picture. The idea is to make it easy to find and contact someone you’ve already worked with.”*

**Driver:**  
- Hover or point at one of the handyman cards (if the list is empty, say you’d run a quick seed so the demo has sample data).

**Speaker:**  
*“When you click a card, you go to that handyman’s profile — a dedicated page for that person.”*

**Driver:**  
- Click one of the past handyman cards.

**Speaker:**  
*“Here you see their name, that they’re a handyman, and their location. So from the main profile we’ve drilled down to a specific handyman’s profile — that’s the connection we’re building between users and the handymen they’ve worked with.”*

**Driver:**  
- Optionally scroll to show the full handyman profile (e.g. “Back to profile” button).

---

## 4. WRAP-UP (5–10 seconds)

**Speaker:**  
*“So in a nutshell: login and sign-up with two user types — Normal and Handyman — then the profile with past handymen, and clicking through to a handyman’s profile. That’s FixFinder. Thanks for watching.”*

**Driver:**  
- You can click **Back to profile** or **Home** so the app ends on a clean screen. Stop screen share when the speaker is done.

---

## Quick reference: who does what

| Section        | Driver (screen-share)              | Speaker (narrator)                          |
|----------------|-------------------------------------|---------------------------------------------|
| Intro          | Show app home                       | Introduce FixFinder and roles              |
| Login          | Click Login, enter credentials, submit | Describe login and what we’re doing     |
| Sign up        | Open Sign up, show form & user type | Explain two user types (Normal / Handyman)  |
| Profile        | Open Profile, show left/right       | Explain profile layout and past handymen   |
| Handyman card  | Click a card, show handyman profile | Explain drill-down to handyman profile      |
| Wrap-up        | Optional: Back/Home                 | Short recap and thank you                   |

---

## If something goes wrong

- **Backend not responding:**  
  **Speaker:** *“We’re seeing a quick connection issue on our side — the app normally talks to our backend for login and profile data.”*  
  **Driver:** Check backend terminal; restart if needed.

- **No past handymen on profile:**  
  **Speaker:** *“This list is populated when a user has worked with handymen; for the demo we can seed it so you see sample cards.”*  
  **Driver:** Run seed script before the next take or show the empty state and explain it.

- **Wrong page or broken link:**  
  **Speaker:** *“Let me just go back to the profile.”*  
  **Driver:** Use browser back or click **Profile** / **Home** in the nav.

---

*Good luck with the demo.*
