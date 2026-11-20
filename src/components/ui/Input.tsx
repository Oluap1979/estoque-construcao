'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-lg border transition-colors
            placeholder:text-gray-400
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
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm" style={{ color: 'var(--danger-500)' }} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm" style={{ color: 'var(--muted-text)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'