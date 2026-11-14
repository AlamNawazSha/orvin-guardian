"use client";
import React, { useState } from 'react';
import { Database, Search, ShieldCheck, Clock, Sparkles, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface MemoryItem {
  id: string;
  timestamp: string;
  title: string;
  category: string;
  summary: string;
  prevention_rule: string;
  severity: string;
  recall_score?: number;
  source?: string;
  failed_fixes?: string[];
  status?: string;
  superseded_by?: string;
}

interface MemoryBankViewerProps {
  memories: MemoryItem[];
}

export function MemoryBankViewer({ memories }: MemoryBankViewerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [reflecting, setReflecting] = useState(false);
  const [reflectionResult, setReflectionResult] = useState<any>(null);

  const handleReflect = async () => {
    setReflecting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/devops-agent/reflect?category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setReflectionResult(data);
      }
    } catch (e) {
      console.error("Reflection error:", e);
    } finally {
      setReflecting(false);
    }
  };

  const filtered = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                          m.summary.toLowerCase().includes(search.toLowerCase()) ||
                          m.prevention_rule.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full bg-[#FFFDF9] rounded-2xl p-5 border border-[#E8E2D5] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-700" />
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">Episodic Memory Bank & Reflection</h3>
            <p className="text-xs text-[#78716C]">Persistent storage of post-mortems, failure traces, and synthesized prevention rules</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReflect}
            disabled={reflecting}
            className="px-3 py-1.5 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] border border-[#D8B4FE] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Synthesize high-level prevention rules from all retained post-mortems"
          >
            {reflecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Episodic Reflect
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search post-mortems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-purple-600 w-44"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-purple-600"
          >
            <option value="all">All Categories</option>
            <option value="dependency">Dependencies</option>
            <option value="hardware_oom">GPU / OOM</option>
            <option value="secret_drift">Secret Drift</option>
            <option value="schema_migration">DB Migrations</option>
          </select>
        </div>
      </div>

      {/* Reflection Insight Card */}
      {reflectionResult && (
        <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200 space-y-2 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              Episodic Reflection Summary ({reflectionResult.total_incidents_analyzed} Incidents)
            </span>
            <button
              onClick={() => setReflectionResult(null)}
              className="text-xs text-purple-600 hover:text-purple-950 font-bold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-purple-800 leading-relaxed">
            {reflectionResult.reflection_summary}
          </p>
          <div className="pt-2 border-t border-purple-200">
            <div className="text-[11px] font-bold text-purple-950 uppercase tracking-wider mb-1">Synthesized Architectural Rules:</div>
            <ul className="space-y-1 text-xs text-purple-900">
              {reflectionResult.synthesized_rules.map((rule: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 mt-0.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-[#78716C] text-xs">
            No incident memories found matching search filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5] hover:border-purple-300 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-[#78716C] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#A8A29E]" />
                      {item.timestamp}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      [{item.source || 'Persistent Database'}]
                    </span>
                    {item.status === 'superseded' && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        Superseded
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#1C1917]">{item.title}</h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded border border-amber-200">
                    Recall: {Math.round((item.recall_score || 0.95) * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#44403C] leading-relaxed bg-[#FFFDF9] p-2.5 rounded-lg border border-[#E8E2D5]">
                {item.summary}
              </p>

              {item.failed_fixes && item.failed_fixes.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-900 space-y-1">
                  <div className="font-bold text-rose-950 flex items-center gap-1">
                    <span>⚠️ Unsuccessful Remedies (Do Not Repeat):</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-800">
                    {item.failed_fixes.map((ff, idx) => (
                      <li key={idx}>{ff}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" />
                <span><strong className="text-emerald-950">Prevention Rule:</strong> {item.prevention_rule}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
