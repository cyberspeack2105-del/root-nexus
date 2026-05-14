"use client";

import { UIProvider } from "@/context/UIContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      {children}
    </UIProvider>
  );
}
