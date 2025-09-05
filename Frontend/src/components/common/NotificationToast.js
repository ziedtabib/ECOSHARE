import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X,
  Bell
} from 'lucide-react';

const NotificationToast = ({ 
  notifications, 
  onRemove, 
  position = 'top-right',
  maxNotifications = 5 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxNotifications));
  }, [notifications, maxNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2`}>
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`max-w-sm w-full ${getBackgroundColor(notification.type)} border rounded-lg shadow-lg overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <h4 className={`text-sm font-medium ${getTextColor(notification.type)} mb-1`}>
                      {notification.title}
                    </h4>
                  )}
                  <p className={`text-sm ${getTextColor(notification.type)} opacity-90`}>
                    {notification.message}
                  </p>
                  {notification.action && (
                    <div className="mt-3">
                      <button
                        onClick={notification.action.onClick}
                        className={`text-sm font-medium ${
                          notification.type === 'success' ? 'text-green-700 hover:text-green-800' :
                          notification.type === 'error' ? 'text-red-700 hover:text-red-800' :
                          notification.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                          notification.type === 'info' ? 'text-blue-700 hover:text-blue-800' :
                          'text-gray-700 hover:text-gray-800'
                        } transition-colors duration-200`}
                      >
                        {notification.action.label}
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemove(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Barre de progression pour les notifications avec durée */}
            {notification.duration && (
              <motion.div
                className={`h-1 ${
                  notification.type === 'success' ? 'bg-green-600' :
                  notification.type === 'error' ? 'bg-red-600' :
                  notification.type === 'warning' ? 'bg-yellow-600' :
                  notification.type === 'info' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: notification.duration / 1000, ease: 'linear' }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook pour gérer les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove après la durée spécifiée
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 7000, // Plus long pour les erreurs
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default NotificationToast;
