import { Card, Chip } from "@heroui/react";

interface MiniBarChartProps {
  data: { label: string; value: number; color: string }[];
}

function MiniBarChart({ data }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 280;
  const H = 80;
  const barW = Math.floor((W - (data.length - 1) * 8) / data.length);

  return (
    <svg className="overflow-visible" height={H} width={W}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.value / max) * (H - 20));
        const x = i * (barW + 8);
        const y = H - 20 - barH;

        return (
          <g key={d.label}>
            <rect
              fill={d.color}
              height={barH}
              opacity={0.85}
              rx={4}
              width={barW}
              x={x}
              y={y}
            />
            <text
              className="text-default-400"
              fill="currentColor"
              fontSize={8}
              textAnchor="middle"
              x={x + barW / 2}
              y={H - 4}
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface FacilityUsageChartProps {
  facilityStats: [string, number][];
  peakHours: [string, number][];
  total: number;
  chartColors: string[];
}

export default function FacilityUsageChart({
  facilityStats,
  peakHours,
  total,
  chartColors,
}: FacilityUsageChartProps) {
  return (
    <Card className="p-6 rounded-xl border border-default-200 bg-background/60">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-default-400 uppercase tracking-widest mb-4">
            Bookings per Facility
          </p>
          <div className="flex flex-col gap-2.5">
            {facilityStats.map(([name, count], idx) => (
              <div key={name} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: chartColors[idx] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-default-600 truncate">
                      {name}
                    </span>
                    <span className="text-xs font-black text-default-500 shrink-0 ml-2">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-default-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(count / total) * 100}%`,
                        background: chartColors[idx],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-center justify-center gap-2 pl-4 border-l border-default-100">
          <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">
            Distribution
          </p>
          <MiniBarChart
            data={facilityStats.map(([label, value], idx) => ({
              label,
              value,
              color: chartColors[idx],
            }))}
          />
        </div>
      </div>
      {peakHours.length > 0 && (
        <div className="mt-5 pt-5 border-t border-default-100">
          <p className="text-[10px] font-black text-default-400 uppercase tracking-widest mb-3">
            Peak Hours
          </p>
          <div className="flex flex-wrap gap-2">
            {peakHours.map(([hour, count]) => (
              <Chip
                key={hour}
                className="font-black"
                color="accent"
                size="sm"
                variant="soft"
              >
                {hour} ({count})
              </Chip>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
