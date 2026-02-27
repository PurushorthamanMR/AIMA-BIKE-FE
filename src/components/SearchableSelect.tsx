import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: number
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: number
  onChange: (value: number) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  /** Optional: id for the trigger (for form validation / required) */
  id?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  required,
  disabled,
  className,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchParams, setSearchParams] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  const searchLower = searchParams.trim().toLowerCase()
  const filteredOptions =
    !searchLower ? options : options.filter((o) => o.label.toLowerCase().includes(searchLower))

  useEffect(() => {
    if (!open) setSearchParams('')
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('position-relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'w-100 d-flex align-items-center justify-content-between gap-2 text-start rounded-3 border px-3 py-2',
          'bg-white text-dark text-decoration-none',
          disabled && 'opacity-75'
        )}
        style={{
          minHeight: '38px',
          borderWidth: '1px',
          fontSize: '0.9375rem',
          borderColor: open ? 'var(--aima-primary)' : 'var(--aima-border, #dee2e6)',
        }}
      >
        <span className={cn(!selectedOption && 'text-muted')}>{displayLabel}</span>
        <ChevronDown size={18} className={cn('shrink-0', open && 'rotate-180')} style={{ transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          className="position-absolute top-100 start-0 end-0 mt-1 rounded-3 border shadow-lg bg-white overflow-hidden z-3"
          style={{ maxHeight: '280px', borderColor: 'var(--aima-border, #dee2e6)' }}
        >
          <div className="p-2 border-bottom bg-light" style={{ borderColor: 'var(--aima-border, #dee2e6)' }}>
            <div className="position-relative">
              <Search size={16} className="position-absolute start-2 top-50 translate-middle-y text-muted" />
              <input
                type="text"
                autoFocus
                value={searchParams}
                onChange={(e) => setSearchParams(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search..."
                className="form-control form-control-sm rounded-2 border"
                style={{ paddingLeft: '28px' }}
              />
            </div>
          </div>
          <ul className="list-unstyled mb-0 py-1 overflow-auto" style={{ maxHeight: '220px' }}>
            <li>
              <button
                type="button"
                className={cn(
                  'w-100 text-start border-0 px-3 py-2 small',
                  value === 0 ? 'text-white' : 'bg-white text-dark'
                )}
                style={value === 0 ? { backgroundColor: 'var(--aima-primary)' } : undefined}
                onClick={() => {
                  onChange(0)
                  setOpen(false)
                }}
              >
                {placeholder}
              </button>
            </li>
            {filteredOptions.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={cn(
                    'w-100 text-start border-0 px-3 py-2 small',
                    value === opt.value ? 'text-white' : 'bg-white text-dark'
                  )}
                  style={{ fontSize: '0.875rem', ...(value === opt.value ? { backgroundColor: 'var(--aima-primary)' } : {}) }}
                  onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.classList.add('bg-light') }}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
            {filteredOptions.length === 0 && searchLower && (
              <li className="px-3 py-3 text-muted small">No match for &quot;{searchParams.trim()}&quot;</li>
            )}
          </ul>
        </div>
      )}

    </div>
  )
}
