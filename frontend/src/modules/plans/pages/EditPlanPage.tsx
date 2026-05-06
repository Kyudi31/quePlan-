import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { TransportType } from '../types/plan.types';
import { planService } from '../services/planService';
import BottomNav from '../components/BottomNav';

const TRANSPORT_OPTIONS: { value: TransportType; icon: string; label: string }[] = [
  { value: 'WALKING', icon: '🚶', label: 'A pie'           },
  { value: 'CAR',     icon: '🚗', label: 'Carro'           },
  { value: 'PUBLIC',  icon: '🚌', label: 'Transp. Público' },
  { value: 'BICYCLE', icon: '🚲', label: 'Bicicleta'       },
  { value: 'MIXED',   icon: '🔀', label: 'Mixto'           },
];

export default function EditPlanPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    planService.getOne(id).then(plan => {
      setForm({
        name:           plan.name,
        numberOfPeople: plan.numberOfPeople,
        budget:         Number(plan.budget),
        transport:      plan.transport,
        scheduledAt:    plan.scheduledAt.slice(0, 16),
      });
      setLoading(false);
    });
  }, [id]);

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form || !id) return;
    if (!form.name.trim())       { setError('El nombre es obligatorio'); return; }
    if (form.budget < 0)         { setError('El presupuesto no puede ser negativo'); return; }
    if (form.numberOfPeople < 1) { setError('Debe haber al menos 1 persona'); return; }
    setSaving(true);
    setError('');
    try {
      await planService.update(id, {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      navigate(`/plans/${id}`);
    } catch {
      setError('Error al actualizar.');
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
                 strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Editar plan</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-4">

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Nombre</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            className="input-field"/>
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Número de personas</label>
          <input type="number" min={1} value={form.numberOfPeople}
            onChange={e => set('numberOfPeople', Math.max(1, parseInt(e.target.value) || 1))}
            className="input-field"/>
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Presupuesto (COP)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input type="number" min={0} value={form.budget}
              onChange={e => set('budget', Math.max(0, Number(e.target.value)))}
              className="input-field pl-8"/>
          </div>
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-3">Transporte</label>
          <div className="flex gap-2 flex-wrap">
            {TRANSPORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => set('transport', opt.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                            border-2 transition-all active:scale-95
                  ${form.transport === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <span>{opt.icon}</span><span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Fecha y Hora</label>
          <input type="datetime-local" value={form.scheduledAt}
            onChange={e => set('scheduledAt', e.target.value)} className="input-field"/>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center font-medium bg-red-50
                        border border-red-100 rounded-2xl py-3">{error}</p>
        )}

        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}