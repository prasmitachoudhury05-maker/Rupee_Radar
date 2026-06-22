import { useState, useEffect } from 'react';
import axios from 'axios';
import { Crosshair, AlertTriangle } from 'lucide-react';

export default function Subscriptions() {
  const [data, setData] = useState({ subscriptions: [], total_yearly_impact: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/metrics/subscriptions');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  if (loading || data.subscriptions.length === 0) return null;

  return (
    <div className="bg-[#1e1e24] border border-rose-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
        <Crosshair size={120} />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 relative z-10 gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 mt-1">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Subscription Sniper</h2>
            <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
              The AI automatically analyzed your statement and detected these recurring charges. 
              We calculate their <strong className="text-rose-400 font-medium">Yearly Impact</strong> to show you exactly how much they are silently draining from your wealth.
            </p>
          </div>
        </div>
        
        <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg text-right min-w-[200px]">
          <p className="text-xs text-rose-300/70 uppercase tracking-wider font-semibold mb-1">Total Yearly Drain</p>
          <p className="text-2xl font-black text-rose-500">₹{data.total_yearly_impact.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {data.subscriptions.map((sub, idx) => (
          <div key={idx} className="bg-[#121214] border border-zinc-800 p-4 rounded-xl flex flex-col hover:border-rose-500/50 transition-colors">
            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 w-max px-2 py-1 rounded mb-2">
              {sub.category}
            </span>
            <h4 className="text-gray-200 font-medium truncate mb-4" title={sub.name}>{sub.name}</h4>
            <div className="mt-auto flex justify-between items-end border-t border-zinc-800/50 pt-3 mb-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Cost Per Month</p>
                <p className="text-white font-medium">₹{sub.monthly.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-rose-400/80 uppercase tracking-wider font-semibold">Cost Per Year</p>
                <p className="text-rose-400 font-bold text-lg">₹{sub.yearly.toLocaleString()}</p>
              </div>
            </div>
            <button className="w-full mt-2 py-1.5 text-xs font-semibold rounded bg-zinc-800 text-zinc-400 hover:bg-rose-500 hover:text-white transition-colors border border-zinc-700 hover:border-rose-500">
              Mark for Cancellation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
