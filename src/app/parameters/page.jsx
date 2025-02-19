'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import useStore from '@/store/store'
import { stores } from '@/store/mockAPI'

const ARCHETYPES = {
  'back-to-back': 'Back to Back',
  'drive': 'Drive'
}

export default function Parameters() {
  const store = useStore()
  const [activeTab, setActiveTab] = useState('main') // main, loading

  // Initialize parameters on mount
  useEffect(() => {
    if (!store.boxData || !store.loadingAreas) {
      store.initializeBoxData();
    }
  }, []);

  // Add change handler to update stores object
  const handleChange = (key, value, updateType = 'dimension') => {
    const currentStore = stores[store.selectedStore];
    
    switch(updateType) {
      case 'dimension':
        const newValue = Math.max(1, parseInt(value) || 1);
        store.setDimensions({ [key]: newValue });
        currentStore[key] = newValue;
        break;
      case 'gap':
        const gapValue = parseFloat(value) || 0;
        store.setGaps({ [key]: gapValue });
        currentStore[key] = gapValue;
        break;
      case 'offset':
        const offsetValue = parseFloat(value) || 0;
        store.setOffsets({ [key]: offsetValue });
        currentStore[key] = offsetValue;
        break;
    }
    
    // Reinitialize after any change
    store.initializeBoxData();
  };

  // Update existing handlers to use new handleChange function
  const handleDimensionChange = (key, value) => handleChange(key, value, 'dimension');
  const handleGapChange = (key, value) => handleChange(key, value, 'gap');
  const handleOffsetChange = (key, value) => handleChange(key, value, 'offset');

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

  // Add new handler for loading area configurations
  const handleLoadingAreaConfig = (areaId, key, value) => {
    const newValue = key === 'isMalKabul' ? value : 
                    key === 'boxesX' || key === 'boxesY' || key === 'boxesZ' ? parseInt(value) :
                    parseFloat(value)
    store.setLoadingAreaConfig(areaId, { [key]: newValue })
  }

  return (
    <div className="p-5 h-screen flex flex-col bg-slate-100">
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <Link href="/" className="px-4 py-2 bg-orange-500 text-white rounded no-underline hover:bg-orange-600 transition-colors">
          Sahne
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('main')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'main' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Raf Parametreleri
          </button>
          <button 
            onClick={() => setActiveTab('loading')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'loading' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Yükleme/Mal Kabul
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'main' ? (
          <div className="grid grid-cols-2 gap-4 max-w-4xl">
            {/* Main Parameters - Compact Layout */}
            <div className="space-y-2">
              <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <label className="text-sm">Raf Sistemi:</label>
                <select 
                  value={store.archetype} 
                  onChange={(e) => handleArchetypeChange(e.target.value)}
                  className="p-1 border rounded text-sm w-full"
                >
                  {Object.entries(ARCHETYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <label className="text-sm">Yükseklik:</label>
                <input type="number" value={store.shelvesY} onChange={(e) => handleDimensionChange('shelvesY', e.target.value)} className="p-1 border rounded text-sm" />
                <label className="text-sm">Derinlik:</label>
                <input type="number" value={store.shelvesZ} onChange={(e) => handleDimensionChange('shelvesZ', e.target.value)} className="p-1 border rounded text-sm" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <label className="text-sm">Aralık X:</label>
                <input type="number" value={store.gapX} onChange={(e) => handleGapChange('gapX', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
                <label className="text-sm">Aralık Y:</label>
                <input type="number" value={store.gapY} onChange={(e) => handleGapChange('gapY', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <label className="text-sm">Aralık Z:</label>
                <input type="number" value={store.gapZ} onChange={(e) => handleGapChange('gapZ', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
                <label className="text-sm">Sırt Aralığı:</label>
                <input type="number" value={store.backGap} onChange={(e) => handleGapChange('backGap', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
              </div>
            </div>

            <div className="space-y-2">
              {/* X Row Settings */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: Math.min(store.shelvesZ, 12) }, (_, i) => (
                  <input
                    key={i}
                    type="number"
                    value={store.shelvesXPerRow[i]}
                    onChange={(e) => handleShelvesXPerRowChange(i, e.target.value)}
                    className="p-1 border rounded text-sm"
                    placeholder={`X${i}`}
                  />
                ))}
              </div>

              {/* Offset Settings */}
              <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-2 gap-1">
                  <label className="text-xs">Genişlik Sol:</label>
                  <input type="number" value={store.widthOffsetStart} onChange={(e) => handleOffsetChange('widthOffsetStart', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <label className="text-xs">Genişlik Sağ:</label>
                  <input type="number" value={store.widthOffsetEnd} onChange={(e) => handleOffsetChange('widthOffsetEnd', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <label className="text-xs">Derinlik Ön:</label>
                  <input type="number" value={store.depthOffsetStart} onChange={(e) => handleOffsetChange('depthOffsetStart', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <label className="text-xs">Derinlik Arka:</label>
                  <input type="number" value={store.depthOffsetEnd} onChange={(e) => handleOffsetChange('depthOffsetEnd', e.target.value)} className="p-1 border rounded text-sm" step="0.1" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(store.loadingAreas || {}).map(([areaId, config]) => (
              <div key={areaId} className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <h3 className="text-sm font-semibold mb-3 text-blue-900 border-b pb-2">{areaId}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600">Alan Tipi</label>
                    <select
                      value={config.isMalKabul}
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'isMalKabul', e.target.value === 'true')}
                      className="w-full p-1 border rounded text-sm"
                    >
                      <option value={false}>Yükleme Alanı</option>
                      <option value={true}>Mal Kabul Alanı</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Max Palet Sayısı X</label>
                    <input 
                      type="number" 
                      value={config.boxesX} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'boxesX', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Max Palet Sayısı Y</label>
                    <input 
                      type="number" 
                      value={config.boxesY} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'boxesY', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Max Palet Sayısı Z</label>
                    <input 
                      type="number" 
                      value={config.boxesZ} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'boxesZ', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Aralık X</label>
                    <input 
                      type="number" 
                      value={config.gapX} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'gapX', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Aralık Y</label>
                    <input 
                      type="number" 
                      value={config.gapY} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'gapY', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Aralık Z</label>
                    <input 
                      type="number" 
                      value={config.gapZ} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'gapZ', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Kenar Boşluğu</label>
                    <input 
                      type="number" 
                      value={config.inset} 
                      onChange={(e) => handleLoadingAreaConfig(areaId, 'inset', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 py-2 px-3 bg-orange-100 text-orange-700 rounded text-xs">
        Bu sayfa yalnızca geliştirme testleri içindir
      </div>
    </div>
  )
}
