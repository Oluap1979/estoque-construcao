'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 rounded-lg border transition-colors resize-y min-h-[80px]
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
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-sm" style={{ color: 'var(--danger-500)' }} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1 text-sm" style={{ color: 'var(--muted-text)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'