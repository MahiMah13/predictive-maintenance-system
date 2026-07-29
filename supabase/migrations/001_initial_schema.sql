-- Supabase Initial Migration: 001_initial_schema.sql
-- Predictive Maintenance System Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'reliability_engineer', 'technician', 'viewer')),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_tag TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  install_date DATE,
  location TEXT,
  criticality_tier TEXT NOT NULL CHECK (criticality_tier IN ('critical', 'high', 'medium', 'low')),
  operating_parameters JSONB DEFAULT '{}'::jsonb,
  lifecycle_status TEXT NOT NULL DEFAULT 'operational'
    CHECK (lifecycle_status IN ('operational', 'degraded', 'under_maintenance', 'decommissioned')),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Sensor Readings / Observations Table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES public.profiles(id),
  reading_type TEXT NOT NULL, -- 'vibration_mm_s', 'temperature_c', 'pressure_psi', 'runtime_hours'
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'sensor_feed')),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Failure Events Table
CREATE TABLE IF NOT EXISTS public.failure_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES public.profiles(id),
  failure_mode TEXT NOT NULL,
  root_cause TEXT,
  affected_component TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  downtime_start TIMESTAMPTZ NOT NULL,
  downtime_end TIMESTAMPTZ,
  estimated_cost_impact NUMERIC,
  technician_notes TEXT,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Maintenance Schedules Table
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN
    ('preventive', 'predictive', 'corrective', 'condition_based', 'emergency')),
  recurrence_rule TEXT,
  next_due_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Work Orders Table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.maintenance_schedules(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AI Predictions Table
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('failure_prediction', 'rul_estimate')),
  risk_score NUMERIC,
  predicted_failure_mode TEXT,
  rul_estimate_hours NUMERIC,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
  assumptions TEXT[] DEFAULT '{}',
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  raw_ai_response JSONB NOT NULL,
  generated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AI Recommendations Table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES public.ai_predictions(id) ON DELETE SET NULL,
  recommendations JSONB NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  confirmed_by UUID REFERENCES public.profiles(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AI Chat Sessions & Messages Tables
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  retrieved_sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Knowledge Documents Table (Vector Search Corpus)
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('manual', 'failure_report', 'maintenance_log', 'spec_sheet', 'other')),
  storage_path TEXT NOT NULL,
  content_text TEXT,
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings ON public.knowledge_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 12. Multi-Agent Planner Runs Table
CREATE TABLE IF NOT EXISTS public.agent_planning_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  scope TEXT NOT NULL,
  diagnostics_output JSONB,
  risk_output JSONB,
  scheduling_output JSONB,
  parts_output JSONB,
  final_plan JSONB,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 13. Asset Attachments Table
CREATE TABLE IF NOT EXISTS public.asset_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
--------------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_planning_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_attachments ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Authenticated User's Organization ID
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Get Authenticated User's Role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations Policies
CREATE POLICY "org_select_policy" ON public.organizations
  FOR SELECT USING (id = public.get_auth_org_id());

-- Profiles Policies
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (organization_id = public.get_auth_org_id());

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Assets RLS Policies
CREATE POLICY "org_members_select_assets" ON public.assets
  FOR SELECT USING (organization_id = public.get_auth_org_id());

CREATE POLICY "privileged_roles_insert_assets" ON public.assets
  FOR INSERT WITH CHECK (
    organization_id = public.get_auth_org_id() 
    AND public.get_auth_role() IN ('admin', 'reliability_engineer')
  );

CREATE POLICY "privileged_roles_update_assets" ON public.assets
  FOR UPDATE USING (
    organization_id = public.get_auth_org_id() 
    AND public.get_auth_role() IN ('admin', 'reliability_engineer')
  );

-- Sensor Readings RLS Policies
CREATE POLICY "org_members_select_sensor_readings" ON public.sensor_readings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = sensor_readings.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

CREATE POLICY "org_members_insert_sensor_readings" ON public.sensor_readings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = sensor_readings.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

-- Failure Events RLS Policies
CREATE POLICY "org_members_select_failure_events" ON public.failure_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = failure_events.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

CREATE POLICY "members_insert_failure_events" ON public.failure_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = failure_events.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

-- Maintenance Schedules RLS Policies
CREATE POLICY "org_members_select_schedules" ON public.maintenance_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = maintenance_schedules.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

CREATE POLICY "privileged_roles_manage_schedules" ON public.maintenance_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = maintenance_schedules.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    ) AND public.get_auth_role() IN ('admin', 'reliability_engineer')
  );

-- Work Orders RLS Policies
CREATE POLICY "org_members_select_work_orders" ON public.work_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = work_orders.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

CREATE POLICY "technician_update_assigned_work_orders" ON public.work_orders
  FOR UPDATE USING (
    assigned_to = auth.uid() OR public.get_auth_role() IN ('admin', 'reliability_engineer')
  );

-- AI Predictions & Recommendations RLS Policies
CREATE POLICY "org_members_select_predictions" ON public.ai_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = ai_predictions.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

CREATE POLICY "org_members_select_recommendations" ON public.ai_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = ai_recommendations.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

CREATE POLICY "admin_engineer_update_recommendations" ON public.ai_recommendations
  FOR UPDATE USING (
    public.get_auth_role() IN ('admin', 'reliability_engineer')
  );

-- AI Chat Sessions & Messages RLS Policies
CREATE POLICY "users_manage_own_chat_sessions" ON public.ai_chat_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_manage_own_chat_messages" ON public.ai_chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_chat_sessions 
      WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
      AND ai_chat_sessions.user_id = auth.uid()
    )
  );

-- Knowledge Documents RLS Policies
CREATE POLICY "org_members_select_knowledge" ON public.knowledge_documents
  FOR SELECT USING (organization_id = public.get_auth_org_id());

CREATE POLICY "admin_engineer_manage_knowledge" ON public.knowledge_documents
  FOR ALL USING (
    organization_id = public.get_auth_org_id() 
    AND public.get_auth_role() IN ('admin', 'reliability_engineer')
  );

-- Agent Planning Runs RLS Policies
CREATE POLICY "org_members_select_agent_plans" ON public.agent_planning_runs
  FOR SELECT USING (organization_id = public.get_auth_org_id());

CREATE POLICY "org_members_insert_agent_plans" ON public.agent_planning_runs
  FOR INSERT WITH CHECK (organization_id = public.get_auth_org_id());

-- Asset Attachments RLS Policies
CREATE POLICY "org_members_select_attachments" ON public.asset_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = asset_attachments.asset_id 
      AND assets.organization_id = public.get_auth_org_id()
    )
  );

--------------------------------------------------------------------------------
-- SEED DATA INSERTION
--------------------------------------------------------------------------------

-- 1. Seed Organization
INSERT INTO public.organizations (id, name, created_at)
VALUES (
  '10000000-0000-4000-a000-000000000001',
  'Apex Precision Manufacturing Inc.',
  '2024-01-15 08:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Seed auth.users records (required for foreign key references in profiles)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
  ('20000000-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000', 'sarah.jenkins@apexmanufacturing.com', '$2a$10$wE99Y5hP4RzG1Qv8X9y2u.vG20x.7Y7v.3/2.Z9y/1.X8w.Z.Y.Z', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Sarah Jenkins"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('20000000-0000-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000', 'marcus.vance@apexmanufacturing.com', '$2a$10$wE99Y5hP4RzG1Qv8X9y2u.vG20x.7Y7v.3/2.Z9y/1.X8w.Z.Y.Z', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Vance"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('20000000-0000-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000', 'alex.rivera@apexmanufacturing.com', '$2a$10$wE99Y5hP4RzG1Qv8X9y2u.vG20x.7Y7v.3/2.Z9y/1.X8w.Z.Y.Z', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Rivera"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Profiles
INSERT INTO public.profiles (id, full_name, email, role, organization_id, created_at, updated_at)
VALUES
  ('20000000-0000-4000-a000-000000000001', 'Dr. Sarah Jenkins', 'sarah.jenkins@apexmanufacturing.com', 'reliability_engineer', '10000000-0000-4000-a000-000000000001', '2024-01-15 08:05:00+00', '2024-01-15 08:05:00+00'),
  ('20000000-0000-4000-a000-000000000002', 'Marcus Vance (Plant Admin)', 'marcus.vance@apexmanufacturing.com', 'admin', '10000000-0000-4000-a000-000000000001', '2024-01-15 08:10:00+00', '2024-01-15 08:10:00+00'),
  ('20000000-0000-4000-a000-000000000003', 'Alex Rivera (Sr. Maintenance Technician)', 'alex.rivera@apexmanufacturing.com', 'technician', '10000000-0000-4000-a000-000000000001', '2024-01-15 08:15:00+00', '2024-01-15 08:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Assets
INSERT INTO public.assets (id, organization_id, owner_id, asset_tag, name, category, manufacturer, model, serial_number, install_date, location, criticality_tier, operating_parameters, lifecycle_status, is_archived, created_at, updated_at)
VALUES
  (
    '30000000-0000-4000-a000-000000000001',
    '10000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'PUMP-101-A',
    'Main Boiler Feed Water Pump P-101',
    'Rotating Equipment',
    'Sulzer',
    'MSD 6x10x13',
    'SLZ-88492-B',
    '2021-03-15',
    'Building B - Boiler House Floor 1',
    'critical',
    '{"max_rpm": 3600, "normal_temp_c": 65, "design_flow_gpm": 1250, "max_vibration_mm_s": 4.5, "operating_pressure_psi": 450}'::jsonb,
    'degraded',
    FALSE,
    '2024-02-01 09:00:00+00',
    NOW()
  ),
  (
    '30000000-0000-4000-a000-000000000002',
    '10000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'COMP-402-B',
    'Rotary Screw Air Compressor AC-402',
    'Compressors',
    'Atlas Copco',
    'GA 90 VSD+',
    'AC-77301-C',
    '2022-07-20',
    'Building A - Utility Room 3',
    'high',
    '{"max_bar": 10, "flow_rate_cfm": 520, "motor_power_kw": 90, "oil_temp_limit_c": 95}'::jsonb,
    'operational',
    FALSE,
    '2024-02-05 10:00:00+00',
    NOW()
  ),
  (
    '30000000-0000-4000-a000-000000000003',
    '10000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'PRESS-200-MAIN',
    '500-Ton Hydraulic Stamping Press HP-200',
    'Production Line Machinery',
    'Schuler',
    'C2-500',
    'SCH-9941-X',
    '2019-11-10',
    'Stamping Bay 2',
    'critical',
    '{"max_tonnage": 500, "system_pressure_bar": 315, "stroke_count_per_min": 40, "hydraulic_fluid_temp_c": 55}'::jsonb,
    'under_maintenance',
    FALSE,
    '2024-02-10 11:00:00+00',
    NOW()
  ),
  (
    '30000000-0000-4000-a000-000000000004',
    '10000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'CONV-309-L1',
    'Assembly Line 1 Main Drive Conveyor Motor',
    'Material Handling',
    'SEW-Eurodrive',
    'Movidrive MDX61B',
    'SEW-44109-M',
    '2023-01-12',
    'Assembly Hall Line 1',
    'medium',
    '{"belt_speed_m_s": 1.5, "motor_current_amps": 28, "gearbox_oil_level_pct": 95}'::jsonb,
    'operational',
    FALSE,
    '2024-03-01 08:30:00+00',
    NOW()
  ),
  (
    '30000000-0000-4000-a000-000000000005',
    '10000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'CHILL-105-SYS',
    'Centrifugal Process Water Chiller CH-105',
    'HVAC',
    'Trane',
    'Centravac CVHE',
    'TRN-10293-Z',
    '2020-05-04',
    'Central Plant Yard',
    'high',
    '{"compressor_rpm": 4200, "refrigerant_pressure_psi": 140, "chilled_water_supply_temp_c": 6.5}'::jsonb,
    'operational',
    FALSE,
    '2024-03-15 14:00:00+00',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Sensor Readings
INSERT INTO public.sensor_readings (id, asset_id, recorded_by, reading_type, value, unit, source, notes, recorded_at, created_at)
VALUES
  ('40000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'vibration_mm_s', 6.8, 'mm/s', 'sensor_feed', 'Elevated drive-end bearing vibration observed during peak load.', NOW() - INTERVAL '2 hours', NOW()),
  ('40000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'temperature_c', 78.4, '°C', 'sensor_feed', 'Bearing housing temperature exceeds normal baseline (65°C).', NOW() - INTERVAL '2 hours', NOW()),
  ('40000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'pressure_psi', 412.0, 'PSI', 'sensor_feed', 'Discharge pressure slight fluctuation.', NOW() - INTERVAL '2 hours', NOW()),
  ('40000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'runtime_hours', 14250, 'hours', 'manual', 'Logged during shift audit.', NOW() - INTERVAL '24 hours', NOW()),
  ('40000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000001', 'vibration_mm_s', 2.1, 'mm/s', 'sensor_feed', 'Vibration within acceptable ISO 10816 Zone A limits.', NOW() - INTERVAL '4 hours', NOW()),
  ('40000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000001', 'temperature_c', 88.0, '°C', 'sensor_feed', 'Compressor discharge air temperature steady.', NOW() - INTERVAL '4 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Failure Events
INSERT INTO public.failure_events (id, asset_id, reported_by, failure_mode, root_cause, affected_component, severity, downtime_start, downtime_end, estimated_cost_impact, technician_notes, image_urls, created_at)
VALUES
  (
    '50000000-0000-4000-a000-000000000001',
    '30000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'Bearing Failure',
    'Inadequate lubrication resulting in inner race spalling and cage deformation.',
    'Drive-End Roller Bearing',
    'critical',
    '2024-04-10 06:30:00+00',
    '2024-04-10 18:45:00+00',
    42500,
    'Replaced DE bearing set, flushed oil reservoir, re-aligned coupling with laser tool.',
    '{}',
    '2024-04-10 19:00:00+00'
  ),
  (
    '50000000-0000-4000-a000-000000000002',
    '30000000-0000-4000-a000-000000000003',
    '20000000-0000-4000-a000-000000000001',
    'Seal/Gasket Failure',
    'Hydraulic main cylinder seal degradation due to thermal breakdown.',
    'Main Ram Hydraulic Seal Kit',
    'high',
    '2024-06-01 11:00:00+00',
    '2024-06-02 02:00:00+00',
    28000,
    'Replaced damaged main hydraulic cylinder seals and refreshed fluid filters.',
    '{}',
    '2024-06-02 03:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Maintenance Schedules
INSERT INTO public.maintenance_schedules (id, asset_id, maintenance_type, recurrence_rule, next_due_at, created_by, created_at)
VALUES
  ('60000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 'predictive', 'FREQ=MONTHLY;INTERVAL=1', NOW() + INTERVAL '3 days', '20000000-0000-4000-a000-000000000001', '2024-05-01 00:00:00+00'),
  ('60000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000002', 'preventive', 'FREQ=MONTHLY;INTERVAL=3', NOW() + INTERVAL '12 days', '20000000-0000-4000-a000-000000000001', '2024-05-15 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Work Orders
INSERT INTO public.work_orders (id, asset_id, schedule_id, assigned_to, title, description, status, priority, due_date, completed_at, created_at, updated_at)
VALUES
  (
    '70000000-0000-4000-a000-000000000001',
    '30000000-0000-4000-a000-000000000001',
    '60000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000003',
    'Drive-End Bearing Replacement & Laser Alignment',
    'Execute precision vibration analysis, replace SKF 6314 bearing assembly, lubricate with Mobilith SHC 220, and align shaft to <0.05mm tolerance.',
    'in_progress',
    'critical',
    NOW() + INTERVAL '2 days',
    NULL,
    NOW() - INTERVAL '1 day',
    NOW()
  ),
  (
    '70000000-0000-4000-a000-000000000002',
    '30000000-0000-4000-a000-000000000002',
    '60000000-0000-4000-a000-000000000002',
    '20000000-0000-4000-a000-000000000003',
    'Quarterly Air & Oil Filter Replacement',
    'Perform 2,000-hour service inspection, change oil separator cartridge, check belt tension, and inspect intake valve assembly.',
    'scheduled',
    'medium',
    NOW() + INTERVAL '5 days',
    NULL,
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    '70000000-0000-4000-a000-000000000003',
    '30000000-0000-4000-a000-000000000003',
    NULL,
    '20000000-0000-4000-a000-000000000003',
    'Hydraulic Reservoir Fluid Flush & Valve Calibration',
    'Flush ISO VG 46 hydraulic oil, replace main proportional valve seals, and perform pressure relief test.',
    'open',
    'high',
    NOW() + INTERVAL '1 day',
    NULL,
    NOW() - INTERVAL '12 hours',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Seed AI Predictions
INSERT INTO public.ai_predictions (id, asset_id, prediction_type, risk_score, predicted_failure_mode, rul_estimate_hours, confidence_level, assumptions, contributing_factors, raw_ai_response, generated_by, created_at)
VALUES
  (
    '80000000-0000-4000-a000-000000000001',
    '30000000-0000-4000-a000-000000000001',
    'failure_prediction',
    84,
    'Bearing Failure',
    120,
    'high',
    ARRAY['Pump operates under continuous 100% duty cycle (24/7).', 'Vibration acceleration trend continues at current trajectory.', 'Ambient temperature remains within 25°C baseline.'],
    '[{"weight": "high", "factor": "Vibration Acceleration Spike", "evidence": "Drive-end bearing overall velocity increased from 3.2 mm/s to 6.8 mm/s in 14 days."}, {"weight": "high", "factor": "Elevated Housing Temperature", "evidence": "BE-DE temperature logged at 78.4°C vs baseline 65.0°C."}]'::jsonb,
    '{"risk_score": 84, "confidence_level": "high", "predicted_failure_mode": "Bearing Failure", "recommended_horizon_days": 5}'::jsonb,
    '20000000-0000-4000-a000-000000000001',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 9. Seed AI Recommendations
INSERT INTO public.ai_recommendations (id, asset_id, prediction_id, recommendations, confidence_level, status, confirmed_by, confirmed_at, created_at)
VALUES
  (
    '90000000-0000-4000-a000-000000000001',
    '30000000-0000-4000-a000-000000000001',
    '80000000-0000-4000-a000-000000000001',
    '[{"action": "Schedule emergency bearing replacement and laser shaft alignment within 72 hours.", "priority": "P1 - Immediate", "justification": "Vibration spectrum exhibits 1X/2X rotational harmonics indicative of severe bearing fatigue."}, {"action": "Perform oil reservoir flush and replace synthetic ISO VG 68 lubricant.", "priority": "P2 - High", "justification": "High operating temperature causes oxidation and loss of viscosity."}]'::jsonb,
    'high',
    'pending',
    NULL,
    NULL,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 10. Seed AI Chat Sessions & Messages
INSERT INTO public.ai_chat_sessions (id, user_id, asset_id, title, created_at)
VALUES
  ('a0000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 'Troubleshooting P-101 High Vibration & Temperature', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ai_chat_messages (id, session_id, role, content, retrieved_sources, created_at)
VALUES
  ('b0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'user', 'What are the main causes for elevated 6.8 mm/s vibration on Main Feed Pump P-101?', '[]'::jsonb, NOW() - INTERVAL '1 day'),
  ('b0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001', 'assistant', 'Based on Sulzer MSD 6x10x13 OEM Maintenance Manual & historical failure log #FL-50001: 1. Drive-End Bearing Degradation: Vibration of 6.8 mm/s exceeds ISO 10816 limit. 2. Shaft Misalignment. Recommended Action: Execute Work Order WO-70001 immediately.', '[{"path": "/docs/sulzer_msd_manual.pdf", "title": "Sulzer MSD Manual", "snippet": "Vibration exceeding 4.5 mm/s RMS on DE bearing requires immediate shutdown."}]'::jsonb, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Knowledge Documents
INSERT INTO public.knowledge_documents (id, organization_id, asset_id, title, document_type, storage_path, content_text, created_at)
VALUES
  ('c0000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 'Sulzer MSD 6x10x13 OEM Maintenance Manual', 'manual', '/docs/sulzer_msd_manual.pdf', 'Section 4.2: Maximum allowable vibration for continuous duty is 4.5 mm/s RMS. Operating temperatures above 75°C accelerate lubricant thermal decomposition by 50%. Inspect drive-end roller bearing cage at 10,000 hour intervals.', '2024-01-20 00:00:00+00'),
  ('c0000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000002', 'Atlas Copco GA 90 VSD+ Service & Troubleshooting Guide', 'manual', '/docs/atlas_copco_ga90_guide.pdf', 'Chapter 8: Oil separator differential pressure exceeding 0.8 bar indicates filter clogging. Change oil filter element every 2,000 hours or 6 months.', '2024-01-22 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 12. Seed Agent Planning Runs
INSERT INTO public.agent_planning_runs (id, organization_id, requested_by, scope, diagnostics_output, risk_output, scheduling_output, parts_output, final_plan, status, created_at, completed_at)
VALUES
  (
    'd0000000-0000-4000-a000-000000000001',
    '10000000-0000-4000-a000-000000000001',
    '20000000-0000-4000-a000-000000000001',
    'Fleet-wide High Criticality Assets',
    '{"flagged_assets": ["30000000-0000-4000-a000-000000000001", "30000000-0000-4000-a000-000000000003"], "primary_diagnostics": "P-101 exhibits bearing degradation; Press-200 shows hydraulic pressure drops."}'::jsonb,
    '{"ranked_risk": [{"priority": 1, "risk_score": 84, "asset_id": "30000000-0000-4000-a000-000000000001"}, {"priority": 2, "risk_score": 72, "asset_id": "30000000-0000-4000-a000-000000000003"}]}'::jsonb,
    '{"proposed_schedule": [{"asset_id": "30000000-0000-4000-a000-000000000001", "target_date": "Within 48 hours", "duration_hours": 6}, {"asset_id": "30000000-0000-4000-a000-000000000003", "target_date": "Within 5 days", "duration_hours": 4}]}'::jsonb,
    '{"required_inventory": [{"stock": 2, "part_no": "SKF-6314-C3", "description": "Deep Groove Ball Bearing 70x150x35mm", "lead_time_days": 0}]}'::jsonb,
    '{"executive_summary": "Consolidated Fleet Reliability Strategy: Immediate shutdown window requested for P-101 pump bearing overhaul.", "estimated_downtime_hours": 10, "avoided_unplanned_cost": 70500}'::jsonb,
    'completed',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '5 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- 13. Seed Asset Attachments
INSERT INTO public.asset_attachments (id, asset_id, file_name, storage_path, uploaded_by, created_at)
VALUES
  ('e0000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 'PUMP-101-Laser-Alignment-Report.pdf', '/attachments/PUMP-101-Alignment.pdf', '20000000-0000-4000-a000-000000000001', '2024-04-10 19:30:00+00')
ON CONFLICT (id) DO NOTHING;
