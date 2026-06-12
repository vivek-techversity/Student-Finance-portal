import { useAppData } from '../components/layout/AppLayout';
import FounderReport from '../components/dashboard/FounderReport';

export default function FounderReportPage() {
  const { students = [], payments = [], calcs = {}, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading report…</p>
        </div>
      </div>
    );
  }

  return <FounderReport students={students} payments={payments} calcs={calcs} />;
}