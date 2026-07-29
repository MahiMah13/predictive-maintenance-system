import crypto from 'crypto';

// In-Memory Production-Grade Data Store with pre-seeded industrial data
const defaultOrgId = 'org-10001-apex-manufacturing';
const defaultUserId = 'usr-20001-lead-engineer';

const store = {
  organizations: [
    {
      id: defaultOrgId,
      name: 'Apex Precision Manufacturing Inc.',
      created_at: new Date('2024-01-15T08:00:00Z').toISOString()
    }
  ],
  profiles: [
    {
      id: defaultUserId,
      full_name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@apexmanufacturing.com',
      role: 'reliability_engineer',
      organization_id: defaultOrgId,
      created_at: new Date('2024-01-15T08:05:00Z').toISOString(),
      updated_at: new Date('2024-01-15T08:05:00Z').toISOString()
    },
    {
      id: 'usr-20002-admin',
      full_name: 'Marcus Vance (Plant Admin)',
      email: 'marcus.vance@apexmanufacturing.com',
      role: 'admin',
      organization_id: defaultOrgId,
      created_at: new Date('2024-01-15T08:10:00Z').toISOString(),
      updated_at: new Date('2024-01-15T08:10:00Z').toISOString()
    },
    {
      id: 'usr-20003-tech',
      full_name: 'Alex Rivera (Sr. Maintenance Technician)',
      email: 'alex.rivera@apexmanufacturing.com',
      role: 'technician',
      organization_id: defaultOrgId,
      created_at: new Date('2024-01-15T08:15:00Z').toISOString(),
      updated_at: new Date('2024-01-15T08:15:00Z').toISOString()
    }
  ],
  assets: [
    {
      id: 'ast-30001-pump-101',
      organization_id: defaultOrgId,
      owner_id: defaultUserId,
      asset_tag: 'PUMP-101-A',
      name: 'Main Boiler Feed Water Pump P-101',
      category: 'Rotating Equipment',
      manufacturer: 'Sulzer',
      model: 'MSD 6x10x13',
      serial_number: 'SLZ-88492-B',
      install_date: '2021-03-15',
      location: 'Building B - Boiler House Floor 1',
      criticality_tier: 'critical',
      operating_parameters: {
        max_rpm: 3600,
        normal_temp_c: 65,
        max_vibration_mm_s: 4.5,
        design_flow_gpm: 1250,
        operating_pressure_psi: 450
      },
      lifecycle_status: 'degraded',
      is_archived: false,
      created_at: new Date('2024-02-01T09:00:00Z').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ast-30002-comp-402',
      organization_id: defaultOrgId,
      owner_id: defaultUserId,
      asset_tag: 'COMP-402-B',
      name: 'Rotary Screw Air Compressor AC-402',
      category: 'Compressors',
      manufacturer: 'Atlas Copco',
      model: 'GA 90 VSD+',
      serial_number: 'AC-77301-C',
      install_date: '2022-07-20',
      location: 'Building A - Utility Room 3',
      criticality_tier: 'high',
      operating_parameters: {
        max_bar: 10,
        flow_rate_cfm: 520,
        oil_temp_limit_c: 95,
        motor_power_kw: 90
      },
      lifecycle_status: 'operational',
      is_archived: false,
      created_at: new Date('2024-02-05T10:00:00Z').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ast-30003-press-200',
      organization_id: defaultOrgId,
      owner_id: defaultUserId,
      asset_tag: 'PRESS-200-MAIN',
      name: '500-Ton Hydraulic Stamping Press HP-200',
      category: 'Production Line Machinery',
      manufacturer: 'Schuler',
      model: 'C2-500',
      serial_number: 'SCH-9941-X',
      install_date: '2019-11-10',
      location: 'Stamping Bay 2',
      criticality_tier: 'critical',
      operating_parameters: {
        max_tonnage: 500,
        hydraulic_fluid_temp_c: 55,
        system_pressure_bar: 315,
        stroke_count_per_min: 40
      },
      lifecycle_status: 'under_maintenance',
      is_archived: false,
      created_at: new Date('2024-02-10T11:00:00Z').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ast-30004-conv-309',
      organization_id: defaultOrgId,
      owner_id: defaultUserId,
      asset_tag: 'CONV-309-L1',
      name: 'Assembly Line 1 Main Drive Conveyor Motor',
      category: 'Material Handling',
      manufacturer: 'SEW-Eurodrive',
      model: 'Movidrive MDX61B',
      serial_number: 'SEW-44109-M',
      install_date: '2023-01-12',
      location: 'Assembly Hall Line 1',
      criticality_tier: 'medium',
      operating_parameters: {
        belt_speed_m_s: 1.5,
        motor_current_amps: 28,
        gearbox_oil_level_pct: 95
      },
      lifecycle_status: 'operational',
      is_archived: false,
      created_at: new Date('2024-03-01T08:30:00Z').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ast-30005-chiller-105',
      organization_id: defaultOrgId,
      owner_id: defaultUserId,
      asset_tag: 'CHILL-105-SYS',
      name: 'Centrifugal Process Water Chiller CH-105',
      category: 'HVAC',
      manufacturer: 'Trane',
      model: 'Centravac CVHE',
      serial_number: 'TRN-10293-Z',
      install_date: '2020-05-04',
      location: 'Central Plant Yard',
      criticality_tier: 'high',
      operating_parameters: {
        chilled_water_supply_temp_c: 6.5,
        refrigerant_pressure_psi: 140,
        compressor_rpm: 4200
      },
      lifecycle_status: 'operational',
      is_archived: false,
      created_at: new Date('2024-03-15T14:00:00Z').toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  sensor_readings: [
    // PUMP-101 Time Series (Vibration, Temp, Pressure, Runtime)
    {
      id: 'sr-40001',
      asset_id: 'ast-30001-pump-101',
      recorded_by: defaultUserId,
      reading_type: 'vibration_mm_s',
      value: 6.8,
      unit: 'mm/s',
      source: 'sensor_feed',
      notes: 'Elevated drive-end bearing vibration observed during peak load.',
      recorded_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'sr-40002',
      asset_id: 'ast-30001-pump-101',
      recorded_by: defaultUserId,
      reading_type: 'temperature_c',
      value: 78.4,
      unit: '°C',
      source: 'sensor_feed',
      notes: 'Bearing housing temperature exceeds normal baseline (65°C).',
      recorded_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'sr-40003',
      asset_id: 'ast-30001-pump-101',
      recorded_by: defaultUserId,
      reading_type: 'pressure_psi',
      value: 412.0,
      unit: 'PSI',
      source: 'sensor_feed',
      notes: 'Discharge pressure slight fluctuation.',
      recorded_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'sr-40004',
      asset_id: 'ast-30001-pump-101',
      recorded_by: defaultUserId,
      reading_type: 'runtime_hours',
      value: 14250,
      unit: 'hours',
      source: 'manual',
      notes: 'Logged during shift audit.',
      recorded_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    // Historical trends for PUMP-101 over past days
    ...[14, 12, 10, 8, 6, 4, 2].map((daysAgo, idx) => ({
      id: `sr-pump-hist-${idx}`,
      asset_id: 'ast-30001-pump-101',
      recorded_by: defaultUserId,
      reading_type: 'vibration_mm_s',
      value: parseFloat((3.2 + (14 - daysAgo) * 0.28).toFixed(2)),
      unit: 'mm/s',
      source: 'sensor_feed',
      notes: `Automated hourly telemetry archive - ${daysAgo} days ago`,
      recorded_at: new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    })),
    // COMP-402 Readings
    {
      id: 'sr-40010',
      asset_id: 'ast-30002-comp-402',
      recorded_by: defaultUserId,
      reading_type: 'vibration_mm_s',
      value: 2.1,
      unit: 'mm/s',
      source: 'sensor_feed',
      notes: 'Vibration within acceptable ISO 10816 Zone A limits.',
      recorded_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'sr-40011',
      asset_id: 'ast-30002-comp-402',
      recorded_by: defaultUserId,
      reading_type: 'temperature_c',
      value: 88.0,
      unit: '°C',
      source: 'sensor_feed',
      notes: 'Compressor discharge air temperature steady.',
      recorded_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }
  ],
  failure_events: [
    {
      id: 'fl-50001',
      asset_id: 'ast-30001-pump-101',
      reported_by: defaultUserId,
      failure_mode: 'Bearing Failure',
      root_cause: 'Inadequate lubrication resulting in inner race spalling and cage deformation.',
      affected_component: 'Drive-End Roller Bearing',
      severity: 'critical',
      downtime_start: new Date('2024-04-10T06:30:00Z').toISOString(),
      downtime_end: new Date('2024-04-10T18:45:00Z').toISOString(),
      estimated_cost_impact: 42500,
      technician_notes: 'Replaced DE bearing set, flushed oil reservoir, re-aligned coupling with laser tool.',
      image_urls: [],
      created_at: new Date('2024-04-10T19:00:00Z').toISOString()
    },
    {
      id: 'fl-50002',
      asset_id: 'ast-30003-press-200',
      reported_by: defaultUserId,
      failure_mode: 'Seal/Gasket Failure',
      root_cause: 'Hydraulic main cylinder seal degradation due to thermal breakdown.',
      affected_component: 'Main Ram Hydraulic Seal Kit',
      severity: 'high',
      downtime_start: new Date('2024-06-01T11:00:00Z').toISOString(),
      downtime_end: new Date('2024-06-02T02:00:00Z').toISOString(),
      estimated_cost_impact: 28000,
      technician_notes: 'Replaced damaged main hydraulic cylinder seals and refreshed fluid filters.',
      image_urls: [],
      created_at: new Date('2024-06-02T03:00:00Z').toISOString()
    }
  ],
  maintenance_schedules: [
    {
      id: 'sch-60001',
      asset_id: 'ast-30001-pump-101',
      maintenance_type: 'predictive',
      recurrence_rule: 'FREQ=MONTHLY;INTERVAL=1',
      next_due_at: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      created_by: defaultUserId,
      created_at: new Date('2024-05-01T00:00:00Z').toISOString()
    },
    {
      id: 'sch-60002',
      asset_id: 'ast-30002-comp-402',
      maintenance_type: 'preventive',
      recurrence_rule: 'FREQ=MONTHLY;INTERVAL=3',
      next_due_at: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
      created_by: defaultUserId,
      created_at: new Date('2024-05-15T00:00:00Z').toISOString()
    }
  ],
  work_orders: [
    {
      id: 'wo-70001',
      asset_id: 'ast-30001-pump-101',
      schedule_id: 'sch-60001',
      assigned_to: 'usr-20003-tech',
      title: 'Drive-End Bearing Replacement & Laser Alignment',
      description: 'Execute precision vibration analysis, replace SKF 6314 bearing assembly, lubricate with Mobilith SHC 220, and align shaft to <0.05mm tolerance.',
      status: 'in_progress',
      priority: 'critical',
      due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'wo-70002',
      asset_id: 'ast-30002-comp-402',
      schedule_id: 'sch-60002',
      assigned_to: 'usr-20003-tech',
      title: 'Quarterly Air & Oil Filter Replacement',
      description: 'Perform 2,000-hour service inspection, change oil separator cartridge, check belt tension, and inspect intake valve assembly.',
      status: 'scheduled',
      priority: 'medium',
      due_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'wo-70003',
      asset_id: 'ast-30003-press-200',
      schedule_id: null,
      assigned_to: 'usr-20003-tech',
      title: 'Hydraulic Reservoir Fluid Flush & Valve Calibration',
      description: 'Flush ISO VG 46 hydraulic oil, replace main proportional valve seals, and perform pressure relief test.',
      status: 'open',
      priority: 'high',
      due_date: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  ai_predictions: [
    {
      id: 'pred-80001',
      asset_id: 'ast-30001-pump-101',
      prediction_type: 'failure_prediction',
      risk_score: 84,
      predicted_failure_mode: 'Bearing Failure',
      rul_estimate_hours: 120,
      confidence_level: 'high',
      assumptions: [
        'Pump operates under continuous 100% duty cycle (24/7).',
        'Vibration acceleration trend continues at current +0.28 mm/s per day trajectory.',
        'Ambient temperature remains within standard 25°C baseline.'
      ],
      contributing_factors: [
        {
          factor: 'Vibration Acceleration Spike',
          evidence: 'Drive-end bearing overall velocity increased from 3.2 mm/s to 6.8 mm/s in 14 days (Threshold: 4.5 mm/s).',
          weight: 'high'
        },
        {
          factor: 'Elevated Housing Temperature',
          evidence: 'BE-DE temperature logged at 78.4°C vs baseline 65.0°C.',
          weight: 'high'
        },
        {
          factor: 'Operating Runtime',
          evidence: 'Asset has accumulated 14,250 operating hours since last major overhaul.',
          weight: 'medium'
        }
      ],
      raw_ai_response: {
        risk_score: 84,
        predicted_failure_mode: 'Bearing Failure',
        confidence_level: 'high',
        recommended_horizon_days: 5,
        data_gaps: ['Oil sample metal particle analysis report pending (ICP spectrum missing).']
      },
      generated_by: defaultUserId,
      created_at: new Date().toISOString()
    }
  ],
  ai_recommendations: [
    {
      id: 'rec-90001',
      asset_id: 'ast-30001-pump-101',
      prediction_id: 'pred-80001',
      recommendations: [
        {
          priority: 'P1 - Immediate',
          action: 'Schedule emergency bearing replacement and laser shaft alignment within 72 hours.',
          justification: 'Vibration spectrum exhibits 1X/2X rotational harmonics indicative of severe bearing fatigue.'
        },
        {
          priority: 'P2 - High',
          action: 'Perform oil reservoir flush and replace synthetic ISO VG 68 lubricant.',
          justification: 'High operating temperature causes oxidation and loss of viscosity.'
        }
      ],
      confidence_level: 'high',
      status: 'pending',
      confirmed_by: null,
      confirmed_at: null,
      created_at: new Date().toISOString()
    }
  ],
  ai_chat_sessions: [
    {
      id: 'chat-10001',
      user_id: defaultUserId,
      asset_id: 'ast-30001-pump-101',
      title: 'Troubleshooting P-101 High Vibration & Temperature',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ],
  ai_chat_messages: [
    {
      id: 'msg-11001',
      session_id: 'chat-10001',
      role: 'user',
      content: 'What are the main causes for elevated 6.8 mm/s vibration on Main Feed Pump P-101?',
      retrieved_sources: [],
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'msg-11002',
      session_id: 'chat-10001',
      role: 'assistant',
      content: 'Based on Sulzer MSD 6x10x13 OEM Maintenance Manual & historical failure log #FL-50001:\n\n1. **Drive-End Bearing Degradation**: Vibration of 6.8 mm/s exceeds ISO 10816 Class III limit (4.5 mm/s). Combined with a housing temperature spike of 78.4°C, this points directly to rolling element spalling.\n2. **Shaft Misalignment**: Ensure parallel alignment is within 0.05 mm using laser alignment tooling.\n3. **Lubricant Contamination**: Check for moisture or particulate ingress in the oil reservoir.\n\n*Recommended Action*: Execute Work Order WO-70001 immediately to prevent catastrophic shaft seizure.',
      retrieved_sources: [
        { title: 'Sulzer MSD Pump OEM Manual Section 4 - Vibration Analysis', path: '/docs/sulzer_msd_manual.pdf', snippet: 'Vibration exceeding 4.5 mm/s RMS on DE bearing requires immediate shutdown and inspection.' },
        { title: 'Failure Event FL-50001 Log', path: '/failures/fl-50001', snippet: 'Inadequate lubrication caused inner race spalling on DE roller bearing.' }
      ],
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ],
  knowledge_documents: [
    {
      id: 'doc-12001',
      organization_id: defaultOrgId,
      asset_id: 'ast-30001-pump-101',
      title: 'Sulzer MSD 6x10x13 OEM Maintenance Manual',
      document_type: 'manual',
      storage_path: '/docs/sulzer_msd_manual.pdf',
      content_text: 'Section 4.2: Maximum allowable vibration for continuous duty is 4.5 mm/s RMS. Operating temperatures above 75°C accelerate lubricant thermal decomposition by 50%. Inspect drive-end roller bearing cage at 10,000 hour intervals.',
      embedding: Array(768).fill(0.012),
      created_at: new Date('2024-01-20T00:00:00Z').toISOString()
    },
    {
      id: 'doc-12002',
      organization_id: defaultOrgId,
      asset_id: 'ast-30002-comp-402',
      title: 'Atlas Copco GA 90 VSD+ Service & Troubleshooting Guide',
      document_type: 'manual',
      storage_path: '/docs/atlas_copco_ga90_guide.pdf',
      content_text: 'Chapter 8: Oil separator differential pressure exceeding 0.8 bar indicates filter clogging. Change oil filter element every 2,000 hours or 6 months.',
      embedding: Array(768).fill(0.008),
      created_at: new Date('2024-01-22T00:00:00Z').toISOString()
    }
  ],
  agent_planning_runs: [
    {
      id: 'plan-13001',
      organization_id: defaultOrgId,
      requested_by: defaultUserId,
      scope: 'Fleet-wide High Criticality Assets',
      diagnostics_output: {
        flagged_assets: ['ast-30001-pump-101', 'ast-30003-press-200'],
        primary_diagnostics: 'P-101 exhibits bearing degradation; Press-200 shows hydraulic pressure drops.'
      },
      risk_output: {
        ranked_risk: [
          { asset_id: 'ast-30001-pump-101', risk_score: 84, priority: 1 },
          { asset_id: 'ast-30003-press-200', risk_score: 72, priority: 2 }
        ]
      },
      scheduling_output: {
        proposed_schedule: [
          { asset_id: 'ast-30001-pump-101', target_date: 'Within 48 hours', duration_hours: 6 },
          { asset_id: 'ast-30003-press-200', target_date: 'Within 5 days', duration_hours: 4 }
        ]
      },
      parts_output: {
        required_inventory: [
          { part_no: 'SKF-6314-C3', description: 'Deep Groove Ball Bearing 70x150x35mm', stock: 2, lead_time_days: 0 },
          { part_no: 'SCH-SEAL-KIT-500T', description: '500T Cylinder Seal Set', stock: 1, lead_time_days: 1 }
        ]
      },
      final_plan: {
        executive_summary: 'Consolidated Fleet Reliability Strategy: Immediate shutdown window requested for P-101 pump bearing overhaul, followed by Press-200 seal maintenance during scheduled weekend shift change.',
        estimated_downtime_hours: 10,
        avoided_unplanned_cost: 70500
      },
      status: 'completed',
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 5.8 * 3600 * 1000).toISOString()
    }
  ],
  asset_attachments: [
    {
      id: 'att-14001',
      asset_id: 'ast-30001-pump-101',
      file_name: 'PUMP-101-Laser-Alignment-Report.pdf',
      storage_path: '/attachments/PUMP-101-Alignment.pdf',
      uploaded_by: defaultUserId,
      created_at: new Date('2024-04-10T19:30:00Z').toISOString()
    }
  ]
};

export default store;
