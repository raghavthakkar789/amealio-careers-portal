'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'input-field',
          className
        )}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
