import { Button, Card } from "@heroui/react";
import { Bell } from "lucide-react";

interface AdminNotification {
  id: number;
  type: "error" | "validation";
  message: string;
}

interface AdminNotificationsProps {
  notifications: AdminNotification[];
  onDismiss: (id: number) => void;
}

export default function AdminNotifications({
  notifications,
  onDismiss,
}: AdminNotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <Card className="p-4 rounded-2xl border border-default-200 bg-background/80">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <Bell size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-default-400 uppercase tracking-widest mb-2">
            Validation & Error Center
          </p>
          <div className="flex flex-col gap-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs font-bold ${
                  item.type === "error"
                    ? "border-danger/20 bg-danger/10 text-danger"
                    : "border-warning/20 bg-warning/10 text-warning"
                }`}
              >
                <span className="min-w-0 break-words">
                  {item.type === "validation" ? "Validation: " : "Error: "}
                  {item.message}
                </span>
                <Button
                  className="text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 min-w-0 h-auto p-0 bg-transparent"
                  variant="ghost"
                  onPress={() => onDismiss(item.id)}
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
