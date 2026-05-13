// ============================================================
// FILE: components/theme-switcher.tsx
// Tombol toggle tema terang/gelap — menggunakan next-themes
// Hanya render setelah mount (cegah hydration mismatch)
// ============================================================

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Sun, Moon } from "lucide-react";

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null; // Cegah flash tema yang salah

  return (
    <Button isIconOnly aria-label="Toggle theme" className="rounded-xl border-default-100" variant="ghost" onPress={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  );
};
