'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState({});
  const [allImages, setAllImages] = useState([]);
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState({ temp: '72°F', condition: 'Sunny', icon: '☀️' });
  
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [currentImageIdx, setCurrentImageIdx] = useState(0); 
  const [playMode, setPlayMode] = useState('loop'); 

  // ==========================================
  // 🎨 主理人专属配置区 (以后换小人图片就在这里填网址)
  // ==========================================
  const UNIT_ILLUSTRATION_URL = "https://images.unsplash.com/photo-1596450514735-a11aaa8bf803?auto=format&fit=crop&w=800&q=80"; // ⚠️ 请把这串网址替换为你小人插画的真实链接！
  const BRAND_LOGO_TEXT = "Cg Space";
  // ==========================================

  // 1. 系统时钟 & 模拟天气预报动态
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Notion 数据抓取 & 建立图片轮播池
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

          // 核心修复：把所有有图片的商品，提取出来放进轮播池！
          const images = json.data.map(item => item.imageUrl).filter(Boolean);
          if(images.length > 0) setAllImages(images);
        }
      } catch (err) { console.error("Sync Error"); }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 5000);
    return () => clearInterval(dataTimer);
  }, []);

  // 3. 大屏转场（菜单 ➔ 海报）
  useEffect(() => {
    if (playMode !== 'loop') return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 10000); // 每 10 秒切换一次大版面
    return () => clearInterval(slideTimer);
  }, [playMode]);

  // 4. 修复全屏海报多图连播！
  useEffect(() => {
    if (allImages.length <= 1) return; // 只有1张图就不播
    const imageTimer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
    }, 4000); // 海报里的图片每 4 秒换一张
    return () => clearInterval(imageTimer);
  }, [allImages]);

  // 兜底全屏大图
  const displayImages = allImages.length > 0 ? allImages : ["https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?auto=format&fit=crop&w=2000&q=80"];

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] flex flex-col justify-between overflow-hidden select-none">
      
      {/* ☁️ 顶部高级悬浮状态栏 (包含天气预报、时钟、智控) */}
      <div className="absolute top-0 w-full px-12 py-8 flex justify-between items-start z-50 pointer-events-auto">
        <div className="flex items-center space-x-6 backdrop-blur-md bg-white/30 px-4 py-2 rounded-full border border-white/40 shadow-sm">
          <span className="text-xl font-black font-serif italic tracking-tighter">{BRAND_LOGO_TEXT}</span>
          <div className="w-px h-4 bg-black/20"></div>
          <span className="font-mono text-xs font-bold tracking-widest uppercase">New York</span>
          <span className="font-mono text-xs">{weather.icon} {weather.temp} {weather.condition}</span>
        </div>
        
        <div className="flex items-center space-x-6 backdrop-blur-md bg-white/30 px-4 py-2 rounded-full border border-white/40 shadow-sm font-mono text-xs">
          <button onClick={() => { setPlayMode('loop'); }} className={`transition-all ${playMode === 'loop' ? 'text-amber-600 font-bold' : 'text-black/50'}`}>AUTO</button>
          <button onClick={() => { setPlayMode('lock-menu'); setCurrentSlide(0); }} className={`transition-all ${playMode === 'lock-menu' ? 'text-black font-bold' : 'text-black/50'}`}>MENU</button>
          <button onClick={() => { setPlayMode('lock-poster'); setCurrentSlide(1); }} className={`transition-all ${playMode === 'lock-poster' ? 'text-black font-bold' : 'text-black/50'}`}>POSTER</button>
          <div className="w-px h-4 bg-black/20"></div>
          <span className="font-bold tracking-wider">{time}</span>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full">
        
        {/* 🎬 画面一：极致高级杂志风菜单 + 你的插画小人 */}
        <div className={`absolute inset-0 pt-32 px-16 pb-16 flex transition-all duration-1000 ${currentSlide === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          
          {/* 左侧：无边框高级点单区 */}
          <div className="w-2/3 pr-20 flex flex-col justify-center space-y-12">
            {Object.keys(menuData).length === 0 ? (
              <div className="text-zinc-400 font-mono text-sm animate-pulse">Syncing elegant menu...</div>
            ) : (
              Object.keys(menuData).map((category) => (
                <div key={category}>
                  <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-amber-600 mb-6 border-b border-black/10 pb-2">{category}</h2>
                  <div className="space-y-4">
                    {menuData[category].map((item) => (
                      <div key={item.id} className="flex justify-between items-end group">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-black font-serif">{item.name}</span>
                          {item.specialTag && <span className="text-[9px] bg-[#1A1A1A] text-[#F4F1EA] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-widest">{item.specialTag}</span>}
                        </div>
                        {/* 高级餐厅专用的点阵对齐线 */}
                        <div className="flex-1 border-b-[1.5px] border-dotted border-black/20 mx-4 mb-2"></div>
                        <span className="font-mono text-xl font-semibold text-black">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 右侧：预留给主理人的 Unit 插画小人展示区！ */}
          <div className="w-1/3 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-amber-100/50 rounded-full blur-3xl scale-75 opacity-50"></div>
            {/* ⚠️ 这里就是你的小人！ */}
            <img 
              src={UNIT_ILLUSTRATION_URL} 
              alt="Brand Unit" 
              className="relative z-10 max-h-[70%] object-contain drop-shadow-xl animate-bounce-slow"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* 🎬 画面二：100% 纯享全屏大图连播（彻底消灭黑框！） */}
        <div className={`absolute inset-0 transition-all duration-1000 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {displayImages.map((imgUrl, index) => (
            <img 
              key={index}
              src={imgUrl} 
              alt="Live Screen" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIdx ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {/* 底部保留一个极简的高级水印 */}
          <div className="absolute bottom-8 left-12 bg-black/60 backdrop-blur-md text-white px-4 py-2 text-xs font-mono tracking-[0.2em] rounded-sm uppercase">
            {BRAND_LOGO_TEXT} // PREMIUM GALLERY
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
