import Image from 'next/image'
import huskyLogo from '@/app/assets/husky-nav.png'
import { IoClose, IoSearch, IoFilter, IoInformationCircle } from "react-icons/io5"
import { HiSortAscending } from "react-icons/hi"
import { FaPallet, FaRegCalendar, FaWeightHanging, FaBox, FaMapMarkerAlt, FaBarcode, FaTags, FaLayerGroup, FaHistory, FaWarehouse, FaUser } from "react-icons/fa"
import useStore from '@/store/store'
import { useState, useMemo, useRef, useEffect } from 'react'

// Helper to format dates
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

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, store }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('location') // location, expiry, weight
  const [showExtraInfo, setShowExtraInfo] = useState({}) // Track which boxes show extra info
  const filterRef = useRef(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  
  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle extra info visibility for a specific box
  const toggleExtraInfo = (boxId) => {
    setShowExtraInfo(prev => ({
      ...prev,
      [boxId]: !prev[boxId]
    }));
  };

  // Combine regular boxes and loading area boxes based on toggle
  const allBoxes = useMemo(() => {
    let boxes = [...(store.boxData || [])];
    
    if (store.showLoadingAreaBoxes) {
      Object.entries(store.loadingAreas || {}).forEach(([areaKey, area]) => {
        const areaBoxes = area.boxes?.map(box => ({
          ...box,
          isLoadingArea: true,
          areaKey
        })) || [];
        boxes = [...boxes, ...areaBoxes];
      });
    }

    // Apply search filter across multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      boxes = boxes.filter(box => 
        (box.content && box.content.toLowerCase().includes(query)) ||
        (box.paletId && box.paletId.toLowerCase().includes(query)) ||
        (box.stockCode && box.stockCode.toLowerCase().includes(query)) ||
        (box.customerName && box.customerName.toLowerCase().includes(query)) ||
        (box.locationCode && box.locationCode.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter if not set to 'all'
    if (statusFilter !== 'all') {
      boxes = boxes.filter(box => {
        if (statusFilter === 'active') return box.status === 'Aktif';
        if (statusFilter === 'inactive') return box.status !== 'Aktif';
        return true;
      });
    }

    // Apply sorting
    if (sortBy === 'location') {
      boxes.sort((a, b) => {
        const aLoc = a.locationCode || '';
        const bLoc = b.locationCode || '';
        return aLoc.localeCompare(bLoc);
      });
    } else if (sortBy === 'expiry') {
      boxes.sort((a, b) => {
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return new Date(a.expirationDate) - new Date(b.expirationDate);
      });
    } else if (sortBy === 'weight') {
      boxes.sort((a, b) => {
        const aWeight = a.weight || 0;
        const bWeight = b.weight || 0;
        return bWeight - aWeight;
      });
    }

    return boxes;
  }, [store.boxData, store.loadingAreas, store.showLoadingAreaBoxes, searchQuery, statusFilter, sortBy]);

  // Generate a unique ID for each box for tracking expanded state
  const getBoxId = (box) => {
    if (box.isLoadingArea) {
      return `loading-${box.areaKey}-${box.boxNumber.join('-')}`;
    }
    return `box-${box.boxNumber.join('-')}`;
  };

  return (
    <div 
      className={`fixed top-[50px] bottom-0 -left-0.5 bg-white shadow-xl z-40 transition-all duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} 
      style={{ width: '250px' }}
    >
      {/* Header */}
      <div className="bg-[#172554] py-2 shadow-md relative">
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-2 top-4 text-white/80 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <IoClose size={16} />
        </button>
        <div className="flex flex-col items-center justify-center gap-1">
          <a href="https://www.b2cargo.com/online-islemler" className="cursor-pointer">
            <div className="p-1 lg:pt-3">
              <div className="relative group">
                <div className="absolute inset-[25%] rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300 bg-orange-500 blur-sm z-0"></div>
                <Image
                  src={huskyLogo}
                  alt="Husky Logo"
                  width={60}
                  height={60}
                  className="object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </div>
          </a>
          <h3 className="text-white font-bold text-sm tracking-wide">Bu Depodaki Tüm Ürünler</h3>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col h-[calc(100%-112px)] pb-2">
        {/* Search and Toggle */}
        <div className="p-2 space-y-2 shrink-0 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün, palet no veya lokasyon ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-100 border border-gray-200 text-xs rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                       pr-16 pl-8 transition-all shadow-sm hover:shadow"
            />
            <IoSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            
            {/* Filter button */}
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex gap-1.5">
              {/* Sort button */}
              <button
                onClick={() => setSortBy(sortBy === 'location' ? 'weight' : sortBy === 'weight' ? 'expiry' : 'location')}
                className={`text-gray-500 hover:text-orange-500 transition-colors p-0.5 rounded-full hover:bg-orange-50`}
                title={`Sırala: ${sortBy === 'location' ? 'Lokasyon' : sortBy === 'weight' ? 'Ağırlık' : 'SKT'}`}
              >
                <HiSortAscending size={15} />
              </button>
              
              <button
                onClick={() => setFilterOpen(prev => !prev)}
                className={`text-gray-500 hover:text-orange-500 transition-colors p-0.5 rounded-full hover:bg-orange-50 ${filterOpen || statusFilter !== 'all' ? 'text-orange-500 bg-orange-50' : ''}`}
              >
                <IoFilter size={15} />
              </button>
            </div>
            
            {/* Filter dropdown */}
            {filterOpen && (
              <div 
                ref={filterRef}
                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-52 overflow-hidden animate-fadeIn"
              >
                <div className="p-2.5 space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Durum Filtresi</p>
                    <div className="flex gap-1">
                      {['all', 'active', 'inactive'].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`text-xs rounded-full px-2.5 py-0.5 flex-1 transition-colors ${
                            statusFilter === status 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status === 'all' ? 'Tümü' : status === 'active' ? 'Aktif' : 'İnaktif'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id="showLoadingAreas"
                          checked={store.showLoadingAreaBoxes}
                          onChange={() => store.toggleLoadingAreaBoxes()}
                          className="sr-only"
                        />
                        <div className={`w-8 h-4 rounded-full transition ${
                          store.showLoadingAreaBoxes ? 'bg-orange-500' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                          store.showLoadingAreaBoxes ? 'translate-x-4' : ''
                        }`}></div>
                      </div>
                      <span>Yükleme ve mal kabul alanlarını listele</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Box List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1.5">
          {/* Stats bar */}
          <div className="flex justify-between text-xs text-gray-500 mb-2 px-1.5">
            <span>{allBoxes.length} ürün</span>
            <span className="italic text-[10px]">
              {sortBy === 'location' ? 'Lokasyona göre sıralama' : 
               sortBy === 'weight' ? 'Ağırlığa göre sıralama' : 
               'SKT\'ye göre sıralama'}
            </span>
          </div>

          <div className="space-y-1.5">
            {allBoxes.map((box) => {
              const boxId = getBoxId(box);
              const isExpanded = showExtraInfo[boxId];
              const isSelected = store.selectedBox &&
                store.selectedBox.x === box.boxNumber[0] &&
                store.selectedBox.y === box.boxNumber[1] &&
                store.selectedBox.z === box.boxNumber[2] &&
                store.selectedBox.isLoadingArea === !!box.isLoadingArea &&
                (!box.isLoadingArea || store.selectedBox.areaKey === box.areaKey);
              
              const [x, y, z] = box.boxNumber || [0, 0, 0];
              
              // Get all API data
              const apiData = box._apiData || {};

              return (
                <div 
                  key={`box-${store.selectedStore}-${x}-${y}-${z}`}
                  className={`p-3 mb-2 rounded cursor-pointer ${
                    isSelected ? 
                      'bg-orange-100 border-l-4 border-orange-500' : 
                      'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    store.setFocusedBox(box.boxNumber, box.isLoadingArea, box.areaKey);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                >
                  {/* Box header with location info - MAIN INFO */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-1.5">
                      <div className="font-medium flex items-center gap-1 text-xs">
                        <FaMapMarkerAlt className="text-orange-500 flex-shrink-0" size={10} />
                        {box.locationCode || apiData.lokasyonKodu || `Palet ${box.boxNumber.join(', ')}`}
                        
                        {box.isLoadingArea && (
                          <span className="px-1 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-semibold tracking-wide whitespace-nowrap ml-1">
                            {box.areaKey?.includes('front') ? 'ÖN' : 'ARKA'} 
                            {box.areaKey?.includes('Left') ? ' SOL' : ' SAĞ'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-orange-800 mt-0.5 line-clamp-1">
                        {box.content || apiData.stokCinsi}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleExtraInfo(boxId);
                      }}
                      className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${isExpanded ? 'bg-gray-100' : ''}`}
                    >
                      <IoInformationCircle size={16} className={`${isExpanded ? 'text-orange-500' : 'text-gray-400'}`} />
                    </button>
                  </div>

                  {/* Summary info row always visible - MAIN INFO */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-600">
                    {/* Customer Name - MAIN INFO */}
                    {(box.customerName || apiData.cariAdi) && (
                      <div className="flex-1 truncate">
                        <span className="opacity-75">Firma:</span> {box.customerName || apiData.cariAdi}
                      </div>
                    )}
                    
                    {/* Quantity - MAIN INFO */}
                    {(box.quantity || apiData.toplam) && (
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <FaBox size={9} className="text-gray-500" />
                        <span>{box.quantity || apiData.toplam}</span>
                      </div>
                    )}
                    
                    {/* Expiry Date - MAIN INFO */}
                    {(box.expirationDate || apiData.skT_) && (
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <FaRegCalendar size={9} className="text-orange-500" />
                        <span>{formatDate(box.expirationDate || apiData.skT_)}</span>
                      </div>
                    )}
                  </div>

                  {/* Expanded details - ADDITIONAL INFO */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t text-[10px] space-y-1.5 text-gray-700 animate-fadeIn">
                      {/* Pallet ID */}
                      {(box.paletId || apiData.palet) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Palet ID:</span>
                          <span className="font-medium">{box.paletId || apiData.palet}</span>
                        </div>
                      )}
                      
                      {/* Stock code */}
                      {(box.stockCode || apiData.stokKodu) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Stok Kodu:</span>
                          <span className="font-medium bg-gray-50 px-1.5 py-0.5 rounded">{box.stockCode || apiData.stokKodu}</span>
                        </div>
                      )}
                      
                      {/* Customer code */}
                      {apiData.cariKodu && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Müşteri Kodu:</span>
                          <span className="font-medium">{apiData.cariKodu}</span>
                        </div>
                      )}
                      
                      {/* Weight */}
                      {(box.weight || apiData.toplamAgirlik) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Ağırlık:</span>
                          <span className="font-medium">{box.weight || apiData.toplamAgirlik} kg</span>
                        </div>
                      )}
                      
                      {/* Total desi */}
                      {apiData.toplamDesi && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Toplam Desi:</span>
                          <span className="font-medium">{apiData.toplamDesi}</span>
                        </div>
                      )}
                      
                      {/* Status */}
                      {(box.status || apiData.durum) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Durum:</span>
                          <span className={`font-medium px-1.5 py-0.5 rounded-full text-white text-[9px] uppercase tracking-wider ${
                            (box.status || apiData.durum) === 'Aktif' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {box.status || apiData.durum}
                          </span>
                        </div>
                      )}
                      
                      {/* Entry date */}
                      {(box.entryDate || apiData.girisTarihi) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Giriş:</span>
                          <span className="font-medium">{formatDate(box.entryDate || apiData.girisTarihi)}</span>
                        </div>
                      )}
                      
                      {/* Barcode */}
                      {apiData.barkod && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Barkod:</span>
                          <span className="font-medium bg-gray-50 px-1.5 py-0.5 rounded">{apiData.barkod}</span>
                        </div>
                      )}
                      
                      {/* Lot number */}
                      {apiData.lotNo && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Lot No:</span>
                          <span className="font-medium">{apiData.lotNo}</span>
                        </div>
                      )}
                      
                      {/* Location type */}
                      {apiData.lokasyonTipi && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Lokasyon Tipi:</span>
                          <span className="font-medium">{apiData.lokasyonTipi}</span>
                        </div>
                      )}
                      
                      {/* Description - if different from location code */}
                      {apiData.aciklama && apiData.aciklama !== apiData.lokasyonKodu && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Açıklama:</span>
                          <span className="font-medium">{apiData.aciklama}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {allBoxes.length === 0 && (
            <div className="text-center text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
              <div className="flex justify-center mb-2">
                <FaBox size={28} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-600 text-sm">Ürün bulunamadı</p>
              <p className="text-[10px] mt-1.5 max-w-[80%] mx-auto">
                {searchQuery ? 
                  'Arama kriterlerinize uygun ürün yok.' : 
                  'Bu depo boş ya da veriler yüklenemedi.'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 px-2.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] hover:bg-orange-200 transition-colors"
                >
                  Aramayı Temizle
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
