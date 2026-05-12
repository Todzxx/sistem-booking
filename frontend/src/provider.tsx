import { ThemeProvider as NextThemesProvider } from "next-themes";

import { AuthProvider } from "./contexts/AuthContext";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider enableSystem attribute="class" defaultTheme="system">
      <AuthProvider>{children}</AuthProvider>
    </NextThemesProvider>
  );
}
