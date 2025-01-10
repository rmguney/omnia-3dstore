'use client'
import Link from 'next/link'
import useStore from '@/store/store'

export default function Parameters() {
  const store = useStore()

  const handleDimensionChange = (key, value) => {
    store.setDimensions({ [key]: Math.max(1, parseInt(value) || 1) })
    store.initializeBoxData()
  }

  const handleGapChange = (key, value) => {
    store.setGaps({ [key]: parseFloat(value) || 0 })
  }

  return (
    <div className="parameters-page">
      <Link href="/" className="back-button">Görüntülemeye Dön</Link>
      
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
          value={store.pairGap} 
          onChange={(e) => handleGapChange('pairGap', e.target.value)} 
          min="0" 
        />
      </div>
    </div>
  )
}
