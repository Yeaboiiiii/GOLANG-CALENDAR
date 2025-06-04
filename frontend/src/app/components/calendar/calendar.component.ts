import { Component, OnInit } from '@angular/core';
import { HolidayService } from '../../services/holiday.service';
import { CountryService } from '../../services/country.service';
import { Holiday, HolidayResponse } from '../../models/holiday.model';
import { Country } from '../../models/country.model';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule
  ]
})
export class CalendarComponent implements OnInit {
  countries: Country[] = [];
  selectedCountry: string = 'IN';
  selectedView: 'monthly' | 'quarterly'|'holiday' = 'holiday';
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;
  currentQuarter: number = Math.floor((new Date().getMonth() / 3)) + 1;
  holidays: Holiday[] = [];
  weekHighlights: Map<number, string> = new Map();
  availableYears: number[] = [];
  
  // Calendar data
  weeks: any[][] = [];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  quarterlyMonths: any[] = [];

  constructor(
    private holidayService: HolidayService,
    private countryService: CountryService
  ) { }

  ngOnInit() {
    this.generateAvailableYears();
    this.loadCountries();
    this.loadHolidays();
  }

  generateAvailableYears() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    this.availableYears = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }

  loadCountries() {
    this.countryService.getCountries().subscribe(
      response => {
        this.countries = response.countries;
      },
      error => {
        console.error('Error loading countries:', error);
      }
    );
  }

  loadHolidays() {
    console.log("fdf");
    if (this.selectedView === 'monthly'|| this.selectedView==='holiday') {
      // Get holidays for current month
      this.holidayService.getHolidays(
        this.selectedCountry,
        this.currentYear,
        this.currentMonth
      ).subscribe(
        response => {
          this.holidays = response.holidays;
          
          // Always get both previous and next month holidays to handle week boundaries
          const promises = [];
          
          // Get previous month
          const prevMonth = this.currentMonth === 1 ? 12 : this.currentMonth - 1;
          const prevYear = this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear;
          promises.push(
            this.holidayService.getHolidays(
              this.selectedCountry,
              prevYear,
              prevMonth
            ).toPromise()
          );
          
          // Get next month
          const nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
          const nextYear = this.currentMonth === 12 ? this.currentYear + 1 : this.currentYear;
          promises.push(
            this.holidayService.getHolidays(
              this.selectedCountry,
              nextYear,
              nextMonth
            ).toPromise()
          );
          
          // Wait for both requests to complete
          Promise.all(promises)
            .then(responses => {
              const [prevMonthResponse, nextMonthResponse] = responses;
              if (prevMonthResponse && nextMonthResponse) {
                // Combine all holidays
                this.holidays = [
                  ...prevMonthResponse.holidays,
                  ...this.holidays,
                  ...nextMonthResponse.holidays
                ];
                
                // Calculate week highlighting with all holidays
                this.weekHighlights = this.holidayService.calculateWeekHighlighting({
                  holidays: this.holidays,
                  country: this.selectedCountry,
                  period: response.period
                });
                this.generateCalendar();
              }
            })
            .catch(error => {
              console.error('Error loading adjacent month holidays:', error);
              // Still proceed with current month
              this.weekHighlights = this.holidayService.calculateWeekHighlighting(response);
              this.generateCalendar();
            });
        },
        error => {
          console.error('Error loading holidays:', error);
        }
      );
    } else {
      // For quarterly view
      this.holidayService.getHolidays(
        this.selectedCountry,
        this.currentYear,
        undefined,
        this.currentQuarter
      ).subscribe(
        response => {
          this.holidays = response.holidays;
          const promises = [];
          
          // Get previous quarter's last month for week boundary
          const prevQuarter = this.currentQuarter === 1 ? 4 : this.currentQuarter - 1;
          const prevYear = this.currentQuarter === 1 ? this.currentYear - 1 : this.currentYear;
          const prevQuarterLastMonth = prevQuarter * 3;
          
          promises.push(
            this.holidayService.getHolidays(
              this.selectedCountry,
              prevYear,
              prevQuarterLastMonth
            ).toPromise()
          );
          
          // Get next quarter's first month for week boundary
          const nextQuarter = this.currentQuarter === 4 ? 1 : this.currentQuarter + 1;
          const nextYear = this.currentQuarter === 4 ? this.currentYear + 1 : this.currentYear;
          const nextQuarterFirstMonth = ((nextQuarter - 1) * 3) + 1;
          
          promises.push(
            this.holidayService.getHolidays(
              this.selectedCountry,
              nextYear,
              nextQuarterFirstMonth
            ).toPromise()
          );
          
          // Wait for both requests to complete
          Promise.all(promises)
            .then(responses => {
              const [prevMonthResponse, nextMonthResponse] = responses;
              if (prevMonthResponse && nextMonthResponse) {
                // Combine all holidays
                this.holidays = [
                  ...prevMonthResponse.holidays,
                  ...this.holidays,
                  ...nextMonthResponse.holidays
                ];
                
                // Calculate week highlighting with all holidays
                this.weekHighlights = this.holidayService.calculateWeekHighlighting({
                  holidays: this.holidays,
                  country: this.selectedCountry,
                  period: response.period
                });
                this.generateQuarterlyCalendar();
              }
            })
            .catch(error => {
              console.error('Error loading adjacent month holidays:', error);
              // Still proceed with current quarter
              this.weekHighlights = this.holidayService.calculateWeekHighlighting(response);
              this.generateQuarterlyCalendar();
            });
        },
        error => {
          console.error('Error loading holidays:', error);
        }
      );
    }
  }

  onCountryChange() {
    this.loadHolidays();
  }

  onViewChange() {
    this.loadHolidays();
  }

  onYearChange() {
    this.loadHolidays();
  }

  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadHolidays();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadHolidays();
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    
    this.weeks = [];
    let week: any[] = [];
    
    // Add empty cells for days before the first of the month
    // Convert Sunday (0) to 6, and other days to day-1 to make Monday (1) -> 0, Tuesday (2) -> 1, etc.
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    for (let i = 0; i < firstDayIndex; i++) {
      week.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      const weekNumber = this.getWeekNumber(date);
      
      // Adjust weekend check for Monday-based week
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      week.push({
        day,
        isWeekend: isWeekend,
        highlight: this.weekHighlights.get(weekNumber) || 'none',
        holidays: this.getHolidaysForDate(date)
      });
      
      // Adjust week break to happen after Sunday
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }
    
    // Add empty cells for remaining days
    while (week.length < 7) {
      week.push(null);
    }
    if (week.length > 0) {
      this.weeks.push(week);
    }
  }

  generateQuarterlyCalendar() {
    this.quarterlyMonths = [];
    this.currentQuarter = Math.floor((this.currentMonth - 1) / 3) + 1;
    const startMonth = (this.currentQuarter - 1) * 3 + 1;
    
    for (let i = 0; i < 3; i++) {
      const month = startMonth + i;
      let targetMonth = month;
      let targetYear = this.currentYear;
      
      if (month > 12) {
        targetMonth = month - 12;
        targetYear = this.currentYear + 1;
      }
      
      const firstDay = new Date(targetYear, targetMonth - 1, 1);
      const lastDay = new Date(targetYear, targetMonth, 0);
      const daysInMonth = lastDay.getDate();
      
      let weeks: any[] = [];
      let week: any[] = [];
      
      // Convert Sunday (0) to 6, and other days to day-1
      let firstDayIndex = firstDay.getDay();
      firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
      
      for (let j = 0; j < firstDayIndex; j++) {
        week.push(null);
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth - 1, day);
        const weekNumber = this.getWeekNumber(date);
        
        // Adjust weekend check for Monday-based week
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        week.push({
          day,
          isWeekend: isWeekend,
          highlight: this.weekHighlights.get(weekNumber) || 'none',
          holidays: this.getHolidaysForDate(date)
        });
        
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      
      while (week.length < 7) {
        week.push(null);
      }
      if (week.length > 0) {
        weeks.push(week);
      }
      
      this.quarterlyMonths.push({
        month: targetMonth,
        year: targetYear,
        weeks: weeks
      });
    }
  }

  // Update month selection to also update quarterly view
  setMonth(month: number) {
    this.currentMonth = month;
    this.currentQuarter = Math.floor((month - 1) / 3) + 1;
    this.loadHolidays();
  }

  previousQuarter() {
    if (this.currentQuarter === 1) {
      this.currentQuarter = 4;
      this.currentYear--;
    } else {
      this.currentQuarter--;
    }
    this.currentMonth = ((this.currentQuarter - 1) * 3) + 1;
    this.loadHolidays();
  }

  nextQuarter() {
    if (this.currentQuarter === 4) {
      this.currentQuarter = 1;
      this.currentYear++;
    } else {
      this.currentQuarter++;
    }
    this.currentMonth = ((this.currentQuarter - 1) * 3) + 1;
    this.loadHolidays();
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private getHolidaysForDate(date: Date): Holiday[] {
    // Format the date in YYYY-MM-DD format without timezone conversion
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return this.holidays.filter(h => h.date === dateString);
  }
} 