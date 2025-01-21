import Image from 'next/image'
import huskyLogo from '@/app/assets/husky-nav.png'

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, store }) {
  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 transition-transform duration-300 transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`} style={{ width: '300px', marginTop: '64px' }}>
      {/* Logo Box */}
      <div className="bg-blue-950 py-3 shadow-md">
        <div className="flex flex-col items-center justify-center gap-3">
          <a 
            href="https://parallax-login.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Image
              src={huskyLogo}
              alt="Husky Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </a>
          <h3 className="text-white font-bold text-lg">Bu Depodaki Tüm Ürünleriniz</h3>
        </div>
      </div>

      <div className="p-3 pr-0">
        <div className="overflow-y-auto" style={{ height: 'calc(85vh - 120px)' }}>
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
  )
}
