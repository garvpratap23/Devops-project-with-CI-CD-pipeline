import { AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
}

export const TaskList = ({ tasks, filter }: TaskListProps) => {
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">{filter === 'completed' ? '🎉' : '📝'}</p>
        <p className="text-dark-400 text-lg">
          {filter === 'completed' ? 'No completed tasks yet' : filter === 'active' ? 'All tasks completed!' : 'No tasks yet. Create one above!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="Task list">
      <AnimatePresence mode="popLayout">
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </div>
  );
};
