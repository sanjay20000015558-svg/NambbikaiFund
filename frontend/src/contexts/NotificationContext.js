import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead } from '../redux/slices/notificationSlice';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  const markOneAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const markAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markOneAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
