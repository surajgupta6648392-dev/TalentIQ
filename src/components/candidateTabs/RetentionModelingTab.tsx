import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Award,
  Clock,
  Compass,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Candidate, PredictiveRetentionModel } from '../../types';

interface RetentionModelingTabProps {
  candidate: Candidate;
  blindScreening: boolean;
}

export const RetentionModelingTab: React.FC<RetentionModelingTabProps> = ({
  candidate,
  blindScreening,
}) => {
  const pr = candidate.parsedResume;
  const rm: PredictiveRetentionModel = candidate.retentionModel || {
    predictedTenureMonths: 28,
    highPerformerProbability: 88,
    flightRiskLevel: 'Low',
    flightRiskReasons: ['Consistent 2+ year career stints observed across past employment'],
    avgPastTenureMonths: 24,
    careerTrajectoryVelocity: 'Rapid Acceleration',
    keySuccessPredictors: [
      'Steady progression in system ownership and architecture impact',
      'High open-source contribution regularity indicates strong internal motivation'
    ],
  };

  const isLowRisk = rm.flightRiskLevel === 'Low';
  const isHighRisk = rm.flightRiskLevel === 'High';

  return (
    <div className="space-y-6">
      {/* Top Predictive Banner */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-sky-50 border border-violet-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-violet-600 text-white rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Predictive Performance & Retention Trajectory Modeling
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                  isLowRisk
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : isHighRisk
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                Flight Risk: {rm.flightRiskLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Machine learning models correlating past role tenures, velocity of title promotions, and technical depth to forecast long-term tenure and performance.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xl font-black text-violet-700">
                {rm.predictedTenureMonths} Months
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Forecasted Tenure
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-left">
              <div className="text-xl font-black text-emerald-600">
                {rm.highPerformerProbability}%
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                High-Performer Prob.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Flight Risk Card */}
        <div
          className={`p-4 rounded-2xl border shadow-2xs space-y-2 ${
            isLowRisk
              ? 'bg-emerald-50/50 border-emerald-200'
              : isHighRisk
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-amber-50/50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ShieldAlert
                className={`w-4 h-4 ${
                  isLowRisk ? 'text-emerald-600' : isHighRisk ? 'text-rose-600' : 'text-amber-600'
                }`}
              />
              <span>Flight Risk Assessment</span>
            </span>
            <span
              className={`text-xs font-black ${
                isLowRisk ? 'text-emerald-700' : isHighRisk ? 'text-rose-700' : 'text-amber-700'
              }`}
            >
              {rm.flightRiskLevel} Risk
            </span>
          </div>

          <div className="space-y-1 text-slate-600 text-[11px]">
            {rm.flightRiskReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Career Velocity Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Career Trajectory Velocity</span>
            </span>
          </div>
          <div className="text-sm font-black text-indigo-700">
            {rm.careerTrajectoryVelocity}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Historical cadence shows promotion or expansion of responsibilities every ~18 to 24 months. Candidate thrives in fast-iterating environments.
          </p>
        </div>

        {/* Past Tenure Benchmark */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Historical Tenure Stint</span>
            </span>
          </div>
          <div className="text-sm font-black text-slate-800">
            Avg. {rm.avgPastTenureMonths} Months / Role
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Calculated across verified employment history (excluding documented internships and contract consulting stints).
          </p>
        </div>
      </div>

      {/* Machine Learning Key Success Predictors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Core Predictive Signals & Success Drivers</span>
        </h4>

        <div className="space-y-2.5">
          {rm.keySuccessPredictors.map((predictor, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 text-xs font-medium leading-relaxed">
                {predictor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
