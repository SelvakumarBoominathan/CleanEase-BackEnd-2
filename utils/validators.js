import config from "../config.js";

/**
 * Password validation utility
 */
export const passwordValidator = {
  /**
   * Validate password strength
   */
  isStrong: (password) => {
    if (password.length < config.PASSWORD_MIN_LENGTH) {
      return false;
    }

    if (password.length > config.PASSWORD_MAX_LENGTH) {
      return false;
    }

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Must contain at least one digit
    if (!/\d/.test(password)) {
      return false;
    }

    return true;
  },

  /**
   * Get password strength error message
   */
  getErrorMessage: () => {
    return `Password must be between ${config.PASSWORD_MIN_LENGTH}-${config.PASSWORD_MAX_LENGTH} characters and contain uppercase, lowercase, and numbers`;
  },

  /**
   * Get password requirements
   */
  getRequirements: () => ({
    minLength: config.PASSWORD_MIN_LENGTH,
    maxLength: config.PASSWORD_MAX_LENGTH,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
  }),
};

/**
 * Email validation utility
 */
export const emailValidator = {
  /**
   * Validate email format
   */
  isValid: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Normalize email (lowercase, trim)
   */
  normalize: (email) => {
    return email.toLowerCase().trim();
  },
};

/**
 * Username validation utility
 */
export const usernameValidator = {
  /**
   * Validate username format
   */
  isValid: (username) => {
    // Alphanumeric only, 3-30 characters
    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    return usernameRegex.test(username);
  },

  /**
   * Get validation error message
   */
  getErrorMessage: () => {
    return "Username must be 3-30 characters and contain only letters and numbers";
  },
};
