import React from 'react'
import { Phone, MessageSquare, Copy, Mail } from 'lucide-react'

export default function ContactsTab({ contacts }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No contacts documented for this property</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contacts.map(contact => (
        <div key={contact.id} className="p-4 bg-white border border-border-light rounded-lg hover:shadow-soft transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-text-primary">{contact.name}</h3>
              <p className="text-sm text-text-secondary">{contact.role}</p>
            </div>
            {contact.preferred && (
              <span className="text-xs bg-blue-50 text-accent-blue px-2 py-1 rounded">
                Preferred: {contact.preferred === 'phone' ? 'Phone' : 'Text'}
              </span>
            )}
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-text-secondary" />
              <span className="text-sm font-mono text-text-primary">{contact.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">{contact.email}</span>
            </div>
          </div>

          {contact.whenToContact && (
            <p className="mb-3 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">When to contact: </span>
              {contact.whenToContact}
            </p>
          )}

          <div className="flex gap-2">
            <button className="px-3 py-2 bg-accent-call text-white rounded-lg text-sm hover:bg-opacity-90 transition-all flex items-center gap-2">
              <Phone size={14} />
              Call
            </button>
            <button className="px-3 py-2 bg-accent-chat text-white rounded-lg text-sm hover:bg-opacity-90 transition-all flex items-center gap-2">
              <MessageSquare size={14} />
              Text
            </button>
            <button className="px-3 py-2 bg-bg-light text-text-secondary rounded-lg text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
              <Copy size={14} />
              Copy
            </button>
            <button className="px-3 py-2 bg-bg-light text-text-secondary rounded-lg text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
              <Mail size={14} />
              Email
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
