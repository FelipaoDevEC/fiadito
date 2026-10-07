export function normalizarTelefono(tel, prefijo = '593') {
  if (!tel) return ''
  let t = tel.replace(/\D/g, '')
  if (t.startsWith('0')) t = t.slice(1)
  if (!t.startsWith(prefijo)) t = prefijo + t
  return t
}

export function construirMensaje(plantilla, { cliente, saldo, negocio, fecha_ultimo_fiado }) {
  return (plantilla || '')
    .replaceAll('{cliente}', cliente ?? '')
    .replaceAll('{saldo}', saldo ?? '')
    .replaceAll('{negocio}', negocio ?? '')
    .replaceAll('{fecha_ultimo_fiado}', fecha_ultimo_fiado ?? '')
}

export function abrirWhatsApp(telefono, mensaje, prefijo = '593') {
  const tel = normalizarTelefono(telefono, prefijo)
  const url = `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}