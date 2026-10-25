import { api } from '../../shared/api/client';

export interface VendorDTO {
 id: string;
 name: string;
 code: string;
 domain: string;
 category: string;
 riskScore: number;
 riskLevel: string;
}

export const vendorsApi = {
 getVendors: (signal?: AbortSignal) => 
 api.get<VendorDTO[]>('/vendors', { signal }),

 getVendorById: (id: string, signal?: AbortSignal) => 
 api.get<VendorDTO>(`/vendors/${id}`, { signal }),
};