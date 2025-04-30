export default function HoveredBox({ hoveredBox, hoveredBoxNumber }) {
  if (!hoveredBox || !hoveredBoxNumber) return null;
  
  // Get API location format and internal representation
  const apiLocation = window.hoveredBoxData?.displayLocation || window.hoveredBoxData?.locationCode;
  const internalCoords = hoveredBoxNumber.join(', ');
  
  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return null;
    }
  };
  
  // Get expiration date
  const expiryDate = window.hoveredBoxData?.expirationDate || window.hoveredBoxData?._apiData?.skT_;
  const formattedExpiryDate = formatDate(expiryDate);
  
  // Get quantity
  const quantity = window.hoveredBoxData?.quantity || window.hoveredBoxData?._apiData?.toplam;
  
  return (
    <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 text-white z-50 max-w-sm hidden lg:block animate-fadeIn">
      <div className="bg-gradient-to-br from-[#081330] to-[#152144] rounded-lg shadow-lg p-3 border border-blue-900/50">
        <div className="font-semibold text-xs mb-1.5 flex justify-between items-center">
          <span className="text-gray-300">Lokasyon:</span>
          {apiLocation ? (
            <span className="bg-blue-800 px-1.5 py-0.5 rounded text-blue-100 text-[10px]">{apiLocation}</span>
          ) : (
            <span className="bg-blue-800 px-1.5 py-0.5 rounded text-blue-100 text-[10px]">{internalCoords}</span>
          )}
        </div>
        
        <div className="text-[11px] font-medium text-orange-100 mb-1">{hoveredBox}</div>
        
        {/* Show primary info only */}
        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px]">
          {window.hoveredBoxData?.customerName && (
            <div className="flex items-center justify-between my-0.5">
              <span className="text-gray-400">Firma:</span>
              <span className="text-white truncate max-w-[160px]">{window.hoveredBoxData.customerName}</span>
            </div>
          )}
          
          {quantity && (
            <div className="flex items-center justify-between my-0.5">
              <span className="text-gray-400">Miktar:</span>
              <span className="text-white">{quantity}</span>
            </div>
          )}
          
          {formattedExpiryDate && (
            <div className="flex items-center justify-between my-0.5">
              <span className="text-gray-400">SKT:</span>
              <span className="text-white">{formattedExpiryDate}</span>
            </div>
          )}
          
          {window.hoveredBoxData?.paletId && (
            <div className="flex items-center justify-between my-0.5">
              <span className="text-gray-400">Palet ID:</span>
              <span className="text-white">{window.hoveredBoxData.paletId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
