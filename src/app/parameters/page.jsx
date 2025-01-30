'use client'
import Link from 'next/link'
import useStore from '@/store/store'
import { stores } from '@/store/mockAPI'

const ARCHETYPES = {
  'back-to-back': 'Back to Back',
  'drive': 'Drive'
}

export default function Parameters() {
  const store = useStore()

  const handleDimensionChange = (key, value) => {
    const newValue = Math.max(1, parseInt(value) || 1)
    store.setDimensions({ [key]: newValue })
    store.initializeBoxData()
    stores[store.selectedStore][key] = newValue // Update stores
  }

  const handleGapChange = (key, value) => {
    const newValue = parseFloat(value) || 0
    store.setGaps({ [key]: newValue })
    stores[store.selectedStore][key] = newValue // Update stores
  }

  const handleShelvesXPerRowChange = (index, value) => {
    const newValue = Math.max(1, parseInt(value) || 1)
    const newShelvesXPerRow = [...store.shelvesXPerRow]
    newShelvesXPerRow[index] = newValue
    store.setShelvesXPerRow(newShelvesXPerRow)
    stores[store.selectedStore].shelvesXPerRow = newShelvesXPerRow // Update stores
  }

  const handlePlaneOffsetChange = (key, value) => {
    const newValue = parseFloat(value) || 0
    store.setPlaneOffsets({ [key]: newValue })
  }

  const handleArchetypeChange = (value) => {
    store.setArchetype(value)
    stores[store.selectedStore].archetype = value // Update stores
  }

  const handleOffsetChange = (key, value) => {
    const newValue = parseFloat(value) || 0
    store.setOffsets({ [key]: newValue })
  }

  return (
    <div className="p-5">
      <Link href="/" className="inline-block mb-5 px-4 py-2 bg-orange-500 text-white rounded no-underline">Sahne</Link>
      <div className="grid grid-cols-[auto_1fr] gap-2.5 items-center max-w-[600px]">
        <label>Raf Tipi: </label>
        <select 
          value={store.archetype} 
          onChange={(e) => handleArchetypeChange(e.target.value)}
          className="p-2 border rounded"
        >
          {Object.entries(ARCHETYPES).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

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

        {Array.from({ length: store.shelvesZ }, (_, index) => (
          <div key={index}>
            <label>{`Raflar X${index}: `}</label>
            <input 
              type="number" 
              value={store.shelvesXPerRow[index]} 
              onChange={(e) => handleShelvesXPerRowChange(index, e.target.value)} 
              min="1" 
            />
          </div>
        ))}

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

        {/* Replace old offset inputs with separate ones */}
        <label>Genişlik Offset (Sol): </label>
        <input 
          type="number" 
          value={store.widthOffsetStart} 
          onChange={(e) => handleOffsetChange('widthOffsetStart', e.target.value)} 
          step="any"
        />
        <label>Genişlik Offset (Sağ): </label>
        <input 
          type="number" 
          value={store.widthOffsetEnd} 
          onChange={(e) => handleOffsetChange('widthOffsetEnd', e.target.value)} 
          step="any"
        />
        <label>Derinlik Offset (Ön): </label>
        <input 
          type="number" 
          value={store.depthOffsetStart} 
          onChange={(e) => handleOffsetChange('depthOffsetStart', e.target.value)} 
          step="any"
        />
        <label>Derinlik Offset (Arka): </label>
        <input 
          type="number" 
          value={store.depthOffsetEnd} 
          onChange={(e) => handleOffsetChange('depthOffsetEnd', e.target.value)} 
          step="any"
        />
      </div>
      <span className="block mt-5 text-sm text-orange-500">
      Bu sayfa yalnızca geliştirme testleri içindir, final versiyonunda kullanılmayacak
      </span>
    </div>
  )
}
