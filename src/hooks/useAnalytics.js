import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useFilters } from '@/contexts/FilterContext';

export function useAnalytics(endpoint, extraParams = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { siteId } = router.query;
  const { getParams } = useDateRange();
  const { getFilterParams } = useFilters();

  const fetchData = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ...getParams(), ...getFilterParams(), ...extraParams });
      const res = await fetch(
        `/api/analytics/${siteId}/${endpoint}?${params}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [siteId, endpoint, JSON.stringify(getParams()), JSON.stringify(getFilterParams()), JSON.stringify(extraParams)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
