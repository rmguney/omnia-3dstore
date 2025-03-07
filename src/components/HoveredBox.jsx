export default function HoveredBox({ hoveredBox, hoveredBoxNumber }) {
  return (
    hoveredBox && hoveredBoxNumber && (
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 text-white z-50 max-w-sm hidden lg:block">
        <div className="bg-[#070F2A] bg-opacity-80 rounded-lg shadow-lg p-4">
          <div className="font-semibold text-sm mb-2">
            <span>Palet No: {hoveredBoxNumber.join(', ')}</span>
          </div>
          <div class="text-xs">{hoveredBox}</div>
        </div>
      </div>
    )
  )
}
