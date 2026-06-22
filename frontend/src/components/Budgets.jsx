import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus } from 'lucide-react';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        axios.get('http://localhost:8000/api/metrics/budgets'),
        axios.get('http://localhost:8000/api/metrics/categories')
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) setSelectedCat(catRes.data[0].name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!selectedCat || !limitAmount) return;
    try {
      await axios.post('http://localhost:8000/api/metrics/budgets', {
        category_name: selectedCat,
        limit_amount: parseFloat(limitAmount)
      });
      setLimitAmount('');
      fetchData();
    } catch (err) {
      console.error("Failed to add budget");
    }
  };

  if (loading) return null;

  return (
    <div className="bg-[#1e1e24] border border-zinc-800 rounded-xl p-6 shadow-xl mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Target size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">Smart Budgeting</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Budget Form */}
        <div className="col-span-1 bg-[#121214] p-5 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Set Category Limit</h3>
          <form onSubmit={handleAddBudget} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select 
                value={selectedCat} 
                onChange={e => setSelectedCat(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-indigo-500"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Monthly Limit (₹)</label>
              <input 
                type="number" 
                required
                min="0"
                value={limitAmount}
                onChange={e => setLimitAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
              <Plus size={16} />
              <span>Save Budget</span>
            </button>
          </form>
        </div>

        {/* Progress Bars */}
        <div className="col-span-1 md:col-span-2 space-y-5 overflow-y-auto max-h-64 pr-2">
          {budgets.length === 0 ? (
            <div className="text-gray-500 text-sm flex items-center justify-center h-full">No budgets set yet.</div>
          ) : (
            budgets.map(b => {
              const percent = Math.min(100, (b.spent / b.limit) * 100);
              const isOver = b.spent > b.limit;
              return (
                <div key={b.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-200">{b.category}</span>
                    <span className="text-gray-400">
                      ₹{b.spent.toLocaleString()} / <span className="text-white">₹{b.limit.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  {isOver && <p className="text-xs text-rose-400">Over budget by ₹{(b.spent - b.limit).toLocaleString()}</p>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
