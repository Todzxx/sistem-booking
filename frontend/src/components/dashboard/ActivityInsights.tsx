import { Card, Button } from "@heroui/react";
import { TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActivityInsights() {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <TrendingUp className="text-primary" />
          Activity Insights
        </h3>
      </div>

      <Card className="p-6 border border-default-200 bg-background/60 backdrop-blur-md rounded-xl">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-20 h-20 bg-default-100 rounded-xl flex items-center justify-center mb-6 text-default-300">
            <Clock size={40} />
          </div>
          <p className="text-xl font-black text-foreground">
            No Recent Activity
          </p>
          <p className="text-default-500 font-medium mt-2 max-w-xs">
            Your recent booking history and system notifications will appear
            here once you start using the platform.
          </p>
          <Button
            className="mt-8 rounded-xl font-bold border-default-200"
            variant="ghost"
            onPress={() => navigate("/calendar")}
          >
            View Schedule
          </Button>
        </div>
      </Card>
    </div>
  );
}
