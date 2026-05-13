// ============================================================
// FILE: provider.tsx
// Provider wrapper — menggabungkan Theme (next-themes) + Auth context
// Urutan penting: ThemeProvider di luar agar AuthContext bisa akses theme
// ============================================================

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider enableSystem attribute="class" defaultTheme="system">
      <AuthProvider>{children}</AuthProvider>
    </NextThemesProvider>
  );
}
