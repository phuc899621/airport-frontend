import { useState, useEffect } from 'react';
import './BookingModal.css';
import API from '../services/backend_api';

interface Customer {
  maHanhKhach: string;
  hoTen: string;
  dienThoai: string;
  cmnd: string;
  email?: string;
}
interface Flight {
  maChuyenBay: string;
  tenSanBayDi: string;
  tenSanBayDen: string;
  ngayGio: string;
  tongSoGheDaDat?: number;
  tongSoGheConLai?: number;
  [key: string]: any;
}

interface TicketClass {
  maHangVe: string;
  tenHangVe: string;
  heSoGia?: number;
  tongSoGhe: number;
  giaVeTheoHang: number;
  soGheConLai: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [quyDinh, setQuyDinh] = useState<any>(null);
  const [flightCode, setFlightCode] = useState('');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [ticketClass, setTicketClass] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [availableTicketClasses, setAvailableTicketClasses] = useState<TicketClass[]>([]);
  const [loadingTicketClasses, setLoadingTicketClasses] = useState(false);
  const [isFlightBookable, setIsFlightBookable] = useState(true);

  // Helper function to get flight code consistently
  const getFlightCode = (flight: Flight): string => {
    return flight.maChuyenBay || '';
  };

  // Check if flight is bookable based on quyDinh time limit
  const checkFlightBookable = (flight: Flight) => {
    if (!flight.ngayGio || !quyDinh) {
      setIsFlightBookable(true);
      return;
    }

    const flightTime = new Date(flight.ngayGio);
    const currentTime = new Date();
    
    // Assuming quyDinh has a property for booking time limit (in hours)
    // You may need to adjust this based on your actual quyDinh structure
    const timeLimit = quyDinh / 60 || 24; // Default 24 hours
    const timeLimitMs = timeLimit * 60 * 60 * 1000; // Convert to milliseconds
    
    const timeDifference = flightTime.getTime() - currentTime.getTime();
    const isBookable = timeDifference > timeLimitMs;
    
    setIsFlightBookable(isBookable);
    
    console.log('Flight booking check:', {
      flightTime: flightTime.toISOString(),
      currentTime: currentTime.toISOString(),
      timeLimit: timeLimit,
      timeDifference: timeDifference / (60 * 60 * 1000), // in hours
      isBookable
    });
  };

  // Filter flights based on search criteria
  const filteredFlights = (flights || []).filter(flight => {
    const matchCode = !flightCode || getFlightCode(flight).toLowerCase().includes(flightCode.toLowerCase());
    const matchDeparture = !departure || (flight.tenSanBayDi || flight.sanBayDi || '').toLowerCase().includes(departure.toLowerCase());
    const matchDestination = !destination || (flight.tenSanBayDen || flight.sanBayDen || '').toLowerCase().includes(destination.toLowerCase());
    // Convert ngayGio to date for comparison
    const flightDate_formatted = flight.ngayGio ? flight.ngayGio.split('T')[0] : flight.ngayBay;
    const matchDate = !flightDate || flightDate_formatted === flightDate;

    return matchCode && matchDeparture && matchDestination && matchDate;
  });

  // Fetch customers and flights from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersResponse = await API.get('/hanh-khach');
        console.log('Customers API Response:', customersResponse.data);
        // Check if response has data property (API wrapper format)
        const customersData = customersResponse.data.data || customersResponse.data;
        setCustomers(Array.isArray(customersData) ? customersData : []);

        const quyDinhResponse = await API.get('/quy-dinh/ThoiGianHuy');
        console.log('Quy Dinh API Response:', quyDinhResponse.data);
        setQuyDinh(quyDinhResponse.data.data);

        // Fetch flights
        const flightsResponse = await API.get('/chuyen-bay');
        const flightsData = flightsResponse.data.data || flightsResponse.data;

        // thời gian hiện tại
        const now = new Date();

        // lọc bỏ chuyến bay đã quá ngày bay
        const validFlights = flightsData.filter((flight: Flight) => {
          if (!flight.ngayGio) return false;
          if((flight.tongSoGheConLai || 0) <= 0) return false;

          const flightTime = new Date(flight.ngayGio);
          return flightTime >= now;
        });

        setFlights(validFlights);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        const mockCustomers: Customer[] = [
          {
            maHanhKhach: 'KH001',
            hoTen: 'Nguyễn Văn A',
            dienThoai: '0901234567',
            cmnd: '123456789',
            email: 'nguyenvana@email.com'
          },
          {
            maHanhKhach: 'KH002',
            hoTen: 'Trần Thị B',
            dienThoai: '0907654321',
            cmnd: '987654321',
            email: 'tranthib@email.com'
          },
          {
            maHanhKhach: 'KH003',
            hoTen: 'Lê Văn C',
            dienThoai: '0903456789',
            cmnd: '456789123',
            email: 'levanc@email.com'
          }
        ];
        setCustomers(mockCustomers);

        const mockFlights: Flight[] = [
          {
            maChuyenBay: 'VN001',
            tenSanBayDi: 'Sân bay Nội Bài',
            tenSanBayDen: 'Sân bay Tân Sơn Nhất',
            ngayGio: '2024-01-15T08:00:00.000Z',
            soGheConLai: 50,
            soGheDaBan: 100
          },
          {
            maChuyenBay: 'VN002',
            tenSanBayDi: 'Sân bay Tân Sơn Nhất',
            tenSanBayDen: 'Sân bay Đà Nẵng',
            ngayGio: '2024-01-16T10:00:00.000Z',
            soGheConLai: 30,
            soGheDaBan: 120
          },
          {
            maChuyenBay: 'VN003',
            tenSanBayDi: 'Sân bay Nội Bài',
            tenSanBayDen: 'Sân bay Đà Nẵng',
            ngayGio: '2024-01-17T14:00:00.000Z',
            soGheConLai: 25,
            soGheDaBan: 95
          }
        ];
        setFlights(mockFlights);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Fetch ticket classes for selected flight
  const fetchTicketClasses = async (maChuyenBay: string) => {
  setLoadingTicketClasses(true);
  try {
    const response = await API.get(`/chuyen-bay/${maChuyenBay}`);
    console.log('Flight details API Response:', response.data);

    // ✅ LẤY PHẦN TỬ ĐẦU TIÊN TRONG ARRAY
    const flightData = response.data.data?.[0];

    if (flightData?.hangVeChuyenBay?.length > 0) {
      setAvailableTicketClasses(flightData.hangVeChuyenBay);
    } else {
      setAvailableTicketClasses([]);
    }
  } catch (error) {
    console.error('Error fetching ticket classes:', error);
    setAvailableTicketClasses([]);
  } finally {
    setLoadingTicketClasses(false);
  }
};

  // Handle flight selection
  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setTicketClass(''); // Reset ticket class
    setTicketPrice(''); // Reset ticket price
    fetchTicketClasses(getFlightCode(flight));
    checkFlightBookable(flight); // Check if flight is bookable
  };

  // Handle ticket class selection
  const handleTicketClassChange = (selectedClassId: string) => {
    setTicketClass(selectedClassId);

    // Find the price for selected class
    const classInfo = availableTicketClasses.find(tc => tc.maHangVe === selectedClassId);
    if (classInfo) {
      setTicketPrice(classInfo.giaVeTheoHang.toString());
    }
  };

  // Handle customer ID/CMND input change
  const handleCustomerIdChange = (value: string) => {
    setCustomerId(value);

    console.log('Searching for:', value); // Debug log
    console.log('Available customers:', customers); // Debug log

    if (value.trim() === '') {
      setSelectedCustomer(null);
      setCustomerName('');
      return;
    }

    // Find customer by ID (maHanhKhach) or CMND
    const foundCustomer = customers.find(customer =>
      customer.maHanhKhach === value || customer.cmnd === value
    );

    console.log('Found customer:', foundCustomer); // Debug log

    if (foundCustomer) {
      setSelectedCustomer(foundCustomer);
      setCustomerName(`${foundCustomer.hoTen} | ${foundCustomer.dienThoai}`);
    } else {
      setSelectedCustomer(null);
      setCustomerName('Không tìm thấy khách hàng');
    }
  };

  const handleBookTicket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!selectedCustomer || !customerId || !selectedFlight || !ticketClass || !ticketPrice) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!isFlightBookable) {
      alert('Không thể đặt vé cho chuyến bay này do đã quá thời gian quy định!');
      return;
    }

    // Prepare data for API
    const bookingData = {
      maHangVe: ticketClass,
      maChuyenBay: getFlightCode(selectedFlight),
      maHanhKhach: selectedCustomer.maHanhKhach
    };

    console.log("Submitting booking data:", bookingData);

    try {
      const response = await fetch("http://localhost:3000/ve/dat-ve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Đặt vé thành công! Vé sẽ được thêm vào danh sách chờ thanh toán.");
        resetForm();
        if (onSuccess) onSuccess(); // Reload dữ liệu TicketsPage
      } else {
        alert("Lỗi: " + (data.message || "Không xác định"));
        console.error("Error from server:", data);
      }
    } catch (err) {
      console.error("Error booking ticket:", err);
      alert("Không thể đặt vé: " + err);
    }
  };

  const handlePayment = async () => {
    if (!selectedCustomer || !customerId || !selectedFlight || !ticketClass || !ticketPrice) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Prepare data for payment API
    const paymentData = {
      maHangVe: ticketClass,
      maChuyenBay: getFlightCode(selectedFlight),
      maHanhKhach: selectedCustomer.maHanhKhach
    };

    console.log("Submitting payment data:", paymentData);

    try {
      const response = await fetch("http://localhost:3000/ve/mua-ve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Mua vé thành công! Vé đã được xác nhận và thanh toán.");
        resetForm();
        if (onSuccess) onSuccess(); // Reload dữ liệu TicketsPage
      } else {
        alert("Lỗi: " + (data.message || "Không xác định"));
        console.error("Error from server:", data);
      }
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      alert("Không thể mua vé: " + err);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerId('');
    setTicketClass('');
    setTicketPrice('');
    setSelectedFlight(null);
    setAvailableTicketClasses([]);
    setIsFlightBookable(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Đặt vé máy bay</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="booking-form">


          <div className="form-row">
            <div className="form-group">
              <label>Mã KH / CMND</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => handleCustomerIdChange(e.target.value)}
                placeholder="Nhập mã khách hàng hoặc CMND"
              />
            </div>
            <div className="form-group">
              <label>Khách hàng</label>
              <input
                type="text"
                value={customerName}
                readOnly
                placeholder="Thông tin khách hàng sẽ hiển thị tự động"
                className={selectedCustomer ? 'customer-found' : customerName ? 'customer-not-found' : ''}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>MaCB</label>
              <input
                type="text"
                value={flightCode}
                onChange={(e) => setFlightCode(e.target.value)}
                placeholder="Lọc theo mã chuyến bay"
              />
            </div>
            <div className="form-group">
              <label>Sân bay đi</label>
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Lọc theo sân bay đi"
              />
            </div>
            <div className="form-group">
              <label>Sân bay đến</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Lọc theo sân bay đến"
              />
            </div>
            <div className="form-group">
              <label>Ngày bay</label>
              <input
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <button
              type="button"
              onClick={() => {
                setFlightCode('');
                setDeparture('');
                setDestination('');
                setFlightDate('');
                setSelectedFlight(null);
                setTicketClass('');
                setTicketPrice('');
                setAvailableTicketClasses([]);
              }}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Xóa bộ lọc
            </button>
          </div>

          <div className="flights-table">
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              Hiển thị {filteredFlights.length} chuyến bay (từ tổng {flights.length} chuyến bay)
            </div>
            <table>
              <thead>
                <tr>
                  <th>MaCB</th>
                  <th>Sân bay đi</th>
                  <th>Sân bay đến</th>
                  <th>Ngày bay</th>
                  <th>Còn lại</th>
                  <th>Đã bán</th>
                  <th>Chọn</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.length > 0 ? (
                  filteredFlights.map((flight) => (
                    <tr key={getFlightCode(flight)}>
                      <td>{getFlightCode(flight)}</td>
                      <td>{flight.tenSanBayDi || flight.sanBayDi}</td>
                      <td>{flight.tenSanBayDen || flight.sanBayDen}</td>
                      <td>{flight.ngayGio ? new Date(flight.ngayGio).toLocaleDateString('vi-VN') : flight.ngayBay}</td>
                      <td>{flight.tongSoGheConLai || flight.conLai }</td>
                      <td>{flight.tongSoGheDaDat || flight.daBan }</td>
                      <td>
                        <input
                          type="radio"
                          name="selectedFlight"
                          onChange={() => handleFlightSelect(flight)}
                          checked={!!selectedFlight && getFlightCode(selectedFlight) === getFlightCode(flight)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      Không tìm thấy chuyến bay phù hợp với điều kiện lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="selected-flight">
            <h3>Chuyến bay đã chọn:</h3>
            {selectedFlight ? (
              <p>{getFlightCode(selectedFlight)} - {selectedFlight.tenSanBayDi || selectedFlight.sanBayDi} → {selectedFlight.tenSanBayDen || selectedFlight.sanBayDen}</p>
            ) : (
              <p>Chưa chọn chuyến bay</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Chọn loại vé</label>
              <select
                value={ticketClass}
                onChange={(e) => handleTicketClassChange(e.target.value)}
                disabled={!selectedFlight || loadingTicketClasses}
              >
                <option value="">
                  {!selectedFlight
                    ? 'Vui lòng chọn chuyến bay trước'
                    : loadingTicketClasses
                      ? 'Đang tải hạng vé...'
                      : 'Chọn hạng vé'
                  }
                </option>
                {availableTicketClasses.map((ticketClassInfo) => (
                  <option key={ticketClassInfo.maHangVe} value={ticketClassInfo.maHangVe}>
                    {ticketClassInfo.tenHangVe} - {ticketClassInfo.giaVeTheoHang.toLocaleString()} VND
                    {` (Còn ${ticketClassInfo.soGheConLai}/${ticketClassInfo.tongSoGhe} chỗ)`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Giá vé (VND)</label>
              <input
                type="text"
                value={ticketPrice ? parseInt(ticketPrice).toLocaleString() : ''}
                readOnly
                placeholder="Giá vé sẽ hiển thị khi chọn hạng vé"
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
          </div>

          <div className="button-group">
            <button 
              className={`book-btn ${!isFlightBookable ? 'disabled' : ''}`}
              onClick={handleBookTicket}
              disabled={!isFlightBookable}
              title={!isFlightBookable ? 'Không thể đặt vé do đã quá thời gian quy định' : ''}
            >
              📝 Đặt vé
            </button>
            <button 
              className="payment-btn"
              onClick={handlePayment}
            >
              💳 Mua vé
            </button>
          </div>

          {selectedFlight && !isFlightBookable && (
            <div className="warning-message">
              ⚠️ Chuyến bay này đã quá thời gian quy định để đặt vé. Chỉ có thể thanh toán trực tiếp.
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

export default BookingModal;