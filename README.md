# Vibe Video Caller 🎥

Vibe Video Caller is a full-stack Zoom-like video conferencing web application built with the **MERN stack** and **WebRTC architecture**. It enables users to seamlessly join or host meetings, share their screen, chat in real-time, and manage meetings with authentication-based private rooms.

🚀 **Live Demo**: [https://vibevideocaller.vercel.app](https://vibevideocaller.vercel.app)  
📂 **GitHub Repo**: [krishnatejaswi2005/Vibe-Video-Caller](https://github.com/krishnatejaswi2005/Vibe-Video-Caller)

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**
- **Material UI (MUI)**
- **CSS**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**

### Authentication & Security
- **bcrypt** – for hashing passwords
- **crypto** – for secure encryption

### Real-Time Communication
- **WebRTC** – peer-to-peer video/audio streaming
- **Socket.IO** – real-time communication & signaling

---

## 📌 Features

### 🧑‍💻 Guest Mode
- Join meetings as a guest without needing to sign up.
- Enter a custom username (visible to other participants).
- Preview video before joining the room.

### 🔐 Authentication
- Register and log in with secure password hashing.
- Create custom private rooms for confidential conversations.
- Access history of previously hosted or joined meetings.

### 📹 In-Meeting Features
- Real-time video and audio communication using WebRTC.
- Toggle video/audio on or off anytime during the meeting.
- Screen sharing functionality for collaborative work.
- Integrated real-time chat feature within the meeting.
- Option to leave or end the call for all users.

### 🕓 Meeting History
- Logged-in users can view past meeting records with timestamps and room details.

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/krishnatejaswi2005/Vibe-Video-Caller.git
cd Vibe-Video-Caller
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following contents:

```env
MONGO_URI=your_mongodb_connection_string
```

Start the backend server:

```bash
nodemon app.js
```

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app should now be running on `http://localhost:5173` (or whichever port Vite assigns).

---


## 🙌 Acknowledgements

- [WebRTC](https://webrtc.org/)
- [Socket.IO](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)

---

Feel free to fork the repo, open issues, or contribute!
```
