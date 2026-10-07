import { Delete } from 'lucide-react'

export default function NumericKeypad({ value, onChange }) {
  const press = (k) => {
    if (k === 'del') return onChange(value.slice(0, -1))
    if (k === '.' && value.includes('.')) return
    if (k === '.' && value === '') return onChange('0.')
    if (value.includes('.') && value.split('.')[1]?.length >= 2) return
    onChange((value + k).replace(/^0+(?=\d)/, ''))
  }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map(k => (
        <button key={k} type="button"
          onClick={() => press(k)}
          className="h-14 rounded-xl bg-gray-100 text-2xl font-semibold active:scale-95 flex items-center justify-center">
          {k === 'del' ? <Delete size={22} /> : k}
        </button>
      ))}
    </div>
  )
}