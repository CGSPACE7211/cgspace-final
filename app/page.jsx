'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState([]);
  const [allLiveImages, setAllLiveImages] = useState([]); // ⚡ 动态多图轮播池
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [currentPosterIdx, setCurrentPosterIdx] = useState(0); // ⚡ 控制自主上传的多图连播
  const [playMode, setPlayMode] = useState('loop'); 

  // 1. 系统精准时钟
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 核心：实时数据引渡雷达（自动捕获多图）
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.success) {
          // 按品类分组
          const grouped = json.data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuData(grouped);

          // 🚀 黑科技：把你在 Notion 单元格里上传的所有图片，自动收集聚拢成一个“无上限连播池”
          const images = json.data.map(item => item.imageUrl).filter(Boolean);
          setAllLiveImages(images);
        }
      } catch (err) { console.error("Sync Error"); } 
      finally { setLoading(false); }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 4000);
    return () => clearInterval(dataTimer);
  }, []);

  // 3. 大版面轮播切换逻辑（菜单 ➔ 海报）
  useEffect(() => {
    if (playMode !== 'loop') return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 8000); // 每 8 秒丝滑转场
    return () => clearInterval(slideTimer);
  }, [playMode]);

  // 4. 🚀 核心：海报内部的“用户多图自主连播”逻辑！
  useEffect(() => {
    if (allLiveImages.length <= 1) return;
    const posterTimer = setInterval(() => {
      setCurrentPosterIdx((prev) => (prev + 1) % allLiveImages.length);
    }, 4000); // 你在 Notion 传的多张图，每 4 秒自动丝滑切下一张！
    return () => clearInterval(posterTimer);
  }, [allLiveImages]);

  if (loading) return (
    <div className="h-screen w-screen bg-[#F4F1EA] flex items-center justify-center text-zinc-400 font-mono tracking-widest text-xs">
      °C / g . SPACE // ART DIRECTION ENGINE INITIALIZING...
    </div>
  );

  // 兜底图池（万一你 Notion 没传图，自动采用这些顶级美学大图撑场子）
  const fallbackImages = [
    "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80"
  ];
  const displayImagePool = allLiveImages.length > 0 ? allLiveImages : fallbackImages;

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] p-16 flex flex-col justify-between overflow-hidden select-none transition-all duration-1000">
      
      {/* 👑 砍掉死板样式，换上顶级设计杂志风格的 HEADER */}
      <div className="flex justify-between items-baseline border-b border-[#1A1A1A]/10 pb-6">
        <div className="flex items-baseline space-x-6">
          <h1 className="text-4xl font-extrabold tracking-tighter text-black font-serif italic">°C / g . SPACE</h1>
          <span className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase">Brooklyn Lab // Premium Signage v4.0</span>
        </div>
        
        {/* 精致扁平化中控台 */}
        <div className="flex items-center space-x-8 font-mono text-xs">
          <div className="flex bg-[#1A1A1A]/5 p-0.5 rounded-md border border-[#1A1A1A]/5 space-x-1">
            <button onClick={() => { setPlayMode('loop'); }} className={`px-3 py-1 rounded transition-all ${playMode === 'loop' ? 'bg-black text-white font-bold' : 'text-zinc-500 opacity-60'}`}>🔄 智能连播</button>
            <button onClick={() => { setPlayMode('lock-menu'); setCurrentSlide(0); }} className={`px-3 py-1 rounded transition-all ${playMode === 'lock-menu' ? 'bg-black text-white font-bold' : 'text-zinc-500 opacity-60'}`}>🔒 锁菜单</button>
            <button onClick={() => { setPlayMode('lock-poster'); setCurrentSlide(1); }} className={`px-3 py-1 rounded transition-all ${playMode === 'lock-poster' ? 'bg-black text-white font-bold' : 'text-zinc-500 opacity-60'}`}>🔒 锁海报</button>
          </div>
          <div className="text-right border-l border-[#1A1A1A]/10 pl-6">
            <span className="text-xl font-bold tracking-tight tabular-nums text-black">{time}</span>
          </div>
        </div>
      </div>

      {/* 主画布内容区 */}
      <div className="flex-1 my-8 relative w-full h-full">
        
        {/* 🎬 画面 A：高级轻量卡片化菜单（彻底砍掉死板黑边） */}
        <div className={`absolute inset-0 grid grid-cols-2 gap-16 items-center transition-all duration-1000 transform ${currentSlide === 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-98 translate-x-4 pointer-events-none'}`}>
          {Object.keys(menuData).length === 0 ? (
            <div className="col-span-2 text-center text-zinc-400 font-mono text-sm animate-pulse">Awaiting design synchronization from Notion...</div>
          ) : (
            Object.keys(menuData).map((category) => (
              <div key={category} className="h-[90%] flex flex-col justify-between border-t-2 border-black/40 pt-6">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-mono text-xs bg-black text-[#F4F1EA] px-3 py-0.5 tracking-widest rounded-sm uppercase font-bold">
                      [{category}]
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">LIVE_DATABASE</span>
                  </div>
                  
                  <div className="space-y-8">
                    {menuData[category].map((item) => (
                      <div key={item.id} className="flex justify-between items-baseline group">
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl font-bold tracking-tight text-black font-sans">{item.name}</span>
                          {item.specialTag && (
                            <span className="font-mono text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider animate-pulse">
                              {item.specialTag}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 border-b border-dashed border-[#1A1A1A]/10 mx-6 relative top-[-6px]"></div>
                        <span className="font-mono text-2xl font-extrabold text-black tracking-tighter">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="font-mono text-[9px] text-zinc-400 tracking-widest uppercase mt-4">// TEMPERATURE & MASS FORMULATED IN REALTIME</div>
              </div>
            ))
          )}
        </div>

        {/* 🎬 画面 B：星巴克级巨幕单品连播大图（左大图，右高级促销排版） */}
        <div className={`absolute inset-0 grid grid-cols-12 gap-12 items-center transition-all duration-1000 transform ${currentSlide === 1 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-98 -translate-x-4 pointer-events-none'}`}>
          
          {/* 左侧：多大图自主变身连播池 */}
          <div className="col-span-7 h-[95%] relative bg-zinc-100 rounded-3xl overflow-hidden shadow-sm border border-black/5">
            {displayImagePool.map((imgUrl, index) => (
              <img 
                key={index}
                src={imgUrl} 
                alt="Live Poster Feed" 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform ${index === currentPosterIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
              />
            ))}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-[9px] font-mono tracking-widest rounded-sm uppercase">
              NOTION_PLAYLIST // SLIDE_0{currentPosterIdx + 1}
            </div>
          </div>

          {/* 右侧：契合你店里高级调性的文案排版 */}
          <div className="col-span-5 bg-black text-[#F4F1EA] p-12 h-[95%] rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <div className="font-mono text-amber-400 text-xs tracking-[0.2em] uppercase mb-4">// BRAND CONCEPT LOOKBOOK</div>
              <h2 className="text-5xl font-black tracking-tighter leading-none text-white uppercase font-serif italic mb-6">
                DAILY FRESH<br/>LAB SELECTION
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed tracking-wide font-light font-sans">
                Every formulation is meticulously balanced and mathematically cataloged down to 0.1 grams. Fueling your creative workflow through premium taste and aesthetic geometry.
              </p>
            </div>

            <div className="border-t border-zinc-800/80 pt-6">
              <div className="flex justify-between items-center mb-2 font-mono text-xs text-zinc-500 uppercase tracking-widest">
                <span>LAB_SPACE</span>
                <span className="font-bold text-white">BROOKLYN, NY</span>
              </div>
              <div className="text-[10px] text-amber-400 font-mono tracking-wider uppercase animate-pulse">
                ● AUTOPLAY ACTIVE // SYNC FREQ 1.0s
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-between items-center font-mono text-[9px] text-zinc-400 tracking-widest uppercase">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
          <span>SYSTEM_STATUS // RUNNING_SECURE_BRIDGE_V4.0</span>
        </div>
        <div>[ REAL-TIME MULTI-IMAGE CAROUSEL ENGINE READY ]</div>
        <div>© 2026 CGSPACE.NYC</div>
      </div>
    </div>
  );
}
