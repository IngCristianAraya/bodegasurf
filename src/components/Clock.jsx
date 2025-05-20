import { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date) => {
    return {
      hours: date.getHours().toString().padStart(2, '0'),
      minutes: date.getMinutes().toString().padStart(2, '0'),
      seconds: date.getSeconds().toString().padStart(2, '0'),
      ampm: date.getHours() >= 12 ? 'PM' : 'AM'
    };
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-PE', options);
  };

  const { hours, minutes, seconds, ampm } = formatTime(time);
  const dateString = formatDate(time);

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-xl font-mono font-medium text-gray-700">
          {hours}:{minutes} <span className="text-orange-500">{ampm}</span>
        </div>
        <div className="text-xs text-gray-500">
          {dateString}
        </div>
      </div>
      <div className="h-8 w-px bg-gray-200"></div>
    </div>
  );
};

export default Clock;
