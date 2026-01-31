import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast, ToastContainer } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Listen for real-time database changes
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.type || 'info',
            title: payload.new.title,
            message: payload.new.message,
            timestamp: payload.new.created_at,
            read: false,
            action_url: payload.new.action_url,
            action_text: payload.new.action_text,
            metadata: payload.new.metadata,
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
          
          // Show toast notification
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: newNotification.action_text || 'View Details',
              onClick: () => {
                if (newNotification.action_url) {
                  window.open(newNotification.action_url, '_blank');
                }
              },
            } : undefined,
          });
        }
      );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast
    toast(notification.title, {
      description: notification.message,
      action: notification.action_url ? {
        label: notification.action_text || 'View Details',
        onClick: () => {
          if (notification.action_url) {
            window.open(notification.action_url, '_blank');
          }
        },
      } : undefined,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

// Utility functions for creating notifications
export const createNotificationHelpers = () => {
  return {
    assessmentCompleted: (candidateEmail: string, score: number, assessmentId: string) => ({
      type: 'success' as const,
      title: 'Assessment Completed',
      message: `${candidateEmail} completed the assessment with a score of ${score}/10.`,
      action_url: `/admin/results/${assessmentId}`,
      action_text: 'View Results',
      metadata: { candidateEmail, score, assessmentId },
    }),
    
    assessmentScheduled: (candidateEmail: string, scheduledTime: string, assessmentId: string) => ({
      type: 'info' as const,
      title: 'Assessment Scheduled',
      message: `Assessment scheduled for ${candidateEmail} at ${new Date(scheduledTime).toLocaleString()}.`,
      action_url: `/admin/scheduler`,
      action_text: 'View Schedule',
      template: 'assessment_scheduled',
    }),
    
    assessmentReminder: (candidateEmail: string, hoursUntil: number) => ({
      type: 'warning' as const,
      title: 'Assessment Reminder',
      message: `Reminder: Your assessment is scheduled in ${hoursUntil} hours.`,
      action_url: `/interview/${assessmentId}`,
      action_text: 'Start Assessment',
      template: 'assessment_reminder',
    }),
    
    bulkOperationCompleted: (operation: string, count: number) => ({
      type: 'success' as const,
      title: 'Bulk Operation Completed',
      message: `${operation} completed successfully for ${count} items.`,
      template: 'bulk_operation',
    }),
    
    systemAlert: (message: string, type: 'error' | 'warning' | 'info' = 'info') => ({
      type,
      title: 'System Alert',
      message,
      template: 'system_alert',
    }),
  };
};

export default NotificationProvider;
