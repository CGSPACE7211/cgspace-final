'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState({});
  const [posters, setPosters] = useState([]);
  const [unitImg, setUnitImg] = useState(null);
  const [logoImg, setLogoImg] = useState(null);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [posterIdx, setPosterIdx] = useState(0);
  const [playMode, setPlayMode] = useState('loop');

  // 1. 系统时钟
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 数据抓取
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.success) {
          const grouped = json.menuItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuData(grouped);
          setPosters(json.posterImages || []);
          setUnitImg(json.unitImage);
          setLogoImg(json.logoImage);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchMatrix();
    const syncTimer = setInterval(fetchMatrix, 5000);
    return () => clearInterval(syncTimer);
  }, []);

  // 3. 🚀 主理人专属定制：菜单与海报的【穿插式连播】
  useEffect(() => {
    // 如果没有海报，就永远锁死在菜单页
    if (playMode !== 'loop' || posters.length === 0) {
      setCurrentSlide(0); 
      return;
    }
    
    // 每 8 秒在“菜单(0)”和“海报(1)”之间切换一次
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 8000); 

    return () => clearInterval(slideTimer);
  }, [playMode, posters.length]);

  // 4. 🚀 核心黑科技：当画面切回菜单时，在后台悄悄准备下一张海报！
  useEffect(() => {
    if (currentSlide === 0 && posters.length > 1) {
      // 延迟 1.5 秒（等旧海报完全淡出不可见后），悄悄把海报源换成下一张
      const hideTimer = setTimeout(() => {
        setPosterIdx((prev) => (prev + 1) % posters.length);
      }, 1500);
      return () => clearTimeout(hideTimer);
    }
  }, [currentSlide, posters.length]);

  if (loading) return <div className="h-screen w-screen bg-[#F4F1EA] flex items-center justify-center font-mono text-xs italic tracking-widest text-zinc-400">°C / g . SPACE // MATRIX SYNCING...</div>;

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] p-16 flex flex-col justify-between overflow-hidden">
      
      {/* ☁️ 顶部状态栏 */}
      <div className="absolute top-0 left-0 w-full px-16 py-8 flex justify-between items-center z-50">
        <div className="flex items-center space-x-6 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm">
          {logoImg ? <img src={logoImg} className="h-14 object-contain" alt="Logo" /> : <span className="text-2xl font-black italic">°C / g . SPACE</span>}
          <div className="w-px h-4 bg-black/10"></div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">☀️ NY 74°F SUNNY</span>
        </div>
        <div className="flex items-center space-x-8 font-mono text-xs font-bold text-black bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm">
          <span className={playMode === 'loop' ? 'text-amber-600' : 'opacity-30'}>AUTOPLAY</span>
          <div className="w-px h-4 bg-black/10"></div>
          <span className="text-base tabular-nums">{time}</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 my-6 relative w-full h-full">
        {/* 🎬 画面一：高级菜单 */}
        <div className={`absolute inset-0 pt-24 flex items-center transition-all duration-1000 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="w-7/12 pr-12 space-y-10">
            {Object.keys(menuData).map(cat => (
              <div key={cat} className="border-t border-black/10 pt-4">
                <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-600 mb-6 font-black">// {cat}</h2>
                <div className="space-y-5">
                  {menuData[cat].map(item => (
                    <div key={item.id} className="flex justify-between items-end group">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-bold tracking-tighter">{item.name}</span>
                        {item.specialTag && <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-mono rounded-sm uppercase tracking-widest animate-pulse">{item.specialTag}</span>}
                      </div>
                      <div className="flex-1 border-b border-dotted border-black/20 mx-4 mb-2"></div>
                      <span className="font-mono text-2xl font-black">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* 右侧：插画小人 */}
          <div className="w-5/12 flex items-center justify-center relative">
            <div className="absolute w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>
            {unitImg && <img src={unitImg} className="relative z-10 max-h-[70%] object-contain drop-shadow-2xl" style={{ animation: 'float 4s ease-in-out infinite' }} />}
          </div>
        </div>

        {/* 🎬 画面二：100%全屏穿插海报 */}
        <div className={`absolute inset-0 -mx-16 -my-16 transition-opacity duration-1000 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {posters.length > 0 && (
            <>
              <img src={posters[posterIdx]} className="absolute inset-0 w-full h-full object-cover" alt="Gallery Poster" />
              <div className="absolute bottom-12 left-16 bg-black/60 backdrop-blur-md text-white px-4 py-2 font-mono text-[10px] tracking-widest rounded-sm uppercase">
                °C / g . SPACE // GALLERY 0{posterIdx + 1}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }`}</style>
    </div>
  );
}
