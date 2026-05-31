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
  const [screenId, setScreenId] = useState('ALL');

  // 🌤️ 新增：实时天气状态
  const [weather, setWeather] = useState({ temp: '--', desc: 'SYNCING', icon: '🌍' });

  // 1. 获取网址后面的 ?screen=X 参数
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setScreenId(params.get('screen') || 'ALL');
    }
  }, []);

  // 2. 系统精准时钟
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. 🌤️ 核心：获取纽约实时天气
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // ⚠️⚠️⚠️ 主理人看这里：把下面引号里的内容，替换成你申请到的真实 API Key！
        const API_KEY = "ee819ecc6d167703afcc1d64cc91072d"; 
        
        if (API_KEY === "替换成你的API_KEY") return; // 如果没填，就不执行

        // 请求 OpenWeatherMap 的纽约数据 (units=imperial 代表用华氏度)
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=New York&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        
        if (data.main) {
          const temp = Math.round(data.main.temp);
          const desc = data.weather[0].main.toUpperCase(); // 比如 CLOUDS, RAIN, CLEAR
          
          // 根据真实的英文天气匹配可爱的 Emoji 图标
          let icon = '☀️';
          if (desc.includes('CLOUD')) icon = '☁️';
          else if (desc.includes('RAIN') || desc.includes('DRIZZLE')) icon = '🌧️';
          else if (desc.includes('THUNDER')) icon = '⛈️';
          else if (desc.includes('SNOW')) icon = '❄️';
          else if (desc.includes('CLEAR')) icon = '☀️';
          else icon = '🌫️'; 
          
          setWeather({ temp, desc, icon });
        }
      } catch (err) { console.error("Weather Error", err); }
    };

    fetchWeather();
    // 每半小时自动刷新一次天气 (天气不需要每秒刷新，半小时正好，能省 API 额度)
    const weatherTimer = setInterval(fetchWeather, 1800000);
    return () => clearInterval(weatherTimer);
  }, []);

  // 4. 数据抓取（融合了多屏幕过滤）
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.success) {
          // 只留下属于这个屏幕的菜单
          const filteredMenu = (json.menuItems || []).filter(item => item.screen === 'ALL' || item.screen === screenId);
          const grouped = filteredMenu.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuData(grouped);
          
          // 只留下属于这个屏幕的海报/视频
          const filteredPosters = (json.posterImages || [])
            .filter(p => p.screen === 'ALL' || p.screen === screenId)
            .map(p => p.url);
            
          setPosters(filteredPosters);
          setUnitImg(json.unitImage);
          setLogoImg(json.logoImage);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    
    if (screenId) {
      fetchMatrix();
      const syncTimer = setInterval(fetchMatrix, 5000);
      return () => clearInterval(syncTimer);
    }
  }, [screenId]);

  // 5. 菜单与海报转场控制
  useEffect(() => {
    if (playMode !== 'loop') return;
    if (posters.length === 0) {
      setCurrentSlide(0);
      return;
    }
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 8000); 
    return () => clearInterval(slideTimer);
  }, [playMode, posters.length]);

  // 6. 海报/视频内部轮换逻辑
  useEffect(() => {
    if (posters.length <= 1) return;
    if (playMode === 'loop') {
      if (currentSlide === 0) {
        const hideTimer = setTimeout(() => {
          setPosterIdx((prev) => (prev + 1) % posters.length);
        }, 1500);
        return () => clearTimeout(hideTimer);
      }
    } else if (playMode === 'lock-poster') {
      if (currentSlide === 1) {
        const pTimer = setInterval(() => {
          setPosterIdx((prev) => (prev + 1) % posters.length);
        }, 4000);
        return () => clearInterval(pTimer);
      }
    }
  }, [currentSlide, posters.length, playMode]);

  if (loading) return <div className="h-screen w-screen bg-[#F4F1EA] flex items-center justify-center font-mono text-xs italic tracking-widest text-zinc-400">CG SPACE // MATRIX SYNCING...</div>;

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] p-16 flex flex-col justify-between overflow-hidden">
      
      {/* ☁️ 顶部状态栏 */}
      <div className="absolute top-0 left-0 w-full px-16 py-8 flex justify-between items-center z-50">
        <div className="flex items-center space-x-6 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm">
          {logoImg ? <img src={logoImg} className="h-18 object-contain" alt="Logo" /> : <span className="text-2xl font-black italic">°C / g . SPACE</span>}
          <div className="w-px h-4 bg-black/10"></div>
          {/* 🌤️ 这里接入了真实的实时天气！ */}
          <span className="font-mono text-[16px] tracking-widest text-zinc-400 uppercase">
            {weather.icon} NY {weather.temp}°F {weather.desc} // SCR-{screenId}
          </span>
        </div>
        
        {/* 控制台按钮 */}
        <div className="flex items-center space-x-6 font-mono text-xs font-bold text-black bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm cursor-pointer z-50 pointer-events-auto">
          <button onClick={() => setPlayMode('loop')} className={`transition-all ${playMode === 'loop' ? 'text-amber-600' : 'opacity-40 hover:opacity-100'}`}>🔄 AUTOPLAY</button>
          <button onClick={() => { setPlayMode('lock-menu'); setCurrentSlide(0); }} className={`transition-all ${playMode === 'lock-menu' ? 'text-black' : 'opacity-40 hover:opacity-100'}`}>🔒 MENU</button>
          <button onClick={() => { setPlayMode('lock-poster'); setCurrentSlide(1); }} className={`transition-all ${playMode === 'lock-poster' ? 'text-black' : 'opacity-40 hover:opacity-100'}`}>🔒 POSTER</button>
          <div className="w-px h-4 bg-black/10"></div>
          <span className="text-base tabular-nums">{time}</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 my-6 relative w-full h-full">
        {/* 🎬 画面一：高级菜单 */}
        <div className={`absolute inset-0 pt-24 flex items-center transition-all duration-1000 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="w-7/12 pr-12 space-y-10">
            {Object.keys(menuData).length === 0 && <div className="text-zinc-400 font-mono text-xs animate-pulse tracking-widest">NO DATA FOR SCREEN {screenId}</div>}
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
            {unitImg && <img src={unitImg} className="relative z-10 max-h-[70%] object-contain drop-shadow-2xl mix-blend-multiply" style={{ animation: 'float 4s ease-in-out infinite' }} />}
          </div>
        </div>

        {/* 🎬 画面二：100%全屏穿插海报（支持高清无缝视频！） */}
        <div className={`absolute inset-0 -mx-16 -my-16 transition-opacity duration-1000 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {posters.length > 0 && posters.map((mediaUrl, idx) => {
            const isVideo = mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.mov') || mediaUrl.toLowerCase().includes('.webm');
            return isVideo ? (
              <video key={idx} src={mediaUrl} autoPlay loop muted playsInline className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === posterIdx ? 'opacity-100' : 'opacity-0'}`} />
            ) : (
              <img key={idx} src={mediaUrl} alt="Gallery Poster" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === posterIdx ? 'opacity-100' : 'opacity-0'}`} />
            );
          })}
          
          <div className="absolute bottom-12 left-16 bg-black/60 backdrop-blur-md text-white px-4 py-2 font-mono text-[10px] tracking-widest rounded-sm uppercase">
            °C / g . SPACE // GALLERY {screenId === 'ALL' ? '' : `S${screenId}-`}0{posterIdx + 1}
          </div>
        </div>
      </div>

      <style jsx global>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }`}</style>
    </div>
  );
}
