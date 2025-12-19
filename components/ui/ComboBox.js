import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * ComboBox component - A dropdown that also allows custom text input
 *
 * @param {string} value - Current value
 * @param {function} onChange - Callback when value changes
 * @param {Array<string>} options - Array of options to show in dropdown
 * @param {string} placeholder - Placeholder text when empty
 * @param {boolean} darkMode - Dark mode styling
 * @param {string} customInputPlaceholder - Placeholder for custom input (optional)
 * @param {boolean} allowCustom - Whether to allow custom input (default: true)
 * @param {function} formatOption - Optional function to format option display
 */
const ComboBox = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  darkMode,
  customInputPlaceholder,
  allowCustom = true,
  formatOption
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current value is in options
  const isCustomValue = value && !options.includes(value.toString());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdown = () => {
    if (isOpen && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        setSearchTerm('');
      }, 150);
    }
  };

  const handleSelect = (option) => {
    onChange(option);
    closeDropdown();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      setIsOpen(true);
      // Focus search input after opening
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const displayValue = value
    ? (formatOption ? formatOption(value) : value)
    : '';

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full px-4 py-2 border rounded-lg flex items-center justify-between transition-colors text-left ${
          darkMode
            ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
            : 'bg-slate-50 border-slate-300 hover:border-slate-400'
        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      >
        <span className={value ? (darkMode ? 'text-gray-100' : 'text-slate-800') : (darkMode ? 'text-gray-400' : 'text-slate-400')}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-0.5 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-slate-200 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-full max-h-64 overflow-hidden rounded-lg border shadow-lg transition-all duration-150 ${
            isClosing
              ? 'opacity-0 translate-y-[-4px]'
              : 'opacity-100 translate-y-0'
          } ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-300'
          }`}
        >
          {/* Search input */}
          <div className={`sticky top-0 p-2 border-b ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'
          }`}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={allowCustom ? (customInputPlaceholder || 'Search or type custom...') : 'Search...'}
                className={`w-full px-3 py-1.5 pr-8 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode
                    ? 'bg-gray-600 border-gray-500 text-gray-100 placeholder-gray-400'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && allowCustom && searchTerm) {
                    e.preventDefault();
                    // If there's an exact match, select it; otherwise use the custom value
                    const exactMatch = filteredOptions.find(
                      opt => opt.toString().toLowerCase() === searchTerm.toLowerCase()
                    );
                    handleSelect(exactMatch || searchTerm);
                  } else if (e.key === 'Escape') {
                    closeDropdown();
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-48">
            {/* Custom value option - show if allowCustom is true and searchTerm doesn't match any option exactly */}
            {allowCustom && searchTerm && !filteredOptions.some(opt =>
              opt.toString().toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors border-b ${
                  darkMode
                    ? 'hover:bg-gray-600 text-blue-400 border-gray-600'
                    : 'hover:bg-blue-50 text-blue-600 border-slate-100'
                }`}
              >
                Use "{searchTerm}"
              </button>
            )}

            {filteredOptions.length === 0 && !searchTerm ? (
              <div className={`p-3 text-sm text-center ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                No options available
              </div>
            ) : filteredOptions.length === 0 && searchTerm && !allowCustom ? (
              <div className={`p-3 text-sm text-center ${
                darkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                No matching options
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value?.toString() === option.toString();
                const displayText = formatOption ? formatOption(option) : option;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option.toString())}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'
                        : darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {displayText}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboBox;
