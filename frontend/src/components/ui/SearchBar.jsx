import React, { useState, useCallback, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  onFilterClick,
  showFilter = false,
  filterCount = 0,
  className = '',
}) => {
  const [value, setValue] = useState('');
  const debounceRef = useRef(null);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(val);
    }, 300);
  }, [onSearch]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="input-field !pl-10 !py-2.5"
        />
        {value && (
          <button
            onClick={() => { setValue(''); onSearch?.(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
      {showFilter && (
        <button
          onClick={onFilterClick}
          className={`relative flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200
            ${filterCount > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-text-light hover:border-primary/40 hover:text-primary'}`}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="w-4 h-4 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default SearchBar;
