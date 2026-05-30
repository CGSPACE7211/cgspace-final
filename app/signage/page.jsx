'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState([]);
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState({ temp: '72°F', cond: 'CALM' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
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
      } catch (err) {
        console.error("Signage fallback active.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 5000);
    return () => clearInterval(dataTimer);
  }, []);

  if (loading) return (
    <div className="h-screen w-screen bg-[#F4F1EA] flex items-center justify-center text-zinc-400 font-mono tracking-widest text-xs">
      °C / g . SPACE // PARAMETRIC INITIALIZING...
    </div>
  );

  return (
    <div className="w-screen h-screen bg-[#F4F1EA] text-[#1A1A1A] font-sans p-16 flex flex-col justify-between overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-[#1A1A1A]/10 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">CGSPACE.NYC</h1>
          <p className="font-mono text-[10px] text-zinc-500 tracking-widest mt-0.5">BROOKLYN // PARAMETRIC LAB</p>
        </div>
        <div className="flex items-center space-x-8 font-mono text-right text-xs">
          <div>
            <div className="text-zinc-400 text-[10px]">SYS_TIME</div>
            <div className="text-base font-bold text-[#1A1A1A] mt-0.5">{time}</div>
          </div>
          <div>
            <div className="text-zinc-400 text-[10px]">ENV_NY</div>
            <div className="text-base font-bold text-[#1A1A1A] mt-0.5">{weather.temp} / {weather.cond}</div>
          </div>
        </div>
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-12 my-auto items-start">
        {Object.keys(menuData).map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="font-mono text-[10px] bg-[#1A1A1A] text-[#F4F1EA] px-2.5 py-0.5 inline-block tracking-widest uppercase">
              [{category}]
            </h2>
            <div className="space-y-5 divide-y divide-[#1A1A1A]/5">
              {menuData[category].map((item) => (
                <div key={item.id} className="pt-4 flex justify-between items-baseline">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold tracking-tight">{item.name}</span>
                    {item.specialTag && (
                      <span className="font-mono text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-sm tracking-wide font-bold">
                        {item.specialTag}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 border-b border-dashed border-[#1A1A1A]/10 mx-4 relative top-[-4px]"></div>
                  <span className="font-mono text-xl font-bold">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#1A1A1A]/10 pt-6 flex justify-between items-center font-mono text-[9px] text-zinc-400">
        <div>CORE_MATRIX_V1.0 // NO SUBSCRIPTION FEE</div>
        <div>[ ALL RECIPES ARE PARAMETRICALLY WEIGHED IN GRAMS ]</div>
      </div>
    </div>
  );
}
