import { useState, useEffect } from 'react';

const Notification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleNotification = (e) => {
      setNotification({
        message: e.detail.message,
        type: e.detail.type
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };
    
    window.addEventListener('showNotification', handleNotification);
    
    return () => {
      window.removeEventListener('showNotification', handleNotification);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
      notification.type === 'success' ? 'bg-green-100 text-green-800' :
      notification.type === 'error' ? 'bg-red-100 text-red-800' :
      'bg-blue-100 text-blue-800'
    }`}>
      <div className="flex items-center">
        <span>{notification.message}</span>
        <button 
          onClick={() => setNotification(null)}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;

// To use this, dispatch an event from anywhere in your app:
// window.dispatchEvent(new CustomEvent('showNotification', {
//   detail: {
//     message: 'Your message here',
//     type: 'success' // or 'error', 'info'
//   }
// }));