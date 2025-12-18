import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">✈️</span>
          <span className="logo-text">CloudAir</span>
        </div>
        <div className="search-box">
          <span className="search-icon">✈️</span>
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
      </div>
      <div className="header-right">
        <div className="user-menu">
          <span className="user-avatar">👤</span>
          <span className="user-name">Nhân viên</span>
        </div>
      </div>
    </header>
  )
}
export default Header
