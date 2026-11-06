import React, { forwardRef, useState, useEffect, useMemo, useRef } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY_VALUE = '__EMPTY_STRING_VALUE__'

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    required = false,
    className = '',
    triggerClassName = '',
    id,
    placeholder = 'Select an option',
    value,
    defaultValue,
    onChange,
    onValueChange,
    disabled = false,
    name,
    size = 'md', // 'sm' | 'md' | 'lg'
    children,
    ...props
  },
  ref
) {
  // Extract options from options prop OR React children (<option>)
  const parsedOptions = useMemo(() => {
    if (options && options.length > 0) {
      return options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          const val = opt.value ?? opt.id ?? ''
          const lbl = opt.label ?? opt.name ?? String(val)
          return {
            value: String(val),
            label: String(lbl),
            disabled: !!opt.disabled,
          }
        }
        return { value: String(opt), label: String(opt), disabled: false }
      })
    }

    if (children) {
      const opts = []
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.props) {
          const val = child.props.value ?? ''
          const lbl = child.props.children || child.props.label || String(val)
          opts.push({
            value: String(val),
            label: String(lbl),
            disabled: !!child.props.disabled,
          })
        }
      })
      return opts
    }

    return []
  }, [options, children])

  // Determine current value
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => {
    const initial = isControlled ? value : (defaultValue ?? '')
    return initial !== undefined && initial !== null ? String(initial) : ''
  })

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value !== undefined && value !== null ? String(value) : '')
    }
  }, [isControlled, value])

  const hiddenInputRef = useRef(null)

  const handleSelectChange = (newVal) => {
    const rawVal = newVal === EMPTY_VALUE ? '' : newVal
    if (!isControlled) {
      setInternalValue(rawVal)
    }

    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = rawVal
      hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }

    if (onChange) {
      onChange({
        target: {
          name,
          value: rawVal,
        },
      })
    }

    if (onValueChange) {
      onValueChange(rawVal)
    }
  }

  // Map internal value to Radix value
  const radixValue = internalValue === '' ? EMPTY_VALUE : internalValue

  // Find label of currently selected option
  const selectedOption = parsedOptions.find((opt) => opt.value === internalValue)

  // Size styling
  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs rounded-lg',
    md: 'h-10 px-3 text-sm rounded-xl',
    lg: 'h-12 px-3.5 text-base rounded-xl',
  }[size] || 'h-10 px-3 text-sm rounded-xl'

  const selectId = id || name || Math.random().toString(36).substring(2, 9)

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label.replace(/\s*\*+$/, '')} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden input for React Hook Form & standard form submission */}
      <input
        type="hidden"
        ref={(node) => {
          hiddenInputRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        id={selectId}
        name={name}
        value={internalValue}
        disabled={disabled}
        {...props}
      />

      <RadixSelect.Root
        value={radixValue}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          type="button"
          className={`flex items-center justify-between w-full border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${sizeClasses} ${
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
              : 'border-slate-200 shadow-sm'
          } ${triggerClassName}`}
        >
          <span className="truncate block text-left">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <RadixSelect.Icon asChild>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-[9999] min-w-[var(--radix-select-trigger-width)] max-h-72 overflow-hidden rounded-xl border border-slate-200/90 bg-white text-slate-900 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          >
            <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-slate-400 bg-slate-50">
              <ChevronUp className="w-4 h-4" />
            </RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="p-1.5 custom-scrollbar">
              {parsedOptions.map((opt) => {
                const itemVal = opt.value === '' ? EMPTY_VALUE : opt.value
                return (
                  <RadixSelect.Item
                    key={itemVal}
                    value={itemVal}
                    disabled={opt.disabled}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm outline-none transition-colors hover:bg-primary-50 hover:text-primary-700 data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-700 data-[state=checked]:font-semibold data-[state=checked]:text-primary-700 data-[state=checked]:bg-primary-50/70 data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                  >
                    <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className="absolute right-2 flex items-center justify-center text-primary-600">
                      <Check className="w-4 h-4" />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                )
              })}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-slate-400 bg-slate-50">
              <ChevronDown className="w-4 h-4" />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  )
})

export default Select
