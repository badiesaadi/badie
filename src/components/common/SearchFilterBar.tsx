import React from 'react';
import { Input, Select } from '../ui/Input';
import { Search } from 'lucide-react';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterOptions?: { value: string; label: string }[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  placeholder?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filterOptions,
  selectedFilter,
  onFilterChange,
  placeholder = 'Search...',
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>
      {filterOptions && onFilterChange && (
        <Select
          options={filterOptions}
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="sm:w-48"
        />
      )}
    </div>
  );
};