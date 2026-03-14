import { useAuth } from '../../hooks/useAuth'
import Badge from '../common/Badge'

export default function Header({ onMenuClick }) {
  const { user, role, logout } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-slate-700">
            {user?.displayName || user?.email}
          </div>
        </div>
        <Badge variant="role">{role}</Badge>
        <button
          onClick={logout}
          className="text-sm text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
