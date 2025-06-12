
import React, { useEffect, useRef } from 'react';
import { SemanticMapData, UiTexts } from '../types';

interface SemanticMapModalProps {
  isOpen: boolean;
  mapData: SemanticMapData | null;
  onClose: () => void;
  onDownloadHtml: () => void;
  uiTexts: UiTexts;
  isVisNetworkLoaded: boolean;
  isLoading: boolean;
}

const SemanticMapModal: React.FC<SemanticMapModalProps> = ({
  isOpen,
  mapData,
  onClose,
  onDownloadHtml,
  uiTexts,
  isVisNetworkLoaded,
  isLoading,
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<any>(null); // Stores vis.Network instance

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isOpen && mapData && networkRef.current && isVisNetworkLoaded && window.vis) {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
      }
      // Use a timeout to ensure the DOM is ready, especially if modal transition takes time
      timerId = setTimeout(() => {
        if (!networkRef.current) {
          console.warn("Network container ref disappeared before network initialization.");
          return;
        }
        const nodes = new window.vis.DataSet(mapData.nodes);
        const edges = new window.vis.DataSet(mapData.edges);
        const data = { nodes, edges };
        const options = {
            layout: { hierarchical: false, improvedLayout: true, randomSeed: 2 },
            interaction: { dragNodes: true, dragView: true, hover: true, zoomView: true, navigationButtons: true, keyboard: true, tooltipDelay: 200 },
            physics: { 
                enabled: true, 
                solver: 'barnesHut', 
                barnesHut: { gravitationalConstant: -3000, centralGravity: 0.15, springLength: 150, springConstant: 0.02, damping: 0.09, avoidOverlap: 0.2 },
                stabilization: { iterations: 1000, fit: true, updateInterval: 25 }
            },
            nodes: { 
                shape: 'box', size: 20, borderWidth: 1.5, shadow: {enabled: true, size:6, x:3, y:3},
                font: { size: 14, color: '#333', face: 'Inter, Arial, sans-serif' }, 
                color: { border: '#3b82f6', background: '#dbeafe', highlight: { border: '#2563eb', background: '#bfdbfe' }, hover: { border: '#2563eb', background: '#bfdbfe' } },
                margin: { top: 5, right: 10, bottom: 5, left: 10 },
                widthConstraint: { maximum: 150 }
            },
            edges: { 
                width: 2, smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 }, 
                arrows: { to: { enabled: true, scaleFactor: 0.7, type: 'arrow' } },
                color: { color:'#9ca3af', highlight:'#4b5563', hover: '#6b7280', opacity:1.0 },
                font: { align: 'middle', size: 11, color: '#4b5563', strokeWidth: 0, background: 'rgba(255,255,255,0.6)'}
            }
        };
        
        const network = new window.vis.Network(networkRef.current, data, options);
        networkInstanceRef.current = network;

        network.on("stabilizationIterationsDone", () => {
            if (networkInstanceRef.current) { 
                networkInstanceRef.current.setOptions({ physics: false });
                networkInstanceRef.current.fit();
            }
        });
        network.on("doubleClick", (params: any) => {
            if (networkInstanceRef.current) {
                if (params.nodes.length > 0) {
                    networkInstanceRef.current.focus(params.nodes[0], { scale: 1.5, animation: true });
                } else {
                    networkInstanceRef.current.fit({animation: true});
                }
            }
        });
      }, 100); // Small delay to allow modal to render
    } else {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
      }
    }
    
    return () => { 
        if (timerId) clearTimeout(timerId);
        // Cleanup on component unmount or when modal closes/data changes
        if (networkInstanceRef.current) {
            networkInstanceRef.current.destroy();
            networkInstanceRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mapData, isVisNetworkLoaded]); // Removed networkRef.current from deps

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-80 flex justify-center items-center z-[70] p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50">
          <h3 className="text-lg sm:text-xl font-semibold text-purple-700">{uiTexts.semanticMapModalTitle}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none font-bold" aria-label="Cerrar mapa conceptual">&times;</button>
        </div>
        <div ref={networkRef} className="flex-grow w-full h-full bg-gray-100">
          {isLoading && !mapData && <p className="text-center p-10 text-gray-600 animate-pulse">Generando mapa...</p>}
          {!isLoading && !mapData && <p className="text-center p-10 text-gray-600">No hay datos para mostrar el mapa.</p>}
        </div>
        <div className="p-3 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button 
            onClick={onDownloadHtml} 
            disabled={!mapData}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition text-sm sm:text-base disabled:opacity-60"
          >
            {uiTexts.downloadHtmlButton}
          </button>
          <button 
            onClick={onClose} 
            className="bg-gray-400 text-white py-2 px-4 rounded-lg shadow hover:bg-gray-500 transition text-sm sm:text-base"
          >
            {uiTexts.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SemanticMapModal;
