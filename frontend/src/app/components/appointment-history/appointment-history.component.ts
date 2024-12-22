import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <div class="history-card">
        <div class="header">
          <h2>Appointment History Report</h2>
          <div class="timestamp">Generated: {{generatedTimestamp | date:'medium'}}</div>
        </div>
      
        <div class="stats-container">
          <canvas id="appointmentStats"></canvas>
        </div>

        <div class="summary">
          <p>Total Appointments: {{appointments.length}}</p>
          <p>Scheduled: {{getStatusCount('scheduled')}}</p>
          <p>Canceled: {{getStatusCount('canceled')}}</p>
        </div>

        <div class="table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let appointment of appointments">
                <td>{{appointment.appointment_time | date:'medium'}}</td>
                <td>{{appointment.doctor?.name}}</td>
                <td>{{appointment.doctor?.specialization || 'General Practice'}}</td>
                <td>
                  <span class="status" [class.status-scheduled]="appointment.status === 'scheduled'"
                                     [class.status-canceled]="appointment.status === 'canceled'">
                    {{appointment.status}}
                  </span>
                </td>
                <td>{{appointment.notes || '-'}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="actions">
          <button class="back-btn" (click)="goBack()">Back to Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
    }

    .history-card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .timestamp {
      color: #666;
      font-size: 0.9em;
    }

    .stats-container {
      margin: 20px 0;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      height: 300px;
    }

    h2 {
      margin: 0;
      color: #333;
    }

    .table-container {
      overflow-x: auto;
      margin: 20px 0;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    .history-table th,
    .history-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .history-table th {
      background-color: #f8f9fa;
      font-weight: 500;
      color: #444;
    }

    .history-table tr:hover {
      background-color: #f8f9fa;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      background: #f0f0f0;
      font-size: 0.9em;
    }

    .status-scheduled {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-canceled {
      background: #ffebee;
      color: #c62828;
    }

    .summary {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      gap: 30px;
    }

    .summary p {
      margin: 0;
      color: #555;
    }

    .actions {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .back-btn {
      padding: 10px 20px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background: #1976D2;
    }
  `]
})
export class AppointmentHistoryComponent implements OnInit {
  appointments: any[] = [];
  generatedTimestamp: Date = new Date();

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { appointments: any[] };
    
    if (state?.appointments) {
      this.appointments = state.appointments;
    }
  }

  ngOnInit() {
    this.createAppointmentChart();
  }

  getStatusCount(status: string): number {
    return this.appointments.filter(apt => apt.status === status).length;
  }

  createAppointmentChart() {
    // Create data points for the line graph
    const appointmentsByDate = new Map<string, { scheduled: number; canceled: number }>();
    
    // Sort appointments by date
    const sortedAppointments = [...this.appointments].sort(
      (a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()
    );

    // Initialize counters
    let scheduledCount = 0;
    let canceledCount = 0;

    // Process appointments to create cumulative data
    sortedAppointments.forEach(apt => {
      const date = new Date(apt.appointment_time).toLocaleDateString();
      
      if (apt.status === 'scheduled') scheduledCount++;
      if (apt.status === 'canceled') canceledCount++;

      appointmentsByDate.set(date, {
        scheduled: scheduledCount,
        canceled: canceledCount
      });
    });

    // Prepare data for the chart
    const labels = Array.from(appointmentsByDate.keys());
    const scheduledData = Array.from(appointmentsByDate.values()).map(v => v.scheduled);
    const canceledData = Array.from(appointmentsByDate.values()).map(v => v.canceled);

    const ctx = document.getElementById('appointmentStats') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Scheduled Appointments',
            data: scheduledData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Canceled Appointments',
            data: canceledData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Appointment History Over Time',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/patient-dashboard']);
  }
} 