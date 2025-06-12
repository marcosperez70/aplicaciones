
import React, { useEffect } from 'react';
import { ToastType } from '../types';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseStyle = "fixed top-20 right-5 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 ease-in-out z-[200]";
  const typeStyles: Record<ToastType, string> = {
    [ToastType.SUCCESS]: "bg-green-500",
    [ToastType.ERROR]: "bg-red-500",
    [ToastType.INFO]: "bg-blue-500",
    [ToastType.WARNING]: "bg-yellow-500 text-black"
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type] || typeStyles[ToastType.INFO]}`}>
      {message}
      <button onClick={onDismiss} className="ml-4 font-bold text-lg leading-none">&times;</button>
    </div>
  );
};

export default Toast;
