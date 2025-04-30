import { BsQuestionCircle, BsArrowsMove, BsMouseFill } from "react-icons/bs";
import { FaKeyboard, FaWalking, FaUndo, FaCamera } from "react-icons/fa";
import { PiMouseLeftClickFill, PiMouseRightClickFill, PiMouseMiddleClickFill } from "react-icons/pi";
import { stores } from '@/store/mockAPI';
import { useState, useEffect, useRef } from 'react';

export default function Header({ isSidebarOpen, setIsSidebarOpen, selectedStore, handleStoreChange, isFirstPerson, toggleCameraMode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
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
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-[#172554] to-[#2e1754] text-white shadow-md fixed top-0 left-0 w-full z-50">
      {/* Left section - Just sidebar toggle now */}
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-orange-400 transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Center section - Favicon + Store dropdown */}
      <div className="flex items-center">
        <img src="/favicon.ico" alt="Favicon" className="w-7 h-7 mr-2" />
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-1.5 bg-transparent text-white hover:text-orange-400 transition-colors duration-200 font-bold text-xl rounded flex items-center gap-2 tracking-wider border border-transparent hover:border-white/20 hover:bg-white/5"
          >
            {stores[selectedStore].storeName}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div 
            ref={dropdownRef}
            className={`absolute left-0 top-full mt-1 w-full min-w-[180px] rounded-md shadow-lg bg-[#172554] bg-opacity-95 text-white transition-all duration-300 ease-in-out transform origin-top ${
              isDropdownOpen 
                ? 'opacity-100 scale-100 visible translate-y-0' 
                : 'opacity-0 scale-95 invisible -translate-y-2'
            }`}
          >
            <div className="py-1 rounded-md overflow-hidden">
                {Object.keys(stores).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleStoreChange({ target: { value: key } });
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left p-2.5 px-4 text-sm font-semibold tracking-wider transition-colors duration-300 ${
                      selectedStore === key 
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
      <label className="items-center cursor-pointer mr-3 hidden lg:flex">
        <div className="relative">
          <input 
            type="checkbox" 
            checked={isFirstPerson} 
            onChange={toggleCameraMode} 
            className="sr-only"
          />
          <div className="block bg-white/10 w-12 h-6 rounded-full border border-white/30"></div>
          <div className={`dot absolute left-1 top-1 bg-orange-500 hover:bg-orange-400 w-4 h-4 rounded-full transition-transform duration-300 ${isFirstPerson ? 'transform translate-x-6' : ''}`}></div>
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
                  <PiMouseLeftClickFill className="text-blue-700" /> Sol tık (Basılı): Kamera rotasyonu
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseRightClickFill className="text-blue-700" /> Sağ tık (Basılı): Kamera kaydırma
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseMiddleClickFill className="text-blue-700" /> Mouse tekerleği: Yakınlaştırma
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseLeftClickFill className="text-blue-700" /> Sol tık (Tek): Palet seçimi
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2 font-bold flex items-center gap-2 text-orange-600">
                <FaWalking className="text-lg" /> Birinci Şahıs Modu
              </p>
              <ul className="space-y-2 ml-2">
                <li className="flex items-center gap-2">
                  <FaKeyboard className="text-blue-700" /> WASD / Ok Tuşları: Hareket
                </li>
                <li className="flex items-center gap-2">
                  <BsArrowsMove className="text-blue-700" /> Mouse hareketi: Kamera kontrolü
                </li>
                <li className="flex items-center gap-2">
                  <PiMouseLeftClickFill className="text-blue-700" /> Sol tık (Tek): Palet seçimi
                </li>
                <li className="flex items-center gap-2">
                  <FaUndo className="text-blue-700" /> R: Pozisyonu sıfırlama
                </li>
                <li className="flex items-center gap-2">
                  <FaCamera className="text-blue-700" /> Q: Birinci şahıs modundan çıkış
                </li>
              </ul>
            </div>
          </div>
        </div>
      </label>
    </header>
  )
}
