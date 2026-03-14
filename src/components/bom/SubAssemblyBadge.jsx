export default function SubAssemblyBadge({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
      title="View sub-assembly BOM"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </button>
  )
}
