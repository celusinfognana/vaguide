import React from 'react'
import { Home, Settings, HelpCircle, LayoutGrid, Heart, Clock } from 'lucide-react'

export default function GlobalSidebar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'properties', label: 'Properties', icon: LayoutGrid },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'manage', label: 'Manage', icon: Settings },
  ]

  return (
    <aside className="w-16 bg-nav-dark text-white flex flex-col items-center py-6 px-2 gap-6 border-r border-gray-800 mt-16">
      {/* Navigation Items */}
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-3 rounded-lg transition-all group relative ${
                currentPage === item.id
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <Icon size={20} />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.label}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 border-t border-gray-700 pt-4">
        <button
          className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all group relative"
          title="Settings"
        >
          <Settings size={20} />
          <div className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Settings
          </div>
        </button>
        <button
          className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all group relative"
          title="Help"
        >
          <HelpCircle size={20} />
          <div className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Help
          </div>
        </button>
      </div>
    </aside>
  )
}
