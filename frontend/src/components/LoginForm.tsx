import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

interface FormData {
  tenDangNhap: string;
  password: string;
}

function LoginForm({ }: LoginFormProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    tenDangNhap: '',
    password: ''
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Đăng nhập:', formData)
    
    const email = formData.tenDangNhap.trim()
    const password = formData.password
    
    try {
      const response = await fetch('http://localhost:3000/auth/nhan-vien/dang-nhap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenDangNhap: email,
          matKhau: password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Đăng nhập thành công!')
        navigate('/home');
      } else {
        alert(`Đăng nhập thất bại: ${data.error || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } 
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="icon">✈️</div>
        <h2>Đăng nhập</h2>
        <p>Chào mừng trở lại!</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="text">Tên đăng nhập</label>
          <input 
            type="text" 
            name="tenDangNhap"
            value={formData.tenDangNhap}
            onChange={handleChange}
            placeholder="user1" 
            required 
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Mật khẩu</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••" 
            required 
          />
        </div>
        
        <div className="form-options">
          <label className="checkbox">
            <input type="checkbox" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
         
        </div>
        
        <button type="submit" className="btn btn-primary">Đăng nhập</button>
      </form>
      
      
    </div>
  )
}

export default LoginForm
