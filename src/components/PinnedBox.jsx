import { BsPin, BsX, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { FaRegCalendar, FaWeightHanging, FaBox, FaTags, FaMapMarkerAlt, FaInfo, FaBarcode, FaUser, FaLayerGroup, FaHistory, FaWarehouse } from "react-icons/fa";
import { useState } from "react";

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
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  
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
  
  // Extract all available data from the API data object
  const apiData = box._apiData || {};
  
  // Main display data
  const companyName = box.customerName || apiData.cariAdi;
  const locationCode = apiLocation || apiData.lokasyonKodu;
  const quantity = box.quantity || apiData.toplam;
  const expiryDate = box.expirationDate || apiData.skT_;

  return (
    <div className="fixed bottom-3 right-3 text-white z-50 max-w-sm animate-fadeIn">
      <div className="flex justify-center mb-[-10px] relative z-[51]">
        <button
          className="bg-orange-500 text-white rounded-full p-1.5 shadow-lg hover:bg-orange-400 transition-colors"
          onClick={handleUnpin}
          title="Kaldır"
        >
          <BsX className="text-lg" />
        </button>
      </div>
      <div className="bg-gradient-to-br from-[#081330] to-[#152144] rounded-lg shadow-lg p-3 border border-blue-900/50">
        {/* Header section with location */}
        <div className="mb-2 pb-1.5 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <BsPin className="text-orange-400 text-sm" />
              <h3 className="font-semibold text-sm">Seçili Palet</h3>
            </div>
            {locationCode ? (
              <span className="text-xs bg-blue-800 px-1.5 py-0.5 rounded text-blue-100">
                {locationCode}
              </span>
            ) : (
              <span className="text-xs bg-blue-800 px-1.5 py-0.5 rounded text-blue-100">
                {internalCoords}
              </span>
            )}
          </div>
          
          {/* Show internal coordinates in small text if API location is available */}
          {locationCode && locationCode !== internalCoords && (
            <div className="text-[9px] text-gray-400 text-right">
              {internalCoords}
            </div>
          )}
          
          {/* Item description */}
          <div className="mt-1 text-base font-medium text-orange-100">{box.content || apiData.stokCinsi}</div>
          
          {/* Company name (primary info) */}
          {companyName && (
            <div className="mt-0.5 text-xs text-blue-200">
              <span className="opacity-75">Firma:</span> {companyName}
            </div>
          )}
        </div>
        
        {/* Main data section - Always visible */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
          {/* Quantity (primary info) */}
          {quantity && (
            <div>
              <span className="text-gray-400 block text-[10px]">Miktar</span>
              <div className="flex items-center gap-1 text-white">
                <FaBox size={10} className="text-orange-400" />
                <span className="font-medium">{quantity}</span>
              </div>
            </div>
          )}
          
          {/* Expiry date (primary info) */}
          {expiryDate && (
            <div>
              <span className="text-gray-400 block text-[10px]">SKT</span>
              <div className="flex items-center gap-1 text-white">
                <FaRegCalendar size={10} className="text-orange-400" />
                <span className="font-medium">{formatDate(expiryDate)}</span>
              </div>
            </div>
          )}
          
          {/* Pallet ID */}
          {(box.paletId || apiData.palet) && (
            <div className="col-span-2">
              <span className="text-gray-400 block text-[10px] mb-0.5">Palet ID</span>
              <span className="text-white font-medium bg-blue-900/40 px-1.5 py-0.5 rounded text-xs">{box.paletId || apiData.palet}</span>
            </div>
          )}
          
          {/* Status */}
          {(box.status || apiData.durum) && (
            <div className="col-span-2">
              <span className="text-gray-400 block text-[10px]">Durum</span>
              <span className={`inline-block px-1.5 py-px rounded-full text-[10px] font-medium ${
                (box.status || apiData.durum) === 'Aktif' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {box.status || apiData.durum}
              </span>
            </div>
          )}
        </div>
        
        {/* Expand/collapse toggle */}
        <button 
          onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
          className="w-full flex items-center justify-center gap-1 text-[10px] text-blue-300 hover:text-blue-200 py-1 border-t border-blue-900/30"
        >
          {showAdditionalInfo ? (
            <>Detayları Gizle <BsChevronUp size={10} /></>
          ) : (
            <>Tüm Detayları Göster <BsChevronDown size={10} /></>
          )}
        </button>
        
        {/* Additional data section - Collapsible */}
        {showAdditionalInfo && (
          <div className="mt-2 pt-2 border-t border-blue-900/30 grid grid-cols-2 gap-x-3 gap-y-2 text-xs animate-fadeIn">
            {/* Stock code */}
            {(box.stockCode || apiData.stokKodu) && (
              <div className="col-span-2">
                <span className="text-gray-400 block text-[10px]">Stok Kodu</span>
                <div className="flex items-center gap-1 text-white">
                  <FaTags size={10} className="text-orange-400" />
                  <span className="font-medium">{box.stockCode || apiData.stokKodu}</span>
                </div>
              </div>
            )}
            
            {/* Weight */}
            {(box.weight || apiData.toplamAgirlik) && (
              <div>
                <span className="text-gray-400 block text-[10px]">Ağırlık</span>
                <div className="flex items-center gap-1 text-white">
                  <FaWeightHanging size={10} className="text-orange-400" />
                  <span className="font-medium">{box.weight || apiData.toplamAgirlik} kg</span>
                </div>
              </div>
            )}
            
            {/* Total desi */}
            {apiData.toplamDesi && (
              <div>
                <span className="text-gray-400 block text-[10px]">Toplam Desi</span>
                <div className="flex items-center gap-1 text-white">
                  <FaBox size={10} className="text-orange-400" />
                  <span className="font-medium">{apiData.toplamDesi}</span>
                </div>
              </div>
            )}
            
            {/* Customer code */}
            {apiData.cariKodu && (
              <div>
                <span className="text-gray-400 block text-[10px]">Müşteri Kodu</span>
                <div className="flex items-center gap-1 text-white">
                  <FaUser size={10} className="text-orange-400" />
                  <span className="font-medium">{apiData.cariKodu}</span>
                </div>
              </div>
            )}
            
            {/* Entry date */}
            {(apiData.girisTarihi || box.entryDate) && (
              <div>
                <span className="text-gray-400 block text-[10px]">Giriş Tarihi</span>
                <div className="flex items-center gap-1 text-white">
                  <FaHistory size={10} className="text-orange-400" />
                  <span className="font-medium">{formatDate(apiData.girisTarihi || box.entryDate)}</span>
                </div>
              </div>
            )}
            
            {/* Location type */}
            {apiData.lokasyonTipi && (
              <div>
                <span className="text-gray-400 block text-[10px]">Lokasyon Tipi</span>
                <div className="flex items-center gap-1 text-white">
                  <FaWarehouse size={10} className="text-orange-400" />
                  <span className="font-medium">{apiData.lokasyonTipi}</span>
                </div>
              </div>
            )}
            
            {/* Barcode */}
            {apiData.barkod && (
              <div className="col-span-2">
                <span className="text-gray-400 block text-[10px]">Barkod</span>
                <div className="flex items-center gap-1 text-white">
                  <FaBarcode size={10} className="text-orange-400" />
                  <span className="font-medium bg-blue-900/40 px-1.5 py-0.5 rounded">{apiData.barkod}</span>
                </div>
              </div>
            )}
            
            {/* Lot number */}
            {apiData.lotNo && (
              <div>
                <span className="text-gray-400 block text-[10px]">Lot No</span>
                <div className="flex items-center gap-1 text-white">
                  <FaLayerGroup size={10} className="text-orange-400" />
                  <span className="font-medium">{apiData.lotNo}</span>
                </div>
              </div>
            )}
            
            {/* Description */}
            {apiData.aciklama && apiData.aciklama !== apiData.lokasyonKodu && (
              <div className="col-span-2">
                <span className="text-gray-400 block text-[10px]">Açıklama</span>
                <div className="flex items-center gap-1 text-white">
                  <FaInfo size={10} className="text-orange-400" />
                  <span className="font-medium">{apiData.aciklama}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
