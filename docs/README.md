# BeSafe - AI Online Safety Guardian 🛡️

**BeSafe** is an AI-powered Chrome extension designed to protect users from offensive content on the web in real-time. When harmful language is detected, the system intervenes by offering immediate emotional support via a chatbot or directing the user to a safe, toxicity-free social network.

## 📸 Project Screenshots

### **Supportive Chatbot**
![Chatbot Interface](/assets/chatBot.png)
*An empathetic AI bot offering immediate support.*

<br>

### **SafePlace Network**
![Safe Social Network](/assets/safePlace.png)
*A safe, moderated social environment.*

<br>

### **Admin Dashboard**
![Admin Panel](/assets/adminPage.png)
*Management of users and safety blocks.*

## 🚀 Key Features

* **Real-Time AI Scanning:** The Chrome extension continuously scans webpage text using OpenAI to detect offensive or harmful language instantly.
* **Smart Intervention:** Upon detection, a pop-up offers the user a choice:
    * **🤖 Chatbot:** A gentle, purpose-driven AI companion designed to de-escalate the situation and provide support.
    * **🏡 SafePlace:** A secure social network alternative with built-in blocking mechanisms against toxicity.
* **Admin Dashboard:** A comprehensive panel for administrators to manage user safety scores, review blocks, and handle system messages.
* **Secure Authentication:** Complete user system with Login/Sign-up capabilities.

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS.
* **Backend:** Node.js, Express.
* **Database:** MongoDB.
* **AI Engine:** OpenAI API (GPT Models).
* **Extension:** Chrome Manifest V3.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

### 1. Prerequisites
* Node.js installed.
* MongoDB URI.
* OpenAI API Key.

### 2. Backend Setup (Server)
```bash
cd server
npm install
