// App Configuration
// Load from environment variables with fallbacks
const getEnvVar = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue
}

// Parse UPI IDs from environment variable (comma-separated) or use default
const getUpiIds = () => {
  const envUpiIds = getEnvVar('VITE_UPI_IDS', '')
  if (envUpiIds) {
    return envUpiIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
  }
  // Default UPI IDs
  return [
    'sktigpta@sbi',
    'sktigpta@paytm',
    'crickbuzz@phonepe',
    'sktigpta@ybl',
    'sktigpta@axl'
  ]
}

export const APP_CONFIG = {
  appName: getEnvVar('VITE_APP_NAME', 'CrickBuzz'),
  appDescription: 'Your Cricket Management Hub',
  currency: getEnvVar('VITE_CURRENCY', '₹'),
  walletBalance: 2500,
  activePackages: 3,
  specialOfferText: 'Get 20% extra on recharge!',
  upiIds: getUpiIds(), // Array of UPI IDs - randomly selected for each payment
  merchantName: getEnvVar('VITE_MERCHANT_NAME', 'CrickBuzz'),
  // Logo paths - centralized for easy updates
  logoPath: '/logo.svg', // App logo path for components
  faviconPath: '/logo.svg', // Favicon path
  appleTouchIconPath: '/logo.svg', // Apple touch icon path
  manifestIconPath: '/logo.svg' // PWA manifest icon path
}

export default APP_CONFIG
