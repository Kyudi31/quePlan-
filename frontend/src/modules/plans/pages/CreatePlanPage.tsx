import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreatePlanPayload, TransportType } from '../types/plan.types';
import { planService } from '../services/planService';
import BottomNav from '../components/BottomNav';

const TRANSPORT_OPTIONS: { value: TransportType; icon: string; label: string }[] = [
  { value: 'WALKING', icon: '🚶', label: 'A pie'           },
  { value: 'CAR',     icon: '🚗', label: 'Carro'           },
  { value: 'PUBLIC',  icon: '🚌', label: 'Transp. Público' },
  { value: 'BICYCLE', icon: '🚲', label: 'Bicicleta'       },
  { value: 'MIXED',   icon: '🔀', label: 'Mixto'           },
];

export default function CreatePlanPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreatePlanPayload>({
    name: '', numberOfPeople: 1, budget: 0,
    transport: 'PUBLIC', scheduledAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (field: keyof CreatePlanPayload, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim())  { setError('El nombre del plan es obligatorio'); return; }
    if (!form.scheduledAt)  { setError('La fecha y hora son obligatorias');  return; }
    if (form.budget < 0)    { setError('El presupuesto no puede ser negativo'); return; }
    if (form.numberOfPeople < 1) { setError('Debe haber al menos 1 persona'); return; }

    setLoading(true);
    setError('');
    try {
      const plan = await planService.create({
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      navigate(`/plans/${plan.id}`);
    } catch {
      setError('Error al crear el plan. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const statusLabel = !form.scheduledAt ? ''
    : new Date(form.scheduledAt) > new Date() ? 'Futuro' : 'Pasado';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
               strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Crear plan</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-4">

        {/* Nombre */}
        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Nombre del plan
          </label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ej: Noche con amigos"
            className="input-field"
          />
        </div>

        {/* Personas */}
        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Número de personas
          </label>
          <input
            type="number" min={1} max={100}
            value={form.numberOfPeople}
            onChange={e => set('numberOfPeople', Math.max(1, parseInt(e.target.value) || 1))}
            className="input-field"
            placeholder="Ej: 4"
          />
        </div>

        {/* Presupuesto */}
        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Presupuesto total (COP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
            <input
              type="number" min={0}
              value={form.budget || ''}
              onChange={e => set('budget', Math.max(0, Number(e.target.value)))}
              className="input-field pl-8"
              placeholder="Ej: 150000"
            />
          </div>
        </div>

        {/* Transporte */}
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

        {/* Fecha */}
        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Fecha y Hora
          </label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={e => set('scheduledAt', e.target.value)}
            className="input-field"
          />
          {statusLabel && (
            <p className={`text-xs mt-1.5 font-medium
              ${statusLabel === 'Futuro' ? 'text-blue-500' : 'text-green-600'}`}>
              Este plan quedará como: {statusLabel}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center font-medium bg-red-50
                        border border-red-100 rounded-2xl py-3 px-4">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? 'Creando...' : 'Crear plan'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}