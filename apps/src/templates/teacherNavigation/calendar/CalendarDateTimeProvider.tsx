import React from 'react';

interface CalendarDateTimeProviderProps {
  children: React.ReactNode;
}

const CalendarDateTimeProvider: React.FC<CalendarDateTimeProviderProps> = ({
  children,
}) => <>{children}</>;

export default CalendarDateTimeProvider;
