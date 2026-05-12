import { Card } from "@heroui/react";
import {
  CalendarDays,
  ClipboardList,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

const guideItems = [
  {
    title: "Book a room",
    description:
      "Open Facilities, choose an available room, fill the purpose and time slot, then confirm the booking.",
    icon: CalendarDays,
  },
  {
    title: "Track your bookings",
    description:
      "Open My Bookings to review pending, approved, rejected, or cancelled reservations.",
    icon: ClipboardList,
  },
  {
    title: "Read status updates",
    description:
      "Open Notifications to see the latest approval or rejection messages from booking activity.",
    icon: MessageCircle,
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-8 px-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Help/Support
        </h1>
        <p className="text-muted font-medium text-lg">
          Quick guide and admin contact for booking support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guideItems.map((item) => (
          <Card
            key={item.title}
            className="p-6 rounded-xl border border-default-200 bg-background/60 backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <item.icon size={24} />
            </div>
            <p className="text-xl font-black text-foreground mb-2">
              {item.title}
            </p>
            <p className="text-sm text-default-500 font-medium leading-relaxed">
              {item.description}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-8 rounded-xl border border-default-200 bg-default-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-default-100 text-primary flex items-center justify-center shrink-0">
              <HelpCircle size={28} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                Need admin help?
              </p>
              <p className="text-default-500 font-medium mt-1">
                Contact admin if your booking is urgent, rejected, or needs a
                schedule adjustment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background border border-default-200 text-sm font-bold text-default-600">
            <Mail className="text-primary" size={18} />
            Contact your system administrator
          </div>
        </div>
      </Card>
    </div>
  );
}
