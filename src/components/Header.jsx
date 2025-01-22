import { BsQuestionCircle, BsArrowsMove, BsMouseFill } from "react-icons/bs";
import { FaKeyboard, FaWalking, FaUndo, FaCamera } from "react-icons/fa";
import { PiMouseLeftClickFill, PiMouseRightClickFill, PiMouseMiddleClickFill } from "react-icons/pi";
import { stores } from '@/store/mockAPI';
import { useState, useEffect, useRef } from 'react';

export default function Header({ isSidebarOpen, setIsSidebarOpen, selectedStore, handleStoreChange, isFirstPerson, toggleCameraMode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-[#172554] to-[#2e1754] text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-orange-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/favicon.ico" alt="Favicon" className="w-7 h-7 lg:ml-4" />
      </div>
      
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-4 bg-transparent text-white hover:text-orange-400 transition-colors duration-200 font-bold text-xl rounded flex items-center gap-2 tracking-widest"
        >
          {stores[selectedStore].storeName}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className={`absolute top-full mt-4 w-48 rounded-md shadow-lg bg-[#172554] bg-opacity-95 text-white transition-all duration-300 ease-in-out transform origin-top ${
          isDropdownOpen 
            ? 'opacity-100 scale-100 visible translate-y-0' 
            : 'opacity-0 scale-95 invisible -translate-y-2'
        }`}>
          <div className="py-1">
              {Object.keys(stores).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    handleStoreChange({ target: { value: key } });
                    setIsDropdownOpen(false);
                  }}
                  className={`block w-full text-center p-2 text-sm font-semibold tracking-wider hover:text-orange border-2 border-transparent rounded-md hover:text-orange-300 transition-colors duration-300 ${
                    selectedStore === key ? 'border-orange-500 text-orange-500' : 'text-white'
                  }`}
                >
                  {stores[key].storeName}
                </button>
              ))}
            </div>
          </div>
      </div>

      <label className="items-center cursor-pointer mr-3 hidden lg:flex">
        <div className="relative">
          <input 
            type="checkbox" 
            checked={isFirstPerson} 
            onChange={toggleCameraMode} 
            className="sr-only"
          />
          <div className="block bg-transparent border-2 border-white w-12 h-7 rounded-full"></div>
          <div className={`dot absolute left-1 top-1 bg-orange-500 hover:bg-orange-400 w-5 h-5 rounded-full transition ${isFirstPerson ? 'transform translate-x-full' : ''}`}></div>
        </div>
        <span className="ml-3 text-white text-sm">{isFirstPerson ? 'Birinci Şahıs' : 'Yörüngesel'}</span>
        <div className="relative group ml-4">
          <BsQuestionCircle className="text-white hover:text-orange-500 transition-colors cursor-help size-6" />
          <div className="absolute right-0 top-full mt-2 p-4 bg-white text-blue-950 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform origin-top-right pointer-events-none
            group-hover:opacity-100 group-hover:scale-100 group-hover:visible group-hover:translate-y-0
            opacity-0 scale-95 invisible -translate-y-2 w-72 text-sm">
            <p className="mb-3 text-lg font-bold text-center border-b pb-2">Kontrol Şeması</p>
            
            <div className="mb-4">
              <p className="mb-2 font-bold flex items-center gap-2 text-orange-600">
                <BsMouseFill className="text-lg" /> Yörüngesel Mod
              </p>
              <ul className="space-y-2 ml-2">
                <li className="flex items-center gap-2">
                  <PiMouseLeftClickFill /> Sol tık (Basılı): Kamera rotasyonu
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseRightClickFill  /> Sağ tık (Basılı): Kamera kaydırma
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseMiddleClickFill /> Mouse tekerleği: Yakınlaştırma
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseLeftClickFill /> Sol tık (Tek): Palet seçimi
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2 font-bold flex items-center gap-2 text-orange-600">
                <FaWalking className="text-lg" /> Birinci Şahıs Modu
              </p>
              <ul className="space-y-2 ml-2">
                <li className="flex items-center gap-2">
                  <FaKeyboard /> WASD / Ok Tuşları: Hareket
                </li>
                <li className="flex items-center gap-2">
                  <BsArrowsMove /> Mouse hareketi: Kamera kontrolü
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseLeftClickFill /> Sol tık (Tek): Palet seçimi
                </li>
                <li className="flex items-center gap-2">
                  <FaUndo /> R: Pozisyonu sıfırlama
                </li>
                <li className="flex items-center gap-2">
                  <FaCamera /> Q: Birinci şahıs modundan çıkış
                </li>
              </ul>
            </div>
          </div>
        </div>
      </label>
    </header>
  )
}
