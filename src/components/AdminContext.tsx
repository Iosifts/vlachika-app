"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { isAdminMode, toggleAdminMode } from "@/lib/admin";

interface AdminContextValue {
  isAdmin: boolean;
  toggle: () => void;
}

const AdminCtx = createContext<AdminContextValue>({
  isAdmin: false,
  toggle: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminMode());
  }, []);

  const toggle = useCallback(() => {
    const next = toggleAdminMode();
    setIsAdmin(next);
  }, []);

  return (
    <AdminCtx.Provider value={{ isAdmin, toggle }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminCtx);
}
