// Vercel Web Analytics - inject function
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject({
  mode: 'auto', // Automatically detects development/production based on environment
});
