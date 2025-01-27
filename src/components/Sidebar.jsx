import Image from 'next/image'
import huskyLogo from '@/app/assets/husky-nav.png'
import { IoClose, IoSearch } from "react-icons/io5"  // Add IoSearch import
import useStore from '@/store/store'
import { useState, useMemo } from 'react'  // Add useState and useMemo

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, store }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter boxes based on search query
  const filteredBoxes = useMemo(() => {
    if (!searchQuery.trim() || !store.boxData) return store.boxData;
    
    return store.boxData.filter(box => 
      box.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [store.boxData, searchQuery]);

  return (
    <div className={`fixed top-0 -left-0.5 h-full bg-white shadow-xl z-40 transition-transform duration-300 transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`} style={{ width: '250px', marginTop: '60px' }}>
      {/* Logo Box */}
      <div className="bg-[#172554] py-4 shadow-md relative">
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-3 top-3 text-white/80 hover:text-orange-500 transition-colors"
        >
          <IoClose size={20} />
        </button>
        <div className="flex flex-col items-center justify-center gap-2">
          <a 
            href="https://parallax-login.vercel.app" 
            className="cursor-pointer"
          >
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

      <div className="p-3 lg:pr-1">
        {/* Add Search Bar */}
        <div className="mb-3 relative">
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

        {/* Update box list to use filtered results */}
        <div className="overflow-y-auto" style={{ height: 'calc(85vh - 120px)' }}>
          {filteredBoxes?.map((box, index) => (
            <div 
              key={index}
              className={`p-1 mb-1 rounded cursor-pointer transition-colors text-sm ${
                store.selectedBox &&
                store.selectedBox.x === box.boxNumber[0] &&
                store.selectedBox.y === box.boxNumber[1] &&
                store.selectedBox.z === box.boxNumber[2]
                  ? 'bg-orange-400 text-white'
                  : 'hover:bg-orange-200'
              }`}
              onClick={() => {
                store.setSelectedBox({
                  x: box.boxNumber[0],
                  y: box.boxNumber[1],
                  z: box.boxNumber[2]
                });
                store.setFocusedBox(box.boxNumber);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
            >
              <div className="cursor-pointer p-2 rounded">
                <div className="font-medium">Palet {box.boxNumber.join(', ')}</div>
                <div className={`text-xs ${
                  store.selectedBox &&
                  store.selectedBox.x === box.boxNumber[0] &&
                  store.selectedBox.y === box.boxNumber[1] &&
                  store.selectedBox.z === box.boxNumber[2]
                    ? 'text-neutral-50'
                    : 'text-neutral-600'
                }`}>{box.content}</div>
              </div>
            </div>
          ))}
          
          {filteredBoxes?.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 mt-4">
              Aradığınız ürün bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
