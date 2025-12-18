import { useState, useEffect } from 'react';
import styles from './TicketsPage.module.css';
import './PageContent.css';
import BookingModal from './BookingModal';

interface BookingData {
  maVe: string;
  maChuyenBay: string;
  tenHangVe: string;
  giaTien: number;
  trangThai: string;
  maHanhKhach: string;
  cmnd: string;
  dienThoai: string;
  ngayVe: string;
}

function TicketsPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<BookingData[]>([]);
  const [completedBookings, setCompletedBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/ve");
      const data = await response.json();

      if (data.success) {
        // Phân chia vé theo trạng thái
        const pending = data.data.filter((ticket: BookingData) => ticket.trangThai === 'da_dat');
        const completed = data.data.filter((ticket: BookingData) => ticket.trangThai === 'da_mua');
        
        setPendingBookings(pending);
        setCompletedBookings(completed);
        setError("");
      } else {
        setError(data.message || "Không thể tải danh sách vé");
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu vé:", err);
      setError("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handlePayment = async (booking: BookingData) => {
    try {
      const response = await fetch(`http://localhost:3000/ve/${booking.maVe}/thanh-toan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Thanh toán thành công!");
        // Reload dữ liệu để cập nhật trạng thái
        await fetchTickets();
      } else {
        alert("Lỗi thanh toán: " + (data.message || "Không xác định"));
        console.error("Error from server:", data);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Không thể xử lý thanh toán: " + err);
    }
  };

  const handleCancel = async (maVe: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy vé này?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/ve/${maVe}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Đã hủy vé thành công!");
        // Reload dữ liệu để cập nhật danh sách
        await fetchTickets();
      } else {
        alert("Lỗi hủy vé: " + (data.message || "Không xác định"));
        console.error("Error from server:", data);
      }
    } catch (err) {
      console.error("Error canceling ticket:", err);
      alert("Không thể hủy vé: " + err);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Vé</h2>
        <p className="page-subtitle">Đặt vé và quản lý booking</p>
        <div className="content-placeholder">
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách vé...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Vé</h2>
        <p className="page-subtitle">Đặt vé và quản lý booking</p>
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
          <h2 className="page-title">Quản lý Vé</h2>
          <p className="page-subtitle">Đặt vé và quản lý booking</p>
        </div>
        <button className={styles.addButton} onClick={handleOpenBookingModal}>
          + Đặt vé
        </button>
      </div>

      <div className={styles.sectionsContainer}>
        {/* Vé chờ thanh toán */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>🎫 Vé chờ thanh toán</h3>
            <span className={styles.badge}>{pendingBookings.length}</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã vé</th>
                  <th>Mã CB</th>
                  <th>Mã HK</th>
                  <th>CMND</th>
                  <th>SĐT</th>
                  <th>Hạng vé</th>
                  <th>Giá vé</th>
                  <th>Ngày đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((booking) => (
                    <tr key={booking.maVe}>
                      <td>
                        <span className={styles.ticketCode}>
                          {booking.maVe}
                        </span>
                      </td>
                      <td>{booking.maChuyenBay}</td>
                      <td>{booking.maHanhKhach}</td>
                      <td>{booking.cmnd}</td>
                      <td>{booking.dienThoai}</td>
                      <td>
                        <span className={styles.ticketClass}>
                          {booking.tenHangVe}
                        </span>
                      </td>
                      <td className={styles.price}>
                        {formatCurrency(booking.giaTien)}
                      </td>
                      <td>{formatDate(booking.ngayVe)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.payButton}
                            onClick={() => handlePayment(booking)}
                          >
                            Thanh toán
                          </button>
                          <button 
                            className={styles.cancelButton}
                            onClick={() => handleCancel(booking.maVe)}
                          >
                            Hủy
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className={styles.noData}>
                      <span className={styles.noDataIcon}>🎫</span>
                      <p>Không có vé nào chờ thanh toán</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vé đã thanh toán */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>✅ Vé đã thanh toán</h3>
            <span className={styles.badge}>{completedBookings.length}</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã Vé</th>
                  <th>Mã CB</th>
                  <th>Mã HK</th>
                  <th>CMND</th>
                  <th>SĐT</th>
                  <th>Hạng vé</th>
                  <th>Giá vé</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.length > 0 ? (
                  completedBookings.map((booking) => (
                    <tr key={booking.maVe}>
                      <td>
                        <span className={styles.ticketCode}>
                          {booking.maVe}
                        </span>
                      </td>
                      <td>{booking.maChuyenBay}</td>
                      <td>{booking.maHanhKhach}</td>
                      <td>{booking.cmnd}</td>
                      <td>{booking.dienThoai}</td>
                      <td>
                        <span className={styles.ticketClass}>
                          {booking.tenHangVe}
                        </span>
                      </td>
                      <td className={styles.price}>
                        {formatCurrency(booking.giaTien)}
                      </td>
                      <td>{formatDate(booking.ngayVe)}</td>
                      <td>
                        <span className={styles.statusPaid}>Đã thanh toán</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className={styles.noData}>
                      <span className={styles.noDataIcon}>✅</span>
                      <p>Không có vé nào đã thanh toán</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={handleCloseBookingModal}
        onSuccess={fetchTickets}
      />
    </div>
  )
}

export default TicketsPage
