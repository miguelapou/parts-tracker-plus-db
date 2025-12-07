/**
 * Validation utilities for form inputs
 *
 * These functions validate user input and return structured results
 * that can be used to show appropriate feedback via toast notifications.
 */

/**
 * Validates a currency/price value
 * @param {string|number} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{ isValid: boolean, value: number, error: string|null }}
 */
export const validateCurrency = (value, fieldName = 'Value') => {
  // Empty/null is valid (defaults to 0)
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, value: 0, error: null };
  }

  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} must be a valid number`
    };
  }

  if (parsed < 0) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} cannot be negative`
    };
  }

  // Cap at reasonable maximum (1 billion)
  if (parsed > 1000000000) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} exceeds maximum allowed value`
    };
  }

  return { isValid: true, value: parsed, error: null };
};

/**
 * Validates a positive integer (for odometer, year, quantities)
 * @param {string|number} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum allowed value
 * @param {number} options.max - Maximum allowed value
 * @param {boolean} options.allowEmpty - Whether empty values are valid
 * @returns {{ isValid: boolean, value: number|null, error: string|null }}
 */
export const validatePositiveInteger = (value, fieldName = 'Value', options = {}) => {
  const { min = 0, max = Infinity, allowEmpty = true } = options;

  // Empty/null handling
  if (value === '' || value === null || value === undefined) {
    if (allowEmpty) {
      return { isValid: true, value: null, error: null };
    }
    return {
      isValid: false,
      value: null,
      error: `${fieldName} is required`
    };
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      value: null,
      error: `${fieldName} must be a valid number`
    };
  }

  if (parsed < min) {
    return {
      isValid: false,
      value: null,
      error: `${fieldName} must be at least ${min}`
    };
  }

  if (parsed > max) {
    return {
      isValid: false,
      value: null,
      error: `${fieldName} must be at most ${max.toLocaleString()}`
    };
  }

  return { isValid: true, value: parsed, error: null };
};

/**
 * Validates a year value
 * @param {string|number} value - The year to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{ isValid: boolean, value: number|null, error: string|null }}
 */
export const validateYear = (value, fieldName = 'Year') => {
  const currentYear = new Date().getFullYear();
  return validatePositiveInteger(value, fieldName, {
    min: 1900,
    max: currentYear + 2, // Allow next year's models
    allowEmpty: true
  });
};

/**
 * Validates an odometer reading
 * @param {string|number} value - The odometer reading to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{ isValid: boolean, value: number|null, error: string|null }}
 */
export const validateOdometer = (value, fieldName = 'Odometer') => {
  return validatePositiveInteger(value, fieldName, {
    min: 0,
    max: 10000000, // 10 million km/miles max
    allowEmpty: true
  });
};

/**
 * Validates part cost fields (price, shipping, duties)
 * Returns all validated values or first error encountered
 * @param {Object} costs - Object with price, shipping, duties
 * @param {Object} toast - Toast notification object
 * @returns {{ isValid: boolean, values: { price: number, shipping: number, duties: number, total: number } | null }}
 */
export const validatePartCosts = (costs, toast) => {
  const priceResult = validateCurrency(costs.price, 'Price');
  if (!priceResult.isValid) {
    toast?.warning(priceResult.error);
    return { isValid: false, values: null };
  }

  const shippingResult = validateCurrency(costs.shipping, 'Shipping');
  if (!shippingResult.isValid) {
    toast?.warning(shippingResult.error);
    return { isValid: false, values: null };
  }

  const dutiesResult = validateCurrency(costs.duties, 'Duties');
  if (!dutiesResult.isValid) {
    toast?.warning(dutiesResult.error);
    return { isValid: false, values: null };
  }

  const total = priceResult.value + shippingResult.value + dutiesResult.value;

  return {
    isValid: true,
    values: {
      price: priceResult.value,
      shipping: shippingResult.value,
      duties: dutiesResult.value,
      total
    }
  };
};

/**
 * Validates project budget
 * @param {string|number} budget - The budget to validate
 * @param {Object} toast - Toast notification object
 * @returns {{ isValid: boolean, value: number }}
 */
export const validateBudget = (budget, toast) => {
  const result = validateCurrency(budget, 'Budget');
  if (!result.isValid) {
    toast?.warning(result.error);
    return { isValid: false, value: 0 };
  }
  return { isValid: true, value: result.value };
};
