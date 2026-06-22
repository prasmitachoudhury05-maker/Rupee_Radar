import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingDown, Target, Lightbulb } from 'lucide-react';
import Budgets from './Budgets';
import Subscriptions from './Subscriptions';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, insRes] = await Promise.all([
          axios.get('http://localhost:8000/api/metrics/summary'),
          axios.get('http://localhost:8000/api/metrics/insights')
        ]);
        setSummary(sumRes.data);
        setInsights(insRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-400 p-8 animate-pulse text-center">Loading your financial universe...</div>;
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <Budgets />
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e1e24] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Income</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">₹{summary.income.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e24] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-rose-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Spend</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">₹{summary.spend.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e24] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Net Savings</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">₹{summary.savings.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <div className="bg-[#1e1e24] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Where Your Money Goes</h3>
          <div className="h-64">
            {summary.top_categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.top_categories} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                  <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{fill: '#27272a'}}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {summary.top_categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No spending data available</div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-[#1e1e24] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Financial Insights</h3>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-black/20 rounded-lg p-4 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <h4 className="text-emerald-400 font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Subscriptions />
    </div>
  );
}
