import { useState, useEffect } from 'react';
import styles from './ReportsPage.module.css';
import './PageContent.css';

interface MonthlyRevenue {
  thang: number;
  soChuyenBay: number;
  doanhThu: number;
  tiLeBanVe: number;
}

interface FlightReport {
  stt: number;
  maChuyenBay: string;
  soVeDaBan: number;
  doanhThu: number;
  tiLeBanVe: number;
}

function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedReportYear, setSelectedReportYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");


  // Mock data - thay thế bằng API calls thực tế
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([])

  const [flightData, setFlightData] = useState<FlightReport[]>([]);

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + ' triệu VNĐ';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };
  const handleMonthChange = async (month: number) => {
    setSelectedMonth(month);

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/bao-cao/thang/${selectedReportYear}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();
      if (month !== 0) {
      // LẤY ĐÚNG THEO KEY THÁNG
      setFlightData(data.data[String(month)] || []);
    } else {
      // LẤY TẤT CẢ THÁNG
      const allFlights = Object.values(data.data).flat();
      setFlightData(allFlights);
    }
    } finally {
      setLoading(false);
    }
  };
  const handleReportYear = async (year: number) => {
    setSelectedReportYear(year);

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/bao-cao/thang/${year}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();

      if (selectedMonth !== 0) {
      // LẤY ĐÚNG THEO KEY THÁNG
      setFlightData(data.data[String(selectedMonth)] || []);
    } else {
      // LẤY TẤT CẢ THÁNG
      const allFlights = Object.values(data.data).flat();
      setFlightData(allFlights);
    }

    } finally {
      setLoading(false);
    }
  };
  // const setSelectedReportYear = async (year: number) => {
  //   setSelectedReportYear(year);
  //   // Gọi API để lấy dữ liệu theo năm
  //   // fetchFlightReport(selectedFlight, selectedMonth, year);
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const response = await fetch(`http://localhost:3000/bao-cao?nam=${year}`, {
  //       headers: {

  //         "Content-Type": "application/json",
  //       },
  //     });
  //   }
  //   catch (err) {
  //   }
  // };

  const handleYearChange = async (year: number) => {

    setSelectedYear(year ? year : new Date().getFullYear());
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://localhost:3000/bao-cao/nam/${year}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setMonthlyData(data.data);
      } else {
        setError("Không thể tải dữ liệu báo cáo doanh thu");
      }
    } catch (err) {
      setError("Không thể tải dữ liệu báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
    // Gọi API để lấy dữ liệu theo năm
    // fetchMonthlyRevenue(year);
  };
  useEffect(() => {
    handleYearChange(new Date().getFullYear());
    handleMonthChange(new Date().getMonth() + 1);
    handleReportYear(new Date().getFullYear());
  }, []);

  const handleFilterChange = () => {
    // Gọi API để lấy dữ liệu báo cáo chuyến bay theo filter
    // fetchFlightReport(selectedFlight, selectedMonth, selectedReportYear);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  months.unshift(0); // Thêm tùy chọn "Tất cả" với giá trị 0\


  return (
    <div className="page-content">
      <h2 className="page-title">Báo cáo & Thống kê</h2>
      <p className="page-subtitle">Phân tích dữ liệu và báo cáo doanh thu</p>

      <div className={styles.reportsContainer}>
        {/* Báo cáo doanh thu năm */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>📊 Báo cáo doanh thu năm</h3>
            <div className={styles.yearFilter}>
              <label>Năm:</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className={styles.yearSelect}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Số chuyến bay</th>
                  <th>Doanh thu</th>
                  <th>Tỉ lệ</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item) => (
                  <tr key={item.thang}>
                    <td className={styles.monthCell}>
                      <span className={styles.monthBadge}>Tháng {item.thang}</span>
                    </td>
                    <td className={styles.numberCell}>
                      {formatNumber(item.soChuyenBay)}
                    </td>
                    <td className={styles.revenueCell}>
                      {formatCurrency(item.doanhThu)}
                    </td>
                    <td className={styles.percentCell}>
                      <span className={styles.percentBadge}>{item.tiLeBanVe}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Báo cáo chuyến bay  */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>✈️ Báo cáo chuyến bay</h3>
            <div className={styles.flightFilters}>

              <div className={styles.filterGroup}>
                <label>Tháng:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className={styles.filterSelect}
                >
                  {months.map(month => (
                    <option key={month} value={month}>Tháng {month}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Năm:</label>
                <select
                  value={selectedReportYear}
                  onChange={(e) => handleReportYear(Number(e.target.value))}
                  className={styles.filterSelect}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Chuyến bay</th>
                  <th>Số vé</th>
                  <th>Doanh thu</th>
                  <th>Tỉ lệ</th>
                </tr>
              </thead>
              <tbody>
                {flightData.map((item, index) => (
                  <tr key={item.stt}>
                    <td>{index + 1}</td>
                   
                    <td className={styles.flightCell}>
                      <span className={styles.flightCode}>{item.maChuyenBay}</span>
                    </td>
                    <td className={styles.numberCell}>
                      {formatNumber(item.soVeDaBan)}
                    </td>
                    <td className={styles.revenueCell}>
                      {formatCurrency(item.doanhThu)}
                    </td>
                    <td className={styles.percentCell}>
                      <span className={styles.percentBadge}>{item.tiLeBanVe}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
