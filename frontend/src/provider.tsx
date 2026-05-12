import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider enableSystem attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  );
}
