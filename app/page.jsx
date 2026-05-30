'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState([]);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPoster, setCurrentPoster] = useState(0);

  // 核心控制状态：'loop' (自动连播), 'freeze-menu' (锁死菜单), 'freeze-poster' (锁死海报)
  const [playMode, setPlayMode] = useState('loop');

  const posterImages = [
    "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80", 
    "https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?auto=format&fit=crop&w=1200&q=80"
  ];

  // 1. 系统时钟逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Notion 数据雷达同步
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
      } catch (err) {
        console.error("Notion sync error.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 5000);
    return () => clearInterval(dataTimer);
  }, []);

  // 3. 👑 智能 URL 参数解析机制
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'menu') {
        setPlayMode('freeze-menu');
        setCurrentSlide(0);
      } else if (view === 'poster') {
        setPlayMode('freeze-poster');
        setCurrentSlide(1);
      }
    }
  }, []);

  // 4. 👑 动态连播/轮播定时器（受控于 playMode）
  useEffect(() => {
    if (playMode !== 'loop') return; // 如果不是连播模式，直接罢工不切换

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 7000);

    return () => clearInterval(slideTimer);
  }, [playMode]);

  // 5. 海报内部大图轮播
  useEffect(() => {
    if (playMode === 'freeze-menu') return;
    const posterTimer = setInterval(() => {
      setCurrentPoster((prev) => (prev + 1) % posterImages.length);
    }, 3500);
    return () => clearInterval(posterTimer);
  }, [playMode]);

  // 👑 手动点击标签切换模式的函数
  const handleModeToggle = () => {
    if (playMode === 'loop') {
      setPlayMode('freeze-menu');
      setCurrentSlide(0);
    } else if (playMode === 'freeze-menu') {
      setPlayMode('freeze-poster');
      setCurrentSlide(1);
    } else {
      setPlayMode('loop');
      setCurrentSlide(0);
    }
  };

  if (loading) return (
    <div className="h-screen w-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-[#F4F1EA] font-mono tracking-widest text-xs">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4F1EA] mb-4"></div>
      °C / g . SPACE // CONTROL MATRIX INITIALIZING...
    </div>
  );

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] font-sans p-12 flex flex-col justify-between overflow-hidden select-none transition-all duration-1000">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b-2 border-[#1A1A1A] pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">°C / g . SPACE</h1>
          <p className="font-mono text-xs text-zinc-500 tracking-widest mt-1">BROOKLYN LAB // DIGITAL MATRIX V2.5</p>
        </div>
        
        {/* RIGHT METRICS - CLICKABLE CONTROL */}
        <div className="flex items-center space-x-12 font-mono text-right text-sm">
          <div 
            onClick={handleModeToggle}
            className="bg-black text-[#F4F1EA] px-4 py-2 rounded cursor-pointer hover:bg-zinc-800 active:scale-95 transition-all select-none"
            title="Click to toggle display mode"
          >
            <span className="text-[9px] block opacity-60 text-left">💡 MODE (CLICK TO SWITCH)</span>
            <span className="font-black text-xs tracking-wide text-amber-400">
              {playMode === 'loop' && "🔄 AUTOPLAY_LOOP"}
              {playMode === 'freeze-menu' && "🔒 STATIC_MENU"}
              {playMode === 'freeze-poster' && "🔒 STATIC_POSTER"}
            </span>
          </div>
          <div>
            <div className="text-zinc-400 text-[10px]">NEW_YORK_TIME</div>
            <div className="text-xl font-black text-[#1A1A1A] tracking-tight tabular-nums">{time}</div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 my-8 relative w-full h-full">
        
        {/* SLIDE 1: MENU */}
        <div className={`absolute inset-0 grid grid-cols-2 gap-x-12 items-center transition-all duration-1000 transform ${currentSlide === 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-10 pointer-events-none'}`}>
          {Object.keys(menuData).length === 0 ? (
            <div className="col-span-2 text-center text-zinc-400 font-mono text-sm">Awaiting Active Items from Notion...</div>
          ) : (
            Object.keys(menuData).map((category) => (
              <div key={category} className="bg-white border-2 border-[#1A1A1A] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] h-[85%] flex flex-col justify-start rounded-xl">
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/20 pb-4 mb-4">
                  <span className="font-mono text-xs bg-black text-[#F4F1EA] px-3 py-1 uppercase tracking-widest rounded-sm">
                    [{category}]
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">LIVE_SYNCHRONIZED</span>
                </div>
                <div className="space-y-6 overflow-hidden">
                  {menuData[category].map((item) => (
                    <div key={item.id} className="flex justify-between items-baseline group">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl font-black text-black tracking-tight">{item.name}</span>
                        {item.specialTag && (
                          <span className="font-mono text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold tracking-wide animate-pulse">
                            {item.specialTag}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 border-b-2 border-dotted border-[#1A1A1A]/20 mx-4 relative top-[-6px]"></div>
                      <span className="font-mono text-2xl font-black bg-[#F4F1EA] px-2 border border-[#1A1A1A] rounded">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* SLIDE 2: POSTER */}
        <div className={`absolute inset-0 grid grid-cols-12 gap-8 items-center transition-all duration-1000 transform ${currentSlide === 1 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-10 pointer-events-none'}`}>
          <div className="col-span-7 h-full relative border-2 border-[#1A1A1A] rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] bg-zinc-200">
            {posterImages.map((imgUrl, idx) => (
              <img 
                key={idx}
                src={imgUrl} 
                alt="Promo"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform ${idx === currentPoster ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              />
            ))}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur text-[#F4F1EA] px-3 py-1 text-[10px] font-mono tracking-widest rounded">
              AMBIENT_CAM // 0{currentPoster + 1}
            </div>
          </div>

          <div className="col-span-5 bg-black text-[#F4F1EA] p-10 h-full rounded-2xl shadow-[12px_12px_0px_0px_rgba(40,40,40,0.2)] flex flex-col justify-between">
            <div>
              <div className="font-mono text-amber-400 text-xs tracking-widest mb-2">// CG_SPACE LAB SPECIAL</div>
              <h2 className="text-5xl font-black tracking-tighter leading-none text-white uppercase mb-4">
                HAPPY HOUR<br/>BUY 3 GET 1 FREE
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed tracking-tight font-light">
                All recipes are parametrically weighed in grams down to the absolute decimal. Experience coffee and pastry through the prism of design.
              </p>
            </div>
            <div className="border-t border-zinc-800 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 font-mono">LOCATION</span>
                <span className="text-xs font-bold text-white tracking-widest font-mono">BROOKLYN, NY</span>
              </div>
              <div className="text-[9px] text-amber-500 font-mono tracking-wider animate-pulse">
                * VALID EVERY DAY FROM 3:00 PM TO 5:00 PM
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="border-t-2 border-[#1A1A1A] pt-4 flex justify-between items-center font-mono text-[10px] text-zinc-500">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>SYSTEM_STATUS // ACTIVE_MATRIX_V2.5</span>
        </div>
        <div>[ REMOTE PARAMETRIC SWITCH READY ]</div>
        <div>© 2026 CGSPACE.NYC</div>
      </div>
    </div>
  );
}
