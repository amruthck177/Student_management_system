import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', badge }) => {
  const getColorScheme = (c) => {
    switch (c) {
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          badge: 'bg-rose-500/10 text-rose-400',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-400',
        };
      case 'sky':
        return {
          iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          badge: 'bg-sky-500/10 text-sky-400',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          badge: 'bg-purple-500/10 text-purple-400',
        };
      default:
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          badge: 'bg-indigo-500/10 text-indigo-400',
        };
    }
  };

  const scheme = getColorScheme(color);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all duration-300 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.iconBg} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${scheme.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
