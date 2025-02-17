import { BsPin } from "react-icons/bs";

export default function PinnedBox({ store }) {
  const handleUnpin = () => {
    store.setSelectedBox(null);
    store.clearFocusedBox();
  };

  const getBoxContent = () => {
    if (!store.selectedBox) return null;

    // Check regular boxes first
    let box = store.boxData?.find(b => 
      b.boxNumber[0] === store.selectedBox.x && 
      b.boxNumber[1] === store.selectedBox.y && 
      b.boxNumber[2] === store.selectedBox.z
    );

    // If not found, check loading areas
    if (!box) {
      for (const area of Object.values(store.loadingAreas || {})) {
        box = area.boxes?.find(b =>
          b.boxNumber[0] === store.selectedBox.x && 
          b.boxNumber[1] === store.selectedBox.y && 
          b.boxNumber[2] === store.selectedBox.z
        );
        if (box) break;
      }
    }

    return box?.content;
  };

  const content = getBoxContent();

  return (
    store.selectedBox && content && (
      <div className="fixed bottom-5 right-5 text-white z-50 max-w-sm">
        <div className="flex justify-center mb-[-8px] relative z-[51]">
          <BsPin 
            className="text-orange-500 text-3xl cursor-pointer hover:text-orange-400 transition-colors" 
            onClick={handleUnpin}
          />
        </div>
        <div className="bg-[#070F2A] bg-opacity-80 rounded-lg shadow-lg p-4">
          <div className="font-semibold text-sm mb-2">
            <span>Palet No: {store.selectedBox.x}, {store.selectedBox.y}, {store.selectedBox.z}</span>
          </div>
          <div className="text-xs">{content}</div>
        </div>
      </div>
    )
  );
}
