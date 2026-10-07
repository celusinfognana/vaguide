import React, { useEffect, useRef, useState } from 'react'
import { Search, Bell, HelpCircle, LogOut, Building2, ChevronDown, Check } from 'lucide-react'

export default function Topbar({
  onSearch,
  onNotifications,
  properties = [],
  selectedProperty,
  onSelectProperty,
}) {
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false)
  const [propertySearch, setPropertySearch] = useState('')
  const propertyMenuRef = useRef(null)
  const selectedPropertyData = properties.find((property) => property.id === selectedProperty)
  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(propertySearch.toLowerCase()),
  )

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!propertyMenuRef.current?.contains(event.target)) {
        setIsPropertyMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handlePropertySelect = (propertyId) => {
    onSelectProperty?.(propertyId)
    setIsPropertyMenuOpen(false)
    setPropertySearch('')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border-light z-40 flex items-center px-6 gap-4 shadow-soft flex-wrap sm:flex-nowrap">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 min-w-max">
        {/* <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
          PH
        </div> */}
        <img src="../assets/ig_logo.png" alt="Logo" className="h-8 w-100" />
        {/* <h1 className="text-lg font-semibold text-text-primary hidden sm:block">Property Support Hub</h1> */}
      </div>

      {/* Property / Collection Dropdown */}
      <div ref={propertyMenuRef} className="relative flex-shrink-0 w-full max-w-[300px] sm:w-[300px]">
        <button
          type="button"
          onClick={() => setIsPropertyMenuOpen((isOpen) => !isOpen)}
          aria-expanded={isPropertyMenuOpen}
          aria-haspopup="listbox"
          className="w-full h-12 px-3 bg-white border border-border-light rounded-xl flex items-center gap-3 text-left shadow-sm hover:border-gray-300 transition-colors"
        >
          <span className="w-9 h-9 rounded-lg bg-[#eaf7ff] text-[#1d9bf0] flex items-center justify-center flex-shrink-0">
            <Building2 size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-wide text-text-secondary leading-none mb-1">
              Property/collection
            </span>
            <span className="block text-sm font-semibold text-text-primary truncate">
              {selectedPropertyData?.name || 'Select collection'}
            </span>
          </span>
          <ChevronDown size={17} className={`text-text-secondary transition-transform ${isPropertyMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isPropertyMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-border-light rounded-xl shadow-medium z-50">
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="search"
                value={propertySearch}
                onChange={(event) => setPropertySearch(event.target.value)}
                placeholder="Search property or collection..."
                aria-label="Search property or collection"
                autoFocus
                className="w-full h-9 pl-9 pr-3 bg-bg-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue"
              />
            </div>

            <div className="max-h-64 overflow-y-auto" role="listbox" aria-label="Properties and collections">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <button
                    key={property.id}
                    type="button"
                    role="option"
                    aria-selected={property.id === selectedProperty}
                    onClick={() => handlePropertySelect(property.id)}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-3 text-left hover:bg-bg-light transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: property.color }} />
                    <span className="flex-1 min-w-0 text-sm text-text-primary truncate">{property.name}</span>
                    {property.id === selectedProperty && <Check size={16} className="text-accent-blue flex-shrink-0" />}
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-text-secondary text-center">No properties found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Search */}
      <div className="flex-1 min-w-[220px] max-w-2xl">
        <button
          onClick={onSearch}
          className="w-full px-4 py-2 bg-bg-light rounded-lg border border-border-light flex items-center gap-3 text-text-secondary hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <Search size={18} className="flex-shrink-0" />
          <span className="text-sm">Search what the guest needs help with...</span>
          <span className="ml-auto text-xs bg-white px-2 py-1 rounded border border-border-light text-gray-500">Ctrl K</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={onNotifications}
          className="p-2 hover:bg-bg-light rounded-lg relative"
          title="Notifications"
        >
          <Bell size={20} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-danger rounded-full"></span>
        </button>

        <button
          className="p-2 hover:bg-bg-light rounded-lg"
          title="Help"
        >
          <HelpCircle size={20} className="text-text-secondary" />
        </button>

        <div className="h-8 w-8 bg-gradient-to-br from-accent-blue to-accent-chat rounded-full flex items-center justify-center text-white text-sm font-semibold">
          JD
        </div>

        <div className="flex flex-col gap-0">
          <span className="text-sm font-medium text-text-primary">John Doe</span>
          <span className="text-xs text-text-secondary">Agent</span>
        </div>

        <button
          className="p-2 hover:bg-bg-light rounded-lg"
          title="Logout"
        >
          <LogOut size={18} className="text-text-secondary" />
        </button>
      </div>
    </header>
  )
}
