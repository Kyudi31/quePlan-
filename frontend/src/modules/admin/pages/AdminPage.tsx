import { useEffect, useState } from 'react';
import type { Plan } from '../../plans/types/plan.types';

const api = async (url: string, options?: any) => {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT:  { label: 'Borrador', cls: 'bg-gray-100 text-gray-600'   },
  FUTURE: { label: 'Futuro',   cls: 'bg-blue-100 text-blue-700'   },
  PAST:   { label: 'Pasado',   cls: 'bg-green-100 text-green-700' },
};

const TRANSPORT: Record<string, string> = {
  WALKING: '🚶 A pie', PUBLIC: '🚌 Público',
  CAR: '🚗 Carro', BICYCLE: '🚲 Bicicleta', MIXED: '🔀 Mixto',
};

export default function AdminPage() {
  const [plans, setPlans]     = useState<Plan[]>([]);
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [editId, setEditId]   = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const load = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      api('/admin/plans'),
      api('/admin/plans/stats'),
    ]);
    setPlans(p);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await api(`/admin/plans/${id}`, { method: 'DELETE' });
    load();
  };

  const handleEditOpen = (plan: Plan) => {
    setEditId(plan.id);
    setEditData({
      name: plan.name,
      numberOfPeople: plan.numberOfPeople,
      budget: Number(plan.budget),
      transport: plan.transport,
      scheduledAt: plan.scheduledAt.slice(0, 16),
    });
  };

  const handleEditSave = async () => {
    await api(`/admin/plans/${editId}`, {
      method: 'PATCH',
      body: JSON.stringify(editData),
    });
    setEditId(null);
    load();
  };

  const filtered = plans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">quePlan</p>
            <h1 className="text-xl font-bold text-gray-900">Panel Administrador</h1>
          </div>
          <a href="/plans"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700
                       bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            ← Vista Usuario
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total',    value: stats.total,       color: 'text-blue-600'   },
              { label: 'Borrador', value: stats.draft,       color: 'text-gray-600'   },
              { label: 'Futuros',  value: stats.future,      color: 'text-indigo-600' },
              { label: 'Pasados',  value: stats.past,        color: 'text-green-600'  },
              { label: 'Usuarios', value: stats.uniqueUsers, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Buscador */}
        <div className="relative mb-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input placeholder="Buscar por nombre de plan..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl h-14 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Plan','Usuario','Fecha','Personas','Presupuesto','Transporte','Estado','Acciones']
                    .map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                             text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(plan => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">{plan.name}</p>
                      <p className="text-xs text-gray-400">{plan.subplans?.length ?? 0} lugares</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 font-mono max-w-[100px] truncate">{plan.userId}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {new Date(plan.scheduledAt).toLocaleDateString('es-CO', { dateStyle: 'short' })}
                      </p>
                    </td>
                    <td className="px-4 py-3">  
                      <p className="text-sm text-gray-600">{plan.numberOfPeople}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-600">${Number(plan.budget).toLocaleString('es-CO')}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{TRANSPORT[plan.transport]}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
                        ${STATUS_CONFIG[plan.status]?.cls}`}>
                        {STATUS_CONFIG[plan.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditOpen(plan)}
                          className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100
                                     px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(plan.id, plan.name)}
                          className="text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100
                                     px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-sm">No hay planes todavía</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal edición */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Editar plan</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre</label>
                <input value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Personas</label>
                  <input type="number" min={1} value={editData.numberOfPeople}
                    onChange={e => setEditData({ ...editData, numberOfPeople: +e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Presupuesto</label>
                  <input type="number" min={0} value={editData.budget}
                    onChange={e => setEditData({ ...editData, budget: +e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Fecha y hora</label>
                <input type="datetime-local" value={editData.scheduledAt}
                  onChange={e => setEditData({ ...editData, scheduledAt: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Transporte</label>
                <select value={editData.transport}
                  onChange={e => setEditData({ ...editData, transport: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                             text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="WALKING">🚶 A pie</option>
                  <option value="PUBLIC">🚌 Transporte público</option>
                  <option value="CAR">🚗 Carro</option>
                  <option value="BICYCLE">🚲 Bicicleta</option>
                  <option value="MIXED">🔀 Mixto</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditId(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5
                           rounded-2xl hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={handleEditSave}
                className="flex-1 bg-blue-600 text-white font-semibold py-2.5
                           rounded-2xl hover:bg-blue-700 text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}