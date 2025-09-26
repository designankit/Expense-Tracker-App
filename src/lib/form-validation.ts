export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: unknown) => string | null
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

export class FormValidator {
  private schema: ValidationSchema

  constructor(schema: ValidationSchema) {
    this.schema = schema
  }

  validate(data: Record<string, unknown>): ValidationErrors {
    const errors: ValidationErrors = {}

    for (const field in this.schema) {
      const rule = this.schema[field]
      const value = data[field]
      const error = this.validateFieldInternal(field, value, rule)
      
      if (error) {
        errors[field] = error
      }
    }

    return errors
  }

  validateField(field: string, value: unknown): string | null {
    const rule = this.schema[field]
    if (!rule) return null
    return this.validateFieldInternal(field, value, rule)
  }

  private validateFieldInternal(field: string, value: unknown, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${this.formatFieldName(field)} is required`
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return null
    }

    // Min validation
    if (rule.min !== undefined) {
      const numValue = parseFloat(value.toString())
      if (isNaN(numValue) || numValue < rule.min) {
        return `${this.formatFieldName(field)} must be at least ${rule.min}`
      }
    }

    // Max validation
    if (rule.max !== undefined) {
      const numValue = parseFloat(value.toString())
      if (isNaN(numValue) || numValue > rule.max) {
        return `${this.formatFieldName(field)} must be at most ${rule.max}`
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return `${this.formatFieldName(field)} format is invalid`
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value)
      if (customError) {
        return customError
      }
    }

    return null
  }

  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
  }
}

// Common validation schemas
export const expenseValidationSchema: ValidationSchema = {
  title: {
    required: true,
    min: 1,
    max: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/
  },
  amount: {
    required: true,
    min: 0.01,
    max: 999999.99,
    custom: (value) => {
      const num = parseFloat(String(value))
      if (isNaN(num)) return 'Amount must be a valid number'
      if (num <= 0) return 'Amount must be greater than 0'
      if (num > 999999.99) return 'Amount is too large'
      return null
    }
  },
  category: {
    required: true,
    min: 1,
    max: 50
  },
  transaction_date: {
    required: true,
    custom: (value) => {
      const date = new Date(String(value))
      const today = new Date()
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
      
      if (isNaN(date.getTime())) return 'Please enter a valid date'
      if (date > today) return 'Date cannot be in the future'
      if (date < oneYearAgo) return 'Date cannot be more than 1 year ago'
      return null
    }
  }
}

export const categoryValidationSchema: ValidationSchema = {
  name: {
    required: true,
    min: 1,
    max: 30,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
    custom: (value) => {
      if (String(value).toLowerCase() === 'other') {
        return 'Category name cannot be "Other"'
      }
      return null
    }
  },
  color: {
    required: true,
    pattern: /^#[0-9A-Fa-f]{6}$/
  }
}