// src/features/monitoring/telemetryClient.ts
export interface TelemetrySignalEvent {
 id: string;
 vendorId: string;
 vendorName: string;
 severity: 'Critical' | 'High' | 'Moderate' | 'Low';
 signalType: 'TLS Certificate Expiry' | 'Subprocessor Modification' | 'SIEM Disconnect' | 'Attestation Renewal';
 timestamp: string;
 isLiveStreamed: boolean;
 isSimulated?: boolean; // Demo flag
}

export class TelemetryStreamer {
 private listeners: ((event: TelemetrySignalEvent) => void)[] = [];
 private timer: number | null = null;

 subscribe(callback: (event: TelemetrySignalEvent) => void) {
 this.listeners.push(callback);
 return () => {
 this.listeners = this.listeners.filter(cb => cb !== callback);
 };
 }

 startPolling(intervalMs = 30000) {
 if (this.timer) return;
 this.timer = window.setInterval(() => {
 // Simulate live telemetry check
 const simulatedEvent: TelemetrySignalEvent = {
 id: `sig_${Date.now()}`,
 vendorId: 'vend-001',
 vendorName: 'CloudScale Infrastructure',
 severity: 'High',
 signalType: 'TLS Certificate Expiry',
 timestamp: new Date().toLocaleTimeString(),
 isLiveStreamed: false, // Demo simulation — not a live feed
 isSimulated: true
 };
 this.listeners.forEach(cb => cb(simulatedEvent));
 }, intervalMs);
 }

 stopPolling() {
 if (this.timer) {
 clearInterval(this.timer);
 this.timer = null;
 }
 }
}

export const telemetryStreamer = new TelemetryStreamer();