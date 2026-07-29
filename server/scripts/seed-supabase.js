import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(rootDir, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('==================================================');
console.log('🌱 Seeding Supabase Cloud Database');
console.log('==================================================');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function seed() {
  // 1. Create Auth Users & Profiles
  console.log('👤 Seeding Auth Users...');
  const userSeeds = [
    {
      email: 'sarah.jenkins@apexmanufacturing.com',
      password: 'Password123!',
      full_name: 'Dr. Sarah Jenkins',
      role: 'reliability_engineer'
    },
    {
      email: 'marcus.vance@apexmanufacturing.com',
      password: 'Password123!',
      full_name: 'Marcus Vance (Plant Admin)',
      role: 'admin'
    },
    {
      email: 'alex.rivera@apexmanufacturing.com',
      password: 'Password123!',
      full_name: 'Alex Rivera (Sr. Maintenance Technician)',
      role: 'technician'
    }
  ];

  const userMap = {};

  // Check existing users
  const { data: existingAuth } = await supabase.auth.admin.listUsers();
  const existingEmailMap = {};
  if (existingAuth && existingAuth.users) {
    existingAuth.users.forEach(u => {
      existingEmailMap[u.email] = u.id;
    });
  }

  for (const u of userSeeds) {
    let userId = existingEmailMap[u.email];
    if (!userId) {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, role: u.role }
      });
      if (error) {
        console.error(`⚠️ Error creating auth user ${u.email}:`, error.message);
        continue;
      }
      userId = created.user.id;
    }
    userMap[u.email] = userId;
    console.log(`  ✓ Auth user ready: ${u.email} -> ${userId}`);
  }

  const primaryUserId = userMap['sarah.jenkins@apexmanufacturing.com'] || Object.values(userMap)[0];
  const techUserId = userMap['alex.rivera@apexmanufacturing.com'] || primaryUserId;

  // 2. Organization
  console.log('🏢 Seeding Organization...');
  const orgId = '10000000-0000-4000-a000-000000000001';
  const { error: orgErr } = await supabase.from('organizations').upsert([
    {
      id: orgId,
      name: 'Apex Precision Manufacturing Inc.',
      created_at: new Date('2024-01-15T08:00:00Z').toISOString()
    }
  ]);
  if (orgErr) console.error('⚠️ Org Insert Error:', orgErr.message);
  else console.log('  ✓ Organization seeded.');

  // 3. Profiles
  console.log('📋 Seeding Profiles...');
  const profilesToSeed = [
    {
      id: userMap['sarah.jenkins@apexmanufacturing.com'] || '20000000-0000-4000-a000-000000000001',
      full_name: 'Dr. Sarah Jenkins',
      role: 'reliability_engineer',
      organization_id: orgId
    },
    {
      id: userMap['marcus.vance@apexmanufacturing.com'] || '20000000-0000-4000-a000-000000000002',
      full_name: 'Marcus Vance (Plant Admin)',
      role: 'admin',
      organization_id: orgId
    },
    {
      id: userMap['alex.rivera@apexmanufacturing.com'] || '20000000-0000-4000-a000-000000000003',
      full_name: 'Alex Rivera (Sr. Maintenance Technician)',
      role: 'technician',
      organization_id: orgId
    }
  ];

  const { error: profErr } = await supabase.from('profiles').upsert(profilesToSeed);
  if (profErr) console.error('⚠️ Profiles Insert Error:', profErr.message);
  else console.log('  ✓ Profiles seeded.');

  // 4. Assets
  console.log('⚙️ Seeding Industrial Assets...');
  const asset1 = '30000000-0000-4000-a000-000000000001';
  const asset2 = '30000000-0000-4000-a000-000000000002';
  const asset3 = '30000000-0000-4000-a000-000000000003';
  const asset4 = '30000000-0000-4000-a000-000000000004';
  const asset5 = '30000000-0000-4000-a000-000000000005';

  const assetsToSeed = [
    {
      id: asset1,
      organization_id: orgId,
      owner_id: primaryUserId,
      asset_tag: 'PUMP-101-A',
      name: 'Main Boiler Feed Water Pump P-101',
      category: 'Rotating Equipment',
      manufacturer: 'Sulzer',
      model: 'MSD 6x10x13',
      serial_number: 'SLZ-88492-B',
      install_date: '2021-03-15',
      location: 'Building B - Boiler House Floor 1',
      criticality_tier: 'critical',
      operating_parameters: { max_rpm: 3600, normal_temp_c: 65, design_flow_gpm: 1250, max_vibration_mm_s: 4.5, operating_pressure_psi: 450 },
      lifecycle_status: 'degraded',
      is_archived: false
    },
    {
      id: asset2,
      organization_id: orgId,
      owner_id: primaryUserId,
      asset_tag: 'COMP-402-B',
      name: 'Rotary Screw Air Compressor AC-402',
      category: 'Compressors',
      manufacturer: 'Atlas Copco',
      model: 'GA 90 VSD+',
      serial_number: 'AC-77301-C',
      install_date: '2022-07-20',
      location: 'Building A - Utility Room 3',
      criticality_tier: 'high',
      operating_parameters: { max_bar: 10, flow_rate_cfm: 520, motor_power_kw: 90, oil_temp_limit_c: 95 },
      lifecycle_status: 'operational',
      is_archived: false
    },
    {
      id: asset3,
      organization_id: orgId,
      owner_id: primaryUserId,
      asset_tag: 'PRESS-200-MAIN',
      name: '500-Ton Hydraulic Stamping Press HP-200',
      category: 'Production Line Machinery',
      manufacturer: 'Schuler',
      model: 'C2-500',
      serial_number: 'SCH-9941-X',
      install_date: '2019-11-10',
      location: 'Stamping Bay 2',
      criticality_tier: 'critical',
      operating_parameters: { max_tonnage: 500, system_pressure_bar: 315, stroke_count_per_min: 40, hydraulic_fluid_temp_c: 55 },
      lifecycle_status: 'under_maintenance',
      is_archived: false
    },
    {
      id: asset4,
      organization_id: orgId,
      owner_id: primaryUserId,
      asset_tag: 'CONV-309-L1',
      name: 'Assembly Line 1 Main Drive Conveyor Motor',
      category: 'Material Handling',
      manufacturer: 'SEW-Eurodrive',
      model: 'Movidrive MDX61B',
      serial_number: 'SEW-44109-M',
      install_date: '2023-01-12',
      location: 'Assembly Hall Line 1',
      criticality_tier: 'medium',
      operating_parameters: { belt_speed_m_s: 1.5, motor_current_amps: 28, gearbox_oil_level_pct: 95 },
      lifecycle_status: 'operational',
      is_archived: false
    },
    {
      id: asset5,
      organization_id: orgId,
      owner_id: primaryUserId,
      asset_tag: 'CHILL-105-SYS',
      name: 'Centrifugal Process Water Chiller CH-105',
      category: 'HVAC',
      manufacturer: 'Trane',
      model: 'Centravac CVHE',
      serial_number: 'TRN-10293-Z',
      install_date: '2020-05-04',
      location: 'Central Plant Yard',
      criticality_tier: 'high',
      operating_parameters: { compressor_rpm: 4200, refrigerant_pressure_psi: 140, chilled_water_supply_temp_c: 6.5 },
      lifecycle_status: 'operational',
      is_archived: false
    }
  ];

  const { error: assetErr } = await supabase.from('assets').upsert(assetsToSeed);
  if (assetErr) console.error('⚠️ Assets Insert Error:', assetErr.message);
  else console.log(`  ✓ ${assetsToSeed.length} Assets seeded.`);

  // 5. Sensor Readings
  console.log('📊 Seeding Sensor Readings / Telemetry...');
  const now = new Date();
  const sensorReadingsToSeed = [
    {
      id: '40000000-0000-4000-a000-000000000001',
      asset_id: asset1,
      recorded_by: primaryUserId,
      reading_type: 'vibration_mm_s',
      value: 6.8,
      unit: 'mm/s',
      source: 'sensor_feed',
      notes: 'Elevated drive-end bearing vibration observed during peak load.',
      recorded_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: '40000000-0000-4000-a000-000000000002',
      asset_id: asset1,
      recorded_by: primaryUserId,
      reading_type: 'temperature_c',
      value: 78.4,
      unit: '°C',
      source: 'sensor_feed',
      notes: 'Bearing housing temperature exceeds baseline (65°C).',
      recorded_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: '40000000-0000-4000-a000-000000000003',
      asset_id: asset1,
      recorded_by: primaryUserId,
      reading_type: 'pressure_psi',
      value: 412.0,
      unit: 'PSI',
      source: 'sensor_feed',
      notes: 'Discharge pressure slight fluctuation.',
      recorded_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: '40000000-0000-4000-a000-000000000004',
      asset_id: asset2,
      recorded_by: primaryUserId,
      reading_type: 'vibration_mm_s',
      value: 2.1,
      unit: 'mm/s',
      source: 'sensor_feed',
      notes: 'Vibration within ISO 10816 Zone A limits.',
      recorded_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString()
    }
  ];

  const { error: srErr } = await supabase.from('sensor_readings').upsert(sensorReadingsToSeed);
  if (srErr) console.error('⚠️ Sensor Readings Insert Error:', srErr.message);
  else console.log(`  ✓ ${sensorReadingsToSeed.length} Telemetry records seeded.`);

  // 6. Failure Events
  console.log('🚨 Seeding Failure Events...');
  const failuresToSeed = [
    {
      id: '50000000-0000-4000-a000-000000000001',
      asset_id: asset1,
      reported_by: primaryUserId,
      failure_mode: 'Bearing Failure',
      root_cause: 'Inadequate lubrication resulting in inner race spalling and cage deformation.',
      affected_component: 'Drive-End Roller Bearing',
      severity: 'critical',
      downtime_start: new Date('2024-04-10T06:30:00Z').toISOString(),
      downtime_end: new Date('2024-04-10T18:45:00Z').toISOString(),
      estimated_cost_impact: 42500,
      technician_notes: 'Replaced DE bearing set, flushed oil reservoir, re-aligned coupling with laser tool.',
      image_urls: []
    },
    {
      id: '50000000-0000-4000-a000-000000000002',
      asset_id: asset3,
      reported_by: primaryUserId,
      failure_mode: 'Seal/Gasket Failure',
      root_cause: 'Hydraulic main cylinder seal degradation due to thermal breakdown.',
      affected_component: 'Main Ram Hydraulic Seal Kit',
      severity: 'high',
      downtime_start: new Date('2024-06-01T11:00:00Z').toISOString(),
      downtime_end: new Date('2024-06-02T02:00:00Z').toISOString(),
      estimated_cost_impact: 28000,
      technician_notes: 'Replaced damaged main hydraulic cylinder seals and refreshed fluid filters.',
      image_urls: []
    }
  ];

  const { error: failErr } = await supabase.from('failure_events').upsert(failuresToSeed);
  if (failErr) console.error('⚠️ Failure Events Insert Error:', failErr.message);
  else console.log(`  ✓ ${failuresToSeed.length} Failure events seeded.`);

  // 7. Maintenance Schedules
  console.log('📅 Seeding Maintenance Schedules...');
  const sched1 = '60000000-0000-4000-a000-000000000001';
  const sched2 = '60000000-0000-4000-a000-000000000002';
  const schedulesToSeed = [
    {
      id: sched1,
      asset_id: asset1,
      maintenance_type: 'predictive',
      recurrence_rule: 'FREQ=MONTHLY;INTERVAL=1',
      next_due_at: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(),
      created_by: primaryUserId
    },
    {
      id: sched2,
      asset_id: asset2,
      maintenance_type: 'preventive',
      recurrence_rule: 'FREQ=MONTHLY;INTERVAL=3',
      next_due_at: new Date(now.getTime() + 12 * 24 * 3600 * 1000).toISOString(),
      created_by: primaryUserId
    }
  ];

  const { error: schedErr } = await supabase.from('maintenance_schedules').upsert(schedulesToSeed);
  if (schedErr) console.error('⚠️ Maintenance Schedules Insert Error:', schedErr.message);
  else console.log(`  ✓ ${schedulesToSeed.length} Maintenance schedules seeded.`);

  // 8. Work Orders
  console.log('🔧 Seeding Work Orders...');
  const workOrdersToSeed = [
    {
      id: '70000000-0000-4000-a000-000000000001',
      asset_id: asset1,
      schedule_id: sched1,
      assigned_to: techUserId,
      title: 'Drive-End Bearing Replacement & Laser Alignment',
      description: 'Execute precision vibration analysis, replace SKF 6314 bearing assembly, lubricate with Mobilith SHC 220, and align shaft to <0.05mm tolerance.',
      status: 'in_progress',
      priority: 'critical',
      due_date: new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: '70000000-0000-4000-a000-000000000002',
      asset_id: asset2,
      schedule_id: sched2,
      assigned_to: techUserId,
      title: 'Quarterly Air & Oil Filter Replacement',
      description: 'Perform 2,000-hour service inspection, change oil separator cartridge, check belt tension, and inspect intake valve assembly.',
      status: 'scheduled',
      priority: 'medium',
      due_date: new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const { error: woErr } = await supabase.from('work_orders').upsert(workOrdersToSeed);
  if (woErr) console.error('⚠️ Work Orders Insert Error:', woErr.message);
  else console.log(`  ✓ ${workOrdersToSeed.length} Work orders seeded.`);

  // 9. AI Predictions
  console.log('🤖 Seeding AI Predictions...');
  const pred1 = '80000000-0000-4000-a000-000000000001';
  const predictionsToSeed = [
    {
      id: pred1,
      asset_id: asset1,
      prediction_type: 'failure_prediction',
      risk_score: 84,
      predicted_failure_mode: 'Bearing Failure',
      rul_estimate_hours: 120,
      confidence_level: 'high',
      assumptions: ['Pump operates under continuous 100% duty cycle.', 'Vibration acceleration trend continues at current trajectory.'],
      contributing_factors: [
        { weight: 'high', factor: 'Vibration Acceleration Spike', evidence: 'Drive-end bearing overall velocity increased from 3.2 mm/s to 6.8 mm/s in 14 days.' },
        { weight: 'high', factor: 'Elevated Housing Temperature', evidence: 'BE-DE temperature logged at 78.4°C vs baseline 65.0°C.' }
      ],
      raw_ai_response: { risk_score: 84, confidence_level: 'high', predicted_failure_mode: 'Bearing Failure', recommended_horizon_days: 5 },
      generated_by: primaryUserId
    }
  ];

  const { error: predErr } = await supabase.from('ai_predictions').upsert(predictionsToSeed);
  if (predErr) console.error('⚠️ AI Predictions Insert Error:', predErr.message);
  else console.log(`  ✓ ${predictionsToSeed.length} AI Predictions seeded.`);

  // 10. AI Recommendations
  console.log('💡 Seeding AI Recommendations...');
  const recommendationsToSeed = [
    {
      id: '90000000-0000-4000-a000-000000000001',
      asset_id: asset1,
      prediction_id: pred1,
      recommendations: [
        { action: 'Schedule emergency bearing replacement and laser shaft alignment within 72 hours.', priority: 'P1 - Immediate', justification: 'Vibration spectrum exhibits rotational harmonics.' },
        { action: 'Perform oil reservoir flush and replace synthetic ISO VG 68 lubricant.', priority: 'P2 - High', justification: 'High operating temperature causes oxidation.' }
      ],
      confidence_level: 'high',
      status: 'pending'
    }
  ];

  const { error: recErr } = await supabase.from('ai_recommendations').upsert(recommendationsToSeed);
  if (recErr) console.error('⚠️ AI Recommendations Insert Error:', recErr.message);
  else console.log(`  ✓ ${recommendationsToSeed.length} AI Recommendations seeded.`);

  // 11. Knowledge Documents
  console.log('📚 Seeding Knowledge Documents...');
  const docsToSeed = [
    {
      id: 'c0000000-0000-4000-a000-000000000001',
      organization_id: orgId,
      asset_id: asset1,
      title: 'Sulzer MSD 6x10x13 OEM Maintenance Manual',
      document_type: 'manual',
      storage_path: '/docs/sulzer_msd_manual.pdf',
      content_text: 'Section 4.2: Maximum allowable vibration for continuous duty is 4.5 mm/s RMS. Operating temperatures above 75°C accelerate lubricant thermal decomposition.'
    },
    {
      id: 'c0000000-0000-4000-a000-000000000002',
      organization_id: orgId,
      asset_id: asset2,
      title: 'Atlas Copco GA 90 VSD+ Service Guide',
      document_type: 'manual',
      storage_path: '/docs/atlas_copco_ga90_guide.pdf',
      content_text: 'Chapter 8: Oil separator differential pressure exceeding 0.8 bar indicates filter clogging. Change oil filter element every 2,000 hours.'
    }
  ];

  const { error: docErr } = await supabase.from('knowledge_documents').upsert(docsToSeed);
  if (docErr) console.error('⚠️ Knowledge Documents Insert Error:', docErr.message);
  else console.log(`  ✓ ${docsToSeed.length} Knowledge documents seeded.`);

  console.log('==================================================');
  console.log('🎉 Supabase Database Seeding Completed Successfully!');
  console.log('==================================================');
}

seed().catch(err => {
  console.error('💥 Fatal Seeding Error:', err);
  process.exit(1);
});
