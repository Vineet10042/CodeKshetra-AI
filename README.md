# CodeKshetra AI - Leetcode Like coding platform 

A modern, full-stack LeetCode clone with an AI tutor, built using the MERN stack (MongoDB, Express, React, Node.js). It features a robust code execution engine, an interactive problem-solving workspace, video editorials, and a gamified point system.

## Tech Stack

**Frontend:**
- **Framework:** React 19 + Vite
- **Styling:** TailwindCSS + DaisyUI
- **State Management:** Redux Toolkit
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Syntax Highlighting:** `react-syntax-highlighter`

**Backend:**
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB (Mongoose) + Redis (Caching)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Video Storage:** Cloudinary

---

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
1. **Node.js** (v18 or higher recommended)
2. **MongoDB** (Running locally or a MongoDB Atlas URI)
3. **Redis** (Must be running locally on your machine on the default port `6379`)

---

##  Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Backend Setup
Navigate to the backend directory, install the required packages, and start the server.

```bash
cd Day09
npm install
```

**Environment Variables:**
Create a `.env` file inside the `Day09` folder and add the following keys. You will need to obtain your own API keys for Cloudinary, Gemini, and your own MongoDB URI.

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/leetcode_clone
JWT_KEY=your_super_secret_jwt_key
GEMINI_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Start the Backend:**
*Note: Make sure your Redis server is running in the background before starting the node server.*
```bash
node src/index.js
# The server should start on http://localhost:3000
```

### 3. Frontend Setup
Open a **new terminal window**, navigate to the frontend directory, install dependencies, and start the Vite dev server.

```bash
cd Frontend
npm install
```

**Start the Frontend:**
```bash
npm run dev
# The React app should start on http://localhost:5173
```



## Key Features
- **Interactive Code Editor:** Embedded Monaco editor supporting C++, Java, and JavaScript.
- **AI Tutor:** Integrated Gemini AI to help users debug code without giving away the complete answer.
- **Admin Dashboard:** Secure portal to create, edit, and manage problems, invisible test cases, and video editorials.
- **Gamified Scoring:** Earn points (Easy: 2, Medium: 4, Hard: 8) upon successfully solving problems for the first time.
- **Video Editorials:** Secure Cloudinary video streaming for problem walkthroughs.
- **Role-based Authentication:** Secure JWT cookies with User and Admin roles.
