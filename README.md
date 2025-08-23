# Inspection Management System

A comprehensive MERN (MongoDB, Express, React, Node.js) application for managing inspection and meeting reports with secure authentication, role-based access control, and modern UI.

## Features

- **Secure Authentication**
  - Email and password login
  - Phone number verification via OTP
  - Password reset functionality
  - Role-based access control

- **User Profile Management**
  - View and edit profile information
  - Change password
  - Display user designation

- **Inspection/Meeting Reports**
  - Create detailed inspection and meeting reports
  - Upload supporting documents
  - Edit and delete reports
  - View detailed report information

- **Search and Export**
  - Search reports by various criteria
  - Export reports in different formats (PDF, Excel, Word)

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Twilio for OTP verification
- Nodemailer for email notifications

### Frontend
- React with React Router
- Redux Toolkit for state management
- RTK Query for API calls
- Formik and Yup for form validation
- Tailwind CSS for styling
- React Icons for UI icons

## Project Structure

### Backend Structure
```
server/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── uploads/        # Uploaded files
├── .env            # Environment variables
├── index.js        # Entry point
└── package.json    # Dependencies
```

### Frontend Structure
```
client/
├── public/         # Static files
├── src/
│   ├── app/        # Redux store setup
│   ├── assets/     # Images, fonts, etc.
│   ├── components/ # Reusable components
│   ├── features/   # Feature-based Redux slices
│   ├── hooks/      # Custom hooks
│   ├── layouts/    # Layout components
│   ├── pages/      # Page components
│   ├── services/   # API services
│   ├── utils/      # Utility functions
│   ├── App.js      # Main component
│   └── index.js    # Entry point
└── package.json    # Dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/AK-Y/Report-Management-System.git
cd Report-Management-System
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inspection-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000

# Email configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Twilio configuration for OTP
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Install frontend dependencies
```bash
cd ../client
npm install
```

5. Start the development servers

Backend:
```bash
cd ../server
npm run dev
```

Frontend:
```bash
cd ../client
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## License

This project is licensed under the MIT License - see the LICENSE file for details. 