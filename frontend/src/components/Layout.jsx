import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/accounts', label: 'Accounts', icon: '💳' },
  { to: '/transfer', label: 'Transfer', icon: '↗️' },
  { to: '/history', label: 'History', icon: '📜' }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-vault-900 text-white px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-xl"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <span className="text-lg font-semibold">🏦 SkyVault Bank</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 text-sm bg-vault-700/50 hover:bg-vault-700 rounded-full px-3 py-1.5"
          >
            {user?.full_name?.split(' ')[0] || 'User'} ▾
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
              <div className="px-4 py-3 border-b text-sm">
                <p className="font-medium truncate">{user?.full_name}</p>
                <p className="text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <nav
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-56 bg-white border-r shrink-0 md:min-h-[calc(100vh-56px)]`}
        >
          <ul className="p-3 space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive ? 'bg-vault-50 text-vault-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <span>🚪</span> Logout
              </button>
            </li>
          </ul>
        </nav>

        <main className="flex-1 p-4 md:p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
