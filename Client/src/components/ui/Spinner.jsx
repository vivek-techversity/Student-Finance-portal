
export default function Spinner({ size = 'md', color = 'indigo' }) {
  const sizes  = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' };
  const colors = {
    indigo: 'border-indigo-500 border-t-transparent',
    white:  'border-white border-t-transparent',
    slate:  'border-slate-400 border-t-transparent',
  };
  return (
    <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`} />
  );
}