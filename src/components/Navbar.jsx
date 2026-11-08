
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="main-nav">
      <NavLink to="/">ตารางคะแนน</NavLink>
      <NavLink to="/teams">ทีมและการแข่งขัน</NavLink>
      <NavLink to="/statistics">สถิติลีก</NavLink>
    </nav>
  )
}
