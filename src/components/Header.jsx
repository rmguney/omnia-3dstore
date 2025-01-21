import { BsQuestionCircle, BsArrowsMove, BsMouseFill } from "react-icons/bs";
import { FaKeyboard, FaWalking, FaUndo, FaCamera } from "react-icons/fa";
import { PiMouseLeftClickFill, PiMouseRightClickFill, PiMouseMiddleClickFill } from "react-icons/pi";
import { stores } from '@/store/mockAPI';

export default function Header({ isSidebarOpen, setIsSidebarOpen, selectedStore, handleStoreChange, isFirstPerson, toggleCameraMode }) {
  return (
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-[#172554] to-[#481754] text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-orange-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/favicon.ico" alt="Favicon" className="w-8 h-8 lg:ml-4" />
      </div>
      <select 
        value={selectedStore} 
        onChange={handleStoreChange} 
        className="px-4 py-1 bg-transparent text-white hover:text-orange-500 transition-colors duration-150 font-bold text-xl rounded items-center justify-center"
      >
        {Object.keys(stores).map((key) => (
          <option key={key} value={key} className="text-blue-950">
            {stores[key].storeName}
          </option>
        ))}
      </select>
      <label className="items-center cursor-pointer mr-3 hidden lg:flex">
        <div className="relative">
          <input 
            type="checkbox" 
            checked={isFirstPerson} 
            onChange={toggleCameraMode} 
            className="sr-only"
          />
          <div className="block bg-transparent border-2 border-white w-14 h-8 rounded-full"></div>
          <div className={`dot absolute left-1 top-1 bg-orange-500 hover:bg-orange-600 w-6 h-6 rounded-full transition ${isFirstPerson ? 'transform translate-x-full' : ''}`}></div>
        </div>
        <span className="ml-3 text-white">{isFirstPerson ? 'Birinci Şahıs' : 'Yörüngesel'}</span>
        <div className="relative group ml-4">
          <BsQuestionCircle className="text-white hover:text-orange-500 transition-colors text-2xl cursor-help" />
          <div className="absolute right-0 top-full mt-2 p-4 bg-white text-blue-950 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-72 text-sm pointer-events-none">
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
