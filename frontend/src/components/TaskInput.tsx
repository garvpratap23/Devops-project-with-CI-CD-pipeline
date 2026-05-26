import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreateTask } from '../hooks/useTasks';

export const TaskInput = () => {
  const [title, setTitle] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({ title: title.trim() });
    setTitle('');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <input
        id="task-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-field flex-1"
        placeholder="What needs to be done?"
        maxLength={255}
        aria-label="New task title"
      />
      <motion.button
        type="submit"
        disabled={!title.trim() || createTask.isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary disabled:opacity-50 whitespace-nowrap"
        id="add-task-btn"
      >
        {createTask.isPending ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          '+ Add Task'
        )}
      </motion.button>
    </motion.form>
  );
};
