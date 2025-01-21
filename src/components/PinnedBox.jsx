import { BsPin } from "react-icons/bs";

export default function PinnedBox({ store }) {
  const handleUnpin = () => {
    store.setSelectedBox(null);
  };

  return (
    store.selectedBox && store.boxData && (
      <div className="fixed bottom-5 right-5 text-white z-50 max-w-sm">
        <div className="flex justify-center mb-[-8px] relative z-[51]">
          <BsPin 
            className="text-orange-500 text-3xl cursor-pointer hover:text-orange-400 transition-colors" 
            onClick={handleUnpin}
          />
        </div>
        <div className="bg-[#070F2A] bg-opacity-80 rounded-lg shadow-lg p-4">
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
    )
  )
}
