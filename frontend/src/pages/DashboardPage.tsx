import { useState } from 'react';
import { motion } from 'framer-motion';
import { StatsCards } from '../components/StatsCards';
import { TaskInput } from '../components/TaskInput';
import { TaskFilters } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';
import { useTasksQuery } from '../hooks/useTasks';
import { useSocket } from '../hooks/useSocket';

export const DashboardPage = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { data: tasks = [], isLoading } = useTasksQuery();

  // Connect WebSocket for real-time updates
  useSocket();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-dark-400">Manage your tasks efficiently</p>
      </motion.div>

      <StatsCards />
      <TaskInput />

      <div className="flex items-center justify-between">
        <TaskFilters filter={filter} onFilterChange={setFilter} />
        <p className="text-sm text-dark-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <TaskList tasks={tasks} filter={filter} />
      )}
    </div>
  );
};
