import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import { maintenanceAPI } from '../services/api';
import { ClipboardList, ArrowLeft, CheckCircle2, Clock, User, Wrench, ShieldCheck } from 'lucide-react';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWO() {
      try {
        const res = await maintenanceAPI.getWorkOrderById(id);
        setWo(res.data);
      } catch (err) {
        console.warn("Error loading work order:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWO();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await maintenanceAPI.updateWorkOrder(id, { status: newStatus });
      setWo(prev => ({ ...prev, status: res.data.status, completed_at: res.data.completed_at }));
    } catch (err) {
      console.error("Error updating WO status:", err);
    }
  };

  if (loading || !wo) {
    return (
      <div className="min-h-screen bg-industrial-900 flex items-center justify-center text-white">
        <Clock className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-industrial-800 rounded-xl text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-md border border-accent-cyan/20">
                {wo.id}
              </span>
              <h1 className="text-xl font-extrabold text-white tracking-tight mt-1">{wo.title}</h1>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-industrial-border space-y-6">
            <div className="flex items-center justify-between border-b border-industrial-border pb-4">
              <div>
                <div className="text-xs text-gray-400">Current Status</div>
                <div className="text-base font-bold text-accent-cyan capitalize">{wo.status.replace('_', ' ')}</div>
              </div>

              <div className="flex items-center gap-2">
                {['scheduled', 'in_progress', 'completed'].map(statusOption => (
                  <button
                    key={statusOption}
                    onClick={() => handleStatusChange(statusOption)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      wo.status === statusOption
                        ? 'bg-accent-cyan text-industrial-900 shadow-md'
                        : 'bg-industrial-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {statusOption.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Work Instructions</h4>
              <p className="text-xs text-gray-200 bg-industrial-900 p-4 rounded-xl border border-industrial-border whitespace-pre-wrap leading-relaxed">
                {wo.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border">
                <span className="text-gray-400 block mb-1">Target Asset</span>
                <span className="font-bold text-white">{wo.asset?.name || wo.asset_id}</span>
              </div>

              <div className="bg-industrial-900/80 p-4 rounded-xl border border-industrial-border">
                <span className="text-gray-400 block mb-1">Assigned Technician</span>
                <span className="font-bold text-white">{wo.assigned_technician?.full_name || 'Alex Rivera (Sr. Tech)'}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
