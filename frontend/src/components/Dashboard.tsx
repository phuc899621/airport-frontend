import './Dashboard.css'
import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface MonthlyRevenue {
  thang: number;
  soChuyenBay: string;
  doanhThu: number;
  tiLeBanVe: string;
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalAirports: 0,
    totalPassengers: 0,
  })
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch thống kê cơ bản
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [flightsRes, airportsRes, passengersRes] = await Promise.all([
          fetch('http://localhost:3000/chuyen-bay?count_only=true'),
          fetch('http://localhost:3000/san-bay?count_only=true'),
          fetch('http://localhost:3000/hanh-khach?count_only=true')
        ])
        
        const flights = await flightsRes.json();
        const airports = await airportsRes.json();
        const passengers = await passengersRes.json();

        setStats({
          totalFlights: flights.data?.length || 0,
          totalAirports: airports.data?.length || 0,
          totalPassengers: passengers.data?.length || 0
        })
      } catch(error) {
        console.error("Lỗi khi fetch thống kê: ", error)
      }
    }
    fetchStats()
  }, [])

  // Fetch dữ liệu doanh thu theo năm
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/bao-cao/nam/${selectedYear}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setRevenueData(result.data)
        } else {
          setRevenueData([])
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu doanh thu:", error)
        setRevenueData([])
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [selectedYear])

  return (
    <div className="dashboard-content">
      <h2 className="page-title">Tổng quan</h2>
      <p className="page-subtitle">Theo dõi hoạt động và thống kê hệ thống</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">✈️</div>
          <div className="stat-details">
            <p className="stat-label">Tổng chuyến bay</p>
            <h3 className="stat-value">{stats.totalFlights}</h3>
            <span className="stat-unit">chuyến</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏢</div>
          <div className="stat-details">
            <p className="stat-label">Tổng sân bay</p>
            <h3 className="stat-value">{stats.totalAirports}</h3>
            <span className="stat-unit">sân bay</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">👥</div>
          <div className="stat-details">
            <p className="stat-label">Hành khách</p>
            <h3 className="stat-value">{stats.totalPassengers}</h3>
            <span className="stat-unit">người</span>
          </div>
        </div>

      </div>


      <div className="chart-section">
        <div className="chart-header">
          <h3 className="section-heading">Doanh thu chuyến bay theo tháng</h3>
          <div className="year-filter">
            <label htmlFor="year-select">Năm: </label>
            <select 
              id="year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="chart-container">
          {loading ? (
            <div className="chart-loading">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : revenueData.length > 0 ? (
            <Line
              data={{
                labels: revenueData.map(item => `Tháng ${item.thang}`),
                datasets: [
                  {
                    label: `Doanh thu năm ${selectedYear} (VNĐ)`,
                    data: revenueData.map(item => item.doanhThu),
                    borderColor: '#5b6ce8',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#5b6ce8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      font: {
                        size: 14,
                        family: "'Inter', sans-serif",
                      },
                      padding: 15,
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                    },
                    bodyFont: {
                      size: 13,
                    },
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('vi-VN').format(context.parsed.y) + ' VNĐ';
                        }
                        return label;
                      }
                    }
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return new Intl.NumberFormat('vi-VN', {
                          notation: 'compact',
                          compactDisplay: 'short'
                        }).format(value as number);
                      },
                      font: {
                        size: 12,
                      },
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="chart-placeholder">
              <p>📊 Không có dữ liệu doanh thu cho năm {selectedYear}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
