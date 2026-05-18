import { Button } from "@heroui/react";
import { User as UserIcon, Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-2xl font-black tracking-tight px-2">Quick Access</h3>

      <div className="flex flex-col gap-4">
        <Button
          className="group p-6 rounded-xl bg-secondary/5 border border-secondary/10 hover:border-secondary/30 transition-all text-left flex items-center justify-between h-auto"
          variant="ghost"
          onPress={() => navigate("/profile")}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <UserIcon size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground uppercase tracking-widest">
                Account Settings
              </span>
              <span className="text-xs font-medium text-default-400">
                Update your preferences
              </span>
            </div>
          </div>
          <ChevronRight
            className="text-secondary/40 group-hover:translate-x-1 transition-transform"
            size={18}
          />
        </Button>

        <Button
          className="group p-6 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center justify-between h-auto"
          variant="ghost"
          onPress={() => navigate("/calendar")}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground uppercase tracking-widest">
                Room Calendar
              </span>
              <span className="text-xs font-medium text-default-400">
                Browse availability
              </span>
            </div>
          </div>
          <ChevronRight
            className="text-primary/40 group-hover:translate-x-1 transition-transform"
            size={18}
          />
        </Button>

        <Button
          className="group p-6 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all text-left flex items-center justify-between h-auto"
          variant="ghost"
          onPress={() => navigate("/calendar")}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground uppercase tracking-widest">
                Availability
              </span>
              <span className="text-xs font-medium text-default-400">
                See what&apos;s free today
              </span>
            </div>
          </div>
          <ChevronRight
            className="text-primary/40 group-hover:translate-x-1 transition-transform"
            size={18}
          />
        </Button>
      </div>
    </div>
  );
}
