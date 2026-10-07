export function formatMoney(n, simbolo = '$') {
  const num = Number(n || 0)
  const abs = Math.abs(num).toFixed(2)
  return `${num < 0 ? '-' : ''}${simbolo}${abs}`
}

export function diasDesde(fechaISO) {
  if (!fechaISO) return null
  const d = new Date(fechaISO + 'T00:00:00')
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return Math.floor((hoy - d) / 86400000)
}

export function hoyISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function sumarDias(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}