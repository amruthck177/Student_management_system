import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Brain,
  Lightbulb,
} from 'lucide-react';

const AIInsightWidget = ({ studentId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const res = await api.get(`/grades/${studentId}/ai-insights`);
        if (res.data.success) {
          setInsights(res.data.insights);
        }
      } catch (err) {
        console.error('[AI Analysis Error]', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, [studentId]);

  if (loading) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 animate-pulse text-xs text-slate-400 flex items-center justify-center gap-2">
        <Brain className="w-4 h-4 text-indigo-400 animate-spin" />
        <span>Running Server-Side AI Predictive Analysis...</span>
      </div>
    );
  }

  if (!insights) return null;

  const isHighRisk = insights.riskLevel === 'HIGH';
  const isModerateRisk = insights.riskLevel === 'MODERATE';

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 space-y-4 relative overflow-hidden shadow-lg shadow-indigo-500/5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>AI Academic Performance Advisor</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                Predictive AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Correlated analysis across attendance participation, internal marks, and exam trends
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border font-mono">
          <span className="text-slate-400 text-[10px]">Confidence:</span>
          <span className="text-indigo-400">{insights.confidenceScore}%</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Projected Final Score</span>
          <div className="text-xl font-bold text-indigo-400 font-mono">
            {insights.projectedCGPA?.toFixed(2)} CGPA
          </div>
          <p className="text-[10px] text-slate-500">Based on historical trajectory</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Academic Standing</span>
          <div
            className={`text-sm font-bold truncate ${
              isHighRisk
                ? 'text-rose-400'
                : isModerateRisk
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {insights.riskLabel}
          </div>
          <p className="text-[10px] text-slate-500">Backlog probability: {insights.riskScore}%</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Subject Focus Needed</span>
          <div className="text-xs font-bold text-amber-300 truncate">
            {insights.weakestSubject}
          </div>
          <p className="text-[10px] text-slate-500">Strongest: {insights.strongestSubject}</p>
        </div>
      </div>

      {/* AI Action Recommendations */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Personalized Study Roadmaps & Interventions</span>
        </div>

        <div className="space-y-1.5">
          {insights.aiRecommendations?.map((rec, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightWidget;
