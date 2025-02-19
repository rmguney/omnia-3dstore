import Image from 'next/image'
import huskyLogo from '@/app/assets/husky-nav.png'
import { IoClose, IoSearch } from "react-icons/io5"  // Add IoSearch import
import useStore from '@/store/store'
import { useState, useMemo } from 'react'  // Add useState and useMemo

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, store }) {
  const [searchQuery, setSearchQuery] = useState('')

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

    if (searchQuery.trim()) {
      boxes = boxes.filter(box => 
        box.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return boxes;
  }, [store.boxData, store.loadingAreas, store.showLoadingAreaBoxes, searchQuery]);

  return (
    <div 
      className={`fixed top-[60px] bottom-0 -left-0.5 bg-white shadow-xl z-40 transition-transform duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} 
      style={{ width: '250px' }}
    >
      {/* Header */}
      <div className="bg-[#172554] py-4 shadow-md relative">
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-3 top-3 text-white/80 hover:text-orange-500 transition-colors"
        >
          <IoClose size={20} />
        </button>
        <div className="flex flex-col items-center justify-center gap-2">
          <a href="https://parallax-login.vercel.app" className="cursor-pointer">
            <Image
              src={huskyLogo}
              alt="Husky Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </a>
          <h3 className="text-white font-bold text-md">Bu Depodaki Tüm Ürünler</h3>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col h-[calc(100%-132px)] pb-4">
        {/* Search and Toggle */}
        <div className="p-3 space-y-3 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün arama"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1 bg-gray-100 border border-gray-200 text-sm rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                       pr-10"
            />
            <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLoadingAreas"
              checked={store.showLoadingAreaBoxes}
              onChange={() => store.toggleLoadingAreaBoxes()}
              className="mr-2"
            />
            <label htmlFor="showLoadingAreas" className="text-xs text-slate-600">
              Yükleme ve mal kabul alanlarındaki ürünleri listele
            </label>
          </div>
        </div>

        {/* Box List - Flexible height with scroll */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {allBoxes.map((box, index) => (
            <div 
              key={`${box.isLoadingArea ? 'loading-' : ''}${index}`}
              className={`p-1 mb-1 rounded cursor-pointer transition-colors text-sm ${
                store.selectedBox &&
                store.selectedBox.x === box.boxNumber[0] &&
                store.selectedBox.y === box.boxNumber[1] &&
                store.selectedBox.z === box.boxNumber[2] &&
                store.selectedBox.isLoadingArea === !!box.isLoadingArea &&
                (!box.isLoadingArea || store.selectedBox.areaKey === box.areaKey)
                  ? 'bg-orange-400 text-white'
                  : 'hover:bg-orange-200'
              }`}
              onClick={() => {
                store.setFocusedBox(box.boxNumber, box.isLoadingArea, box.areaKey);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
            >
              <div className="cursor-pointer p-2 rounded">
                <div className="font-medium flex items-center gap-2">
                  {box.isLoadingArea && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-semibold tracking-wide">
                      {store.loadingAreas[box.areaKey].isMalKabul ? 'KABUL ALANI' : 'YÜKLEME ALANI'}
                    </span>
                  )}
                  <span>Palet {box.boxNumber.join(', ')}</span>
                </div>
                <div className={`text-xs mt-1 ${
                  store.selectedBox &&
                  store.selectedBox.x === box.boxNumber[0] &&
                  store.selectedBox.y === box.boxNumber[1] &&
                  store.selectedBox.z === box.boxNumber[2]
                    ? 'text-neutral-50'
                    : 'text-neutral-600'
                }`}>
                  {box.content}
                </div>
              </div>
            </div>
          ))}
          
          {allBoxes.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 mt-4">
              Aradığınız ürün bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
