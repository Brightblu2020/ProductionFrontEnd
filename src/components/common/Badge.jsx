const categoryColors = {
  PCB: 'bg-blue-100 text-blue-800',
  Electrical: 'bg-amber-100 text-amber-800',
  Mechanical: 'bg-slate-100 text-slate-700',
  Connector: 'bg-purple-100 text-purple-800',
  Fastener: 'bg-gray-100 text-gray-700',
  Wire: 'bg-green-100 text-green-800',
  Label: 'bg-pink-100 text-pink-800',
  Service: 'bg-orange-100 text-orange-800',
  Enclosure: 'bg-teal-100 text-teal-800',
  Other: 'bg-gray-100 text-gray-600',
}

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
}

export default function Badge({ children, variant = 'category' }) {
  const colorMap = variant === 'role' ? roleColors : categoryColors
  const colorClass = colorMap[children] || 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {children}
    </span>
  )
}
