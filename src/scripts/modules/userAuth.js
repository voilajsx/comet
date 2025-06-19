/**
 * Comet Framework - User Authentication Module (Cross-browser with 7-day sessions)
 * Demonstrates login/logout/auth flows with persistent sessions
 * @module @voilajsx/comet
 * @file src/scripts/modules/userAuth.js
 */

import { comet } from '@voilajsx/comet/api';
import { storage } from '@voilajsx/comet/storage';

/**
 * User Auth Module Configuration
 */
const userAuthModule = {
  name: 'userAuth',

  handlers: {
    login: (data) => loginUser(data),
    logout: () => logoutUser(),
    getProfile: () => getUserProfile(),
    getAuthStatus: (data) => checkAuthStatus(data),
  },

  mainAction: (data) => checkAuthStatus(data),

  init: () => {
    console.log('[User Auth] Module initialized with 7-day sessions');
  },
};

/**
 * Login user with email and password
 */
/**
 * Login user with email and password
 */
async function loginUser(data) {
  try {
    const { email, password } = data || {};

    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password required',
      };
    }

    console.log('[User Auth] Attempting login with:', { email });

    const response = await comet.post(
      'https://reqres.in/api/login',
      {
        email: email,
        password: password,
      },
      {
        'x-api-key': 'reqres-free-v1',
      }
    );

    console.log(
      '[User Auth] Full response:',
      JSON.stringify(response, null, 2)
    );

    // Fix: Check the nested data structure
    // response.data.data.token (not response.data.token)
    if (
      response.ok &&
      response.data &&
      response.data.data &&
      response.data.data.token
    ) {
      await storeAuthToken(response.data.data.token);
      return {
        success: true,
        message: 'Login successful',
        user: {
          email: email,
          token: response.data.data.token,
          loginTime: Date.now(),
        },
      };
    } else {
      const errorMsg =
        response.data?.data?.error ||
        response.data?.error ||
        response.error ||
        `HTTP ${response.data?.status}`;
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error('[User Auth] Login failed:', error);
    return {
      success: false,
      error: 'Login request failed',
      details: error.message,
    };
  }
}

/**
 * Logout user - clear stored auth data
 */
async function logoutUser() {
  try {
    await storage.remove([
      'auth.token',
      'auth.timestamp',
      'auth.userData',
      'auth.userCacheTime',
      'auth.userEmail',
    ]);

    console.log('[User Auth] User logged out successfully');
    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[User Auth] Logout failed:', error);
    return {
      success: false,
      error: 'Logout failed',
      details: error.message,
    };
  }
}

/**
 * Get user profile using stored token
 */
async function getUserProfile() {
  try {
    const token = await getStoredAuthToken();

    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
        needsLogin: true,
      };
    }

    // Check cached user data first
    const cachedUserData = await getCachedUserData();
    if (cachedUserData) {
      return {
        success: true,
        profile: cachedUserData,
      };
    }

    const response = await comet.get('https://reqres.in/api/users/2', {
      Authorization: `Bearer ${token}`,
      'x-api-key': 'reqres-free-v1',
    });

    if (response.ok && response.data && response.data.data) {
      const user = response.data.data;
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        avatar: user.avatar,
        lastAccess: Date.now(),
      };

      await cacheUserData(userData);
      return {
        success: true,
        profile: userData,
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch profile',
        needsLogin: true,
      };
    }
  } catch (error) {
    console.error('[User Auth] Profile fetch failed:', error);
    return {
      success: false,
      error: 'Profile request failed',
      details: error.message,
    };
  }
}

/**
 * Check current authentication status with 7-day session
 */
async function checkAuthStatus(data = {}) {
  try {
    const sessionDays =
      data.sessionDays || (await storage.get('auth.sessionDays', 7));
    const token = await getStoredAuthToken(sessionDays);

    if (token) {
      return {
        success: true,
        authenticated: true,
        hasToken: true,
        message: 'User is authenticated',
        sessionDays: sessionDays,
        timestamp: Date.now(),
      };
    } else {
      return {
        success: true,
        authenticated: false,
        message: 'No valid token found',
        sessionDays: sessionDays,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error('[User Auth] Auth status check failed:', error);
    return {
      success: false,
      authenticated: false,
      error: error.message,
    };
  }
}

/**
 * Store authentication token using Comet storage
 */
async function storeAuthToken(token) {
  try {
    await storage.set({
      'auth.token': token,
      'auth.timestamp': Date.now(),
    });
    console.log('[User Auth] Token stored successfully');
  } catch (error) {
    console.error('[User Auth] Failed to store token:', error);
  }
}

/**
 * Get stored authentication token with 7-day expiry
 */
async function getStoredAuthToken(sessionDays = 7) {
  try {
    const token = await storage.get('auth.token');
    const timestamp = await storage.get('auth.timestamp');

    if (!token || !timestamp) {
      return null;
    }

    const tokenAge = Date.now() - timestamp;
    const maxAge = sessionDays * 24 * 60 * 60 * 1000;

    if (tokenAge < maxAge) {
      return token;
    }

    // Token expired
    console.log(
      `[User Auth] Token expired after ${sessionDays} days, removing`
    );
    await storage.remove([
      'auth.token',
      'auth.timestamp',
      'auth.userData',
      'auth.userCacheTime',
      'auth.userEmail',
    ]);

    return null;
  } catch (error) {
    console.error('[User Auth] Failed to get token:', error);
    return null;
  }
}

/**
 * Cache user data for faster loads
 */
async function cacheUserData(userData) {
  try {
    await storage.set({
      'auth.userData': userData,
      'auth.userCacheTime': Date.now(),
    });
  } catch (error) {
    console.error('[User Auth] Failed to cache user data:', error);
  }
}

/**
 * Get cached user data if fresh (1 hour cache)
 */
async function getCachedUserData() {
  try {
    const userData = await storage.get('auth.userData');
    const cacheTime = await storage.get('auth.userCacheTime');

    if (!userData || !cacheTime) {
      return null;
    }

    const cacheAge = Date.now() - cacheTime;
    const maxCacheAge = 60 * 60 * 1000; // 1 hour

    if (cacheAge < maxCacheAge) {
      return userData;
    }

    return null;
  } catch (error) {
    console.error('[User Auth] Failed to get cached user data:', error);
    return null;
  }
}

export default userAuthModule;
