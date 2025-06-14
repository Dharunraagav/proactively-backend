# Proactively - Healthcare Management Platform

A modern healthcare management platform built with Next.js, featuring patient management, doctor consultations, and appointment scheduling.

## 🌐 Live Demo

Visit the live application: [https://dharunraagav.github.io/proactively-backend/](https://dharunraagav.github.io/proactively-backend/)

## ✨ Features

### 🔐 Authentication & Security
- **Secure Login System** with rate limiting (100 requests/15 min per IP)
- **Session Management** with max 3 concurrent sessions per user
- **Client-side Protection** with progressive lockouts (5 failed attempts = 15min lockout)
- **Load Testing Ready** - handles heavy concurrent login loads

### 👨‍⚕️ Doctor Consultation
- Browse certified lifestyle medicine doctors
- Filter by specialty and location
- Real-time availability checking
- Appointment booking with calendar integration

### 📊 Dashboard Features
- Patient profile management
- Document upload and management
- Appointment history and scheduling
- Admin panel for healthcare providers

### 🚀 Performance & Testing
- **Load Testing Scripts** included for performance validation
- **Rate Limiting** to prevent abuse and ensure stability
- **Optimized for Production** with static export capabilities

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: GitHub Pages with GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dharunraagav/proactively-backend.git
cd proactively-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Update lib/supabase.ts with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📈 Load Testing

Test your login system's performance under heavy load:

```bash
# Simple stress test (100 concurrent users, 1000 total requests)
node scripts/stress-test.js

# Advanced K6 load testing (requires K6 installation)
k6 run scripts/load-test.js
```

### Expected Performance:
- ✅ **Success Rate**: 95-100% under normal load
- ✅ **Response Time**: <500ms average
- ✅ **Rate Limiting**: Activates at 100 requests/15min per IP
- ✅ **Session Limits**: Max 3 concurrent sessions per user

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Patient dashboard
│   ├── admin/            # Admin panel
│   ├── login/            # Authentication pages
│   └── signup/
├── components/           # Reusable UI components
├── lib/                 # Utilities and configurations
│   ├── supabase.ts      # Database configuration
│   └── rate-limiter.ts  # Rate limiting logic
├── pages/api/           # API routes
├── scripts/             # Load testing scripts
└── public/              # Static assets
```

## 🔧 Configuration

### Database Schema
The application uses Supabase with the following main tables:
- `profiles` - User profiles and metadata
- `consultants` - Doctor information and availability
- `appointments` - Booking and scheduling data
- `documents` - Patient document management

### Rate Limiting
- **Login API**: 100 requests per 15 minutes per IP
- **Session Limit**: 3 concurrent sessions per user
- **Client Lockout**: 15 minutes after 5 failed attempts

## 🚀 Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions:

1. Push to `master` branch triggers deployment
2. Next.js builds and exports static files
3. GitHub Pages serves the application

### Manual Deployment
```bash
npm run build
npm run export
```

## 🧪 Testing

### Load Testing Results
- **Concurrent Users**: Supports 100+ concurrent users
- **Response Time**: <2s for 95% of requests
- **Error Rate**: <1% under normal conditions
- **Rate Limiting**: Properly blocks excessive requests

### Security Features
- ✅ SQL injection protection via Supabase
- ✅ Rate limiting on authentication endpoints
- ✅ Session management and concurrent login limits
- ✅ Client-side progressive lockouts

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login with rate limiting
- Rate limited to 100 requests per 15 minutes per IP
- Returns session data and user information

### Key Features
- Automatic session tracking
- Concurrent session validation
- Progressive error messaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the load testing documentation in `README-LOAD-TESTING.md`

---

**Built with ❤️ for modern healthcare management**
