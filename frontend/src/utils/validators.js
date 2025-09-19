// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors[0] : 'Password is valid'
  };
};

// Username validation
export const validateUsername = (username) => {
  const minLength = 3;
  const maxLength = 20;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  
  if (username.length < minLength) {
    return {
      isValid: false,
      message: `Username must be at least ${minLength} characters long`
    };
  }
  
  if (username.length > maxLength) {
    return {
      isValid: false,
      message: `Username must be no more than ${maxLength} characters long`
    };
  }
  
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores'
    };
  }
  
  return {
    isValid: true,
    message: 'Username is valid'
  };
};

// Log level validation
export const validateLogLevel = (level) => {
  const validLevels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  return {
    isValid: validLevels.includes(level.toUpperCase()),
    message: validLevels.includes(level.toUpperCase()) 
      ? '' 
      : `Log level must be one of: ${validLevels.join(', ')}`
  };
};

// Service name validation
export const validateServiceName = (serviceName) => {
  const serviceRegex = /^[a-zA-Z0-9-_]+$/;
  const minLength = 3;
  const maxLength = 50;
  
  if (!serviceName || serviceName.length < minLength) {
    return {
      isValid: false,
      message: `Service name must be at least ${minLength} characters long`
    };
  }
  
  if (serviceName.length > maxLength) {
    return {
      isValid: false,
      message: `Service name must be no more than ${maxLength} characters long`
    };
  }
  
  if (!serviceRegex.test(serviceName)) {
    return {
      isValid: false,
      message: 'Service name can only contain letters, numbers, hyphens, and underscores'
    };
  }
  
  return {
    isValid: true,
    message: 'Service name is valid'
  };
};

// Date range validation
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      message: 'Both start and end dates are required'
    };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      message: 'Please enter valid dates'
    };
  }
  
  if (start >= end) {
    return {
      isValid: false,
      message: 'Start date must be before end date'
    };
  }
  
  const maxRange = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  if (end - start > maxRange) {
    return {
      isValid: false,
      message: 'Date range cannot exceed 30 days'
    };
  }
  
  return {
    isValid: true,
    message: 'Date range is valid'
  };
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  const isValid = value !== null && value !== undefined && value.toString().trim() !== '';
  return {
    isValid,
    message: isValid ? '' : `${fieldName} is required`
  };
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });
  
  return { isValid, errors };
};
