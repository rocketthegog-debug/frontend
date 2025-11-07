# CrickBuzz Frontend

A modern, responsive cricket management application built with React and Vite. This frontend application provides a comprehensive platform for cricket match management, wallet operations, earnings, and admin functionalities.

## 🚀 Features

### User Features
- **Live Match Updates**: Real-time cricket match scores and details
- **Wallet Management**: Recharge, withdraw, and track wallet balance
- **Earnings System**: Click-to-earn functionality with daily limits
- **Referral Program**: Refer friends and earn rewards
- **Order Management**: View and track all transactions
- **Payment Methods**: Manage bank account and UPI details
- **Match Details**: Comprehensive match information with player stats

### Admin Features
- **User Management**: View, edit, restrict, and delete users
- **Transaction Management**: Process recharge and withdrawal requests
- **Referral Settings**: Configure referral rewards and program status
- **Dashboard**: Overview of users, transactions, and system stats
- **Bank Account Access**: View user bank account details

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Country Flag** - Country flag components
- **QRCode.react** - QR code generation
- **Axios/Fetch** - HTTP client

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rocketthegog-debug/frontend.git
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5001/api

# Environment
VITE_NODE_ENV=development

# App Configuration (Optional - defaults in config.js)
VITE_APP_NAME=CrickBuzz
VITE_MERCHANT_NAME=CrickBuzz
VITE_CURRENCY=₹

# UPI IDs (comma-separated)
VITE_UPI_IDS=sktigpta@sbi,sktigpta@paytm,crickbuzz@phonepe,sktigpta@ybl,sktigpta@axl
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
fronted/
├── public/                 # Static assets
│   └── logo.svg           # App logo
├── src/
│   ├── components/        # React components
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # Admin pages
│   │   │   └── ...       # User pages
│   │   └── ...           # Shared components
│   ├── services/         # API services
│   │   └── api.js        # API functions
│   ├── config.js         # App configuration
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind configuration
```

## 🎨 Key Components

### Pages
- **Home**: Dashboard with recent transactions and matches
- **Matches**: Live and upcoming cricket matches
- **Earnings**: Click-to-earn functionality with cooldown system
- **Recharge**: Wallet recharge with UPI payment
- **Withdrawal**: Request withdrawals
- **My Orders**: Transaction history
- **Account**: User profile and settings
- **Login/Register**: Authentication with referral code support

### Admin Pages
- **Dashboard**: Admin overview and statistics
- **Users**: User management (view, edit, restrict, delete)
- **Withdrawals**: Process withdrawal requests
- **Payments**: Process recharge requests
- **Referral Settings**: Configure referral program

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5001/api` |
| `VITE_APP_NAME` | Application name | `CrickBuzz` |
| `VITE_MERCHANT_NAME` | Merchant name for payments | `CrickBuzz` |
| `VITE_CURRENCY` | Currency symbol | `₹` |
| `VITE_UPI_IDS` | Comma-separated UPI IDs | See config.js |

## 🚀 Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 📦 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Serve the `dist/` directory using any static hosting service:
   - Netlify
   - GitHub Pages
   - AWS S3
   - Any web server (nginx, Apache, etc.)

## 🔄 API Integration

The frontend communicates with the backend API. Ensure the backend server is running and accessible at the URL specified in `VITE_API_BASE_URL`.

### API Endpoints Used

- `/api/cricket/*` - Cricket match data
- `/api/auth/*` - Authentication
- `/api/wallet/*` - Wallet operations
- `/api/earnings/*` - Earnings and click-to-earn
- `/api/referral/*` - Referral program
- `/api/admin/*` - Admin operations
- `/api/payment-methods/*` - Payment method management

## 🎯 Features in Detail

### Click-to-Earn System
- Balance-based earning tiers
- Daily click limits
- Rate limiting with cooldown
- 95% common range, 5% rare range probability

### Payment System
- UPI QR code generation
- Multiple UPI ID support
- UTR verification for recharge
- Payment method management

### Admin Features
- User restriction/lock system
- Transaction status management
- Referral program configuration
- Bank account details access

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify `VITE_API_BASE_URL` in `.env`
   - Check CORS settings on backend

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (requires v18+)

3. **Environment Variables Not Working**
   - Ensure variables start with `VITE_` prefix
   - Restart dev server after changing `.env`
   - Check `.env` file is in root directory

## 📝 Development Guidelines

- Use functional components with hooks
- Follow React best practices
- Maintain consistent code formatting
- Use Tailwind CSS for styling
- Keep components modular and reusable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support, email rocketthegog@gmail.com or create an issue in the repository.

## 🔗 Related

- [Backend Repository](https://github.com/rocketthegog-debug/backend) (if available)
- [API Documentation](./API.md) (if available)

---

**Built with ❤️ by rocketthegog-debug**
