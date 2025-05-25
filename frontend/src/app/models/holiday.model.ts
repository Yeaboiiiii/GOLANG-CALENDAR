export interface Holiday {
    date: string;
    name: string;
    type: string;
    country: string;
    description?: string;
}

export interface HolidayResponse {
    holidays: Holiday[];
    country: string;
    period: string;
}

export interface WeekHighlight {
    weekNumber: number;
    highlightType: 'light-green' | 'dark-green' | 'none';
    holidayCount: number;
} 