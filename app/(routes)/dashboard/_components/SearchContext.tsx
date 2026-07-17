"use client";

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";

type SearchContextType = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);
  const toggleSearch = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(
    () => ({ open, openSearch, closeSearch, toggleSearch }),
    [open, openSearch, closeSearch, toggleSearch]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useDashboardSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useDashboardSearch must be used inside SearchProvider");
  return ctx;
}