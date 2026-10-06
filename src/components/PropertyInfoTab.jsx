import React from 'react'

export default function PropertyInfoTab({ info }) {
  if (!info) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No property information documented</p>
      </div>
    )
  }

  const fields = [
    { label: 'Property Name', value: info.name },
    { label: 'Property Type', value: info.type },
    { label: 'Address', value: info.address },
    { label: 'Maximum Occupancy', value: info.occupancy },
    { label: 'Check-in Time', value: info.checkIn },
    { label: 'Check-out Time', value: info.checkOut },
    { label: 'Pet Policy', value: info.petPolicy },
    { label: 'Parking', value: info.parking },
    { label: 'Amenities', value: info.amenities },
    { label: 'Guest Instructions', value: info.guestInstructions },
  ]

  return (
    <div className="max-w-2xl space-y-4">
      {fields.map((field, idx) => (
        <div key={idx} className="p-4 bg-white border border-border-light rounded-lg">
          <h3 className="font-semibold text-text-primary mb-2">{field.label}</h3>
          <p className="text-sm text-text-secondary">{field.value}</p>
        </div>
      ))}
    </div>
  )
}
