import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs font-bold text-default-400 uppercase tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <div
        className="fixed inset-0 z-[-1] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        <div className="flex flex-col flex-1 w-full">
          <main className="container mx-auto max-w-7xl pt-12 px-6 flex-grow pb-20">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="flex items-center justify-center h-64">
                      <p className="text-default-400">Welcome to RoomSync</p>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <footer className="w-full flex items-center justify-center py-6 border-t border-default-100 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <p className="text-default-400 text-xs font-medium">
                © 2026 RoomSync Booking System
              </p>
              <div className="flex gap-4 text-[10px] text-default-300">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Contact Support</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
