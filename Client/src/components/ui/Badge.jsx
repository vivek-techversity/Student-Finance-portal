import { statusClasses, regionClasses } from '../../utils/formatters';


export default function Badge({ variant = 'custom', value, className = '' }) {
  let cls = '';

  if (variant === 'status') {
    cls = statusClasses[value] || 'bg-slate-100 text-slate-600 border border-slate-200';
  } else if (variant === 'region') {
    cls = regionClasses(value);
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold
        whitespace-nowrap ${cls} ${className}`}
    >
      {value}
    </span>
  );
}