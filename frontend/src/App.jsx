import UploadFlow from './components/UploadFlow';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

import { Download } from 'lucide-react';

function App() {
  const handleDownload = () => {
    window.open('http://localhost:8000/api/export/pdf', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 font-sans p-4 md:p-8 pb-32">
      <header className="max-w-6xl mx-auto py-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent inline-block">
            RupeeRadar
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Your AI-Powered Personal Finance Engine</p>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 border border-zinc-700 transition-colors"
        >
          <Download size={18} />
          <span>Export PDF</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto space-y-16">
        <section>
          <UploadFlow />
        </section>
        
        <section className="pt-8 border-t border-zinc-800/50">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-sm">📊</span>
            Financial Dashboard
          </h2>
          <Dashboard />
        </section>
      </main>

      <Chatbot />
    </div>
  );
}

export default App;
