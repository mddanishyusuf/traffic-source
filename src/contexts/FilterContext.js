import { createContext, useContext, useState, useCallback } from 'react';

const FilterContext = createContext();

const FILTER_KEYS = ['channel', 'country', 'city', 'page', 'entry_page', 'exit_page', 'browser', 'os', 'device'];

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({});

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getFilterParams = useCallback(() => {
    const params = {};
    for (const key of FILTER_KEYS) {
      if (filters[key]) params[key] = filters[key];
    }
    return params;
  }, [filters]);

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <FilterContext.Provider
      value={{ filters, setFilter, removeFilter, clearFilters, getFilterParams, hasFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);
