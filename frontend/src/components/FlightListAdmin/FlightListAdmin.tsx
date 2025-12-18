import { useEffect, useState } from "react";
import styles from "./FlightListAdmin.module.css";
import "../PageContent.css";

interface SanBayTrungGian {
  maChuyenBay: string;
  maSanBay: string;
  tenSanBay: string;
  thoiGianDung: number;
  thuTuDung: number;
  ghiChu: string;
}

interface HangVeChuyenBay {
  maHangVe: string;
  tenHangVe: string;
  heSoGia: number;
  tongSoGhe: number;
  giaVeTheoHang: number;
  soGheConLai: number;
}

interface Flight {
  maChuyenBay: string;
  tenSanBayDi: string;
  tenSanBayDen: string;
  ngayGio: string;
  thoiGianBay?: number;
  giaVeCoBan?: number;
  tongSoGheDaDat?: number;
  tongSoGheConLai?: number;
  tongSoGhe?: number;
  maSanBayDi?: string;
  maSanBayDen?: string;
  thoiGianDi?: string;
  thoiGianDen?: string;
  sanBayTrungGian?: SanBayTrungGian[];
  hangVeChuyenBay?: HangVeChuyenBay[];
}

interface Airport {
  maSanBay: string;
  tenSanBay: string;
  quocGia: string;
}

interface FlightFormData {
  maSanBayDi: string;
  maSanBayDen: string;
  ngayGio: string;
  thoiGianBay: string;
  giaVeCoBan: string;
  sanBayTrungGians: Array<{
    maSanBay: string;
    thuTuDung: number;
    thoiGianDung: number;
    ghiChu: string;
  }>;
  hangVes: Array<{
    maHangVe: string;
    tongSoGhe: number;
  }>;
}

const FlightListAdmin = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [flightFormData, setFlightFormData] = useState<FlightFormData>({
    maSanBayDi: "",
    maSanBayDen: "",
    ngayGio: "",
    thoiGianBay: "",
    giaVeCoBan: "",
    sanBayTrungGians: [],
    hangVes: [
      { maHangVe: "HV001", tongSoGhe: 10 }
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightsRes, airportsRes] = await Promise.all([
          fetch("http://localhost:3000/chuyen-bay"),
          fetch("http://localhost:3000/san-bay")
        ]);
        
        const flightsData = await flightsRes.json();
        const airportsData = await airportsRes.json();
        
        if (flightsData.success) {
          setFlights(flightsData.data);
        } else {
          setError(flightsData.message || "Không thể tải danh sách chuyến bay");
        }
        
        if (airportsData.success) {
          setAirports(airportsData.data);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeFlights = flights.filter((flight) => {
    const flightDate = new Date(flight.ngayGio);
    return flightDate >= today;
  });

  const completedFlights = flights.filter((flight) => {
    const flightDate = new Date(flight.ngayGio);
    return flightDate < today;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleViewDetail = async (flightId: string) => {
  setDetailLoading(true);
  setDetailError("");
  setShowDetailModal(true);

  try {
    const response = await fetch(`http://localhost:3000/chuyen-bay/${flightId}`);
    const data = await response.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      setSelectedFlight(data.data[0]); // ✅ LẤY PHẦN TỬ ĐẦU
    } else {
      setDetailError("Không tìm thấy thông tin chuyến bay");
    }
  } catch (err) {
    console.error("Lỗi lấy chi tiết chuyến bay:", err);
    setDetailError("Không thể kết nối đến server");
  } finally {
    setDetailLoading(false);
  }
};

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFlight(null);
    setDetailError("");
    setDetailLoading(false);
  };

  // Create flight handlers
  const handleCreateFlight = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFlightFormData({
      maSanBayDi: "",
      maSanBayDen: "",
      ngayGio: "",
      thoiGianBay: "",
      giaVeCoBan: "",
      sanBayTrungGians: [],
      hangVes: [
        { maHangVe: "HV001", tongSoGhe: 10 }
      ],
    });
  };

  const handleFlightInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFlightFormData({
      ...flightFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Sân bay trung gian handlers
  const addSanBayTrungGian = () => {
    setFlightFormData({
      ...flightFormData,
      sanBayTrungGians: [
        ...flightFormData.sanBayTrungGians,
        {
          maSanBay: "",
          thuTuDung: flightFormData.sanBayTrungGians.length + 1,
          thoiGianDung: 0,
          ghiChu: "",
        },
      ],
    });
  };

  const removeSanBayTrungGian = (index: number) => {
    const newSanBayTrungGians = flightFormData.sanBayTrungGians.filter((_, i) => i !== index);
    // Cập nhật lại thứ tự dừng
    const updatedSanBayTrungGians = newSanBayTrungGians.map((item, i) => ({
      ...item,
      thuTuDung: i + 1,
    }));
    
    setFlightFormData({
      ...flightFormData,
      sanBayTrungGians: updatedSanBayTrungGians,
    });
  };

  const updateSanBayTrungGian = (index: number, field: string, value: string | number) => {
    const updatedSanBayTrungGians = flightFormData.sanBayTrungGians.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });

    setFlightFormData({
      ...flightFormData,
      sanBayTrungGians: updatedSanBayTrungGians,
    });
  };

  const handleCreateFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requestData = {
        maSanBayDi: flightFormData.maSanBayDi,
        maSanBayDen: flightFormData.maSanBayDen,
        ngayGio: flightFormData.ngayGio,
        thoiGianBay: parseInt(flightFormData.thoiGianBay),
        giaVeCoBan: parseFloat(flightFormData.giaVeCoBan),
        sanBayTrungGians: flightFormData.sanBayTrungGians,
        hangVes: flightFormData.hangVes,
      };

      const response = await fetch("http://localhost:3000/chuyen-bay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Tạo chuyến bay thành công!");
        handleCloseCreateModal();
        // Refresh flights list
        const flightsRes = await fetch("http://localhost:3000/chuyen-bay");
        const flightsData = await flightsRes.json();
        if (flightsData.success) {
          setFlights(flightsData.data);
        }
      } else {
        alert(data.error.detail);
      }
    } catch (err) {
      console.error("Lỗi tạo chuyến bay:", err);
      alert("Không thể tạo chuyến bay");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };



  if (loading) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Chuyến bay</h2>
        <p className="page-subtitle">Danh sách và quản lý các chuyến bay</p>
        <div className="content-placeholder">
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách chuyến bay...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Chuyến bay</h2>
        <p className="page-subtitle">Danh sách và quản lý các chuyến bay</p>
        <div className="content-placeholder">
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="page-content">
      <div className={styles.headerSection}>
        <div>
          <h2 className="page-title">Quản lý Chuyến bay</h2>
          <p className="page-subtitle">Danh sách và quản lý các chuyến bay</p>
        </div>
        <button className={styles.addButton} onClick={handleCreateFlight}>
          ✈️ Tạo chuyến bay
        </button>
      </div>

      <div className={styles.sectionsContainer}>
        {/* Chuyến bay đang hoạt động */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>✈️ Chuyến bay đang hoạt động</h3>
            <span className={styles.badge}>{activeFlights.length}</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã chuyến bay</th>
                  <th>Sân bay đi</th>
                  <th>Sân bay đến</th>
                  <th>Ngày bay</th>
                  <th>Còn lại</th>
                  <th>Đã đặt</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {activeFlights.length > 0 ? (
                  activeFlights.map((flight, index) => (
                    <tr key={flight.maChuyenBay}>
                      <td>{index + 1}</td>
                      <td>
                        <span className={styles.flightCode}>
                          {flight.maChuyenBay}
                        </span>
                      </td>
                      <td className={styles.airportName}>
                        {flight.tenSanBayDi}
                      </td>
                      <td className={styles.airportName}>
                        {flight.tenSanBayDen}
                      </td>
                      <td>{formatDate(flight.ngayGio)}</td>
                      <td className={styles.airportName}>
                        {flight.tongSoGheConLai}
                      </td>
                      <td className={styles.airportName}>
                        {flight.tongSoGheDaDat}
                      </td>

                      <td>
                        <button
                          className={styles.detailButton}
                          onClick={() =>
                            handleViewDetail(flight.maChuyenBay)
                          }
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.noData}>
                      <span className={styles.noDataIcon}>✈️</span>
                      <p>Không có chuyến bay nào đang hoạt động</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chuyến bay đã kết thúc */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>📋 Chuyến bay đã kết thúc</h3>
            <span className={styles.badge}>{completedFlights.length}</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã chuyến bay</th>
                  <th>Sân bay đi</th>
                  <th>Sân bay đến</th>
                  <th>Ngày bay</th>
                  <th>Còn lại</th>
                  <th>Đã đặt</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {completedFlights.length > 0 ? (
                  completedFlights.map((flight, index) => (
                    <tr key={flight.maChuyenBay}>
                      <td>{index + 1}</td>
                      <td>
                        <span className={styles.flightCode}>
                          {flight.maChuyenBay}
                        </span>
                      </td>
                      <td className={styles.airportName}>
                        {flight.tenSanBayDi}
                      </td>
                      <td className={styles.airportName}>
                        {flight.tenSanBayDen}
                      </td>
                      <td>{formatDate(flight.ngayGio)}</td>
                      <td className={styles.airportName}>
                        {flight.tongSoGheConLai}
                      </td>
                      <td className={styles.airportName}>
                        {flight.tongSoGheDaDat}
                      </td>
                      <td>
                        <button
                          className={styles.detailButton}
                          onClick={() =>
                            handleViewDetail(flight.maChuyenBay)
                          }
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.noData}>
                      <span className={styles.noDataIcon}>📋</span>
                      <p>Không có chuyến bay nào đã kết thúc</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Chi tiết chuyến bay */}
      {showDetailModal && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailModal}>
          <div
            className={styles.detailModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết chuyến bay</h3>
              <button
                className={styles.closeButton}
                onClick={handleCloseDetailModal}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {detailLoading && (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Đang tải chi tiết chuyến bay...</p>
                </div>
              )}

              {detailError && (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <p>{detailError}</p>
                </div>
              )}

              {!detailLoading && !detailError && selectedFlight && (
                <>
                  {/* Form thông tin chuyến bay */}
                  <div className={styles.formSection}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Mã chuyến bay</label>
                        <input
                          type="text"
                          value={selectedFlight.maChuyenBay}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Thời gian bay (phút)</label>
                        <input
                          type="text"
                          value={selectedFlight.thoiGianBay ? `${selectedFlight.thoiGianBay} phút` : 'Chưa có thông tin'}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Tên sân bay đi</label>
                        <input
                          type="text"
                          value={selectedFlight.tenSanBayDi}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Tên sân bay đến</label>
                        <input
                          type="text"
                          value={selectedFlight.tenSanBayDen}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Giá vé cơ bản</label>
                        <input
                          type="text"
                          value={selectedFlight.giaVeCoBan ? formatCurrency(selectedFlight.giaVeCoBan) : 'Chưa có thông tin'}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Tổng số ghế</label>
                        <input
                          type="text"
                          value={selectedFlight.tongSoGhe || 'Chưa có thông tin'}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Số ghế đã đặt</label>
                        <input
                          type="text"
                          value={selectedFlight.tongSoGheDaDat || 0}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Số ghế còn lại</label>
                        <input
                          type="text"
                          value={selectedFlight.tongSoGheConLai || 0}
                          readOnly
                          className={styles.inputField}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bảng sân bay trung gian */}
                  <div className={styles.tableSection}>
                    <h4>Sân bay trung gian</h4>
                    <div className={styles.tableWrapper}>
                      <table className={styles.detailTable}>
                        <thead>
                          <tr>
                            <th>Thứ tự dừng</th>
                            <th>MaSB</th>
                            <th>Tên Sân Bay</th>
                            <th>Thời gian dừng</th>
                            <th>Ghi Chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFlight.sanBayTrungGian && selectedFlight.sanBayTrungGian.length > 0 ? (
                            selectedFlight.sanBayTrungGian.map((stop, index) => (
                              <tr key={index}>
                                <td>{stop.thuTuDung}</td>
                                <td>{stop.maSanBay}</td>
                                <td>{stop.tenSanBay}</td>
                                <td>{stop.thoiGianDung} phút</td>
                                <td>{stop.ghiChu || '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className={styles.noData}>
                                <span className={styles.noDataIcon}>✈️</span>
                                <p>Không có sân bay trung gian</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bảng hạng vé */}
                  <div className={styles.tableSection}>
                    <h4>Hạng vé</h4>
                    <div className={styles.tableWrapper}>
                      <table className={styles.detailTable}>
                        <thead>
                          <tr>
                            <th>Mã hạng vé</th>
                            <th>Tên hạng vé</th>
                            <th>Hệ số giá</th>
                            <th>Tổng số ghế</th>
                            <th>Giá vé theo hạng</th>
                            <th>Số ghế còn lại</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFlight.hangVeChuyenBay && selectedFlight.hangVeChuyenBay.length > 0 ? (
                            selectedFlight.hangVeChuyenBay.map((hangVe, index) => (
                              <tr key={index}>
                                <td>{hangVe.maHangVe}</td>
                                <td>{hangVe.tenHangVe}</td>
                                <td>{hangVe.heSoGia}</td>
                                <td>{hangVe.tongSoGhe}</td>
                                <td>{formatCurrency(hangVe.giaVeTheoHang)}</td>
                                <td>{hangVe.soGheConLai}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className={styles.noData}>
                                <span className={styles.noDataIcon}>🎫</span>
                                <p>Không có thông tin hạng vé</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo chuyến bay */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={handleCloseCreateModal}>
          <div
            className={styles.createModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>✈️ Tạo Chuyến Bay Mới</h3>
              <button
                className={styles.closeButton}
                onClick={handleCloseCreateModal}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateFlightSubmit} className={styles.createForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="maSanBayDi">Sân Bay Đi</label>
                  <select
                    id="maSanBayDi"
                    name="maSanBayDi"
                    value={flightFormData.maSanBayDi}
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
                  <label htmlFor="maSanBayDen">Sân Bay Đến</label>
                  <select
                    id="maSanBayDen"
                    name="maSanBayDen"
                    value={flightFormData.maSanBayDen}
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
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ngayGio">Ngày Giờ Khởi Hành</label>
                  <input
                    type="datetime-local"
                    id="ngayGio"
                    name="ngayGio"
                    value={flightFormData.ngayGio}
                    onChange={handleFlightInputChange}
                    required
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="thoiGianBay">Thời Gian Bay (phút)</label>
                  <input
                    type="number"
                    id="thoiGianBay"
                    name="thoiGianBay"
                    value={flightFormData.thoiGianBay}
                    onChange={handleFlightInputChange}
                    placeholder="Ví dụ: 40"
                    min="1"
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="giaVeCoBan">Giá Vé Cơ Bản (VNĐ)</label>
                  <input
                    type="number"
                    id="giaVeCoBan"
                    name="giaVeCoBan"
                    value={flightFormData.giaVeCoBan}
                    onChange={handleFlightInputChange}
                    placeholder="Ví dụ: 1500000"
                    min="0"
                    step="1000"
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              {/* Sân bay trung gian */}
              <div className={styles.sectionDivider}>
                <div className={styles.sectionHeader}>
                  <h4>Sân bay trung gian</h4>
                  <button
                    type="button"
                    className={styles.addStopButton}
                    onClick={addSanBayTrungGian}
                  >
                    ➕ Thêm sân bay
                  </button>
                </div>
                
                {flightFormData.sanBayTrungGians.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Chưa có sân bay trung gian nào. Nhấn "Thêm sân bay" để thêm.</p>
                  </div>
                ) : (
                  <div className={styles.stopsList}>
                    {flightFormData.sanBayTrungGians.map((stop, index) => (
                      <div key={index} className={styles.stopItem}>
                        <div className={styles.stopHeader}>
                          <span className={styles.stopNumber}>Điểm dừng {stop.thuTuDung}</span>
                          <button
                            type="button"
                            className={styles.removeStopButton}
                            onClick={() => removeSanBayTrungGian(index)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className={styles.stopForm}>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label>Sân bay</label>
                              <select
                                value={stop.maSanBay}
                                onChange={(e) => updateSanBayTrungGian(index, 'maSanBay', e.target.value)}
                                required
                                className={styles.selectInput}
                              >
                                <option value="">Chọn sân bay</option>
                                {airports
                                  .filter(airport => 
                                    airport.maSanBay !== flightFormData.maSanBayDi && 
                                    airport.maSanBay !== flightFormData.maSanBayDen
                                  )
                                  .map((airport) => (
                                    <option key={airport.maSanBay} value={airport.maSanBay}>
                                      {airport.tenSanBay} ({airport.maSanBay})
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label>Thời gian dừng (phút)</label>
                              <input
                                type="number"
                                value={stop.thoiGianDung}
                                onChange={(e) => updateSanBayTrungGian(index, 'thoiGianDung', parseInt(e.target.value) || 0)}
                                placeholder="Ví dụ: 20"
                                min="0"
                                required
                                className={styles.inputField}
                              />
                            </div>
                          </div>
                          <div className={styles.formGroup}>
                            <label>Ghi chú</label>
                            <input
                              type="text"
                              value={stop.ghiChu}
                              onChange={(e) => updateSanBayTrungGian(index, 'ghiChu', e.target.value)}
                              placeholder="Ghi chú về điểm dừng (tùy chọn)"
                              className={styles.inputField}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseCreateModal}
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

export default FlightListAdmin;
