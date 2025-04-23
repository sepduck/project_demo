import { AfterViewInit, Component } from '@angular/core';
import Chart, {
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
  ArcElement
} from 'chart.js/auto';

// Đăng ký các thành phần cần thiết
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.createBarChart();
    this.createPieChart();
    this.createHeartbeatChart();
  }

  createBarChart(): void {
    new Chart('myChart', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createPieChart(): void {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['Trực tiếp', 'Xã hội', 'Giới thiệu'],
        datasets: [{
          data: [30, 50, 20],
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
        }
      }
    });
  }
  createHeartbeatChart(): void {
    new Chart('heartbeatChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Heartbeat',
          data: [0, 10000, 5000, 15000, 10000, 20000, 15000, 25000, 20000, 30000, 25000, 35000, 30000],
          borderColor: '#4e73df',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: 'linear'
        },
        plugins: {
          legend: {
            display: false
          },
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            min: 0,
            max: 40000,
            ticks: {
              stepSize: 10000
            },
            grid: {
              display: true
            }
          }
        }
      },
      plugins: [{
        id: 'whiteBackground',
        beforeDraw: (chart) => {
          const ctx = chart.canvas.getContext('2d');
          if (ctx) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          }
        }
      }]

    });
  }

}