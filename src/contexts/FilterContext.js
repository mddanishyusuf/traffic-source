import { createContext, useContext, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

const FilterContext = createContext();

const FILTER_KEYS = ['channel', 'country', 'city', 'page', 'entry_page', 'exit_page', 'browser', 'os', 'device'];

export function FilterProvider({ children }) {
  const router = useRouter();

  // Extract filter values from current URL query params
  const filters = useMemo(() => {
    const f = {};
    for (const key of FILTER_KEYS) {
      if (router.query[key]) f[key] = router.query[key];
    }
    return f;
  }, [router.query]);

  const updateQuery = useCallback((newFilters) => {
    // Keep non-filter query params (like siteId) and merge with new filters
    const query = {};
    for (const [k, v] of Object.entries(router.query)) {
      if (!FILTER_KEYS.includes(k)) query[k] = v;
    }
    for (const [k, v] of Object.entries(newFilters)) {
      if (v) query[k] = v;
    }
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [router]);

  const setFilter = useCallback((key, value) => {
    updateQuery({ ...filters, [key]: value });
  }, [filters, updateQuery]);

  const removeFilter = useCallback((key) => {
    const next = { ...filters };
    delete next[key];
    updateQuery(next);
  }, [filters, updateQuery]);

  const clearFilters = useCallback(() => {
    updateQuery({});
  }, [updateQuery]);

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
