// src/features/audit/auditStore.ts
export interface ImmutableAuditRecord {
 id: string;
 timestamp: string;
 actor: string;
 action: string;
 targetId: string;
 rationale: string;
 demoReference: string; // Demo only — not a cryptographic signature
}

const AUDIT_STORAGE_KEY = 'validexia_immutable_audit_log_v1';

export const auditStore = {
 getRecords(): ImmutableAuditRecord[] {
 try {
 const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
 if (!stored) return [];
 return JSON.parse(stored);
 } catch {
 return [];
 }
 },

 appendRecord(actor: string, action: string, targetId: string, rationale: string): ImmutableAuditRecord {
 const records = this.getRecords();
 const newRecord: ImmutableAuditRecord = {
 id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
 timestamp: new Date().toISOString(),
 actor,
 action,
 targetId,
 rationale,
 demoReference: `demo_${Date.now()}` // Not a cryptographic signature — demo mode only
 };

 const updated = [newRecord, ...records];
 try {
 localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
 } catch {
 // Storage blocked (private mode, quota) — record stays in memory only
 }
 return newRecord;
 }
};