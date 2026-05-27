import { ReportsClient } from "./reports-client";

export const metadata = {
  title: "Reportes",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Reportes
        </h1>
      </div>
      <ReportsClient />
    </div>
  );
}
