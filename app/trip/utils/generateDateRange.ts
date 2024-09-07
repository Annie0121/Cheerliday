import dayjs  from 'dayjs';

export const generateDateRange = (start: dayjs.Dayjs|null, end: dayjs.Dayjs|null) => {
    const dateRange = [];
    let currentDate = dayjs(start);
    const endDate = dayjs(end);
  
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      dateRange.push({ date: currentDate.format('M月D日'),startTime:"8:00", attractions: [] });
      currentDate = currentDate.add(1, 'day');
    }
  
    return dateRange;
};