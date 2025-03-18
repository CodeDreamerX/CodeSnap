# CodeSnap

CodeSnap is a web-based tool designed to help developers safely share code screenshots on social media. It uses OCR technology to extract code from screenshots and scan for security risks such as hardcoded credentials or sensitive information.

## Features

- **User Authentication**
  - Email/password authentication with email verification
  - OAuth sign-in with GitHub and Google

- **Screenshot Upload**
  - Upload JPEG/PNG images via file selection
  - Paste directly from clipboard with Ctrl+V

- **Security Analysis**
  - Extract code from screenshots using OCR
  - Detect hardcoded credentials and sensitive information
  - Confidence score (ScanFactor) based on OCR extraction quality

## Technology Stack

### Backend
- Node.js with Express
- MongoDB for data storage
- Passport.js for authentication
- Tesseract.js for OCR
- Jimp for image preprocessing
- Nodemailer for email verification

### Frontend
- React
- Tailwind CSS
- React Router for navigation
- Axios for API requests

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas)
- Google and GitHub OAuth credentials (for social login)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/codesnap.git
cd codesnap
```

2. Install dependencies for server and client:
```
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

3. Create .env files:

For server (.env in server folder):
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@codesnap.com
CLIENT_URL=http://localhost:3000
```

4. Run the application:

For development (separate terminals):
```
# Run the server
cd server
npm run dev

# Run the client
cd client
npm start
```

The application will be accessible at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. Create an account or sign in with Google/GitHub
2. Upload a code screenshot or paste from clipboard
3. View the security analysis results
4. Share your code screenshot confidently if no security issues are found

## License

This project is licensed under the MIT License 