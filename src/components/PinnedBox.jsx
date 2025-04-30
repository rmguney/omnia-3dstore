import { BsPin, BsX } from "react-icons/bs";
import { FaRegCalendar, FaWeightHanging, FaBox, FaTags, FaMapMarkerAlt } from "react-icons/fa";

// Helper to format dates nicely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};

export default function PinnedBox({ store }) {
  const handleUnpin = () => {
    store.setSelectedBox(null);
    store.clearFocusedBox();
  };

  const getBoxContent = () => {
    if (!store.selectedBox) return null;

    // Check regular boxes first
    let box = store.boxData?.find(b => 
      b.boxNumber[0] === store.selectedBox.x && 
      b.boxNumber[1] === store.selectedBox.y && 
      b.boxNumber[2] === store.selectedBox.z
    );

    // If not found, check loading areas
    if (!box) {
      for (const area of Object.values(store.loadingAreas || {})) {
        box = area.boxes?.find(b =>
          b.boxNumber[0] === store.selectedBox.x && 
          b.boxNumber[1] === store.selectedBox.y && 
          b.boxNumber[2] === store.selectedBox.z
        );
        if (box) break;
      }
    }

    return box;
  };

  const box = getBoxContent();
  if (!store.selectedBox || !box) return null;

  // Get API location format and internal coordinates
  const apiLocation = box.displayLocation || box.locationCode;
  const internalCoords = `${store.selectedBox.x}, ${store.selectedBox.y}, ${store.selectedBox.z}`;

  return (
    <div className="fixed bottom-5 right-5 text-white z-50 max-w-sm animate-fadeIn">
      <div className="flex justify-center mb-[-12px] relative z-[51]">
        <button
          className="bg-orange-500 text-white rounded-full p-2 shadow-lg hover:bg-orange-400 transition-colors group"
          onClick={handleUnpin}
          title="Kaldır"
        >
          <BsX className="text-xl" />
        </button>
      </div>
      <div className="bg-gradient-to-br from-[#081330] to-[#152144] rounded-lg shadow-lg p-4 border border-blue-900/50">
        <div className="mb-3 pb-2 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BsPin className="text-orange-400" />
              <h3 className="font-semibold">Seçili Palet</h3>
            </div>
            {apiLocation ? (
              <span className="text-sm bg-blue-800 px-2 py-0.5 rounded text-blue-100">
                {apiLocation}
              </span>
            ) : (
              <span className="text-sm bg-blue-800 px-2 py-0.5 rounded text-blue-100">
                {internalCoords}
              </span>
            )}
          </div>
          
          {/* Show internal coordinates in small text if API location is available */}
          {apiLocation && (
            <div className="text-[10px] text-gray-400 text-right mt-1">
              {internalCoords}
            </div>
          )}
          
          <div className="mt-2 text-lg font-medium text-orange-100">{box.content}</div>
          
          {/* Add customer name (cariAdi) prominently if available */}
          {box.customerName && (
            <div className="mt-1 text-sm text-blue-200">
              <span className="opacity-75">Firma:</span> {box.customerName}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Remove the locationCode display here since we're now showing it at the top */}
          {box.paletId && (
            <div className="col-span-2">
              <span className="text-gray-400 block text-xs mb-0.5">Palet ID</span>
              <span className="text-white font-medium bg-blue-900/40 px-2 py-0.5 rounded">{box.paletId}</span>
            </div>
          )}
          
          {/* Rest of the properties */}
          {box.weight && (
            <div>
              <span className="text-gray-400 block text-xs mb-0.5">Ağırlık</span>
              <div className="flex items-center gap-1 text-white">
                <FaWeightHanging size={11} className="text-orange-400" />
                <span className="font-medium">{box.weight} kg</span>
              </div>
            </div>
          )}
          
          {box.quantity && (
            <div>
              <span className="text-gray-400 block text-xs mb-0.5">Miktar</span>
              <div className="flex items-center gap-1 text-white">
                <FaBox size={11} className="text-orange-400" />
                <span className="font-medium">{box.quantity}</span>
              </div>
            </div>
          )}
          
          {box.stockCode && (
            <div>
              <span className="text-gray-400 block text-xs mb-0.5">Stok Kodu</span>
              <div className="flex items-center gap-1 text-white">
                <FaTags size={11} className="text-orange-400" />
                <span className="font-medium">{box.stockCode}</span>
              </div>
            </div>
          )}
          
          {box.expirationDate && (
            <div>
              <span className="text-gray-400 block text-xs mb-0.5">SKT</span>
              <div className="flex items-center gap-1 text-white">
                <FaRegCalendar size={11} className="text-orange-400" />
                <span className="font-medium">{formatDate(box.expirationDate)}</span>
              </div>
            </div>
          )}
          
          {box.status && (
            <div className="col-span-2 mt-1">
              <span className="text-gray-400 block text-xs mb-0.5">Durum</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                box.status === 'Aktif' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {box.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
