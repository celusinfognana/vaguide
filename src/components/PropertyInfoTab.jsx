import React from 'react'

export default function PropertyInfoTab({ info }) {
  if (!info) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No property information documented</p>
      </div>
    )
  }

  const standardFields = [
    ['name', 'Property Name'],
    ['type', 'Property Type'],
    ['address', 'Address'],
    ['occupancy', 'Maximum Occupancy'],
    ['checkIn', 'Check-in Time'],
    ['checkOut', 'Check-out Time'],
    ['petPolicy', 'Pet Policy'],
    ['parking', 'Parking'],
    ['amenities', 'Amenities'],
    ['guestInstructions', 'Guest Instructions'],
  ]
  const sourceDocument = info.sourceDocument
  const includedKeys = new Set([...standardFields.map(([key]) => key), 'sourceDocument'])
  const fields = [
    ...standardFields.map(([key, label]) => ({ label, value: info[key] })),
    ...Object.entries(info)
      .filter(([key]) => !includedKeys.has(key))
      .map(([key, value]) => ({
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase()),
        value,
      })),
  ].filter((field) => field.value !== undefined && field.value !== null && field.value !== '')

  return (
    <div className="max-w-2xl space-y-4">
      {fields.map((field) => (
        <div key={field.label} className="p-4 bg-white border border-border-light rounded-lg">
          <h3 className="font-semibold text-text-primary mb-2">{field.label}</h3>
          {field.label === 'Additional Information' ? (
            <pre className="text-sm text-text-secondary whitespace-pre-wrap break-words font-sans">{String(field.value)}</pre>
          ) : (
            <p className="text-sm text-text-secondary break-words">
              {typeof field.value === 'string' && /^https?:\/\//.test(field.value) ? (
                <a className="text-accent-blue underline" href={field.value} target="_blank" rel="noreferrer">
                  {field.value}
                </a>
              ) : (
                String(field.value)
              )}
            </p>
          )}
        </div>
      ))}
      {sourceDocument && (
        <details className="rounded-lg border border-border-light bg-white">
          <summary className="cursor-pointer p-4 font-semibold text-text-primary">Uploaded source document</summary>
          <pre className="max-h-[70vh] overflow-auto border-t border-border-light p-4 text-xs text-text-secondary whitespace-pre-wrap break-words">
            {sourceDocument}
          </pre>
        </details>
      )}
    </div>
  )
}
