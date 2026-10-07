import React from 'react'
import HomePage from '../pages/HomePage'
import PropertiesPage from '../pages/PropertiesPage'
import PropertyWorkspace from '../pages/PropertyWorkspace'
import FavoritesPage from '../pages/FavoritesPage'
import RecentPage from '../pages/RecentPage'
import AdminPropertiesPage from '../pages/AdminPropertiesPage'

export default function MainWorkspace({
  currentPage,
  selectedProperty,
  selectedSubproperty,
  subpropertySections,
  propertySections,
  selectedProcedure,
  proceduresInCategory,
  allProperties,
  favorites,
  onToggleFavorite,
  onShowToast,
  onPropertySelect,
  onCategorySelect,
  onProcedureSelect,
  onNavigatePage,
  onOpenSearch,
  searchQuery,
  searchScope,
  activeWorkspaceTab,
  onSelectWorkspaceTab,
  adminDatabase,
  adminRepository,
  onAdminDatabaseChange,
}) {
  return (
    <main className="flex-1 overflow-hidden mt-16">
      {currentPage === 'home' && (
        <HomePage
          allProperties={allProperties}
          favorites={favorites}
          onPropertySelect={(propId) => {
            onPropertySelect(propId)
            onNavigatePage('property-workspace')
          }}
          onToggleFavorite={onToggleFavorite}
          onShowToast={onShowToast}
          onOpenSearch={onOpenSearch}
          onBrowseProperties={() => onNavigatePage('properties')}
          onViewFavorites={() => onNavigatePage('favorites')}
          onViewRecent={() => onNavigatePage('recent')}
        />
      )}

      {currentPage === 'properties' && (
        <PropertiesPage
          properties={allProperties}
          favorites={favorites}
          onPropertySelect={(propId) => {
            onPropertySelect(propId)
            onNavigatePage('property-workspace')
          }}
          onToggleFavorite={onToggleFavorite}
          onShowToast={onShowToast}
        />
      )}

      {currentPage === 'property-workspace' && selectedProperty && (
        <PropertyWorkspace
          property={selectedProperty}
          subproperty={selectedSubproperty}
          subpropertySections={subpropertySections}
          propertySections={propertySections}
          selectedProcedure={selectedProcedure}
          proceduresInCategory={proceduresInCategory}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onShowToast={onShowToast}
          onProcedureSelect={onProcedureSelect}
          onCategorySelect={onCategorySelect}
          allProperties={allProperties}
          activeWorkspaceTab={activeWorkspaceTab}
          onSelectWorkspaceTab={onSelectWorkspaceTab}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage
          favorites={favorites}
          allProperties={allProperties}
          onToggleFavorite={onToggleFavorite}
          onShowToast={onShowToast}
        />
      )}

      {currentPage === 'recent' && (
        <RecentPage
          onPropertySelect={(propId) => {
            onPropertySelect(propId)
            onNavigatePage('property-workspace')
          }}
        />
      )}

      {currentPage === 'manage' && (
        <AdminPropertiesPage
          adminDatabase={adminDatabase}
          adminRepository={adminRepository}
          onAdminDatabaseChange={onAdminDatabaseChange}
          onShowToast={onShowToast}
        />
      )}
    </main>
  )
}
