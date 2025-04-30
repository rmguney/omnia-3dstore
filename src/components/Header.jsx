import { BsQuestionCircle, BsArrowsMove, BsMouseFill } from "react-icons/bs";
import { FaKeyboard, FaWalking, FaUndo, FaCamera } from "react-icons/fa";
import { PiMouseLeftClickFill, PiMouseRightClickFill, PiMouseMiddleClickFill } from "react-icons/pi";
import { stores } from '@/store/mockAPI';
import { useState, useEffect, useRef } from 'react';

export default function Header({ isSidebarOpen, setIsSidebarOpen, selectedStore, handleStoreChange, isFirstPerson, toggleCameraMode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Get a valid store to display when the selected one doesn't exist
  const storeToDisplay = selectedStore && stores[selectedStore] 
    ? selectedStore 
    : Object.keys(stores)[0] || "CRK-2"; // Default to first store or CRK-2
  
  // When the page loads with an invalid store, select a valid one
  useEffect(() => {
    if (selectedStore && !stores[selectedStore] && stores[storeToDisplay]) {
      handleStoreChange({ target: { value: storeToDisplay } });
    }
  }, [selectedStore, storeToDisplay, handleStoreChange]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center p-2.5 bg-gradient-to-r from-[#172554] to-[#2e1754] text-white shadow-xl fixed top-0 left-0 w-full z-50">
      {/* Left section - Just sidebar toggle now */}
      <div className="flex items-center w-24 justify-start">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-orange-400 transition-colors p-1.5 rounded-full hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Center section - Favicon + Store dropdown */}
      <div className="flex items-center">
        <img src="/favicon.ico" alt="Favicon" className="w-6 h-6 mr-1.5" />
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-3 py-1 bg-transparent text-white hover:text-orange-400 transition-colors duration-200 font-bold text-base rounded flex items-center gap-1.5 tracking-wider border border-transparent hover:border-white/20 hover:bg-white/5"
          >
            {stores[storeToDisplay]?.storeName || "Depo Seçin"}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div 
            ref={dropdownRef}
            className={`absolute left-0 top-full mt-1 w-[100%] rounded-md shadow-lg bg-[#172554] bg-opacity-95 text-white transition-all duration-300 ease-in-out transform origin-top ${
              isDropdownOpen 
                ? 'opacity-100 visible translate-y-0 scale-y-100' 
                : 'opacity-0 invisible -translate-y-4 scale-y-75'
            } overflow-hidden`}
          >
            <div className={`py-1 rounded-md overflow-hidden transition-all duration-300 ${isDropdownOpen ? 'animate-slideDown' : ''}`}>
                {Object.keys(stores).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleStoreChange({ target: { value: key } });
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left p-2 px-3 text-xs font-semibold tracking-wider transition-colors duration-300 ${
                      storeToDisplay === key 
                        ? 'bg-orange-500 text-white' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {stores[key].storeName}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Camera mode toggle */}
      <div className="w-24 flex justify-end">
        <label className="items-center cursor-pointer mr-2 hidden lg:flex">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={isFirstPerson} 
              onChange={toggleCameraMode} 
              className="sr-only"
            />
            <div className="block bg-white/10 w-10 h-5 rounded-full border border-white/30"></div>
            <div className={`dot absolute left-1 top-0.5 bg-orange-500 hover:bg-orange-400 w-4 h-4 rounded-full transition-transform duration-300 ${isFirstPerson ? 'transform translate-x-5' : ''}`}></div>
          </div>
          <span className="ml-2 text-white text-xs">{isFirstPerson ? 'Birinci Şahıs' : 'Yörüngesel'}</span>
          <div className="relative group ml-3">
            <BsQuestionCircle className="text-white hover:text-orange-500 transition-colors cursor-help size-5" />
            <div className="absolute right-0 top-full mt-2 p-3 bg-white text-blue-950 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform origin-top-right pointer-events-none
              group-hover:opacity-100 group-hover:scale-100 group-hover:visible group-hover:translate-y-0
              opacity-0 scale-95 invisible -translate-y-2 w-[280px] text-xs z-50">
              <p className="mb-2 text-sm font-bold text-center border-b pb-1.5">Kontrol Şeması</p>
              
              <div className="mb-3">
                <p className="mb-1.5 font-bold flex items-center gap-1.5 text-orange-600 text-xs">
                  <BsMouseFill className="text-sm" /> Yörüngesel Mod
                </p>
                <ul className="space-y-1.5 ml-1.5">
                  <li className="flex items-center gap-1.5">
                    <PiMouseLeftClickFill className="text-blue-700" /> Sol tık (Basılı): Kamera rotasyonu
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PiMouseRightClickFill className="text-blue-700" /> Sağ tık (Basılı): Kamera kaydırma
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PiMouseMiddleClickFill className="text-blue-700" /> Mouse tekerleği: Yakınlaştırma
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PiMouseLeftClickFill className="text-blue-700" /> Sol tık (Tek): Palet seçimi
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-1.5 font-bold flex items-center gap-1.5 text-orange-600 text-xs">
                  <FaWalking className="text-sm" /> Birinci Şahıs Modu
                </p>
                <ul className="space-y-1.5 ml-1.5">
                  <li className="flex items-center gap-1.5">
                    <FaKeyboard className="text-blue-700" /> WASD / Ok Tuşları: Hareket
                  </li>
                  <li className="flex items-center gap-1.5">
                    <BsArrowsMove className="text-blue-700" /> Mouse hareketi: Kamera kontrolü
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PiMouseLeftClickFill className="text-blue-700" /> Sol tık (Tek): Palet seçimi
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FaUndo className="text-blue-700" /> R: Pozisyonu sıfırlama
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FaCamera className="text-blue-700" /> Q: Birinci şahıs modundan çıkış
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </label>
      </div>
    </header>
  )
}
