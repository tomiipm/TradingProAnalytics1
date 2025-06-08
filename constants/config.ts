export const CONFIG = {
  API: {
    BASE_URL: "https://api.example.com/v1",
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    FMP_BASE_URL: "https://financialmodelingprep.com/api/v3",
    FMP_API_KEY: "G1iuFutsBehNPt8vgEbCx2hXMrQzjYdh",
    ALWAYS_USE_REAL_DATA: true, // Always use real data, no fallbacks
    SYMBOL_MAPPING: {
      'US30': '^DJI', // Map US30 to Dow Jones Industrial Average
      'XAU/USD': 'XAUUSD', // Map Gold
    }
  },
  SUBSCRIPTION: {
    PRICE: 6.99,
    DAYS: 7,
  },
  STORE: {
    IOS_PRODUCT_ID: "com.tradingproanalytics.premium.weekly",
    ANDROID_PRODUCT_ID: "com.tradingproanalytics.premium.weekly",
    VERIFY_RECEIPTS: true,
  },
  PREMIUM_PAIRS: [
    "XAU/USD", // Gold
    "US30", // Dow Jones
    "EUR/JPY",
    "GBP/JPY",
    "AUD/JPY",
    "NZD/JPY",
    "EUR/GBP",
    "GBP/CHF",
    "EUR/CHF",
    "USD/SGD",
    "GBP/USD",
    "USD/JPY",
    "AUD/USD",
    "NZD/USD"
  ],
  STANDARD_PAIRS: [
    "EUR/USD",
    "EUR/AUD",
    "USD/CAD"
  ],
  RECOMMENDED_BROKERS: [
    {
      name: "Broker One",
      link: "https://broker1.example.com",
      description: "Regulated broker with low spreads",
    },
    {
      name: "Broker Two",
      link: "https://broker2.example.com",
      description: "Best for beginners with educational resources",
    },
    {
      name: "Broker Three",
      link: "https://broker3.example.com",
      description: "Advanced trading platform with multiple assets",
    },
  ],
  AI_MODEL: {
    VERSION: "2.1.0",
    ACCURACY: 87,
    LAST_UPDATED: "2023-10-15",
    BACKEND_URL: "https://api.tradingproanalytics.com/ai/predict", // Not used in local mode
    TENSORFLOW_JS_MODEL_PATH: "local://forex-model", // Local storage path
    PREDICTION_THRESHOLD: 0.6, // Minimum confidence for a signal to be generated
    FEATURES: ['price', 'volume', 'rsi', 'ma20', 'ma50'], // Features used for prediction
  },
  APP: {
    VERSION: "1.0.0",
    BUILD: "2023.10.1",
    NAME: "Trading ProAnalytics",
    CONTACT_EMAIL: "app@iplinseparable.app",
    WEBSITE: "https://tradingproanalytics.com",
  },
  NOTIFICATIONS: {
    TYPES: {
      SIGNAL: "New trading signal available",
    },
  },
};