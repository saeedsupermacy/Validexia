// src/shared/ui/ErrorStates.tsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WifiOff, ShieldAlert, Clock, RotateCw, X} from 'lucide-react';
import { Button } from './core';

interface NetworkErrorBannerProps {
 onRetry: () => void;
}

export function NetworkErrorBanner({ onRetry }: NetworkErrorBannerProps) {
 return (
 <div role="alert" className="bg-risk-critical/10 border rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in duration-200 mb-6">
 <WifiOff aria-hidden="true" className="text-risk-critical shrink-0 mt-0.5" size={18} />
 <div className="flex-1 space-y-1">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold uppercase tracking-wider text-risk-critical">Network Connection Lost</span>
 <span className="text-[10px] font-semibold uppercase bg-risk-critical/20 text-risk-critical px-2 py-0.5 rounded">Action Failed</span>
 </div>
 <p className="text-xs text-text-primary font-medium m-0">
 Unable to reach the server. Your recent changes have been saved locally but could not be synchronized.
 </p>
 <div className="pt-2 flex items-center gap-3">
 <Button type="button" variant="primary" size="sm" onClick={onRetry} className="h-7 text-xs">
 <RotateCw aria-hidden="true" size={12} className="mr-1.5" /> Try Again
 </Button>
 <span className="text-[11px] text-text-tertiary">Check your VPN or local gateway.</span>
 </div>
 </div>
 </div>
 );
}

interface PermissionErrorModalProps {
 onClose: () => void;
}

export function PermissionErrorModal({ onClose }: PermissionErrorModalProps) {
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 document.addEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'hidden';
 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'unset';
 };
 }, [onClose]);

 return (
 createPortal(
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="permissionModalTitle"
 className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
 >
 <div className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3 text-risk-critical">
 <div aria-hidden="true" className="p-2.5 rounded-xl bg-risk-critical/10 border border-risk-critical/20">
 <ShieldAlert size={22} />
 </div>
 <div>
 <span className="text-[10px] font-semibold uppercase tracking-wider text-risk-critical block">Access Denied</span>
 <h3 id="permissionModalTitle" className="text-base font-bold text-text-primary m-0">Insufficient Privileges</h3>
 </div>
 </div>
 <button 
 type="button" 
 onClick={onClose} 
 aria-label="Close permission dialog"
 className="p-1 text-text-tertiary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-info rounded"
 >
 <X aria-hidden="true" size={18} />
 </button>
 </div>
 <p className="text-xs text-text-secondary leading-relaxed m-0">
 <strong>Action not completed:</strong> Your current profile does not grant permission to modify or sign off on this record.
 </p>
 <div className="p-3 bg-base border border-border rounded-xl text-xs space-y-1">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">What you can do next:</span>
 <p className="text-text-primary font-medium m-0">Request sign-off from a designated Compliance Officer or switch to an authorized role.</p>
 </div>
 <div className="flex justify-end pt-2">
 <Button type="button" variant="secondary" size="sm" onClick={onClose}>Close Window</Button>
 </div>
 </div>
 </div>
 , document.body));
}

interface ExpiredSessionModalProps {
 onReauth: () => void;
}

export function ExpiredSessionModal({ onReauth }: ExpiredSessionModalProps) {
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onReauth();
 };
 document.addEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'hidden';
 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'unset';
 };
 }, [onReauth]);

 return (
 createPortal(
 <div 
 role="dialog"
 aria-modal="true"
 aria-labelledby="sessionExpiredTitle"
 className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
 >
 <div className="bg-surface rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] text-center">
 <div aria-hidden="true" className="w-12 h-12 rounded-full bg-status-warning/10 border flex items-center justify-center mx-auto text-status-warning">
 <Clock size={24} />
 </div>
 <div className="space-y-1">
 <h3 id="sessionExpiredTitle" className="text-base font-bold text-text-primary m-0">Session Expired</h3>
 <p className="text-xs text-text-secondary m-0">
 Your security token has expired due to inactivity. Your unsaved form inputs are securely cached.
 </p>
 </div>
 <div className="pt-2">
 <Button type="button" variant="primary" size="sm" onClick={onReauth} className="w-full h-9">
 Re-Authenticate Securely
 </Button>
 </div>
 </div>
 </div>
 , document.body));
}