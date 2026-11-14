"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, RefreshCw, GitPullRequest, 
  CheckCircle2, AlertTriangle, ArrowRight, Layers, Cpu, Radio,
  Dna, Zap, GitMerge, Eye, X, Terminal
} from 'lucide-react';

interface FleetService {
  id: string;
  name: string;
  cluster: string;
  runtime: string;
  criticality: string;
  immunity_status: 'vulnerable' | 'immunized' | 'healthy';
  detected_pathogen?: string | null;
  matched_antibody_id?: string | null;
  active_prs: any[];
  last_scanned: string;
}

interface Antibody {
  id: string;
  incident_id: string;
  name: string;
  pathogen: string;
  origin_service: string;
  target_severity: string;
  prevention_rule: string;
  vaccination_patch: string;
  discovered_at: string;
  status: string;
  times_propagated: number;
}

interface FleetStatusData {
  fleet_immunity_score: number;
  total_services: number;
  vulnerable_count: number;
  immunized_count: number;
  healthy_count: number;
  antibodies: Antibody[];
  services: FleetService[];
  last_fleet_sync: string;
}

interface ImmuneSystemViewerProps {
  apiBaseUrl: string;
}

export function ImmuneSystemViewer({ apiBaseUrl }: ImmuneSystemViewerProps) {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [propagating, setPropagating] = useState(false);
  const [data, setData] = useState<FleetStatusData | null>(null);
  const [selectedServiceForPR, setSelectedServiceForPR] = useState<FleetService | null>(null);
  const [selectedAntibodyForPatch, setSelectedAntibodyForPatch] = useState<Antibody | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const fetchFleetStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/devops-agent/immune-system/fleet-status`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load fleet immunity status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetStatus();
  }, [apiBaseUrl]);

  const handleScanFleet = async () => {
    try {
      setScanning(true);
      const res = await fetch(`${apiBaseUrl}/devops-agent/immune-system/scan-fleet`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setBannerMessage("Fleet scan completed: Microservice dependencies re-indexed against active antibodies.");
        setTimeout(() => setBannerMessage(null), 5000);
      }
    } catch (err) {
      console.error("Fleet scan failed", err);
    } finally {
      setScanning(false);
    }
  };

  const handlePropagateAll = async () => {
    try {
      setPropagating(true);
      const res = await fetch(`${apiBaseUrl}/devops-agent/immune-system/propagate-antibody`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const json = await res.json();
        setBannerMessage(json.message);
        // Refresh fleet
        await fetchFleetStatus();
        setTimeout(() => setBannerMessage(null), 6000);
      }
    } catch (err) {
      console.error("Antibody propagation failed", err);
    } finally {
      setPropagating(false);
    }
  };

  const handleVaccinateSingleService = async (serviceId: string, antibodyId?: string) => {
    try {
      setPropagating(true);
      const res = await fetch(`${apiBaseUrl}/devops-agent/immune-system/propagate-antibody`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, antibody_id: antibodyId })
      });
      if (res.ok) {
        const json = await res.json();
        setBannerMessage(json.message);
        await fetchFleetStatus();
        setTimeout(() => setBannerMessage(null), 5000);
      }
    } catch (err) {
      console.error("Single service vaccination failed", err);
    } finally {
      setPropagating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-[#475569]">Initializing Software Immune System Telemetry...</p>
      </div>
    );
  }

  const score = data?.fleet_immunity_score ?? 66.7;
  const isFullyProtected = score >= 99;

  return (
    <div className="space-y-8 animate-fade-in text-[#0F172A]">
      {/* Top Banner Alert if Action Taken */}
      {bannerMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-sm flex items-center justify-between shadow-xs animate-slide-up">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header & Executive Concept */}
      <div className="bg-[#FFFDF9] border border-[#E2DCD0] p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-indigo-600" /> Cross-Service Autonomous Defense
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active Fleet Radar
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0F172A] tracking-tight">
              Software Immune System
            </h2>
            <p className="text-sm text-[#475569] max-w-2xl leading-relaxed">
              When an outage is resolved in one microservice, ORVIN synthesizes an <strong>Architectural Antibody</strong> from the post-mortem and scans your entire organization to preemptively vaccinate sibling services before they fail.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleScanFleet}
              disabled={scanning}
              className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF7F0] hover:bg-[#EFEBE0] text-[#0F172A] text-xs font-bold flex items-center gap-2 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning Fleet...' : 'Scan Fleet Radar'}</span>
            </button>

            <button
              onClick={handlePropagateAll}
              disabled={propagating || isFullyProtected}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                isFullyProtected
                  ? 'bg-emerald-600 text-white cursor-default opacity-90'
                  : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isFullyProtected ? 'Fleet Fully Immunized (100%)' : 'Preemptively Vaccinate Fleet'}</span>
            </button>
          </div>
        </div>

        {/* Global Immunity Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#E2DCD0]">
          {/* Score Gauge */}
          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#CBD5E1]/80 space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Fleet Immunity Index</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-heading ${score === 100 ? 'text-emerald-600' : score > 70 ? 'text-indigo-600' : 'text-amber-600'}`}>
                {score}%
              </span>
              <span className="text-xs text-[#64748B] font-semibold">Protected</span>
            </div>
            <div className="w-full bg-[#E2DCD0] h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-700 ${score === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-indigo-600'}`} 
                style={{ width: `${score}%` }} 
              />
            </div>
          </div>

          {/* Vulnerable Services */}
          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#CBD5E1]/80 space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">At-Risk Microservices</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-heading ${data?.vulnerable_count ? 'text-rose-600' : 'text-emerald-600'}`}>
                {data?.vulnerable_count ?? 0}
              </span>
              <span className="text-xs text-[#64748B] font-semibold">harboring pathogens</span>
            </div>
            <p className="text-[11px] text-[#64748B] pt-1">
              {data?.vulnerable_count ? 'Immediate vaccination required' : 'Zero active vulnerabilities'}
            </p>
          </div>

          {/* Immunized Services */}
          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#CBD5E1]/80 space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Vaccinated / Protected</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-emerald-700">
                {(data?.immunized_count ?? 0) + (data?.healthy_count ?? 0)}
              </span>
              <span className="text-xs text-[#64748B] font-semibold">/ {data?.total_services ?? 6} total</span>
            </div>
            <p className="text-[11px] text-[#64748B] pt-1">Protected by memory gate</p>
          </div>

          {/* Active Antibodies */}
          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#CBD5E1]/80 space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Active Antibodies</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-indigo-700">
                {data?.antibodies?.length ?? 3}
              </span>
              <span className="text-xs text-[#64748B] font-semibold">synthesized</span>
            </div>
            <p className="text-[11px] text-[#64748B] pt-1">Derived from Hindsight post-mortems</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Fleet Services Radar & Active Antibodies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Microservice Fleet Radar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
              Microservice Fleet Radar
            </h3>
            <span className="text-xs text-[#64748B]">
              Refreshed {data?.last_fleet_sync?.split(' ')[1] || 'recently'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.services.map((svc) => {
              const isVuln = svc.immunity_status === 'vulnerable';
              const isImmune = svc.immunity_status === 'immunized';

              return (
                <div 
                  key={svc.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isVuln
                      ? 'bg-rose-50/60 border-rose-300 shadow-xs'
                      : isImmune
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-[#FFFDF9] border-[#E2DCD0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                        {svc.name}
                      </h4>
                      <span className="text-[11px] text-[#64748B]">{svc.runtime}</span>
                    </div>

                    {/* Status Badge */}
                    {isVuln ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> AT RISK
                      </span>
                    ) : isImmune ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> IMMUNIZED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-500" /> HEALTHY
                      </span>
                    )}
                  </div>

                  {/* Pathogen or Antibody Info */}
                  <div className="my-3 text-xs bg-white/70 p-3 rounded-xl border border-slate-200/80 space-y-1">
                    {isVuln ? (
                      <div>
                        <span className="font-bold text-rose-800 flex items-center gap-1">
                          ⚠️ Pathogen Detected:
                        </span>
                        <p className="text-[#334155] text-[11px] leading-snug mt-0.5">
                          {svc.detected_pathogen}
                        </p>
                      </div>
                    ) : isImmune ? (
                      <div>
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          🛡️ Protected by Antibody:
                        </span>
                        <p className="text-[#334155] text-[11px] leading-snug mt-0.5">
                          {svc.matched_antibody_id?.toUpperCase()} (Preemptively Vaccinated)
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#475569]">
                        Zero historical pathogen signatures detected. Clean baseline.
                      </p>
                    )}
                  </div>

                  {/* Actions & Details */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] text-[#64748B] font-mono">{svc.cluster}</span>
                    
                    {isVuln ? (
                      <button
                        onClick={() => handleVaccinateSingleService(svc.id, svc.matched_antibody_id || undefined)}
                        disabled={propagating}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>Deploy Antibody</span>
                      </button>
                    ) : isImmune && svc.active_prs?.length > 0 ? (
                      <button
                        onClick={() => setSelectedServiceForPR(svc)}
                        className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <GitPullRequest className="w-3 h-3 text-emerald-700" />
                        <span>View PR Diff</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Antibodies Registry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
              <Dna className="w-5 h-5 text-indigo-600" />
              Synthesized Antibodies
            </h3>
            <span className="text-xs text-[#64748B] font-semibold">
              {data?.antibodies?.length || 0} Total
            </span>
          </div>

          <div className="space-y-3">
            {data?.antibodies.map((ab) => (
              <div 
                key={ab.id}
                className="bg-[#FFFDF9] border border-[#E2DCD0] p-4 rounded-2xl shadow-2xs space-y-2 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {ab.id.toUpperCase()}
                    </span>
                    <h5 className="font-bold text-xs text-[#0F172A] leading-snug pt-1">
                      {ab.name}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-rose-700 bg-rose-50 border border-rose-200">
                    {ab.target_severity}
                  </span>
                </div>

                <p className="text-[11px] text-[#475569] line-clamp-2">
                  <strong>Pathogen:</strong> {ab.pathogen}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2DCD0] text-[11px]">
                  <span className="text-[#64748B] text-[10px]">
                    Origin: <span className="font-semibold text-[#0F172A]">{ab.origin_service}</span>
                  </span>
                  <button
                    onClick={() => setSelectedAntibodyForPatch(ab)}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  >
                    <span>View Patch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Vaccination PR Diff Viewer */}
      {selectedServiceForPR && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] border border-[#E2DCD0] max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD0]">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-base text-[#0F172A]">
                  Preemptive Vaccination Pull Request
                </h4>
              </div>
              <button 
                onClick={() => setSelectedServiceForPR(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-900">
                  Target Service: <span className="font-mono">{selectedServiceForPR.name}</span>
                </div>
                <div className="text-emerald-800">
                  Branch: <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded">orvin-immune/{selectedServiceForPR.matched_antibody_id?.toLowerCase()}</span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Autonomous Status: VACCINATION_PR_MERGED (Pre-empted outage before deployment)
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-[#0F172A] block mb-1">
                  Synthesized Unified Git Patch Applied:
                </span>
                <pre className="p-4 rounded-xl bg-[#0F172A] text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  {selectedServiceForPR.active_prs?.[0]?.patch || "--- a/config\n+++ b/config\n# Preemptive immunization applied"}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedServiceForPR(null)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Antibody Prevention Patch Viewer */}
      {selectedAntibodyForPatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] border border-[#E2DCD0] max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD0]">
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-base text-[#0F172A]">
                  {selectedAntibodyForPatch.name}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedAntibodyForPatch(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="bg-[#FAF7F0] border border-[#CBD5E1] p-3.5 rounded-xl text-xs space-y-2">
                <div>
                  <span className="font-bold text-[#64748B]">Target Pathogen:</span>
                  <p className="text-[#0F172A] font-semibold mt-0.5">{selectedAntibodyForPatch.pathogen}</p>
                </div>
                <div>
                  <span className="font-bold text-[#64748B]">Prevention Rule:</span>
                  <p className="text-[#0F172A] font-semibold mt-0.5">{selectedAntibodyForPatch.prevention_rule}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-[#0F172A] block mb-1">
                  Vaccination Template Patch:
                </span>
                <pre className="p-4 rounded-xl bg-[#0F172A] text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  {selectedAntibodyForPatch.vaccination_patch}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAntibodyForPatch(null)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
