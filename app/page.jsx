'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState([]);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [playMode, setPlayMode] = useState('loop'); // 'loop' (自动连播), 'lock-menu' (锁死菜单), 'lock-poster' (锁死海报)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.success) {
          const grouped = json.data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuData(grouped);
        }
      } catch (err) { console.error("Sync Error"); } 
      finally { setLoading(false); }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 4000);
    return () => clearInterval(dataTimer);
  }, []);

  // 7秒自动连播控制
  useEffect(() => {
    if (playMode !== 'loop') return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 7000);
    return () => clearInterval(slideTimer);
  }, [playMode]);

  if (loading) return (
    <div className="h-screen w-screen bg-[#1A1A1A] flex items-center justify-center text-[#F4F1EA] font-mono tracking-widest text-xs">
      °C / g . SPACE // PREMIUM SIGNAGE SYSTEM INITIALIZING...
    </div>
  );

  // 提取你在 Notion 表格里上传的第一张海报图，如果没有上传，自动使用精美建筑背景作为兜底
  const firstLiveImage = Object.values(menuData).flat().find(item => item.imageUrl)?.imageUrl 
    || "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] p-12 flex flex-col justify-between overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b-2 border-black pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">°C / g . SPACE</h1>
          <p className="font-mono text-xs text-zinc-500 tracking-widest mt-1">BROOKLYN LAB // PREMIUM SIGNAGE v3.0</p>
        </div>
        
        {/* 控制台 - 完美支持店员手动直控 */}
        <div className="flex items-center space-x-8 font-mono text-xs">
          <div className="flex bg-black/5 p-1 rounded-lg border border-black/10 space-x-1">
            <button onClick={() => { setPlayMode('loop'); }} className={`px-2.5 py-1 rounded transition-all ${playMode === 'loop' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500'}`}>🔄 连播</button>
            <button onClick={() => { setPlayMode('lock-menu'); setCurrentSlide(0); }} className={`px-2.5 py-1 rounded transition-all ${playMode === 'lock-menu' ? 'bg-black text-white font-bold' : 'text-zinc-500'}`}>🔒 菜单</button>
            <button onClick={() => { setPlayMode('lock-poster'); setCurrentSlide(1); }} className={`px-2.5 py-1 rounded transition-all ${playMode === 'lock-poster' ? 'bg-black text-white font-bold' : 'text-zinc-500'}`}>🔒 海报</button>
          </div>
          <div className="text-right">
            <div className="text-zinc-400 text-[10px]">REALTIME_CLOCK</div>
            <div className="text-xl font-black tabular-nums">{time}</div>
          </div>
        </div>
      </div>

      {/* STAGE CONTAINER */}
      <div className="flex-1 my-6 relative w-full h-full">
        
        {/* SLIDE 0: DYNAMIC MENU */}
        <div className={`absolute inset-0 grid grid-cols-2 gap-12 items-center transition-all duration-700 ${currentSlide === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          {Object.keys(menuData).length === 0 ? (
            <div className="col-span-2 text-center text-zinc-400 font-mono text-sm">Awaiting active items from Notion...</div>
          ) : (
            Object.keys(menuData).map((category) => (
              <div key={category} className="bg-white border-2 border-black p-8 h-[90%] flex flex-col justify-between rounded-2xl shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                <div>
                  <div className="border-b border-black/10 pb-3 mb-6">
                    <span className="font-mono text-xs bg-black text-white px-3 py-1 rounded-sm uppercase tracking-widest">[{category}]</span>
                  </div>
                  <div className="space-y-6">
                    {menuData[category].map((item) => (
                      <div key={item.id} className="flex justify-between items-baseline">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl font-black tracking-tight">{item.name}</span>
                          {item.specialTag && <span className="font-mono text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">{item.specialTag}</span>}
                        </div>
                        <div className="flex-1 border-b-2 border-dashed border-black/10 mx-4 relative top-[-6px]"></div>
                        <span className="font-mono text-2xl font-black">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="font-mono text-[9px] text-zinc-400 tracking-widest">// PARAMETRIC WEIGHED UNIT</div>
              </div>
            ))
          )}
        </div>

        {/* SLIDE 1: HERO IMAGE POSTER */}
        <div className={`absolute inset-0 grid grid-cols-12 gap-8 items-center transition-all duration-700 ${currentSlide === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="col-span-7 h-full relative border-2 border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] bg-zinc-800">
            {/* 📸 这里会自动、实时拉取你在 Notion 里面长传的精美海报图！ */}
            <img src={firstLiveImage} alt="Notion Live Visual" className="absolute inset-0 w-full h-full object-cover opacity-95 transition-all duration-1000 scale-100 hover:scale-105" />
            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 text-[10px] font-mono tracking-widest rounded">LIVE_NOTION_IMAGE_FEED</div>
          </div>
          <div className="col-span-5 bg-black text-[#F4F1EA] p-10 h-full rounded-2xl flex flex-col justify-between">
            <div>
              <div className="font-mono text-amber-400 text-xs tracking-widest mb-2">// BRAND LAB FEATURED</div>
              <h2 className="text-5xl font-black tracking-tighter leading-none text-white uppercase mb-4">DAILY FRESH<br/><span className="text-amber-400">CAKE & DRINKS</span><br/>SERIES</h2>
              <p className="text-zinc-400 text-xs font-mono leading-relaxed">Every recipe is formulated and weighed down to the absolute decimal. Experience the seamless fusion of design and flavor.</p>
            </div>
            <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-xs text-zinc-400 font-mono">
              <span>LOCATION // BROOKLYN LAB</span>
              <span className="text-amber-400 animate-pulse">● LIVE SYNCED</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="border-t-2 border-black pt-4 flex justify-between items-center font-mono text-[10px] text-zinc-400">
        <div>CORE_ENGINE_V3.0 // NO SUBSCRIPTION FEE</div>
        <div>© 2026 CGSPACE.NYC</div>
      </div>
    </div>
  );
}
