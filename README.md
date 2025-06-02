# DealSensei - AI-Powered CRM Platform

![DealSensei]

## 🚀 Overview

DealSensei is a multi-tenant CRM platform designed for companies to manage contacts, deals, and customer data with deep integration of AI-powered tools to boost sales effectiveness. The platform leverages artificial intelligence to provide actionable insights and recommendations to sales teams.

## ✨ Key Features

- **Multi-Tenant Architecture**: Secure data isolation between companies
- **Sales Pipeline Management**: Customizable pipelines and deal stages
- **Contact & Deal Management**: Comprehensive tracking of customer interactions
- **Team Collaboration**: Role-based access control for admins and sales representatives
- **Activity Tracking**: Log calls, meetings, emails, and other customer interactions
- **File Management**: Attach and organize documents related to deals and contacts
- **Email Integration**: Send emails directly from the platform

### 🤖 AI-Powered Features

- **Deal Coach AI**: Analyzes deals and provides actionable next steps to improve close probability
- **Customer Persona Builder**: Generates behavioral profiles from interaction history
- **Objection Handler Recommender**: Suggests convincing responses to customer objections in real-time
- **Win-Loss Explainer**: Analyzes deal data to explain why deals were won or lost

## 🛠️ Tech Stack

### Frontend

- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Yup validation
- **API Integration**: Custom hooks (useQuery/useMutation)
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js with Express
- **Database**: MongoDB with Vector Search capabilities
- **Authentication**: JWT with bcrypt encryption
- **File Storage**: Amazon S3
- **Email**: SMTP/SendGrid
- **AI Integration**: Gemini SDK (text-embedding-004)

## 🏗️ Project Structure

### Frontend (`/FRONTEND`)

```
/src
  /api         - API service and endpoints
  /components  - Reusable UI components
    /ui        - Base UI components
    /layout    - Layout components
    /contacts  - Contact-related components
    /deals     - Deal-related components
    /activities - Activity-related components
    /ai        - AI feature components
  /hooks       - Custom React hooks
  /pages       - Page components
  /redux       - Redux store, slices, and actions
  /utils       - Utility functions
  /styles      - Global styles
```

### Backend (`/BACKEND`)

```
/src
  /config      - Configuration files
  /middleware  - Express middleware
  /utils       - Utility functions
  /feature     - Feature-based modules
    /auth      - Authentication
    /company   - Company management
    /user      - User management
    /pipeline  - Pipeline management
    /contact   - Contact management
    /deal      - Deal management
    /activity  - Activity tracking
    /file      - File management
    /ai        - AI features
  /scripts     - Utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- AWS S3 account
- Gemini API key
- SMTP service

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/deal-sensei.git
cd deal-sensei
```

2. Install dependencies for both frontend and backend

```bash
# Install backend dependencies
cd BACKEND
npm install

# Install frontend dependencies
cd ../FRONTEND
npm install
```

3. Set up environment variables

```bash
# Backend (.env)
cp BACKEND/.env.example BACKEND/.env
# Edit BACKEND/.env with your configuration

# Frontend (.env)
cp FRONTEND/.env.example FRONTEND/.env
# Edit FRONTEND/.env with your configuration
```

4. Start the development servers

```bash
# Start backend server
cd BACKEND
npm run dev

# Start frontend server
cd ../FRONTEND
npm run dev
```

## 🔐 Environment Variables

### Backend

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

```bash
# Run backend tests
cd BACKEND
npm test

# Run frontend tests
cd ../FRONTEND
npm test
```

## 📝 Development Guidelines

### Code Structure

- Follow feature-based architecture in the `feature/` directory
- Use `api.js` for API calls
- Use `useQuery`/`useMutation` for API interactions

### Development Rules

- Update `.env` files with dummy keys if actual keys aren't available
- Use Windows commands only
- Follow the existing file structure and patterns
- Use Redux for state management
- Implement proper error handling and validation

### Frontend

- Use Tailwind CSS for styling
- Follow the design system in `frontend-design-spec.md`
- Ensure responsive design
- Use Lucide icons
- Implement dark/light mode support

### Backend

- Use ES modules (type: module)
- Follow the structure in `backend-details.md`
- Implement proper error handling with `CustomError.js`
- Use `apiResponse.js` for consistent responses
- Maintain data isolation with `company_id`

### Security

- Never commit sensitive data
- Use environment variables for configuration
- Implement proper authentication/authorization
- Follow security best practices

### Documentation

- Update `todo.md` with task status
- Add JSDoc comments
- Keep documentation up-to-date

### Git Workflow

- Follow feature branch workflow
- Write clear commit messages
- Create pull requests for review
- Keep the main branch stable

## 📊 Project Status

The project is currently in active development. Check the `todo.md` file for the current status of implementation tasks.

## 📄 License

[MIT](LICENSE)

## 👥 Contributors

- Sudhir - Project Lead

---

© 2025 DealSensei. All rights reserved.
