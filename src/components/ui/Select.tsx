'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3 py-2 rounded-lg border transition-colors appearance-none
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
            disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}
            ${className}
          `}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: error ? 'var(--danger-500)' : 'var(--input-border)',
            color: 'var(--foreground)',
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm" style={{ color: 'var(--danger-500)' }} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1 text-sm" style={{ color: 'var(--muted-text)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'