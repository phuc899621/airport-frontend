import { useState, useEffect } from 'react'
import './PageContent.css'
import './SettingsPage.css'

// ================= Interfaces =================
interface FlightSettings {
  ThoiGianBayToiThieu: number
  SanBayTrungGianToiDa: number
  ThoiGianDungMin: number
  ThoiGianDungMax: number
  ThoiGianHuy: number
}

interface Ve {
  maHangVe: string
  tenHangVe: string
  heSoGia: number
}

function SettingsPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [listVe, setListVe] = useState<Ve[]>([])

  const [flightSettings, setFlightSettings] = useState<FlightSettings>({
    ThoiGianBayToiThieu: 0,
    SanBayTrungGianToiDa: 0,
    ThoiGianDungMin: 0,
    ThoiGianDungMax: 0,
    ThoiGianHuy: 0,
  })

  // ⭐ NEW: state riêng cho form tạo hạng vé
  const [tenHangVe, setTenHangVe] = useState('')
  const [heSoGia, setHeSoGia] = useState('')

  // ================= API =================
  const fetchFlightSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/quy-dinh')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const settingsObject: FlightSettings = {
          ThoiGianBayToiThieu: 0,
          SanBayTrungGianToiDa: 0,
          ThoiGianDungMin: 0,
          ThoiGianDungMax: 0,
          ThoiGianHuy: 0,
        }

        data.data.forEach((item: any) => {
          if (item.tenQuyDinh in settingsObject) {
            settingsObject[item.tenQuyDinh as keyof FlightSettings] =
              item.giaTri
          }
        })

        setFlightSettings(settingsObject)
      }
    } catch {
      setError('Không thể tải cài đặt chuyến bay')
    } finally {
      setLoading(false)
    }
  }

  const fetchVe = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/hang-ve')
      const data = await response.json()
      if (data.success) setListVe(data.data)
    } catch {
      setError('Không thể tải hạng vé')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlightSettings()
    fetchVe()
  }, [])

  // ================= Handlers =================
  const handleFlightSettingsChange = (
    field: keyof FlightSettings,
    value: string
  ) => {
    setFlightSettings((prev) => ({
      ...prev,
      [field]: parseInt(value) || 0,
    }))
  }

  const handleUpdateFlight = async () => {
    try {
      setLoading(true)

      const dataArray = Object.entries(flightSettings).map(
        ([tenQuyDinh, giaTri]) => ({
          tenQuyDinh,
          giaTri,
        })
      )

      const response = await fetch('http://localhost:3000/quy-dinh', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quyDinhs: dataArray }),
      })

      const data = await response.json()
      alert(data.message)
      console.log(data)
      if (data.success) {
        alert('Cập nhật cài đặt chuyến bay thành công!')
        fetchFlightSettings()
      } else alert(data.message)
    } catch {
      alert('Không thể cập nhật cài đặt chuyến bay')
    } finally {
      setLoading(false)
    }
  }

  // ⭐ NEW: handleSubmit tạo hạng vé (KHÔNG ĐỤNG QUY ĐỊNH)
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const parsedHeSoGia = parseFloat(heSoGia)

  if (!tenHangVe.trim() || isNaN(parsedHeSoGia) || parsedHeSoGia <= 0) {
    alert('Dữ liệu không hợp lệ')
    return
  }

  try {
    setLoading(true)

    const response = await fetch('http://localhost:3000/hang-ve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenHangVe: tenHangVe.trim(),
        heSoGia: parsedHeSoGia,
      }),
    })

    const data = await response.json()
    console.log('Create hang ve:', data)

    if (!response.ok) {
      alert(data.message || 'Tạo hạng vé thất bại')
      return
    }

    alert('Tạo hạng vé thành công!')
    setTenHangVe('')
    setHeSoGia('')
    fetchVe()
  } catch (error) {
    console.error(error)
    alert('Không thể tạo hạng vé')
  } finally {
    setLoading(false)
  }
}

  // ================= Render =================
  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container loading-state">
          <div className="loading-spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* ===== CÀI ĐẶT QUY ĐỊNH (GIỮ NGUYÊN) ===== */}
        <div className="settings-section">
          <h3 className="section-title">Cài đặt chuyến bay</h3>
          <div className="settings-grid">
            <div className="settings-column">
              <label>Thời gian bay tối thiểu (phút)</label>
              <input
                type="number"
                value={flightSettings.ThoiGianBayToiThieu}
                onChange={(e) =>
                  handleFlightSettingsChange(
                    'ThoiGianBayToiThieu',
                    e.target.value
                  )
                }
                className="form-input"
              />
              <label>Thời gian dừng tối thiểu (phút)</label>
              <input
                type="number"
                value={flightSettings.ThoiGianDungMin}
                onChange={(e) =>
                  handleFlightSettingsChange(
                    'ThoiGianDungMin',
                    e.target.value
                  )
                }
                className="form-input"
              />
              <label>Thời gian hủy chuyến (phút)</label>
              <input
                type="number"
                value={flightSettings.ThoiGianHuy}
                onChange={(e) =>
                  handleFlightSettingsChange('ThoiGianHuy', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="settings-column">
              <label>Số sân bay trung gian tối đa</label>
              <input
                type="number"
                value={flightSettings.SanBayTrungGianToiDa}
                onChange={(e) =>
                  handleFlightSettingsChange(
                    'SanBayTrungGianToiDa',
                    e.target.value
                  )
                }
                className="form-input"
              />
              <label>Thời gian dừng tối đa (phút)</label>
              <input
                type="number"
                value={flightSettings.ThoiGianDungMax}
                onChange={(e) =>
                  handleFlightSettingsChange(
                    'ThoiGianDungMax',
                    e.target.value
                  )
                }
                className="form-input"
              />
              <button className="btn-primary" onClick={handleUpdateFlight} style={{ marginTop: '40px' }}>
                Cập nhật
              </button>
            </div>
          </div>
        </div>

        {/* ===== THÊM HẠNG VÉ (ĐÃ FIX) ===== */}
        <div className="settings-section">
          <h3 className="section-title">Thêm hạng vé</h3>

          <form onSubmit={handleSubmit} className="settings-column">
            <input
              type="text"
              className="form-input"
              placeholder="Tên hạng vé"
              value={tenHangVe}
              onChange={(e) => setTenHangVe(e.target.value)}
            />
            <input
              type="number"
              className="form-input"
              placeholder="Hệ số giá"
              value={heSoGia}
              onChange={(e) => setHeSoGia(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Tạo
            </button>
          </form>
        </div>

        {/* ===== DANH SÁCH HẠNG VÉ ===== */}
        <table className="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Hệ số</th>
            </tr>
          </thead>
          <tbody>
            {listVe.length ? (
              listVe.map((v, i) => (
                <tr key={v.maHangVe}>
                  <td>{i + 1}</td>
                  <td>{v.maHangVe}</td>
                  <td>{v.tenHangVe}</td>
                  <td>{v.heSoGia}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Không có hạng vé</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="settings-footer">CloudAir 2025</div>
      </div>
    </div>
  )
}

export default SettingsPage
