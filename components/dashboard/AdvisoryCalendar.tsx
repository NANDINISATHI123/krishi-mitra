import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { getTasksForMonth, getUserTaskStatuses, updateTaskStatus } from '../../services/calendarService.js';
import { addActionToQueue } from '../../services/offlineService.js';
import { CalendarTask } from '../../types.js';
import { CheckCircleIcon, PendingIcon } from '../Icons.js';
import SkeletonLoader from '../SkeletonLoader.js';

const AdvisoryCalendar = () => {
  const { t, user, language, isOnline, refreshData, refreshPendingCount } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [statuses, setStatuses] = useState<{ [taskId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const [taskData, statusData] = await Promise.all([
      getTasksForMonth(month),
      getUserTaskStatuses(user.id),
    ]);
    setTasks(taskData);
    const statusMap = statusData.reduce((acc, status) => {
      acc[status.task_id] = status.is_done;
      return acc;
    }, {} as { [taskId: string]: boolean });
    setStatuses(statusMap);
    setPendingUpdates(new Set()); // Clear pending state on successful fetch
    setLoading(false);
  }, [user, currentDate]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshData]);

  const handleToggleStatus = async (taskId: string) => {
    if (!user) return;
    const currentStatus = statuses[taskId] || false;
    const newStatus = !currentStatus;
    
    setStatuses(prev => ({ ...prev, [taskId]: newStatus }));

    if (isOnline) {
      try {
        await updateTaskStatus(user.id, taskId, newStatus);
      } catch (error) {
        // Revert UI on error
        setStatuses(prev => ({ ...prev, [taskId]: currentStatus }));
        alert("Failed to update status. Please try again.");
      }
    } else {
      setPendingUpdates(prev => new Set(prev).add(taskId));
      await addActionToQueue({
        service: 'calendar',
        method: 'updateTaskStatus',
        payload: { userId: user.id, taskId, isDone: newStatus }
      });
      refreshPendingCount(); // Instantly update the pending count in the header
    }
  };
  
  const tasksForCurrentMonth = tasks.filter(task => task.month === currentDate.getMonth() + 1);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-primary dark:text-primary-light">{t('advisory_calendar')}</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Tasks for {currentDate.toLocaleString(language, { month: 'long', year: 'numeric' })}</h2>
        {loading ? <SkeletonLoader className="h-48" /> : (
          <div className="space-y-4">
            {tasksForCurrentMonth.length > 0 ? tasksForCurrentMonth.map(task => (
              <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg border dark:border-gray-700">
                <div className="font-bold text-center">
                  <p className="text-2xl text-primary dark:text-primary-light">{task.day_of_month}</p>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{language === 'te' ? task.title_te : task.title}</h3>
                  <p className="text-base text-gray-600 dark:text-gray-400">{language === 'te' ? task.description_te : task.description}</p>
                </div>
                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className={`p-2 rounded-full transition-colors ${
                    statuses[task.id] 
                    ? 'text-green-500 bg-green-100 dark:bg-green-900/50' 
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {pendingUpdates.has(task.id) ? (
                    <span title={t('pending_sync_status')}>
                        <PendingIcon className="w-8 h-8 text-yellow-500" />
                    </span>
                  ) : (
                    <span title={statuses[task.id] ? 'Mark as not done' : 'Mark as done'}>
                        <CheckCircleIcon className="w-8 h-8" />
                    </span>
                  )}
                </button>
              </div>
            )) : <p className="text-gray-500">No tasks for this month.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisoryCalendar;