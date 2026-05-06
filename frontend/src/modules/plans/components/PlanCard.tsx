import { useNavigate } from 'react-router-dom';
import type { Plan } from '../types/plan.types';
import { planService } from '../services/planService';

const STATUS_CONFIG = {
  DRAFT:  { label: 'Pendiente',   cls: 'bg-gray-100 text-gray-500'   },
  FUTURE: { label: 'Programado',  cls: 'bg-blue-50 text-blue-600'    },
  PAST:   { label: 'Completado',  cls: 'bg-green-50 text-green-600'  },
};

const TRANSPORT_ICON: Record<string, string> = {
  WALKING: '🚶', PUBLIC: '🚌', CAR: '🚗', BICYCLE: '🚲', MIXED: '🔀',
};

const TRANSPORT_LABEL: Record<string, string> = {
  WALKING: 'A pie', PUBLIC: 'Transp. Público',
  CAR: 'Carro', BICYCLE: 'Bicicleta', MIXED: 'Mixto',
};

interface Props { plan: Plan; onUpdate: () => void; }

export default function PlanCard({ plan, onUpdate }: Props) {
  const navigate = useNavigate();
  const { label, cls } = STATUS_CONFIG[plan.status];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar "${plan.name}"?`)) return;
    await planService.remove(plan.id);
    onUpdate();
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Marcar "${plan.name}" como completado?`)) return;
    await planService.update(plan.id, { status: 'PAST' } as any);
    onUpdate();
  };

  return (
    <div
      onClick={() => navigate(`/plans/${plan.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer
                 hover:shadow-md active:scale-[0.99] transition-all duration-150"
    >
      {/* Título */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate text-base">{plan.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(plan.scheduledAt).toLocaleDateString('es-CO', {
              weekday: 'short', day: 'numeric', month: 'short',
            })}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
          {label}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
        <span>👥 {plan.numberOfPeople}</span>
        <span>💰 ${Number(plan.budget).toLocaleString('es-CO')}</span>
        <span>{TRANSPORT_ICON[plan.transport]} {TRANSPORT_LABEL[plan.transport]}</span>
      </div>

      {plan.subplans.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">📍 {plan.subplans.length} lugar(es) en ruta</p>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50"
           onClick={e => e.stopPropagation()}>
        <div className="flex gap-3">
          <button
            onClick={e => { e.stopPropagation(); navigate(`/plans/${plan.id}/edit`); }}
            className="text-xs text-blue-600 font-medium hover:text-blue-700"
          >
            Editar
          </button>
          <button onClick={handleDelete}
            className="text-xs text-red-400 font-medium hover:text-red-600">
            Eliminar
          </button>
        </div>

        {/* Solo mostrar "Completar" si NO está ya completado */}
        {plan.status !== 'PAST' && (
          <button onClick={handleComplete}
            className="text-xs bg-green-50 text-green-600 font-semibold px-3 py-1.5
                       rounded-lg hover:bg-green-100 transition-all">
            ✅ Completar
          </button>
        )}
      </div>
    </div>
  );
}