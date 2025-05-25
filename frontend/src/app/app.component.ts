import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CalendarComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Holiday Calendar</h1>
      </header>
      <main>
        <app-calendar></app-calendar>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #fafafa;
    }

    header {
      background-color: #1976d2;
      color: white;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      margin: 0;
      font-size: 2rem;
    }

    main {
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  title = 'frontend';
}
