import { useSettings } from "@/hooks/useSettings";
import { MoreHorizontal, Trash2, Shirt, Upload, Tag, X, CloudRain, Camera, Send, Sun } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const customScrollbarStyle = `
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #1f2937; /* gray-800 */
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4b5563; /* gray-600 */
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280; /* gray-500 */
}
`;

interface WardrobeItemCardProps {
    item: WardrobeItem
    onDelete: (id: string) => void
}


const WardrobeItemCard = ({ item, onDelete }: WardrobeItemCardProps) => {

    return (
        // Wrapper for 16:9 aspect ratio (9/16 = 56.25%)
        <div className="relative w-full pb-[56.25%]"> 
            <div 
                className="absolute inset-0 bg-gray-700 rounded-xl overflow-hidden shadow-lg border-2 border-gray-600 hover:border-fuchsia-700 transition-all duration-200"
            >
                {/* Image Preview (Square) - Left side */}
                <div className="absolute top-0 left-0 h-full w-1/2 p-2">
                    {item ? <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg shadow-md"

                    /> : null}
                </div>

                {/* Content on the right side */}
                <div className="absolute top-0 right-0 h-full w-1/2 p-2 flex flex-col justify-between">
                    
                    {/* Category Tag - TOP RIGHT, prominent */}
                    <div className="w-full text-right">
                        <span className="text-xs font-semibold px-3 py-1 bg-cyan-700 text-white rounded-lg shadow-md tracking-wider">
                            {item.category.toUpperCase()}
                        </span>
                    </div>
                    
                    {/* Item Name - Center Right (text-base, max 2 lines) */}
                    <p className="text-base font-bold text-white line-clamp-2 text-center mt-auto mb-auto" title={item.name}>
                        {item.name}
                    </p>

                    {/* Buttons - Bottom Right (Larger size) */}
                    <div className="flex justify-between items-center space-x-2 mt-2">
                        {/* Option Button */}
                        <button 
                            className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-lg text-gray-300 hover:text-cyan-400 transition text-sm font-medium shadow-inner"
                            title="옵션"
                            onClick={(e) => { e.stopPropagation(); console.log('Option clicked for', item.name); }}
                        >
                             <MoreHorizontal className="w-4 h-4 mr-1" /> 옵션
                        </button>
                        {/* Delete Button */}
                        <button 
                            className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-lg text-gray-300 hover:text-fuchsia-400 transition text-sm font-medium shadow-inner"
                            title="삭제"
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        >
                            <Trash2 className="w-4 h-4 mr-1" /> 삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface WardrobeItem {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
}

/**
 * Implements the wardrobe management logic (no selection feature).
 * This component takes the place of PhotoVault/Wardrobe logic in the layout.
 */
export const WardrobeSelector = () => {
    // Defines the structure for a wardrobe item
    const initialWardrobe: WardrobeItem[] = [
   ];
    
    const [wardrobe, setWardrobe] = useState(initialWardrobe);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Group items by category
    const groupedWardrobe = wardrobe.reduce<any>((groups, item) => {
        const category = item.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(item);
        return groups;
    }, {});

    const handleDelete = (itemId: string) => {
        setWardrobe(prevWardrobe => prevWardrobe.filter(item => item.id !== itemId));
    };

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            const newItem = {
                id: `item-${Date.now()}`,
                category: 'Tops', 
                name: file.name.substring(0, file.name.lastIndexOf('.')) || 'New Item',
                imageUrl: imageUrl,
            };

            setWardrobe(prev => [...prev, newItem]);
        }
        event.target.value = null; 
    };

    // Custom CSS for scrollbar applied via global style (or similar mechanism in real Tailwind setup)
    // For single file, we can define a style element globally if needed, but here we just rely on the class.
    
    // We only need this style for the file block, but since it's a JSX file, we include it via a template literal
    // If running in a real environment, you'd define this in a CSS file.
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = customScrollbarStyle;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                <Shirt className="w-5 h-5 mr-2" /> 디지털 옷장
            </h2>
            
            {/* Upload Button */}
            <div className="mb-4 pb-4 border-b border-gray-700">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden" // Hide the default file input
                />
                <button
                    onClick={() => fileInputRef.current ? fileInputRef.current.click() : () => {}}
                    className="w-full flex items-center justify-center p-3 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition transform hover:scale-[1.01] shadow-lg shadow-fuchsia-900/50"
                >
                    <Upload className="w-5 h-5 mr-2" />
                    새 아이템 추가 (업로드)
                </button>
            </div>


            {/* Wardrobe Items List - Grouped by Category */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {Object.entries(groupedWardrobe).map(([category, items]) => (
                    <div key={category}>
                        <h3 className="text-lg font-medium text-gray-200 mb-3 flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-fuchsia-400"/> {category}
                        </h3>
                        {/* 2-column grid for the 16:9 cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
                            {(items as any).map((item: any) => (
                                <WardrobeItemCard 
                                    key={item.id}
                                    item={item}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
