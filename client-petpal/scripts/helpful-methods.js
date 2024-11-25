import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export const formatDate = (date) => {
    if (isToday(date)) {
        return `Today ${format(date, 'HH:mm:ss')}`;
    } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'HH:mm:ss')}`;
    } else if (isThisWeek(date)) {
        return `${format(date, 'EEEE')} ${format(date, 'HH:mm:ss')}`;
    } else {
        return format(date, 'dd-MM-yyyy HH:mm:ss');
    }
}