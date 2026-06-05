import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CrmSelectOption {
  value: string;
  label: string;
}

interface CrmSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CrmSelectOption[];
  placeholder?: string;
  className?: string;
}

const CrmSelect: React.FC<CrmSelectProps> = ({ value, onChange, options, placeholder = 'Select...', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative select-none ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium border rounded-xl bg-white transition-all min-w-[9rem] ${
          open
            ? 'border-orange-400 ring-2 ring-orange-400/20 text-gray-800'
            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <span className={selected?.value ? 'text-gray-800' : 'text-gray-400'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-full animate-scale-in"
          style={{ minWidth: '10rem' }}
        >
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={12} className="text-orange-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CrmSelect;
