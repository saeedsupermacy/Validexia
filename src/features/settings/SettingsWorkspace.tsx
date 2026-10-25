// src/features/settings/SettingsWorkspace.tsx
import React, { useState, useEffect } from 'react';
import { 
 Building2, Sliders, FileText, Bell, ShieldAlert, Blocks, 
 Database, Palette, CheckCircle2, AlertTriangle, Save 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Eyebrow} from '../../shared/ui/core';
import { NetworkErrorBanner, PermissionErrorModal, ExpiredSessionModal } from '../../shared/ui/ErrorStates';
import { auditStore } from '../audit/auditStore';

export type SettingsCategory = 
 | 'Organization' 
 | 'Risk model' 
 | 'Policies' 
 | 'Notifications' 
 | 'Security' 
 | 'Integrations' 
 | 'Data' 
 | 'Appearance';

export function SettingsWorkspace() {
 const [activeCategory, setActiveCategory] = useState<SettingsCategory>('Security');
 const [savedToast, setSavedToast] = useState(false);

 // Error simulation states
 const [hasNetworkError, setHasNetworkError] = useState(false);
 const [showPermissionModal, setShowPermissionModal] = useState(false);
 const [showSessionExpired, setShowSessionExpired] = useState(false);

 // Safe localStorage read — returns fallback if storage is blocked
 const safeGet = (key: string, fallback: string): string => {
 try {
 return localStorage.getItem(key) || fallback;
 } catch {
 return fallback;
 }
 };

 // Form states for demonstration
 const [orgName, setOrgName] = useState(() => safeGet('vx-orgName', 'Validexia Enterprise Global'));
 const [riskTolerance, setRiskTolerance] = useState(() => safeGet('vx-riskTolerance', 'Balanced: flag vendors scoring 65+'));
 const [mfaEnforced, setMfaEnforced] = useState(() => safeGet('vx-mfaEnforced', 'true') !== 'false');
 const [sessionTimeout, setSessionTimeout] = useState(() => safeGet('vx-sessionTimeout', '15 Minutes of Inactivity'));
 const [themeMode, setThemeMode] = useState(() => safeGet('vx-themeMode', 'System Default (Dark / Light)'));
 const [complianceProfile, setComplianceProfile] = useState(() => safeGet('vx-complianceProfile', 'SOC 2 Type II & GDPR'));
 const [dataResidency, setDataResidency] = useState(() => safeGet('vx-dataResidency', 'EU Central (Frankfurt - AWS eu-central-1)'));
 const [policyDpa, setPolicyDpa] = useState(() => safeGet('vx-policyDpa', 'true') !== 'false');
 const [policyCipher, setPolicyCipher] = useState(() => safeGet('vx-policyCipher', 'true') !== 'false');
 const [notifyRiskPings, setNotifyRiskPings] = useState(() => safeGet('vx-notifyRiskPings', 'true') !== 'false');
 const [notifyDigest, setNotifyDigest] = useState(() => safeGet('vx-notifyDigest', 'true') !== 'false');
 const [apiKey, setApiKey] = useState(() => safeGet('vx-masterApiKey', 'vx_live_9981247819234819237489'));
 const [ipWhitelist, setIpWhitelist] = useState(() => safeGet('vx-ipWhitelist', '192.168.1.0/24\n10.0.4.0/22\n172.16.8.12/32'));

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (hasNetworkError) setHasNetworkError(false);
 if (showPermissionModal) setShowPermissionModal(false);
 if (showSessionExpired) setShowSessionExpired(false);
 }
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [hasNetworkError, showPermissionModal, showSessionExpired]);

 const handleSave = () => {
 try {
 localStorage.setItem('vx-orgName', orgName);
 localStorage.setItem('vx-riskTolerance', riskTolerance);
 localStorage.setItem('vx-mfaEnforced', String(mfaEnforced));
 localStorage.setItem('vx-sessionTimeout', sessionTimeout);
 localStorage.setItem('vx-themeMode', themeMode);
 localStorage.setItem('vx-complianceProfile', complianceProfile);
 localStorage.setItem('vx-dataResidency', dataResidency);
 localStorage.setItem('vx-policyDpa', String(policyDpa));
 localStorage.setItem('vx-policyCipher', String(policyCipher));
 localStorage.setItem('vx-notifyRiskPings', String(notifyRiskPings));
 localStorage.setItem('vx-notifyDigest', String(notifyDigest));
 localStorage.setItem('vx-masterApiKey', apiKey);
 localStorage.setItem('vx-ipWhitelist', ipWhitelist);
 } catch { /* storage unavailable */ }
 auditStore.appendRecord('Current User', 'SETTINGS_UPDATED', 'tenant-settings', 'Organization and governance settings saved');
 setSavedToast(true);
 setTimeout(() => setSavedToast(false), 3000);
 };

 const regenerateApiKey = () => {
 const hex = Array.from({ length: 22 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
 const next = `vx_live_${hex}`;
 setApiKey(next);
 try { localStorage.setItem('vx-masterApiKey', next); } catch { /* storage unavailable */ }
 };

 /** Map the Appearance dropdown to the real app theme (vx-theme, used by AppShell). */
 const applyThemeMode = (mode: string) => {
 try {
 if (mode.startsWith('Forced Dark')) {
 localStorage.setItem('vx-theme', 'dark');
 document.documentElement.classList.add('dark');
 } else if (mode.startsWith('Forced Light')) {
 localStorage.setItem('vx-theme', 'light');
 document.documentElement.classList.remove('dark');
 } else {
 // System Default — clear override so AppShell falls back to prefers-color-scheme
 localStorage.removeItem('vx-theme');
 const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 document.documentElement.classList.toggle('dark', prefersDark);
 }
 } catch { /* storage unavailable */ }
 };

 const categories: { id: SettingsCategory; label: string; icon: React.ReactNode; serious?: boolean }[] = [
 { id: 'Organization', label: 'Organization', icon: <Building2 aria-hidden="true" size={16} /> },
 { id: 'Risk model', label: 'Risk Model & Scoring', icon: <Sliders aria-hidden="true" size={16} /> },
 { id: 'Policies', label: 'Enterprise Policies', icon: <FileText aria-hidden="true" size={16} /> },
 { id: 'Notifications', label: 'Alerts & Notifications', icon: <Bell aria-hidden="true" size={16} /> },
 { id: 'Security', label: 'Security & Access Control', icon: <ShieldAlert aria-hidden="true" size={16} />, serious: true },
 { id: 'Integrations', label: 'Integrations & Webhooks', icon: <Blocks aria-hidden="true" size={16} /> },
 { id: 'Data', label: 'Data Retention & Residency', icon: <Database aria-hidden="true" size={16} />, serious: true },
 { id: 'Appearance', label: 'Appearance & UI', icon: <Palette aria-hidden="true" size={16} /> },
 ];

 return (
 <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
 
 <div aria-live="polite" className="sr-only">
 Settings workspace loaded. Active settings category: {activeCategory}.
 </div>

 {hasNetworkError && <NetworkErrorBanner onRetry={() => setHasNetworkError(false)} />}
 {showPermissionModal && <PermissionErrorModal onClose={() => setShowPermissionModal(false)} />}
 {showSessionExpired && <ExpiredSessionModal onReauth={() => setShowSessionExpired(false)} />}

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
 <div>
 <Eyebrow>Administration</Eyebrow>
 <h1 className="text-page-title">Settings</h1>
 <p className="text-body-secondary mt-1">
 Configure global risk thresholds, security policies, and administrative preferences.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 {savedToast && (
 <div className="flex items-center gap-2 bg-status-success/10 text-status-success border px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in">
 <CheckCircle2 aria-hidden="true" size={14} /> Settings updated successfully
 </div>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
 
 {/* Left Sub-Navigation Sidebar (1 col) */}
 <Card className="shadow-sm lg:sticky lg:top-6">
 <CardContent className="p-2 space-y-1" role="group" aria-label="Settings Categories">
 {categories.map(cat => (
 <button
 key={cat.id}
 type="button"
 onClick={() => setActiveCategory(cat.id)}
 className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-info ${
 activeCategory === cat.id
 ? 'bg-surface text-text-primary shadow-sm border border-border-strong'
 : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
 }`}
 >
 <div className="flex items-center gap-2.5 truncate">
 <span aria-hidden="true" className={cat.serious ? 'text-risk-critical' : 'text-text-tertiary'}>
 {cat.icon}
 </span>
 <span className="truncate">{cat.label}</span>
 </div>
 {cat.serious && (
 <span aria-hidden="true" className="w-2 h-2 rounded-full bg-risk-critical shrink-0" title="High-stakes security section" />
 )}
 </button>
 ))}
 </CardContent>
 </Card>

 {/* Right Content Area (3 cols) */}
 <div className="lg:col-span-3 space-y-6">
 
 {/* 1. ORGANIZATION SETTINGS */}
 {activeCategory === 'Organization' && (
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4 bg-surface-hover/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <Building2 aria-hidden="true" size={16} className="text-info" /> Organization & Tenant Profile
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-4 text-xs">
 <div className="space-y-1.5">
 <label htmlFor="tenantOrgNameInput" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Tenant Organization Name</label>
 <input 
 id="tenantOrgNameInput"
 type="text" 
 value={orgName} 
 onChange={(e) => setOrgName(e.target.value)}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label htmlFor="tenantIdInput" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Tenant ID (UUID)</label>
 <input id="tenantIdInput" type="text" readOnly value="ten_994821a...77b" className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-tertiary" />
 </div>
 <div className="space-y-1.5">
 <label htmlFor="primaryComplianceSelect" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Primary Industry Compliance</label>
 <select id="primaryComplianceSelect" value={complianceProfile} onChange={(e) => setComplianceProfile(e.target.value)} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info">
 <option>SOC 2 Type II & GDPR</option>
 <option>HIPAA & HITRUST</option>
 <option>PCI-DSS Level 1</option>
 </select>
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-end">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Organization
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 2. RISK MODEL SETTINGS */}
 {activeCategory === 'Risk model' && (
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4 bg-surface-hover/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <Sliders aria-hidden="true" size={16} className="text-info" /> Quantitative Risk Scoring & Thresholds
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-4 text-xs">
 <div className="space-y-1.5">
 <label htmlFor="riskToleranceSelect" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Default Portfolio Risk Tolerance Profile</label>
 <select 
 id="riskToleranceSelect"
 value={riskTolerance}
 onChange={(e) => setRiskTolerance(e.target.value)}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option>Strict: flag vendors scoring 80+</option>
 <option>Balanced: flag vendors scoring 65+</option>
 <option>Cautious: flag vendors scoring 40+</option>
 </select>
 </div>

 <div className="p-4 bg-base border border-border rounded-xl space-y-2">
 <span className="font-bold text-text-primary">Scoring Weighting Factors</span>
 <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
 <div className="p-2 bg-surface rounded border border-border-subtle text-center">
 <span className="text-text-tertiary block text-[10px]">SOC 2 Attestation</span>
 <span className="font-bold text-info">40%</span>
 </div>
 <div className="p-2 bg-surface rounded border border-border-subtle text-center">
 <span className="text-text-tertiary block text-[10px]">Cipher / TLS Hygiene</span>
 <span className="font-bold text-info">35%</span>
 </div>
 <div className="p-2 bg-surface rounded border border-border-subtle text-center">
 <span className="text-text-tertiary block text-[10px]">Subprocessor Risk</span>
 <span className="font-bold text-info">25%</span>
 </div>
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-end">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Update Risk Model
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 3. POLICIES SETTINGS */}
 {activeCategory === 'Policies' && (
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4 bg-surface-hover/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <FileText aria-hidden="true" size={16} className="text-info" /> Enterprise Compliance Policies
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-4 text-xs">
 <div className="space-y-3">
 <label className="flex items-start gap-3 p-3 bg-base border border-border rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
 <input type="checkbox" checked={policyDpa} onChange={(e) => setPolicyDpa(e.target.checked)} className="mt-0.5 rounded border-border text-info focus:ring-info" />
 <div>
 <span className="font-bold text-text-primary block">Mandatory DPA Execution for Tier 1 Subprocessors</span>
 <span className="text-[11px] text-text-tertiary">Automatically flag any vendor onboarding missing an executed Data Processing Agreement.</span>
 </div>
 </label>

 <label className="flex items-start gap-3 p-3 bg-base border border-border rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
 <input type="checkbox" checked={policyCipher} onChange={(e) => setPolicyCipher(e.target.checked)} className="mt-0.5 rounded border-border text-info focus:ring-info" />
 <div>
 <span className="font-bold text-text-primary block">Strict Cipher Deprecation (Block TLS 1.0/1.1)</span>
 <span className="text-[11px] text-text-tertiary">Instantly trigger risk score degradation if active endpoints support legacy TLS handshakes.</span>
 </div>
 </label>
 </div>

 <div className="pt-4 border-t border-border flex justify-end">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Policies
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 4. NOTIFICATIONS SETTINGS */}
 {activeCategory === 'Notifications' && (
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4 bg-surface-hover/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <Bell aria-hidden="true" size={16} className="text-info" /> Alert & Signal Routing
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-4 text-xs">
 <div className="space-y-3">
 <label className="flex items-center justify-between p-3 bg-base border border-border rounded-xl cursor-pointer">
 <div>
 <span className="font-bold text-text-primary block">Critical Risk Event Pings</span>
 <span className="text-[11px] text-text-tertiary">Send Slack alerts immediately upon critical vendor telemetry shifts.</span>
 </div>
 <input type="checkbox" checked={notifyRiskPings} onChange={(e) => setNotifyRiskPings(e.target.checked)} className="rounded border-border text-info focus:ring-info" />
 </label>

 <label className="flex items-center justify-between p-3 bg-base border border-border rounded-xl cursor-pointer">
 <div>
 <span className="font-bold text-text-primary block">Weekly Executive Risk Digest</span>
 <span className="text-[11px] text-text-tertiary">Email summary report to board directors and CISO every Monday at 08:00 UTC.</span>
 </div>
 <input type="checkbox" checked={notifyDigest} onChange={(e) => setNotifyDigest(e.target.checked)} className="rounded border-border text-info focus:ring-info" />
 </label>
 </div>

 <div className="pt-4 border-t border-border flex justify-end">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Preferences
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 5. SECURITY SETTINGS (HIGH-STAKES / SERIOUS) */}
 {activeCategory === 'Security' && (
 <Card className="shadow-sm bg-risk-critical/10 dark:bg-risk-critical/5">
 <CardHeader className="border-b border-border px-6 py-4 bg-risk-critical/10 dark:bg-risk-critical/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-risk-critical">
 <ShieldAlert aria-hidden="true" size={16} /> Security & Strict Access Control (High-Stakes)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-6 text-xs">
 
 <div className="p-4 bg-risk-critical/10 border rounded-xl flex items-start gap-3">
 <AlertTriangle aria-hidden="true" size={18} className="text-risk-critical shrink-0 mt-0.5" />
 <div className="space-y-1">
 <strong className="text-risk-critical font-bold">Strict Tenant Isolation Enforced</strong>
 <p className="text-text-secondary leading-relaxed m-0">
 Modifying cryptographic session timeouts, SAML SSO enforcement, or IP allowlists directly impacts tenant audit defensibility and SOC 2 compliance posture.
 </p>
 </div>
 </div>

 <div className="space-y-4">
 <label className="flex items-center justify-between p-4 bg-base border border-border rounded-xl cursor-pointer">
 <div>
 <span className="font-bold text-text-primary block text-sm">Enforce Multi-Factor Authentication (MFA)</span>
 <span className="text-text-tertiary">Require all tenant users to authenticate via hardware token or TOTP authenticator app.</span>
 </div>
 <input 
 type="checkbox" 
 checked={mfaEnforced} 
 onChange={(e) => setMfaEnforced(e.target.checked)}
 className="w-4 h-4 rounded border-border text-risk-critical focus:ring-risk-critical" 
 />
 </label>

 <div className="space-y-1.5">
 <label htmlFor="sessionTimeoutSelect" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Administrative Session Timeout</label>
 <select 
 id="sessionTimeoutSelect"
 value={sessionTimeout}
 onChange={(e) => setSessionTimeout(e.target.value)}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-risk-critical"
 >
 <option>15 Minutes of Inactivity</option>
 <option>30 Minutes of Inactivity</option>
 <option>1 Hour (Strict Enterprise Policy)</option>
 </select>
 </div>

 <div className="space-y-1.5 pt-2">
 <label htmlFor="ipWhitelistTextarea" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Corporate IP Whitelist (CIDR Notation)</label>
 <textarea 
 id="ipWhitelistTextarea"
 rows={3}
 value={ipWhitelist}
 onChange={(e) => setIpWhitelist(e.target.value)}
 placeholder={"192.168.1.0/24\n10.0.4.0/22"}
 className="w-full bg-base border border-border rounded-lg p-3 font-mono text-[11px] text-text-secondary focus:outline-none focus:ring-2 focus:ring-info"
 />
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-end items-center">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Security Settings
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 6. INTEGRATIONS SETTINGS */}
 {activeCategory === 'Integrations' && (
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4 bg-surface-hover/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <Blocks aria-hidden="true" size={16} className="text-info" /> Global Webhook & API Keys
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-4 text-xs">
 <div className="space-y-1.5">
 <label htmlFor="masterApiKeyInput" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Demo API Key <span className="normal-case font-medium">(not a real secret)</span></label>
 <div className="flex gap-2">
 <input id="masterApiKeyInput" type="password" readOnly value={apiKey} className="flex-1 bg-base border border-border rounded-lg px-3 py-2 font-mono text-xs text-text-tertiary" />
 <Button type="button" variant="secondary" size="sm" onClick={regenerateApiKey}>Regenerate</Button>
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-end">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Integrations
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 7. DATA SETTINGS (HIGH-STAKES / SERIOUS) */}
 {activeCategory === 'Data' && (
 <Card className="shadow-sm bg-risk-critical/10 dark:bg-risk-critical/5">
 <CardHeader className="border-b border-border px-6 py-4 bg-risk-critical/10 dark:bg-risk-critical/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-risk-critical">
 <Database aria-hidden="true" size={16} /> Data Residency & Immutable Retention (High-Stakes)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-6 text-xs">
 
 <div className="space-y-4">
 <div className="space-y-1.5">
 <label htmlFor="dataResidencySelect" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Primary Data Residency Jurisdiction</label>
 <select id="dataResidencySelect" value={dataResidency} onChange={(e) => setDataResidency(e.target.value)} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-risk-critical">
 <option>EU Central (Frankfurt - AWS eu-central-1)</option>
 <option>US East (N. Virginia - AWS us-east-1)</option>
 <option>Switzerland (Zurich - AWS ch-east-1)</option>
 </select>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="retentionPeriodInput" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Audit Log Retention Period</label>
 <input id="retentionPeriodInput" type="text" readOnly value="7 Years (demo setting)" className="w-full bg-base border border-border rounded-lg px-3 py-2 font-mono text-xs text-text-tertiary" />
 </div>
 </div>

 <div className="pt-4 border-t border-border flex justify-end items-center">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Data Settings
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 8. APPEARANCE SETTINGS (COSMETIC) */}
 {activeCategory === 'Appearance' && (
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border px-6 py-4 bg-surface-hover/20">
 <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
 <Palette aria-hidden="true" size={16} className="text-info" /> Appearance & Theme Preferences (Cosmetic)
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-4 text-xs">
 <div className="space-y-1.5">
 <label htmlFor="colorThemeSelect" className="font-bold uppercase tracking-wider text-[10px] text-text-tertiary block">Color Theme Mode</label>
 <select 
 id="colorThemeSelect"
 value={themeMode}
 onChange={(e) => { setThemeMode(e.target.value); applyThemeMode(e.target.value); }}
 className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-info"
 >
 <option>System Default (Dark / Light)</option>
 <option>Forced Dark Mode (High Contrast)</option>
 <option>Forced Light Mode</option>
 </select>
 </div>

 <div className="pt-4 border-t border-border flex justify-end">
 <Button type="button" variant="primary" size="sm" onClick={handleSave} className="gap-1.5 font-bold">
 <Save aria-hidden="true" size={14} /> Save Appearance
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 </div>

 </div>

 </div>
 );
}