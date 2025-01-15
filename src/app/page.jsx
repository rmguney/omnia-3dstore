'use client'
import './globals.css'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import useStore from '@/store/store'
import { stores } from '@/store/mockAPI'
import Scene from '@/components/Scene'
import { BsPin } from "react-icons/bs";

export default function App() {
  const store = useStore()
  const [isFirstPerson, setIsFirstPerson] = useState(store.isFirstPerson)
  const [selectedStore, setSelectedStore] = useState('store1')
  const [hoveredBox, setHoveredBox] = useState(null)
  const [hoveredBoxNumber, setHoveredBoxNumber] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setIsFirstPerson(store.isFirstPerson)
  }, [store.isFirstPerson])

  const toggleCameraMode = () => {
    store.toggleCameraMode()
    setIsFirstPerson(!isFirstPerson)
  }

  const handleStoreChange = (e) => {
    const storeKey = e.target.value
    setSelectedStore(storeKey)
    store.switchStore(storeKey)
  }

  return (
    <>
      <header className="flex justify-between items-center p-4 bg-gradient-to-r from-[#172554] to-[#481754] text-white fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:text-orange-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/favicon.ico" alt="Favicon" className="w-10 h-10" />
        </div>
        <select 
          value={selectedStore} 
          onChange={handleStoreChange} 
          className="px-4 py-1 bg-transparent text-white font-bold text-xl rounded items-center justify-center"
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
            <div className={`dot absolute left-1 top-1 bg-orange-500 w-6 h-6 rounded-full transition ${isFirstPerson ? 'transform translate-x-full' : ''}`}></div>
          </div>
          <span className="ml-3 text-white">{isFirstPerson ? 'Birinci Şahıs' : 'Yörüngesel'}</span>
        </label>
      </header>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ width: '320px', marginTop: '72px' }}>
        <div className="p-4">
          <h3 className="font-bold mb-4 text-lg text-blue-950">Depo İçeriği</h3>
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
            {store.boxData?.map((box, index) => (
              <div 
                key={index}
                className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                  store.selectedBox &&
                  store.selectedBox.x === box.boxNumber[0] &&
                  store.selectedBox.y === box.boxNumber[1] &&
                  store.selectedBox.z === box.boxNumber[2]
                    ? 'bg-orange-300'
                    : 'hover:bg-orange-100'
                }`}
                onClick={() => {
                  store.setSelectedBox({
                    x: box.boxNumber[0],
                    y: box.boxNumber[1],
                    z: box.boxNumber[2]
                  });
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
              >
                <div className="font-medium">Palet {box.boxNumber.join(', ')}</div>
                <div className="text-sm text-gray-600">{box.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Scene 
        onPointerOver={(content, boxNumber) => {
          setHoveredBox(content)
          setHoveredBoxNumber(boxNumber)
        }}
        onPointerOut={() => {
          setHoveredBox(null)
          setHoveredBoxNumber(null)
        }}
      />

      {/* Hovered Box Info */}
      {hoveredBox && hoveredBoxNumber && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 text-blue-950 z-50 max-w-xs">
          <div className="bg-white bg-opacity-80 rounded-lg shadow-lg p-4">
            <div className="font-bold mb-2">
              <span>Palet No: {hoveredBoxNumber.join(', ')}</span>
            </div>
            <div>{hoveredBox}</div>
          </div>
        </div>
      )}

      {/* Pinned Box - Bottom Right */}
      {store.selectedBox && store.boxData && (
        <div className="fixed bottom-5 right-5 text-blue-950 z-50 max-w-xs">
          <div className="flex justify-center mb-[-8px] relative z-[51]">
            <BsPin className="text-orange-500 text-3xl" />
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg shadow-lg p-4">
            <div className="font-bold mb-2">
              <span>Palet No: {store.selectedBox.x}, {store.selectedBox.y}, {store.selectedBox.z}</span>
            </div>
            <div>
              {store.boxData.find(box => 
                box.boxNumber[0] === store.selectedBox.x && 
                box.boxNumber[1] === store.selectedBox.y && 
                box.boxNumber[2] === store.selectedBox.z
              )?.content}
            </div>
          </div>
        </div>
      )}

      <Link href="/parameters" className="px-4 py-2 rounded fixed top-20 right-5 z-50 hidden lg:block">
        Parametre Testi
      </Link>
    </>
  )
}
