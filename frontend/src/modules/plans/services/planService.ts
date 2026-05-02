import axios from 'axios';
import type { Plan, CreatePlanPayload, Subplan } from '../types/plan.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export const planService = {
  getAll:  (status?: string) =>
    api.get<Plan[]>('/plans', { params: status ? { status } : {} })
       .then(r => r.data),

  getOne:  (id: string) =>
    api.get<Plan>(`/plans/${id}`).then(r => r.data),

  create:  (payload: CreatePlanPayload) =>
    api.post<Plan>('/plans', payload).then(r => r.data),

  update:  (id: string, payload: Partial<CreatePlanPayload>) =>
    api.patch<Plan>(`/plans/${id}`, payload).then(r => r.data),

  remove:  (id: string) =>
    api.delete(`/plans/${id}`),

  addSubplan: (planId: string, data: Omit<Subplan, 'id' | 'planId'>) =>
    api.post<Subplan>(`/plans/${planId}/subplans`, data).then(r => r.data),

  reorderSubplans: (planId: string, orderedIds: string[]) =>
    api.patch(`/plans/${planId}/subplans/reorder`, { orderedIds })
       .then(r => r.data),

  removeSubplan: (planId: string, subplanId: string) =>
    api.delete(`/plans/${planId}/subplans/${subplanId}`),
};