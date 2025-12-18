import { useEffect, useState } from "react";
import styles from "./PassengerList.module.css";
import "../PageContent.css";

interface Passenger {
  maHanhKhach: string;
  hoTen: string;
  dienThoai: string;
  cmnd: string;
  email: string;
}

export const PassengerList = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    hoTen: "",
    cmnd: "",
    dienThoai: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchPassengers = async () => {
    try {
      const response = await fetch("http://localhost:3000/hanh-khach");
      const data = await response.json();
      
      if (data.success) {
        setPassengers(data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu khách hàng:", err);
      setError("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleDelete = async (maHanhKhach: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      return;
    }

    setDeleting(maHanhKhach);
    try {
      const response = await fetch(`http://localhost:3000/hanh-khach/${maHanhKhach}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Xóa khách hàng thành công!");
        fetchPassengers();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      console.error("Lỗi xóa khách hàng:", err);
      alert("Không thể xóa khách hàng");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddPassenger = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ hoTen: "", cmnd: "", dienThoai: "", email: "" });
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
    console.log("Submitting form data:", formData);

    try {
      const response = await fetch("http://localhost:3000/hanh-khach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Thêm khách hàng thành công!");
        handleCloseModal();
        fetchPassengers();
      } else {
        alert("Lỗi: " + (data.message || data.error.detail || "Không xác định"));
        console.error("Error from server:", data.error);
      }
    } catch (err) {
      
      
      console.log("Form data at error time:", formData);
      alert("Không thể thêm khách hàng: " + err);
      
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Khách hàng</h2>
        <p className="page-subtitle">Danh sách và thông tin khách hàng</p>
        <div className="content-placeholder">
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách khách hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <h2 className="page-title">Quản lý Khách hàng</h2>
        <p className="page-subtitle">Danh sách và thông tin khách hàng</p>
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
          <h2 className="page-title">Quản lý Khách hàng</h2>
          <p className="page-subtitle">Danh sách và thông tin khách hàng</p>
        </div>
        <button className={styles.addButton} onClick={handleAddPassenger}>
          ➕ Thêm Khách Hàng
        </button>
      </div>
      <div className="content-placeholder">
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Khách Hàng</th>
                <th>Họ Tên</th>
                <th>Điện Thoại</th>
                <th>Email</th>
                <th>CMND</th>
              
              </tr>
            </thead>
            <tbody>
              {passengers.length > 0 ? (
                passengers.map((passenger, index) => (
                  <tr key={passenger.maHanhKhach}>
                    <td>{index + 1}</td>
                    <td>
                      <span className={styles.passengerId}>
                        {passenger.maHanhKhach}
                      </span>
                    </td>
                    <td className={styles.passengerName}>{passenger.hoTen}</td>
                    <td>
                      <span className={styles.phone}>{passenger.dienThoai}</span>
                    </td>
                    <td>
                      <span className={styles.email}>{passenger.email}</span>
                    </td>
                    <td>
                      <span className={styles.cmnd}>{passenger.cmnd}</span>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.noData}>
                    <span className={styles.noDataIcon}>👥</span>
                    <p>Không có khách hàng nào trong hệ thống</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.footer}>
            <p className={styles.totalCount}>
              Tổng số: <strong>{passengers.length}</strong> khách hàng
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>👤 Thêm Khách Hàng Mới</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="hoTen">Họ Tên</label>
                <input
                  type="text"
                  id="hoTen"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cmnd">CMND/CCCD</label>
                <input
                  type="text"
                  id="cmnd"
                  name="cmnd"
                  value={formData.cmnd}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 001234567890"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="dienThoai">Điện Thoại</label>
                <input
                  type="tel"
                  id="dienThoai"
                  name="dienThoai"
                  value={formData.dienThoai}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 0912345678"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: example@email.com"
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
                  {submitting ? "Đang thêm..." : "Thêm Khách Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
