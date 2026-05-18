import { Button } from "@heroui/react";
import { Zap, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader({ userName }: { userName: string }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-xl bg-primary p-6 md:p-8 text-primary-foreground">
      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
        <Sparkles size={240} />
      </div>
      <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur-md text-xs font-black uppercase tracking-widest border border-primary-foreground/20">
          <Zap className="fill-current" size={14} />
          System Online
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            Welcome Back, <br />
            <span className="opacity-80">{userName || "User"}!</span>
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-70 max-w-md">
            Everything you need to manage your workspace and team schedule in
            one place.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="h-14 px-8 rounded-xl bg-primary-foreground text-primary font-black text-base transition-transform active:scale-[0.97]"
            onPress={() => navigate("/facilities")}
          >
            Start Booking
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
