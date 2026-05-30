'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState([]);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 系统核心状态
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentSlide, setCurrentSlide] = useState(0); // 0: 菜单, 1: 巨幕海报, 2: 概念 Lookbook
  const [playMode, setPlayMode] = useState('auto'); // 'auto' (自动时段排期), 'lock-menu', 'lock-poster', 'lock-lookbook'

  // 📸 高清商业商品图池（代码自动根据商品品类匹配，主理人未来可以随意修改这些 Unsplash 顶级美学图片 URL）
  const imageAssets = {
    matcha: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80", // 极致抹茶空间
    coffee: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80", // 质感手冲咖啡
    bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80", // 刚出炉的先锋面包
    poster: "https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?auto=format&fit=crop&w=1200&q=80"  // 下午茶氛围巨幕
  };

  // 1. 系统精准时钟 + 时间段检测
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentHour(now.getHours());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Notion 实时数据引渡雷达
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
      } catch (err) { console.error("Notion Matrix Offline"); } 
      finally { setLoading(false); }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 5000);
    return () => clearInterval(dataTimer);
  }, []);

  // 3. 👑 核心：智能商业排期轮播引擎（Dayparting Engine）
  useEffect(() => {
    const slideTimer = setInterval(() => {
      // 如果主理人手动锁定了某个模板，排期引擎自动挂起不干预
      if (playMode !== 'auto') return;

      /**
       * 商业排期核心逻辑：
       * 朝气早晨 (06:00 - 11:00) -> 80%时间卡在菜单(Slide 0)，偶数次跳一下Lookbook
       * 黄金下午 (11:00 - 17:00) -> 菜单(Slide 0)与促销大图(Slide 1)循环连播切换
       * 极客黑夜 (17:00 - 24:00) -> 进入黑金微醺模式，全界面模板高频连播
       */
      if (currentHour >= 6 && currentHour < 11) {
        // 早晨高峰期：极高概率留在大屏幕菜单
        setCurrentSlide((prev) => (prev === 0 ? 2 : 0)); 
      } else if (currentHour >= 11 && currentHour < 17) {
        // 下午闲时：星巴克级菜单海报自动连播切换
        setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
      } else {
        // 夜间：全模板轮巡连播
        setCurrentSlide((prev) => (prev + 1) % 3);
      }
    }, 7000); // 每隔 7 秒钟丝滑转场一次

    return () => clearInterval(slideTimer);
  }, [playMode, currentHour]);

  if (loading) return (
    <div className="h-screen w-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-[#F4F1EA] font-mono tracking-widest text-xs">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F4F1EA] mb-4"></div>
      °C / g . SPACE // INTEGRATED DAYPARTING MATRIX INITIALIZING...
    </div>
  );

  // 👑 根据当前系统小时，自动调配全局调性色彩（白天暖燕麦，晚上黑金机能）
  const isNight = currentHour >= 17 || currentHour < 6;
  const themeBg = isNight ? 'bg-[#0D0D0D] text-[#00FF66]' : 'bg-[#F4F1EA] text-[#1A1A1A]';
  const cardBg = isNight ? 'bg-[#141414] border-[#00FF66]/30 shadow-[0_0_20px_rgba(0,255,102,0.1)]' : 'bg-white border-black shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]';
  const badgeStyle = isNight ? 'bg-[#00FF66] text-black font-black' : 'bg-black text-[#F4F1EA]';

  return (
    <div className={`w-screen h-screen ${themeBg} font-sans p-12 flex flex-col justify-between overflow-hidden select-none transition-colors duration-1000`}>
      
      {/* 👑 PREMIUM BRAND HEADER */}
      <div className={`flex justify-between items-center border-b-2 ${isNight ? 'border-[#00FF66]/20' : 'border-[#1A1A1A]'} pb-6`}>
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${isNight ? 'text-[#00FF66]' : 'text-black'}`}>°C / g . SPACE</h1>
          <p className="font-mono text-xs text-zinc-500 tracking-widest mt-1">
            BROOKLYN LAB // {isNight ? '🌌 NIGHT_MODE (BAR_MATRIX)' : '🌅 DAY_MODE (LAB_MATRIX)'}
          </p>
        </div>
        
        {/* 👑 DYNAMIC SMART CONTROL PANEL */}
        <div className="flex items-center space-x-8 font-mono text-sm">
          <div className="flex bg-zinc-800/10 p-1.5 rounded-lg border border-zinc-500/20 space-x-2 text-xs">
            <button 
              onClick={() => { setPlayMode('auto'); }}
              className={`px-3 py-1.5 rounded transition-all ${playMode === 'auto' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 opacity-60'}`}
            >
              🤖 AUTO_SCHED
            </button>
            <button 
              onClick={() => { setPlayMode('lock-menu'); setCurrentSlide(0); }}
              className={`px-3 py-1.5 rounded transition-all ${playMode === 'lock-menu' ? 'bg-black text-white font-bold' : 'text-zinc-400 opacity-60'}`}
            >
              🔒 MENU
            </button>
            <button 
              onClick={() => { setPlayMode('lock-poster'); setCurrentSlide(1); }}
              className={`px-3 py-1.5 rounded transition-all ${playMode === 'lock-poster' ? 'bg-black text-white font-bold' : 'text-zinc-400 opacity-60'}`}
            >
              🔒 POSTER
            </button>
          </div>
          
          <div className="text-right">
            <div className="text-zinc-400 text-[10px]">CURRENT_SLOT</div>
            <div className="text-sm font-black uppercase tracking-wider text-zinc-400">
              {currentSlide === 0 && "01 // GRID_MENU"}
              {currentSlide === 1 && "02 // HERO_POSTER"}
              {currentSlide === 2 && "03 // CONCEPT_LOOKBOOK"}
            </div>
          </div>
          <div className="text-right border-l pl-8 border-zinc-500/20">
            <div className="text-zinc-400 text-[10px]">LOCAL_TIME</div>
            <div className="text-xl font-black tracking-tight tabular-nums">{time}</div>
          </div>
        </div>
      </div>

      {/* 👑 MASTER TEMPLATE ENGINE CONTAINER */}
      <div className="flex-1 my-6 relative w-full h-full">
        
        {/* 🎬 TEMPLATE 1: COMMERCIAL CARD-BASED DIGITAL MENU */}
        <div className={`absolute inset-0 grid grid-cols-2 gap-12 items-center transition-all duration-700 transform ${currentSlide === 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-10 pointer-events-none'}`}>
          {Object.keys(menuData).length === 0 ? (
            <div className="col-span-2 text-center text-zinc-400 font-mono text-sm animate-pulse">Establishing Notion Secure Matrix Connection...</div>
          ) : (
            Object.keys(menuData).map((category) => (
              <div key={category} className={`border-2 ${cardBg} p-8 h-[90%] flex flex-col justify-between rounded-2xl transition-all duration-500`}>
                <div>
                  <div className="flex justify-between items-center border-b border-zinc-500/10 pb-4 mb-6">
                    <span className={`font-mono text-xs px-3 py-1 uppercase tracking-widest rounded-sm ${badgeStyle}`}>
                      [{category}]
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">LIVE_DATA_FEED</span>
                  </div>
                  
                  <div className="space-y-6">
                    {menuData[category].map((item) => (
                      <div key={item.id} className="flex justify-between items-baseline group">
                        <div className="flex items-center space-x-4">
                          <span className={`text-3xl font-black tracking-tight ${isNight ? 'text-white' : 'text-black'}`}>{item.name}</span>
                          {item.specialTag && (
                            <span className="font-mono text-[9px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                              {item.specialTag}
                            </span>
                          )}
                        </div>
                        <div className={`flex-1 border-b-2 border-dashed ${isNight ? 'border-[#00FF66]/20' : 'border-black/10'} mx-4 relative top-[-6px]`}></div>
                        <span className={`font-mono text-2xl font-black px-2 border rounded ${isNight ? 'border-[#00FF66]/30 bg-zinc-900 text-[#00FF66]' : 'border-black bg-[#F4F1EA] text-black'}`}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="font-mono text-[9px] text-zinc-400/60 mt-4 tracking-widest uppercase">// PARAMETRIC WEIGHED UNIT ACTIVE</div>
              </div>
            ))
          )}
        </div>

        {/* 🎬 TEMPLATE 2: COMMERCIAL HERO CAROUSEL (左大图，右文案促销连播模式) */}
        <div className={`absolute inset-0 grid grid-cols-12 gap-8 items-center transition-all duration-700 transform ${currentSlide === 1 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-10 pointer-events-none'}`}>
          <div className={`col-span-7 h-full relative border-2 ${isNight ? 'border-[#00FF66]/30' : 'border-black'} rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] bg-zinc-800`}>
            <img src={imageAssets.poster} alt="Promo" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-1000 scale-100 hover:scale-105" />
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur text-[#F4F1EA] px-3 py-1 text-[10px] font-mono tracking-widest rounded uppercase">
              AMBIENT_ADS // PROMO_SLOT_A
            </div>
          </div>

          <div className={`col-span-5 ${isNight ? 'bg-[#141414] border border-[#00FF66]/30' : 'bg-black'} text-[#F4F1EA] p-10 h-full rounded-2xl flex flex-col justify-between`}>
            <div>
              <div className="font-mono text-amber-400 text-xs tracking-widest mb-3">// LAB MID-DAY REFRESHMENT</div>
              <h2 className="text-5xl font-black tracking-tighter leading-none text-white uppercase mb-6">
                HAPPY HOUR<br/><span className="text-amber-400">BUY 3 GET 1</span><br/>FREE
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed tracking-tight font-light font-mono">
                [SYSTEM_ALERT] All formulations are calculated mathematically down to 0.1 grams. Fueling your design workflow seamlessly.
              </p>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="flex justify-between items-center mb-2 font-mono text-xs text-zinc-400">
                <span>LOCATION</span>
                <span className="font-bold text-white tracking-widest">BROOKLYN LAB</span>
              </div>
              <div className="text-[10px] text-amber-400 font-mono tracking-wider animate-pulse">
                * VALID TIME: 11:00 AM - 05:00 PM EVERY DAY
              </div>
            </div>
          </div>
        </div>

        {/* 🎬 TEMPLATE 3: LUXURY BRAND LOOKBOOK (巨幕单品概念海报) */}
        <div className={`absolute inset-0 grid grid-cols-12 gap-8 items-center transition-all duration-700 transform ${currentSlide === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
          <div className="col-span-5 space-y-6 pr-6">
            <div className="font-mono text-xs text-zinc-400 tracking-widest">// FEATURED LAB RECIPE</div>
            <h3 className={`text-6xl font-black tracking-tighter uppercase leading-none ${isNight ? 'text-white' : 'text-black'}`}>
              MATCHA<br/>DENSITY_
            </h3>
            <p className="text-zinc-400 text-xs font-mono leading-relaxed">
              Crafted with Uji ceremonial grade matcha, layered exactly at a 1.25 density ratio using organic house oat milk. Weighing precisely 4.5g of pure matcha sift.
            </p>
            <div className="pt-4 border-t border-zinc-500/10 flex items-baseline space-x-4">
              <span className="font-mono text-3xl font-black text-amber-500">$7.50</span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">[ BEST SELLER // ACTIVE ]</span>
            </div>
          </div>
          
          <div className={`col-span-7 h-full relative border-2 ${isNight ? 'border-[#00FF66]/30' : 'border-black'} rounded-3xl overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,0.05)]`}>
            <img src={imageAssets.matcha} alt="Matcha Concept" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-6 right-6 bg-black/80 text-white font-mono text-[9px] px-3 py-1 tracking-widest rounded">
              °C / g . SPACE LOOKBOOK V3.0
            </div>
          </div>
        </div>

      </div>

      {/* 👑 GLOBAL REAL-TIME FOOTER */}
      <div className={`border-t-2 ${isNight ? 'border-[#00FF66]/20 text-[#00FF66]/50' : 'border-[#1A1A1A] text-zinc-400'} pt-4 flex justify-between items-center font-mono text-[10px]`}>
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isNight ? 'bg-[#00FF66] animate-pulse' : 'bg-green-500 animate-ping'}`}></span>
          <span>SYSTEM // ENGINE_INTELLIGENT_DAYPARTING_V3.0</span>
        </div>
        <div className="tracking-widest uppercase">
          [ CURRENT_STRATEGY: {playMode === 'auto' ? `AUTOMATIC_TIMED (HOUR_${currentHour})` : 'MANUAL_OVERRIDE_ACTIVE'} ]
        </div>
        <div>© 2026 CGSPACE.NYC</div>
      </div>
    </div>
  );
}
