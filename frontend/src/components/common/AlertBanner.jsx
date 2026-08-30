import React from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

const AlertBanner = ({ type = 'warning', title, message, action }) => {
  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          icon: XCircle,
          iconColor: 'text-rose-400',
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
        };
      case 'info':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
          icon: Info,
          iconColor: 'text-sky-400',
        };
      case 'warning':
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-xl border ${style.bg} flex items-start justify-between gap-3 text-xs shadow-sm`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 ${style.iconColor} mt-0.5`} />
        <div>
          {title && <h4 className="font-semibold text-slate-100 mb-0.5">{title}</h4>}
          <p className="text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default AlertBanner;
