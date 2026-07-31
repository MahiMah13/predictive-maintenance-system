import React, { createContext, useContext, useState, useEffect } from 'react';

const IoTStreamContext = createContext(null);

export const IoTStreamProvider = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [telemetryData, setTelemetryData] = useState({
    asset_id: 'ast-30001-pump-101',
    asset_tag: 'PUMP-101-A',
    asset_name: 'Main Boiler Feed Water Pump P-101',
    vibration_mm_s: 4.2,
    temperature_c: 66.5,
    pressure_bar: 8.4,
    current_amps: 42.1,
    status: 'normal'
  });
  const [anomalyEvent, setAnomalyEvent] = useState(null);
  const [streamTick, setStreamTick] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamTick(prev => prev + 1);

        setTelemetryData(prev => {
          // Generate small realistic sensor jitter
          const vibJitter = (Math.random() - 0.48) * 0.3;
          const tempJitter = (Math.random() - 0.48) * 0.5;
          const pressJitter = (Math.random() - 0.5) * 0.1;
          const ampJitter = (Math.random() - 0.5) * 0.4;

          const newVib = Math.max(1.5, Math.min(10.0, Number((prev.vibration_mm_s + vibJitter).toFixed(2))));
          const newTemp = Math.max(40.0, Math.min(95.0, Number((prev.temperature_c + tempJitter).toFixed(1))));
          const newPress = Math.max(4.0, Math.min(15.0, Number((prev.pressure_bar + pressJitter).toFixed(2))));
          const newAmp = Math.max(20.0, Math.min(80.0, Number((prev.current_amps + ampJitter).toFixed(1))));

          const isCritical = newVib > 6.5 || newTemp > 76.0;

          if (isCritical && !anomalyEvent) {
            setAnomalyEvent({
              id: `anom-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              vibration: newVib,
              temperature: newTemp,
              asset_name: prev.asset_name,
              message: `Telemetry Excursion: Vibration spike recorded at ${newVib} mm/s (Threshold: 4.5 mm/s).`
            });
          }

          return {
            ...prev,
            vibration_mm_s: newVib,
            temperature_c: newTemp,
            pressure_bar: newPress,
            current_amps: newAmp,
            status: isCritical ? 'degraded' : 'normal'
          };
        });
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, anomalyEvent]);

  const toggleStreaming = () => {
    setIsStreaming(prev => !prev);
  };

  const triggerManualAnomaly = () => {
    setTelemetryData(prev => ({
      ...prev,
      vibration_mm_s: 7.85,
      temperature_c: 81.2,
      status: 'degraded'
    }));
    setAnomalyEvent({
      id: `anom-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      vibration: 7.85,
      temperature: 81.2,
      asset_name: 'Main Boiler Feed Water Pump P-101',
      message: 'CRITICAL TELEMETRY SPIKE: Vibration 7.85 mm/s exceeds ISO 10816 Class III Safety Limit (4.5 mm/s).'
    });
  };

  const clearAnomaly = () => {
    setAnomalyEvent(null);
  };

  return (
    <IoTStreamContext.Provider value={{
      isStreaming,
      telemetryData,
      anomalyEvent,
      streamTick,
      toggleStreaming,
      triggerManualAnomaly,
      clearAnomaly
    }}>
      {children}
    </IoTStreamContext.Provider>
  );
};

export const useIoTStream = () => useContext(IoTStreamContext);
