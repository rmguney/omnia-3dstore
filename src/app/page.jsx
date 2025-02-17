'use client'
import './globals.css'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import useStore from '@/store/store'
import Scene from '@/components/Scene'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import HoveredBox from '@/components/HoveredBox'
import PinnedBox from '@/components/PinnedBox'

export default function App() {
  const store = useStore()
  const [isFirstPerson, setIsFirstPerson] = useState(store.isFirstPerson)
  const [selectedStore, setSelectedStore] = useState('store1')
  const [hoveredBox, setHoveredBox] = useState(null)
  const [hoveredBoxNumber, setHoveredBoxNumber] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Initialize as false

  // Initialize store and loading areas on mount
  useEffect(() => {
    // Force double initialization to ensure loading areas are populated
    store.initializeBoxData();
    // Small delay to ensure state is updated
    requestAnimationFrame(() => {
      store.initializeBoxData();
    });
  }, []); // Run only on mount

  // Initialize sidebar state based on screen size after mount
  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 1024)
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        selectedStore={selectedStore} 
        handleStoreChange={handleStoreChange} 
        isFirstPerson={isFirstPerson} 
        toggleCameraMode={toggleCameraMode} 
      />

      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        store={store} 
      />

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

      <HoveredBox hoveredBox={hoveredBox} hoveredBoxNumber={hoveredBoxNumber} />

      <PinnedBox store={store} />

      <Link href="/parameters" className="px-4 py-2 rounded fixed bottom-5 right-5 z-30 hidden xl:block text-gray-700">
        Parametre Testi
        <br/>
        <small>Dev Beta 0.1.0</small>
      </Link>
    </>
  )
}
