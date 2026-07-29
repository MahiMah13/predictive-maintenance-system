import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Legend
} from 'recharts';
import { Activity, Thermometer, Gauge, Clock } from 'lucide-react';

export default function SensorTrendChart({ readings = [], assetName = 'Asset' }) {
  const [selectedStream, setSelectedStream] = useState('vibration');

  // Format data for Recharts
  const chartData = [
    { date: '14 Days Ago', vibration: 3.2, temperature: 64, pressure: 450, threshold: 4.5 },
    { date: '12 Days Ago', vibration: 3.5, temperature: 66, pressure: 448, threshold: 4.5 },
    { date: '10 Days Ago', vibration: 4.1, temperature: 68, pressure: 442, threshold: 4.5 },
    { date: '8 Days Ago', vibration: 4.8, temperature: 71, pressure: 435, threshold: 4.5 },
    { date: '6 Days Ago', vibration: 5.4, temperature: 73, pressure: 428, threshold: 4.5 },
    { date: '4 Days Ago', vibration: 6.1, temperature: 76, pressure: 420, threshold: 4.5 },
    { date: '2 Days Ago', vibration: 6.5, temperature: 77, pressure: 415, threshold: 4.5 },
    { date: 'Today (Latest)', vibration: 6.8, temperature: 78.4, pressure: 412, threshold: 4.5 }
  ];

  const getMetricDetails = () => {
    switch (selectedStream) {
      case 'vibration':
        return { name: 'Vibration Acceleration (mm/s)', key: 'vibration', color: '#06b6d4', unit: 'mm/s', threshold: 4.5, label: 'ISO 10816 Limit (4.5 mm/s)' };
      case 'temperature':
        return { name: 'Bearing Temp (°C)', key: 'temperature', color: '#f59e0b', unit: '°C', threshold: 75.0, label: 'High Temp Alert (75°C)' };
      case 'pressure':
        return { name: 'Discharge Pressure (PSI)', key: 'pressure', color: '#10b981', unit: 'PSI', threshold: 400.0, label: 'Min Operating Pressure (400 PSI)' };
      default:
        return { name: 'Vibration (mm/s)', key: 'vibration', color: '#06b6d4', unit: 'mm/s', threshold: 4.5, label: 'ISO Limit' };
    }
  };

  const current = getMetricDetails();

  return (
    <div className="glass-panel p-5 rounded-2xl border border-industrial-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-cyan" />
            Time-Series Sensor Telemetry
          </h3>
          <p className="text-xs text-gray-400">
            Real-time & historical trend monitoring for {assetName}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-industrial-900 p-1 rounded-xl border border-industrial-border">
          <button
            onClick={() => setSelectedStream('vibration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedStream === 'vibration' ? 'bg-accent-cyan text-industrial-900 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Vibration
          </button>

          <button
            onClick={() => setSelectedStream('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedStream === 'temperature' ? 'bg-accent-amber text-industrial-900 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Temperature
          </button>

          <button
            onClick={() => setSelectedStream('pressure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedStream === 'pressure' ? 'bg-accent-emerald text-industrial-900 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Pressure
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} unit={` ${current.unit}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <ReferenceLine
              y={current.threshold}
              label={{ value: current.label, fill: '#f43f5e', fontSize: 10, position: 'top' }}
              stroke="#f43f5e"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey={current.key}
              name={current.name}
              stroke={current.color}
              strokeWidth={3}
              dot={{ r: 4, fill: current.color }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-industrial-border flex items-center justify-between text-xs text-gray-400">
        <span>Sampling interval: Continuous 1-minute IoT burst</span>
        <span className="text-amber-400 font-mono flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          Threshold Excursion Detected
        </span>
      </div>
    </div>
  );
}
