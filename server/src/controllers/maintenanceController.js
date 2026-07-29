import store from '../services/store.js';
import { workOrderSchema } from '../schemas/validationSchemas.js';

export async function listFleetFailures(req, res) {
  const { search, severity, asset_id } = req.query;
  let failures = store.failure_events.map(f => {
    const asset = store.assets.find(a => a.id === f.asset_id);
    return {
      ...f,
      asset_name: asset?.name || 'Unknown Asset',
      asset_tag: asset?.asset_tag || 'N/A',
      asset_category: asset?.category || 'N/A'
    };
  });

  if (asset_id) {
    failures = failures.filter(f => f.asset_id === asset_id);
  }
  if (severity) {
    failures = failures.filter(f => f.severity === severity);
  }
  if (search) {
    const q = search.toLowerCase();
    failures = failures.filter(f => 
      f.failure_mode.toLowerCase().includes(q) ||
      (f.root_cause && f.root_cause.toLowerCase().includes(q)) ||
      f.asset_name.toLowerCase().includes(q) ||
      f.asset_tag.toLowerCase().includes(q)
    );
  }

  res.json(failures);
}

export async function listSchedules(req, res) {
  const schedules = store.maintenance_schedules.map(s => {
    const asset = store.assets.find(a => a.id === s.asset_id);
    return {
      ...s,
      asset_name: asset?.name || 'Unknown Asset',
      asset_tag: asset?.asset_tag || 'N/A'
    };
  });
  res.json(schedules);
}

export async function createSchedule(req, res) {
  const { asset_id, maintenance_type, recurrence_rule, next_due_at } = req.body;
  const newSchedule = {
    id: `sch-${Date.now()}`,
    asset_id,
    maintenance_type: maintenance_type || 'preventive',
    recurrence_rule: recurrence_rule || 'FREQ=MONTHLY;INTERVAL=1',
    next_due_at: next_due_at || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    created_by: req.user.id,
    created_at: new Date().toISOString()
  };
  store.maintenance_schedules.unshift(newSchedule);
  res.status(201).json(newSchedule);
}

export async function listWorkOrders(req, res) {
  const { status, priority, asset_id, assigned_to } = req.query;
  let workOrders = store.work_orders.map(w => {
    const asset = store.assets.find(a => a.id === w.asset_id);
    const tech = store.profiles.find(p => p.id === w.assigned_to);
    return {
      ...w,
      asset_name: asset?.name || 'Unknown Asset',
      asset_tag: asset?.asset_tag || 'N/A',
      assigned_to_name: tech?.full_name || 'Unassigned Technician'
    };
  });

  if (status) {
    workOrders = workOrders.filter(w => w.status === status);
  }
  if (priority) {
    workOrders = workOrders.filter(w => w.priority === priority);
  }
  if (asset_id) {
    workOrders = workOrders.filter(w => w.asset_id === asset_id);
  }
  if (assigned_to) {
    workOrders = workOrders.filter(w => w.assigned_to === assigned_to);
  }

  res.json(workOrders);
}

export async function createWorkOrder(req, res, next) {
  try {
    const validated = workOrderSchema.parse(req.body);
    const newWO = {
      id: `wo-${Date.now()}`,
      asset_id: validated.asset_id,
      schedule_id: validated.schedule_id || null,
      assigned_to: validated.assigned_to || req.user.id,
      title: validated.title,
      description: validated.description || '',
      status: validated.status || 'open',
      priority: validated.priority || 'medium',
      due_date: validated.due_date || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.work_orders.unshift(newWO);
    res.status(201).json(newWO);
  } catch (err) {
    next(err);
  }
}

export async function getWorkOrderById(req, res) {
  const wo = store.work_orders.find(w => w.id === req.params.id);
  if (!wo) {
    return res.status(404).json({ error: "Work order not found" });
  }

  const asset = store.assets.find(a => a.id === wo.asset_id);
  const tech = store.profiles.find(p => p.id === wo.assigned_to);

  res.json({
    ...wo,
    asset,
    assigned_technician: tech
  });
}

export async function updateWorkOrder(req, res) {
  const wo = store.work_orders.find(w => w.id === req.params.id);
  if (!wo) {
    return res.status(404).json({ error: "Work order not found" });
  }

  const { status, title, description, priority, assigned_to, due_date } = req.body;
  if (status) {
    wo.status = status;
    if (status === 'completed') {
      wo.completed_at = new Date().toISOString();
      // Restore asset lifecycle status if completed
      const asset = store.assets.find(a => a.id === wo.asset_id);
      if (asset) asset.lifecycle_status = 'operational';
    }
  }
  if (title) wo.title = title;
  if (description) wo.description = description;
  if (priority) wo.priority = priority;
  if (assigned_to) wo.assigned_to = assigned_to;
  if (due_date) wo.due_date = due_date;

  wo.updated_at = new Date().toISOString();
  res.json(wo);
}
