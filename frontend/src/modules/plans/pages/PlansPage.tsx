import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '../types/plan.types';
import { planService } from '../services/planService';
import PlanCard from '../components/PlanCard';
import BottomNav from '../components/BottomNav';

export default function PlansPage() {
  const [active, setActive]   = useState<Plan[]>([]);
  const [past, setPast]       = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<'active' | 'past'>('active');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const all = await planService.getAll();
      // Planes activos = FUTURE o DRAFT
      setActive(all.filter(p => p.status === 'FUTURE' || p.status === 'DRAFT'));
      // Planes pasados = PAST
      setPast(all.filter(p => p.status === 'PAST'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const shown = tab === 'active' ? active : past;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">quePlan</p>
              <h1 className="text-2xl font-bold text-gray-900">Mis Planes</h1>
            </div>
            <button
              onClick={() => navigate('/plans/new')}
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2
                         rounded-2xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              + Nuevo
            </button>
          </div>

          {/* Solo 2 tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('active')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all
                ${tab === 'active'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Mis planes {active.length > 0 && `(${active.length})`}
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all
                ${tab === 'past'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Completados {past.length > 0 && `(${past.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-28 animate-pulse"/>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{tab === 'active' ? '🗺️' : '✅'}</div>
            <p className="text-gray-500 font-medium">
              {tab === 'active'
                ? 'No tienes planes activos'
                : 'Aún no tienes planes completados'}
            </p>
            {tab === 'active' && (
              <button
                onClick={() => navigate('/plans/new')}
                className="mt-6 bg-blue-600 text-white text-sm font-semibold px-6 py-3
                           rounded-2xl hover:bg-blue-700 transition-all"
              >
                Crear mi primer plan
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map(plan => (
              <PlanCard key={plan.id} plan={plan} onUpdate={load} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}