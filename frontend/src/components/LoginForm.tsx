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

function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) {
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
    alert('Đăng nhập thành công!')
    
    const email = formData.tenDangNhap.trim()
    const password = formData.password

    if (email === "user" && password === "123456") {
      navigate('/home')
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
