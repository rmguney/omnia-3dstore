'use client'
import Link from 'next/link'
import useStore from '@/store/store'

export default function Parameters() {
  const store = useStore()

  const handleDimensionChange = (key, value) => {
    const newValue = Math.max(1, parseInt(value) || 1)
    store.setDimensions({ [key]: newValue })
    store.initializeBoxData()
    apiData[key] = newValue // Update apiData
  }

  const handleGapChange = (key, value) => {
    const newValue = parseFloat(value) || 0
    store.setGaps({ [key]: newValue })
    apiData[key] = newValue // Update apiData
  }

  return (
    <div className="parameters-page">
      <Link href="/" className="back-button">Sahne</Link>
      
      <div className="controls">
        <label>Raflar X: </label>
        <input 
          type="number" 
          value={store.shelvesX} 
          onChange={(e) => handleDimensionChange('shelvesX', e.target.value)} 
          min="1" 
        />
        <label>Raflar Y: </label>
        <input 
          type="number" 
          value={store.shelvesY} 
          onChange={(e) => handleDimensionChange('shelvesY', e.target.value)} 
          min="1" 
        />
        <label>Raflar Z: </label>
        <input 
          type="number" 
          value={store.shelvesZ} 
          onChange={(e) => handleDimensionChange('shelvesZ', e.target.value)} 
          min="2" 
          step="2" 
        />

        <label>Aralık X: </label>
        <input 
          type="number" 
          value={store.gapX} 
          onChange={(e) => handleGapChange('gapX', e.target.value)} 
          min="0" 
        />
        <label>Aralık Y: </label>
        <input 
          type="number" 
          value={store.gapY} 
          onChange={(e) => handleGapChange('gapY', e.target.value)} 
          min="0" 
        />
        <label>Aralık Z: </label>
        <input 
          type="number" 
          value={store.gapZ} 
          onChange={(e) => handleGapChange('gapZ', e.target.value)} 
          min="0" 
        />
        <label>Sırt Aralığı: </label>
        <input 
          type="number" 
          value={store.backGap} 
          onChange={(e) => handleGapChange('backGap', e.target.value)} 
          min="0" 
        />
      </div>
    </div>
  )
}
