# Hospital Inventory Management System

A comprehensive enterprise-level web application for hospital supplies inventory management with multi-tenant architecture, secure authentication, and advanced analytics.

## 🏥 Features

- **Multi-tenant Architecture** - Complete data isolation between healthcare organizations
- **Healthcare Compliance** - Medication safety classifications (Hazardous, High Alert, LASA)
- **Advanced Analytics** - Business intelligence with predictive insights and compliance monitoring
- **Real-time Inventory Tracking** - Live updates with automatic low stock alerts
- **Hierarchical Structure** - Sites → Stock Areas → Items → Inventory
- **Advanced Table Functionality** - Filtering, sorting, pagination with Tanstack React Table
- **Dark Mode Support** - Professional healthcare interface
- **Security First** - JWT authentication, password hashing, route protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL (for production) or SQLite (for development)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secure-jwt-secret"
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom theme
- **Tanstack React Table** - Advanced data table functionality
- **Recharts** - Interactive analytics charts
- **React Hooks + Context** - State management

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Prisma ORM** - Type-safe database operations
- **SQLite** (development) / **PostgreSQL** (production)
- **JWT Authentication** - Secure token-based auth
- **bcryptjs** - Password hashing

### Testing
- **Jest** - Testing framework
- **@testing-library/react** - Component testing
- **Security validation tests** - XSS/injection prevention
- **Performance regression tests** - Algorithm efficiency

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── dashboard/         # Main application pages
│   ├── login/            # Authentication pages
│   └── register/
├── components/            # Reusable React components
│   ├── charts/           # Analytics visualizations
│   └── ui/               # Base UI components
├── lib/                  # Utilities and configurations
├── services/             # Business logic layer
├── types/                # TypeScript definitions
└── __tests__/            # Test files
```

## 🏥 Healthcare Features

### Medication Safety
- **High Alert Medications** - Special handling requirements
- **Hazardous Drugs** - Safety protocol compliance
- **LASA (Look-Alike-Sound-Alike)** - Error prevention system

### Compliance Monitoring
- Real-time safety alerts
- Compliance scoring dashboard
- Audit trail and activity logs
- Regulatory reporting capabilities

### Analytics & Insights
- Usage trends and turnover analysis
- Predictive low stock algorithms
- Site performance metrics
- Executive summary reports

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report

# Database scripts
npm run db:migrate   # Run database migrations
npm run db:deploy    # Deploy migrations to production
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
```

### Database Schema

The application uses a multi-tenant architecture with the following models:
- **Company** - Tenant isolation
- **User** - Authentication and authorization
- **Site** - Hospital locations
- **StockArea** - Inventory storage areas
- **Item** - Medications and supplies
- **Inventory** - Stock tracking and management

## 🚀 Deployment

### Vercel Deployment

1. **Prepare for deployment**
   ```bash
   cp .env.example .env.production
   ```

2. **Configure environment variables in Vercel**
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secure random string
   - `NEXT_PUBLIC_APP_URL` - Your app domain

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

#### Required
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret (generate securely)

#### Optional
- `NEXT_PUBLIC_APP_URL` - App URL for redirects
- `SENTRY_DSN` - Error monitoring
- `VERCEL_ANALYTICS_ID` - Analytics tracking

## 🔒 Security

- **Multi-tenant data isolation** - Company-level data separation
- **JWT authentication** - Secure token-based sessions
- **Password hashing** - bcrypt with salt rounds
- **Input validation** - Prevents XSS and injection attacks
- **Route protection** - Authenticated endpoints only
- **CORS configuration** - Secure cross-origin requests

## 📊 Testing

- **23 passing tests** covering security, performance, and functionality
- **Security validation** for XSS prevention and data isolation
- **Performance regression tests** for algorithm efficiency
- **Component testing** with React Testing Library
- **Test coverage reports** with Jest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 Healthcare Compliance Note

This system is designed for hospital inventory management. Ensure compliance with relevant healthcare regulations (HIPAA, FDA, etc.) in your jurisdiction before production use.

---

**Built with ❤️ for healthcare professionals**