import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UploadFlow() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, mapping_required, success, error
  const [message, setMessage] = useState('');
  const [csvColumns, setCsvColumns] = useState([]);
  const [missingCols, setMissingCols] = useState([]);
  
  // Mapping state: { "Date": "Txn Date", "Amount": "Value", ... }
  const [mapping, setMapping] = useState({
    Date: '',
    Description: '',
    Amount: ''
  });

  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async (mappingData = null) => {
    if (!file) return;
    setStatus('uploading');
    setMessage('Uploading and parsing statement...');

    const formData = new FormData();
    formData.append('file', file);
    if (mappingData) {
      formData.append('mapping', JSON.stringify(mappingData));
    }

    try {
      // Assuming backend is running on 8000 locally
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;
      if (data.status === 'mapping_required') {
        setStatus('mapping_required');
        setCsvColumns(data.columns);
        setMissingCols(data.missing);
        setMessage(data.message);
      } else if (data.status === 'success') {
        setStatus('success');
        setMessage(data.message + " Reloading dashboard...");
        setPreview(data.preview);
        
        // Force reload so dashboard fetches new data and triggers AI insights generation
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'An error occurred during upload.');
    }
  };

  const loadSampleData = async () => {
    setStatus('uploading');
    setMessage('Loading and processing sample statement...');
    try {
      const response = await axios.post('http://localhost:8000/api/upload/sample');
      const data = response.data;
      if (data.status === 'success') {
        setStatus('success');
        setMessage("Sample data loaded successfully! Scroll down to see the dashboard in action.");
        setPreview(data.preview);
        
        // Force a tiny delay so the dashboard can fetch the new data, though React will handle it,
        // it's nice to reload the page or let the dashboard refresh. Since dashboard is in App.jsx
        // and doesn't auto-refresh on upload success, let's just trigger a full window reload
        // to make the demo bulletproof.
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to load sample data.');
    }
  };

  const submitMapping = () => {
    // Validate mapping
    for (let col of missingCols) {
      if (!mapping[col]) {
        setMessage(`Please select a column for ${col}`);
        return;
      }
    }
    // Re-upload with mapping
    handleUpload(mapping);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
        <UploadCloud className="text-blue-400" /> Upload Statement
      </h2>

      {/* Upload Section */}
      {status === 'idle' || status === 'error' || status === 'uploading' ? (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-zinc-400" />
              <p className="mb-2 text-sm text-zinc-400">
                <span className="font-semibold text-white">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-zinc-500">CSV files only (for now)</p>
            </div>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>
          
          {file && <p className="text-sm text-zinc-300">Selected: {file.name}</p>}
          {status === 'error' && <p className="text-sm text-red-400 flex items-center gap-1"><AlertTriangle size={16}/> {message}</p>}
          
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => handleUpload()}
              disabled={!file || status === 'uploading'}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
            >
              {status === 'uploading' ? 'Processing...' : 'Upload & Process'}
            </button>
            <button 
              onClick={loadSampleData}
              disabled={status === 'uploading'}
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
            >
              Try with Sample Data
            </button>
          </div>
        </div>
      ) : null}

      {/* Mapping Section */}
      {status === 'mapping_required' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="p-4 bg-orange-500/10 border border-orange-500/50 rounded-lg">
            <h3 className="text-orange-400 font-medium flex items-center gap-2 mb-2">
              <AlertTriangle size={18}/> Unrecognized Format
            </h3>
            <p className="text-sm text-zinc-300 mb-4">{message}</p>
            
            <div className="space-y-3">
              {missingCols.map(col => (
                <div key={col} className="flex flex-col">
                  <label className="text-xs font-medium text-zinc-400 mb-1">Which column represents <b>{col}</b>?</label>
                  <select 
                    className="p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white outline-none focus:border-blue-500"
                    value={mapping[col] || ''}
                    onChange={(e) => setMapping({...mapping, [col]: e.target.value})}
                  >
                    <option value="">Select a column...</option>
                    {csvColumns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button 
              onClick={submitMapping}
              className="mt-4 w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
            >
              Confirm Mapping
            </button>
          </div>
        </div>
      )}

      {/* Success / Preview Section */}
      {status === 'success' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="text-green-400 font-medium">Success!</h3>
              <p className="text-sm text-zinc-300">{message}</p>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mt-4">Data Preview (Anonymized)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-300">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Recurring</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-zinc-800">
                    <td className="px-4 py-3 whitespace-nowrap">{row.Date}</td>
                    <td className="px-4 py-3">{row.Description}</td>
                    <td className="px-4 py-3">{row.Category}</td>
                    <td className="px-4 py-3">{row.is_recurring ? '✅ Yes' : '❌ No'}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => {setFile(null); setStatus('idle'); setPreview([]);}}
            className="mt-2 text-sm text-blue-400 hover:underline"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}
