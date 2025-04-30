export default function HoveredBox({ hoveredBox, hoveredBoxNumber }) {
  if (!hoveredBox || !hoveredBoxNumber) return null;
  
  // Get API location format and internal representation
  const apiLocation = window.hoveredBoxData?.displayLocation || window.hoveredBoxData?.locationCode;
  const internalCoords = hoveredBoxNumber.join(', ');
  
  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 text-white z-50 max-w-sm hidden lg:block animate-fadeIn">
      <div className="bg-gradient-to-br from-[#081330] to-[#152144] rounded-lg shadow-lg p-4 border border-blue-900/50">
        <div className="font-semibold text-sm mb-2 flex justify-between items-center">
          <span className="text-gray-300">Lokasyon:</span>
          {apiLocation ? (
            <span className="bg-blue-800 px-2 py-0.5 rounded text-blue-100">{apiLocation}</span>
          ) : (
            <span className="bg-blue-800 px-2 py-0.5 rounded text-blue-100">{internalCoords}</span>
          )}
        </div>
        
        <div className="text-xs font-medium text-orange-100 mb-2">{hoveredBox}</div>
        
        {/* Add pallet ID and customer name if available */}
        {window.hoveredBoxData && (
          <div className="mt-2 pt-2 border-t border-white/10 text-xs">
            {window.hoveredBoxData.paletId && (
              <div className="flex items-center justify-between my-1">
                <span className="text-gray-400">Palet ID:</span>
                <span className="text-white">{window.hoveredBoxData.paletId}</span>
              </div>
            )}
            {window.hoveredBoxData.customerName && (
              <div className="flex items-center justify-between my-1">
                <span className="text-gray-400">Firma:</span>
                <span className="text-white truncate max-w-[180px]">{window.hoveredBoxData.customerName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
