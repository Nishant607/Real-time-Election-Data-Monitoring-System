# Real-time Election Data Monitoring System

This project is a comprehensive and secure real-time election data monitoring system. It uses a **modern decoupled architecture** to ensure reliability, security, and a beautiful user experience.

## ✨ Key Features (Phases 1, 2, and 3)

1. **Immersive UI / UX:**
   - **Glassmorphism Dark UI:** Developed using Tailwind CSS, Lucide React Icons, and Framer Motion for premium fluid animations and aesthetic appeal.
   - **Role-Based Access Control (RBAC):** Strict isolation between `Admin` and `User` roles. Administrative paths (like Account Provisioning and Audit Logs) are fully guarded.
   
2. **Real-Time Data Layer:**
   - **Supabase Integration:** Supabase manages Authentication and Postgres database architecture efficiently.
   - **Live Event Stream:** Any anomalies or significant changes immediately reflect on the Dashboard Event Stream and Alerts List without requiring page refresh.
   
3. **Anomaly Detection & Automated Auditing:**
   - **Suspicious Voting Spike Detection:** The backend detects voting changes of over 50% or within very short intervals (< 60 seconds).
   - **Alert Lifecycle Management:** Spikes trigger `Pending` status votes, high-severity Alerts are generated, and they can be Investigated/Resolved within the Investigation Hub by an Admin.
   - **Audit Logs:** A chronological trace of every destructive/administrative action.

---

## 🚀 How to Run the System

To see the full system working, you must ensure both backend dependencies and frontend servers are active.

### Terminal 1: The Backend (API & Processing)
1. Activate the environment: `.\.venv\Scripts\Activate`
2. Start the server (if using Django): `cd backend; python manage.py runserver`
*(Note: With the Supabase integration, much of the data fetching directly hits Supabase, but strictly enforced rules are managed correctly).*

### Terminal 2: The Frontend (React UI)
1. Navigate to the root directory's frontend folder: `cd frontend`
2. Install dependencies (if you haven't already): `npm install`
3. Start the dev server: `npm run dev`
4. **Access the UI:** [http://localhost:5173/](http://localhost:5173/)

---

## 🛡️ Authentication Guide

The application connects to **Supabase Auth**. 

- **Admin Login:** Use an admin-tier account (e.g., `nishant` mapped to `nishant@election.local` with password: `nishant@2004`) to access candidate provisioning and audit views.
- **Normal User:** Standard users can only view Dashboards and basic Analytics panels.

*(Utility scripts exist in the `frontend/` directory to construct new native users if starting from a fresh environment, such as `node create_real_users.js`.)*

---

## 📂 Project Structure

- `backend/`: Django codebase, managing security, migrations, anomaly algorithms, and local API.
- `frontend/src/`: React pages, contexts, components, and animations.
- `Project_Migration_Prompt.txt`: Master prompt blueprint mapping the architecture for generative AI reproduction (e.g. into a MySQL configuration if chosen).

---

## 🛠 Technology Stack

- **Backend:** Python, Django REST Framework, Django Channels (WebSockets)
- **Database/Auth:** Supabase (PostgreSQL, Supabase Auth JS)
- **Frontend:** React, HTML, JS, Tailwind CSS, Framer Motion, Lucide Icons
- **Environment:** Windows, Node.js / npm
