'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppShellState } from '@/types/appShell';

const defaultState: AppShellState = {
  companyName: '',
  companyInitials: 'I.AI',
  pageTitle: 'Cerebro de Compras',
  hasActiveIntegrations: false,
  statusText: 'Pendiente de configuración',
  integrationBadgeStatus: 'pending',
  pendingOrdersCount: 2,
  providers: [],
  lastSyncTimestamp: null,
};

/**
 * Stale-while-revalidate pattern: show cached data immediately on mount,
 * then revalidate in the background. Prevents layout shift and blank
 * TopBar on every route change inside /dashboard.
 */
const CACHE_KEY = 'inventa_shell_v1';
const STALE_MS = 60_000; // 1 minute cache freshness

function readCache(): { state: AppShellState; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(state: AppShellState) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ state, ts: Date.now() }));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

export function useAppShell() {
  const cached = useRef(readCache());
  const [state, setState] = useState<AppShellState>(cached.current?.state ?? defaultState);
  const [loading, setLoading] = useState<boolean>(!cached.current);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/shell', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.state) {
          setState(json.state);
          writeCache(json.state);
        }
      }
    } catch (err) {
      console.error('Failed to fetch App Shell state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If cache is fresh, skip immediate fetch (stale-while-revalidate).
    const isFresh = cached.current && Date.now() - cached.current.ts < STALE_MS;
    if (isFresh) {
      setLoading(false);
      // Still revalidate in the background
      const t = setTimeout(fetchState, 200);
      return () => clearTimeout(t);
    }
    fetchState();
  }, [fetchState]);

  return {
    state,
    loading,
    refreshShell: fetchState,
  };
}
