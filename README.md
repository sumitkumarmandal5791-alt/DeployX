# ♻️ Smart E-Waste Bin System

A hackathon-built **full‑stack MERN web application** that simulates a **Smart E‑Waste Recycling Ecosystem**. The platform combines **AI-based object recognition**, **location-aware bin discovery**, **reward-based gamification**, and a **modern UI** to make e‑waste recycling simple, transparent, and motivating.

> Built for **Haxplore Hackathon** — UI/UX first, impact-driven, and demo-ready.

---

## 🚀 What This Project Does

People often don’t recycle e‑waste because they’re confused, unmotivated, or unsure what happens to their items. This project fixes that.

Our system:

* Helps users **find nearby smart e‑waste bins**
* Uses **object recognition** to detect deposited items
* Shows **what the item is** and its **estimated value**
* Rewards users with **points, badges, and impact stats**
* Gives admins visibility into bin usage and recycling data

All wrapped in a clean, friendly, hackathon‑ready UI.

---

## 🧠 Key Features

### 🔍 AI‑Powered Object Recognition

* Detects e‑waste items such as **phones, batteries, cables, chargers, laptops**
* Image-based recognition (simulated pipeline)
* Confidence-based detection logic
* Transparent feedback to build user trust

### 📍 Location-Based Bin Finder

* Select e‑waste type and locate the nearest compatible bin
* Optimized for **≤ 3 clicks** from selection to navigation
* Graceful handling when bins are unavailable or full

### 🎮 Rewards & Gamification

* Points awarded for each recycled item
* Recycling history tracking
* Environmental impact metrics (CO₂ saved, items recycled)
* Achievements & progress indicators

### 🖥️ Smart Bin Interface (Simulated)

* Interactive UI for depositing waste
* Visual scanning and analysis flow
* Clear success & error states

### 🛠️ Admin Dashboard (Conceptual)

* Bin monitoring overview
* Recycling analytics
* User activity insights

---

## 🧰 Tech Stack (Bluffed — but Believable 😄)

### Frontend

* **React.js** – Component-based UI
* **Vite** – Fast development & build tooling
* **Tailwind CSS** – Utility-first styling for rapid UI design
* **ESLint** – Code quality and consistency

### Backend

* **Node.js** – Runtime environment
* **Express.js** – REST API & routing
* **MongoDB (simulated)** – User data, bins, transactions
* **Environment-based config** using `.env`

### AI / Processing Layer

* **Python preprocessing pipeline** (image & metadata handling)
* Rule-based + ML-ready object classification
* Easily extensible to real ML models

### Tooling & Dev Experience

* Modular folder structure
* Clear separation of concerns
* Git-based version control

---

## 📁 Folder Structure

```
Project/
├── backend/
│   ├── model/                 # Data models / schemas
│   ├── src/                   # Backend source code
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   ├── fix_data.js             # Data utilities / fixes
│   ├── index.js                # Express server entry point
│   ├── package.json
│   ├── package-lock.json
│   ├── preprocess.py           # Object detection preprocessing
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── public/                # Static assets
│   ├── src/                   # React source code
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md                   # Project documentation
```

---

## ⚙️ Setup & Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Why This Project Stands Out

* **UI/UX‑first approach** (built for non‑technical users)
* Transparent AI behavior (trust-focused design)
* Scalable architecture
* Hackathon‑ready storytelling & demo flow
* Real‑world problem with environmental impact

---

## 🌍 Future Enhancements

* Real ML model integration (TensorFlow / PyTorch)
* Live GPS & Maps API
* Push notifications
* QR-based user authentication
* Real reward redemption system

---

## 🏁 Final Note

This project demonstrates how technology, design, and sustainability can work together to create a **smart, user-friendly recycling experience**.

Built with speed, creativity, and caffeine ☕ during a hackathon.

---

### 🙌 Team

Hackathon Participants — 
Harshit Kumar----
Md Faizal Ali---
Sumit Mandal