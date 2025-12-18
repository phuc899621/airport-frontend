import { useEffect, useState } from "react";
import styles from "./AirportList.module.css";
import "../PageContent.css";

interface Airport {
  maSanBay: string;
  tenSanBay: string;
  quocGia: string;
}

interface FlightFormData {
  sanBayDi: string;
  sanBayDen: string;
  ngayGio: string;
  giaVe: string;
  soGheTrong: string;
}

export const AirportList = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showFlightModal, setShowFlightModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    tenSanBay: "",
    quocGia: "",
  });
  const [flightFormData, setFlightFormData] = useState<FlightFormData>({
    sanBayDi: "",
    sanBayDen: "",
    ngayGio: "",
    giaVe: "",
    soGheTrong: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAirports = async () => {
    try {
      const response = await fetch("http://localhost:3000/san-bay");
      const data = await response.json();
      
      if (data.success) {
        setAirports(data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu sân bay:", err);
      setError("Không thể tải danh sách sân bay");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Sân bay</h2>
        <p className="page-subtitle">Danh sách và thông tin các sân bay</p>
        <div className="content-placeholder">
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách sân bay...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Sân bay</h2>
        <p className="page-subtitle">Danh sách và thông tin các sân bay</p>
        <div className="content-placeholder">
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddAirport = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ tenSanBay: "", quocGia: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/san-bay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Thêm sân bay thành công!");
        handleCloseModal();
        fetchAirports();
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi thêm sân bay:", err);
      alert("Không thể thêm sân bay");
    } finally {
      setSubmitting(false);
    }
  };

  // Flight modal handlers
  const handleAddFlight = () => {
    setShowFlightModal(true);
  };

  const handleCloseFlightModal = () => {
    setShowFlightModal(false);
    setFlightFormData({
      sanBayDi: "",
      sanBayDen: "",
      ngayGio: "",
      giaVe: "",
      soGheTrong: "",
    });
  };

  const handleFlightInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFlightFormData({
      ...flightFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/chuyen-bay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...flightFormData,
          giaVe: parseFloat(flightFormData.giaVe),
          soGheTrong: parseInt(flightFormData.soGheTrong),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Tạo chuyến bay thành công!");
        handleCloseFlightModal();
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi tạo chuyến bay:", err);
      alert("Không thể tạo chuyến bay");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className={styles.headerSection}>
        <div>
          <h2 className="page-title">Quản lý Sân bay</h2>
          <p className="page-subtitle">Danh sách và thông tin các sân bay</p>
        </div>
        <div className={styles.buttonGroup}>
         
          <button className={styles.addButton} onClick={handleAddAirport}>
            ➕ Thêm sân bay
          </button>
        </div>
      </div>
      <div className="content-placeholder">
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT   </th>
                <th>Tên Sân Bay</th>
                <th>Quốc Gia</th>
              </tr>
            </thead>
            <tbody>
              {airports.length > 0 ? (
                airports.map((airport, index) => (
                  <tr key={airport.maSanBay}>
                    <td>{index + 1}</td>
                    <td className={styles.airportName}>{airport.tenSanBay}</td>
                    <td>
                      <span className={styles.country}>{airport.quocGia}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.noData}>
                    <span className={styles.noDataIcon}>✈️</span>
                    <p>Không có sân bay nào trong hệ thống</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.footer}>
            <p className={styles.totalCount}>
              Tổng số: <strong>{airports.length}</strong> sân bay
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✈️ Thêm Sân Bay Mới</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="tenSanBay">Tên Sân Bay</label>
                <input
                  type="text"
                  id="tenSanBay"
                  name="tenSanBay"
                  value={formData.tenSanBay}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Sân bay Quốc tế Nội Bài"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="quocGia">Quốc Gia</label>
                <input
                  type="text"
                  id="quocGia"
                  name="quocGia"
                  value={formData.quocGia}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Việt Nam"
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Đang thêm..." : "Thêm Sân Bay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFlightModal && (
        <div className={styles.modalOverlay} onClick={handleCloseFlightModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✈️ Tạo Chuyến Bay Mới</h3>
              <button className={styles.closeButton} onClick={handleCloseFlightModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleFlightSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="sanBayDi">Sân Bay Đi</label>
                <select
                  id="sanBayDi"
                  name="sanBayDi"
                  value={flightFormData.sanBayDi}
                  onChange={handleFlightInputChange}
                  required
                  className={styles.selectInput}
                >
                  <option value="">Chọn sân bay đi</option>
                  {airports.map((airport) => (
                    <option key={airport.maSanBay} value={airport.maSanBay}>
                      {airport.tenSanBay} ({airport.maSanBay})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="sanBayDen">Sân Bay Đến</label>
                <select
                  id="sanBayDen"
                  name="sanBayDen"
                  value={flightFormData.sanBayDen}
                  onChange={handleFlightInputChange}
                  required
                  className={styles.selectInput}
                >
                  <option value="">Chọn sân bay đến</option>
                  {airports.map((airport) => (
                    <option key={airport.maSanBay} value={airport.maSanBay}>
                      {airport.tenSanBay} ({airport.maSanBay})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ngayGio">Ngày Giờ Khởi Hành</label>
                <input
                  type="datetime-local"
                  id="ngayGio"
                  name="ngayGio"
                  value={flightFormData.ngayGio}
                  onChange={handleFlightInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="giaVe">Giá Vé (VNĐ)</label>
                <input
                  type="number"
                  id="giaVe"
                  name="giaVe"
                  value={flightFormData.giaVe}
                  onChange={handleFlightInputChange}
                  placeholder="Ví dụ: 2500000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="soGheTrong">Số Ghế Trống</label>
                <input
                  type="number"
                  id="soGheTrong"
                  name="soGheTrong"
                  value={flightFormData.soGheTrong}
                  onChange={handleFlightInputChange}
                  placeholder="Ví dụ: 180"
                  min="1"
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseFlightModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Đang tạo..." : "Tạo Chuyến Bay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
