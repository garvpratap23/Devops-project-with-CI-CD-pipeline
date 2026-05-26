import { motion } from 'framer-motion';
import { useTaskStatsQuery } from '../hooks/useTasks';

const statCards = [
  { label: 'Total Tasks', key: 'total' as const, icon: '📋', gradient: 'from-primary-600/20 to-primary-800/20', border: 'border-primary-600/30' },
  { label: 'Completed', key: 'completed' as const, icon: '✅', gradient: 'from-green-600/20 to-green-800/20', border: 'border-green-600/30' },
  { label: 'Pending', key: 'pending' as const, icon: '⏳', gradient: 'from-accent-600/20 to-accent-800/20', border: 'border-accent-600/30' },
];

export const StatsCards = () => {
  const { data: stats } = useTaskStatsQuery();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`card-hover bg-gradient-to-br ${card.gradient} border ${card.border}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">{card.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.[card.key] ?? 0}</p>
            </div>
            <span className="text-3xl" role="img" aria-label={card.label}>{card.icon}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
