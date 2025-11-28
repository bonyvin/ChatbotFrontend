import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  Code, 
  CheckCircle,
  Cpu,
  Layers
} from 'lucide-react';

// The specific endpoint provided
const API_URL = "https://rex.retail.us-ashburn-1.ocs.oraclecloud.com/rgbu-rex-kpmg-par1-mfcs/RmsReSTServices/services";

export default function OracleTest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
// Example implementation
const authenticateAndCallAPI = async (username, password) => {
  // Create Basic Auth header
  const credentials = btoa(`${username}:${password}`);
  
  try {
    // Call the API endpoint
    const response = await fetch(
      'https://rex.retail.us-ashburn-1.ocs.oraclecloud.com/rgbu-rex-kpmg-par1-mfcs/RmsReSTServices/services',
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("API call error:", error);
    console.error('API call failed:', error);
    throw error;
  }
};
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Note: Browser security often blocks 'Authorization' or custom headers 
          // in cross-origin requests unless the server explicitly allows them.
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      console.log("Fetch error:", err);
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status color
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    return status.toUpperCase() === 'ACTIVE' || status.toUpperCase() === 'STARTED'
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Server className="w-6 h-6 text-blue-600" />
              Oracle RMS Service Monitor
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Endpoint: <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{API_URL}</span>
            </p>
          </div>
          <button onClick={() => authenticateAndCallAPI('vinodkumarmd@kpmg.com', 'Oracle16sep@121')}>Test API</button>
          <button
            onClick={fetchData}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm
              ${loading 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Call Service API
              </>
            )}
          </button>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Connection Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-xs text-red-500 mt-2">
                Note: If this is a CORS error, the browser is blocking the request because the Oracle server might not whitelist this origin.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Ready to Connect</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              Click the button above to fetch the current status of the RMS Rest Services.
            </p>
          </div>
        )}

        {/* Data Display */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                icon={<Layers className="w-5 h-5 text-purple-600" />}
                label="Application"
                value={data.appName}
                subValue={data.appCode}
              />
              <StatCard 
                icon={<Cpu className="w-5 h-5 text-indigo-600" />}
                label="System Version"
                value={data.appVersion}
                subValue={`Java: ${data.javaVersion}`}
              />
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Status</span>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data.appStatus)}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {data.appStatus}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 font-mono">Build: {data.buildDate}</p>
                </div>
              </div>
            </div>

            {/* Databases Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-800">Database Connections</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {data.databases?.map((db, idx) => (
                  <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${db.dataSourceStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <p className="text-sm font-medium text-slate-900 truncate" title={db.dataSourceName}>
                          {db.dataSourceName.split('-')[0]}...
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate">{db.dataSourceName}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase">Available</p>
                        <p className="font-mono font-medium">{db.availableConnectionsCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase">Active</p>
                        <p className="font-mono font-medium">{db.activeConnectionsCurrentCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase">Avg</p>
                        <p className="font-mono font-medium">{db.activeConnectionsAverageCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Raw JSON */}
            <div className="flex justify-end">
               <button 
                onClick={() => setShowRaw(!showRaw)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
               >
                 <Code className="w-4 h-4" />
                 {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
               </button>
            </div>

            {showRaw && (
              <div className="bg-slate-900 rounded-xl p-4 shadow-inner overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono leading-relaxed">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// Helper Component for Cards
function StatCard({ icon, label, value, subValue }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value || "N/A"}</div>
        {subValue && <div className="text-sm text-slate-500 mt-1">{subValue}</div>}
      </div>
    </div>
  );
}