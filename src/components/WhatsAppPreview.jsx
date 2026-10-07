import { useState } from 'react'
import { X } from 'lucide-react'
import { abrirWhatsApp } from '../lib/whatsapp'

export default function WhatsAppPreview({ mensaje, telefono, prefijo, onClose }) {
  const [texto, setTexto] = useState(mensaje)
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Vista previa</h2>
          <button onClick={onClose} className="p-2 -mr-2"><X /></button>
        </div>
        <p className="text-sm text-gray-500">Puedes editar el mensaje antes de enviarlo.</p>
        <textarea rows={5} className="input-lg resize-none" value={texto}
          onChange={e => setTexto(e.target.value)} />
        <button disabled={!telefono}
          onClick={() => { abrirWhatsApp(telefono, texto, prefijo); onClose() }}
          className="btn-primary">
          {telefono ? 'Abrir WhatsApp' : 'Cliente sin teléfono'}
        </button>
      </div>
    </div>
  )
}