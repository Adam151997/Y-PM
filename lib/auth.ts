/**
 * Authentication utilities wrapper for backward compatibility
 * Uses the fixed version that works with both Server and Client components
 */

export { 
  signToken, 
  setAuthCookie, 
  clearAuthCookie, 
  requireAuth,
  getUserFromToken,
  type JWTPayload 
} from './auth-fixed';

// Export the Server Component version as default getCurrentUser
export { getCurrentUserServer as getCurrentUser } from './auth-fixed';

// Also export the hybrid version for convenience
export { getCurrentUserHybrid } from './auth-fixed';
