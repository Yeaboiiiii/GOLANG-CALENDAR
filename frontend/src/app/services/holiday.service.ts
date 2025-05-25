import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayResponse } from '../models/holiday.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHolidays(country: string, year: number, month?: number, quarter?: number): Observable<HolidayResponse> {
    let url = `${this.apiUrl}/holidays?country=${country}&year=${year}`;
    
    if (month) {
      url += `&month=${month}`;
    }
    
    if (quarter) {
      url += `&quarter=${quarter}`;
    }

    return this.http.get<HolidayResponse>(url);
  }

  calculateWeekHighlighting(holidays: HolidayResponse): Map<number, string> {
    const weekHighlights = new Map<number, string>();
    const holidaysPerWeek = new Map<string, number>();
    const seenDates = new Set<String>();

    // First pass: collect all holidays and their weeks
    holidays.holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip if we've already processed this date or if it's a weekend
      const dayOfWeek = date.getDay();
      if (seenDates.has(dateStr) || dayOfWeek === 0 || dayOfWeek === 6) return;
      seenDates.add(dateStr);

      // Get the week number for this holiday
      const weekNumber = this.getWeekNumber(date);
      const year = date.getFullYear();
      const weekKey = `${year}-${weekNumber}`;
      
      // Only count weekday holidays
      const currentCount = holidaysPerWeek.get(weekKey) || 0;
      holidaysPerWeek.set(weekKey, currentCount + 1);
    });

    // Second pass: apply highlighting
    holidaysPerWeek.forEach((count, weekKey) => {
      const weekNumber = parseInt(weekKey.split('-')[1]);
      if (count >= 2) {
        weekHighlights.set(weekNumber, 'dark-green');
      } else if (count === 1) {
        weekHighlights.set(weekNumber, 'light-green');
      }
    });

    return weekHighlights;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
} 