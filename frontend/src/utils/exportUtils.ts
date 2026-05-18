import { LOCALE } from "@/config/locale";
import { Booking } from "@/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeCsvCell(value: string): string {
  const v = value ?? "";

  if (/^[=+\-@]/.test(v)) return `\t${v}`;

  return v;
}

function toCsvValue(value: string): string {
  return `"${sanitizeCsvCell(value).replace(/"/g, '""')}"`;
}

function htd(value: string): string {
  return escapeHtml(value ?? "");
}

export function exportToCSV(bookings: Booking[]) {
  const headers = [
    "ID",
    "Purpose",
    "User",
    "Email",
    "Facility",
    "Start Time",
    "End Time",
    "Status",
    "Created At",
  ];
  const rows = bookings.map((b: any) => [
    b.id,
    toCsvValue(b.purpose ?? ""),
    toCsvValue(b.user?.name ?? ""),
    toCsvValue(b.user?.email ?? ""),
    toCsvValue(b.facility?.name ?? ""),
    new Date(b.startTime).toLocaleString(LOCALE, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    new Date(b.endTime).toLocaleString(LOCALE, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    b.status,
    new Date(b.createdAt ?? b.startTime).toLocaleString(LOCALE, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(bookings: Booking[]) {
  const rows = bookings
    .map(
      (b: any) => `
    <tr>
      <td>${htd(b.id)}</td>
      <td>${htd(b.purpose)}</td>
      <td>${htd(b.user?.name)}</td>
      <td>${htd(b.user?.email)}</td>
      <td>${htd(b.facility?.name)}</td>
      <td>${htd(new Date(b.startTime).toLocaleString(LOCALE, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</td>
      <td>${htd(new Date(b.endTime).toLocaleString(LOCALE, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</td>
      <td>${htd(b.status)}</td>
    </tr>
  `,
    )
    .join("");
  const html = `
    <html><head><meta charset="utf-8" /></head><body>
      <table border="1">
        <thead>
          <tr><th>ID</th><th>Purpose</th><th>User</th><th>Email</th><th>Facility</th><th>Start Time</th><th>End Time</th><th>Status</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>
  `;
  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `bookings_export_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(bookings: Booking[]) {
  const rows = bookings
    .map(
      (b: any) => `
    <tr>
      <td>${htd(b.purpose)}</td>
      <td>${htd(b.user?.name)}</td>
      <td>${htd(b.facility?.name)}</td>
      <td>${htd(new Date(b.startTime).toLocaleString(LOCALE, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</td>
      <td>${htd(new Date(b.endTime).toLocaleString(LOCALE, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</td>
      <td>${htd(b.status)}</td>
    </tr>
  `,
    )
    .join("");
  const printWindow = window.open("", "_blank", "width=1100,height=800");

  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>Booking Audit Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          p { color: #6b7280; margin: 0 0 20px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Booking Audit Report</h1>
        <p>Generated ${new Date().toLocaleString(LOCALE, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        <table>
          <thead><tr><th>Purpose</th><th>User</th><th>Facility</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
