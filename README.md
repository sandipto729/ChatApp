
# ChatApp

A simple real-time chat application with authentication, built using React (Vite) for the frontend and Node.js/Express with Socket.io for the backend.

## Features
- User registration and login
- Real-time messaging with Socket.io
- Chat rooms and user list
- Protected routes for authenticated users

## Tech Stack
- **Frontend:** React, Vite, SCSS
- **Backend:** Node.js, Express, Socket.io, MongoDB

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- MongoDB

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/sandipto729/ChatApp.git
cd ChatApp
```

#### 2. Install dependencies
- For the server:
	```bash
	cd server
	npm install
	```
- For the client:
	```bash
	cd ../client
	npm install
	```

#### 3. Start the application
- Start the backend server:
	```bash
	cd server
	npm start
	```
- Start the frontend:
	```bash
	cd ../client
	npm run dev
	```

#### 4. Open in browser
Visit [http://localhost:5173](http://localhost:5173) to use the app.

## Folder Structure
- `client/` - React frontend
- `server/` - Node.js backend

## License
MIT
