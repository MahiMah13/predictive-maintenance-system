import { z } from "zod";

export const assetCreateSchema = z.object({
  asset_tag: z.string().min(2, "Asset Tag is required"),
  name: z.string().min(2, "Asset Name is required"),
  category: z.string().min(2, "Category is required"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  install_date: z.string().optional(),
  location: z.string().optional(),
  criticality_tier: z.enum(["critical", "high", "medium", "low"]),
  operating_parameters: z.record(z.any()).optional(),
  lifecycle_status: z.enum(["operational", "degraded", "under_maintenance", "decommissioned"]).optional()
});

export const sensorReadingSchema = z.object({
  reading_type: z.string().min(1, "Reading type is required"),
  value: z.number({ invalid_type_error: "Value must be a valid number" }),
  unit: z.string().min(1, "Unit is required"),
  source: z.enum(["manual", "sensor_feed"]).default("manual"),
  notes: z.string().optional()
});

export const failureEventSchema = z.object({
  failure_mode: z.string().min(2, "Failure Mode is required"),
  root_cause: z.string().optional(),
  affected_component: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  downtime_start: z.string().min(5, "Downtime start time is required"),
  downtime_end: z.string().optional().nullable(),
  estimated_cost_impact: z.number().optional(),
  technician_notes: z.string().optional()
});

export const workOrderSchema = z.object({
  asset_id: z.string().min(1, "Asset ID is required"),
  schedule_id: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  title: z.string().min(3, "Work Order Title is required"),
  description: z.string().optional(),
  status: z.enum(["open", "scheduled", "in_progress", "completed", "overdue", "cancelled"]).default("open"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  due_date: z.string().optional().nullable()
});

export const confirmRecommendationSchema = z.object({
  confirmed: z.literal(true, { errorMap: () => ({ message: "Plant condition verification confirmation is mandatory before accepting work plan." }) }),
  notes: z.string().optional()
});

export const failurePredictionResultSchema = z.object({
  risk_score: z.number().min(0).max(100),
  predicted_failure_mode: z.string(),
  confidence_level: z.enum(["low", "medium", "high"]),
  contributing_factors: z.array(z.object({
    factor: z.string(),
    evidence: z.string(),
    weight: z.enum(["low", "medium", "high"])
  })),
  assumptions: z.array(z.string()),
  recommended_horizon_days: z.number(),
  data_gaps: z.array(z.string())
});
