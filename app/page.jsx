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

  // 1. 系统精准时钟
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 核心：从后端收取全自动打包好的云端资产
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
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchMatrix();
    const syncTimer = setInterval(fetchMatrix, 4000);
    return () => clearInterval(syncTimer);
  }, []);

  // 3. 大版面转场控制（菜单 ➔ 海报）
  useEffect(() => {
    if (playMode !== 'loop') return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 10000); // 10秒更换一次大版面
    return () => clearInterval(slideTimer);
  }, [playMode]);

  // 4. 全屏海报多大图丝滑轮播池
  useEffect(() => {
    if (posters.length <= 1) return;
    const pTimer = setInterval(() => {
      setPosterIdx((prev) => (prev + 1) % posters.length);
    }, 4500); // 每4.5秒自动切下一张
    return () => clearInterval(pTimer);
  }, [posters]);

  if (loading) return (
    <div className="h-screen w-screen bg-[#F4F1EA] flex flex-col items-center justify-center text-zinc-400 font-mono tracking-[0.3em] text-xs">
      °C / g . SPACE // PREMIUM SIGNAGE MATRIX INITIALIZING...
    </div>
  );

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] p-16 flex flex-col justify-between overflow-hidden select-none">
      
      {/* ☁️ 顶级高定悬浮状态栏 */}
      <div className="absolute top-0 left-0 w-full px-16 py-8 flex justify-between items-center z-50">
        <div className="flex items-center space-x-6 bg-white/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/40 shadow-sm transition-all">
          {logoImg ? (
            <img src={logoImg} alt="Brand Logo" className="h-6 object-contain" />
          ) : (
            <span className="text-2xl font-black font-serif italic tracking-tighter text-black">°C / g . SPACE</span>
          )}
          <div className="w-px h-4 bg-black/10"></div>
          <div className="flex items-center space-x-2 font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>NY_LAB</span>
            <span>☀️ 74°F SUNNY</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 bg-white/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/40 shadow-sm font-mono text-[11px]">
          <button onClick={() => setPlayMode('loop')} className={`transition-all tracking-wider ${playMode === 'loop' ? 'text-amber-600 font-extrabold' : 'text-black/40'}`}>🔄 AUTOPLAY</button>
          <button onClick={() => { setPlayMode('lock-menu'); setCurrentSlide(0); }} className={`transition-all tracking-wider ${playMode === 'lock-menu' ? 'text-black font-extrabold' : 'text-black/40'}`}>MENU</button>
          <button onClick={() => { setPlayMode('lock-poster'); setCurrentSlide(1); }} className={`transition-all tracking-wider ${playMode === 'lock-poster' ? 'text-black font-extrabold' : 'text-black/40'}`}>GALLERY</button>
          <div className="w-px h-4 bg-black/10"></div>
          <span className="font-bold tracking-tight text-sm tabular-nums text-black">{time}</span>
        </div>
      </div>

      {/* 主舞台 */}
      <div className="flex-1 my-6 relative w-full h-full">
        
        {/* 🎬 画面一：高级杂志排版风菜单 */}
        <div className={`absolute inset-0 pt-28 pb-6 flex items-center transition-all duration-1000 transform ${currentSlide === 0 || posters.length === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-98 pointer-events-none'}`}>
          
          <div className="w-7/12 pr-16 flex flex-col justify-center space-y-12">
            {Object.keys(menuData).length === 0 ? (
              <div className="text-zinc-400 font-mono text-xs animate-pulse tracking-widest">LOADING LAB RECEIPT...</div>
            ) : (
              Object.keys(menuData).map((category) => (
                <div key={category} className="border-t border-black/10 pt-4">
                  <h2 className="text-[11px] font-mono tracking-[0.3em] uppercase text-amber-600 mb-6 font-bold">
                    // {category}
                  </h2>
                  <div className="space-y-5">
                    {menuData[category].map((item) => (
                      <div key={item.id} className="flex justify-between items-end group">
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl font-bold text-zinc-900 tracking-tight font-sans">{item.name}</span>
                          {item.specialTag && (
                            <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 rounded-sm uppercase tracking-wider font-medium">{item.specialTag}</span>
                          )}
                        </div>
                        <div className="flex-1 border-b border-dotted border-black/15 mx-4 mb-1.5"></div>
                        <span className="font-mono text-2xl font-semibold text-black tracking-tight">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 右侧：主理人高定插画小人（Unit）黄金展示舞台 */}
          <div className="w-5/12 h-full flex flex-col items-center justify-center relative">
            <div className="absolute w-[80%] h-[60%] bg-gradient-to-tr from-amber-200/20 to-orange-200/10 rounded-full blur-3xl opacity-60 scale-90"></div>
            {unitImg ? (
              <img 
                src={unitImg} 
                alt="Brand Character Unit" 
                className="relative z-10 max-h-[75%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                style={{ animation: 'premiumFloat 5s ease-in-out infinite' }}
              />
            ) : (
              <div className="border border-dashed border-black/10 rounded-3xl p-10 text-center font-mono text-xs text-zinc-400 max-w-[280px]">
                [ 🪐 Place Your Unit Illustration Here via Notion Name="UNIT" ]
              </div>
            )}
          </div>
        </div>

        {/* 🎬 画面二：100% 纯享无边界全屏巨幕画廊 */}
        <div className={`absolute inset-0 -mx-16 -my-16 transition-all duration-1000 ${currentSlide === 1 && posters.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {posters.map((imgUrl, index) => (
            <img 
              key={index}
              src={imgUrl} 
              alt="Premium Gallery Bleed" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === posterIdx ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          
          <div className="absolute bottom-12 left-16 bg-black/70 backdrop-blur-md text-[#F4F1EA] px-4 py-2 text-[10px] font-mono tracking-[0.25em] rounded-sm uppercase">
            °C / g . SPACE // ARTWORK 0{posterIdx + 1}
          </div>
        </div>

      </div>

      <div className="border-t border-black/10 pt-4 flex justify-between items-center font-mono text-[9px] text-zinc-400 tracking-widest uppercase">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>SYSTEM // SECURE_MATRIX_CONNECTED_v4.5</span>
        </div>
        <div>[ TOTAL ZERO CODE // MANAGED FROM NOTION MOBILE APP ]</div>
      </div>

      <style jsx global>{`
        @keyframes premiumFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
