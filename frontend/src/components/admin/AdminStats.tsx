import { Card } from "@heroui/react";
import { BarChart2, Clock, CheckCircle2, Filter } from "lucide-react";

interface AdminStatsProps {
  total: number;
  pending: number;
  approved: number;
  approvalRate: number;
}

export default function AdminStats({
  total,
  pending,
  approved,
  approvalRate,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-5 rounded-xl border border-default-200 bg-background/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">
              Total
            </p>
            <p className="text-2xl font-black text-foreground">{total}</p>
          </div>
        </div>
      </Card>
      <Card className="p-5 rounded-xl border border-warning/20 bg-warning/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-warning/10 rounded-2xl text-warning">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">
              Pending
            </p>
            <p className="text-2xl font-black text-warning">{pending}</p>
          </div>
        </div>
      </Card>
      <Card className="p-5 rounded-xl border border-success/20 bg-success/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-success/10 rounded-2xl text-success">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">
              Approved
            </p>
            <p className="text-2xl font-black text-success">{approved}</p>
          </div>
        </div>
      </Card>
      <Card className="p-5 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">
              Approval Rate
            </p>
            <p className="text-2xl font-black text-primary">{approvalRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
