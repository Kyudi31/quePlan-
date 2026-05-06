import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Plan, Subplan } from '../types/plan.types';
import { planService } from '../services/planService';
import BottomNav from '../components/BottomNav';

const TRANSPORT_LABEL: Record<string, string> = {
  WALKING: 'A pie', PUBLIC: 'Transp. Público',
  CAR: 'Carro', BICYCLE: 'Bicicleta', MIXED: 'Mixto',
};

export default function PlanDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan]         = useState<Plan | null>(null);
  const [loading, setLoading]   = useState(true);
  const [newPlace, setNewPlace] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    if (!id) return;
    const data = await planService.getOne(id);
    setPlan(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleAddSubplan = async () => {
    if (!newPlace.trim() || !plan) return;
    setSaving(true);
    await planService.addSubplan(plan.id, {
      placeName: newPlace.trim(),
      notes:     newNotes.trim() || undefined,
      order:     plan.subplans.length,
    });
    setNewPlace('');
    setNewNotes('');
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const handleRemove = async (subplanId: string) => {
    if (!plan) return;
    await planService.removeSubplan(plan.id, subplanId);
    load();
  };

  const handleMove = async (subplans: Subplan[], index: number, dir: -1 | 1) => {
    if (!plan) return;
    const next = index + dir;
    if (next < 0 || next >= subplans.length) return;
    const reordered = [...subplans];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    await planService.reorderSubplans(plan.id, reordered.map(s => s.id));
    load();
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Plan no encontrado</p>
    </div>
  );

  const sorted = [...plan.subplans].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/plans')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{plan.name}</h1>
          </div>
          <button onClick={() => navigate(`/plans/${plan.id}/edit`)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Editar
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">

        {/* Resumen del plan */}
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fecha', value: new Date(plan.scheduledAt).toLocaleDateString('es-CO', { dateStyle: 'medium' }) },
              { label: 'Personas', value: `${plan.numberOfPeople} personas` },
              { label: 'Presupuesto', value: `$${Number(plan.budget).toLocaleString('es-CO')}` },
              { label: 'Transporte', value: TRANSPORT_LABEL[plan.transport] },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className="font-semibold text-gray-700 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agregar lugar */}
        <div className="card p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Lugares en la ruta</h2>

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                         text-sm font-semibold py-2.5 rounded-2xl hover:bg-blue-700 transition-all">
              + Añadir lugar
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <input
                  placeholder="Nombre del lugar"
                  className="input-field pl-9"
                  value={newPlace}
                  onChange={e => setNewPlace(e.target.value)}
                  autoFocus
                />
              </div>
              <input
                placeholder="Notas (opcional)"
                className="input-field"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowAdd(false); setNewPlace(''); setNewNotes(''); }}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium
                             text-gray-600 hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleAddSubplan} disabled={saving || !newPlace.trim()}
                  className="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold
                             hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {saving ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de subplanes */}
        {sorted.length > 0 && (
          <div className="flex flex-col gap-3">
            {sorted.map((sub, index) => (
              <div key={sub.id} className="card p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center
                                justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{sub.placeName}</p>
                  {sub.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{sub.notes}</p>}
                </div>
                {/* Botones subir/bajar */}
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleMove(sorted, index, -1)} disabled={index === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100
                               disabled:opacity-25 transition-all">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button onClick={() => handleMove(sorted, index, 1)} disabled={index === sorted.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100
                               disabled:opacity-25 transition-all">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {/* Eliminar */}
                <button onClick={() => handleRemove(sub.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50
                             text-gray-400 hover:text-red-500 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {sorted.length === 0 && !showAdd && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">📍</p>
            <p className="text-sm">Agrega lugares a tu ruta</p>
          </div>
        )}

        {sorted.length > 0 && (
          <button onClick={() => navigate('/plans')} className="btn-primary">
            Guardar cambios
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}