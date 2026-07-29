import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import store from '../services/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'predictive-maintenance-jwt-secret-key-2026';

export async function register(req, res, next) {
  try {
    const { full_name, email, password, role, organization_name } = req.body;
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Missing required registration fields" });
    }

    let org = store.organizations.find(o => o.name.toLowerCase() === (organization_name || '').toLowerCase());
    if (!org) {
      org = {
        id: `org-${Date.now()}`,
        name: organization_name || 'Apex Plant Operations',
        created_at: new Date().toISOString()
      };
      store.organizations.push(org);
    }

    const newProfile = {
      id: `usr-${Date.now()}`,
      full_name,
      email,
      role: role || 'reliability_engineer',
      organization_id: org.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.profiles.push(newProfile);

    const token = jwt.sign({ id: newProfile.id, email: newProfile.email, role: newProfile.role, organization_id: org.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: newProfile,
      organization: org
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    const profile = store.profiles.find(p => p.email?.toLowerCase() === email?.toLowerCase()) || store.profiles[0];
    const org = store.organizations.find(o => o.id === profile.organization_id);

    const token = jwt.sign({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      organization_id: profile.organization_id
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: profile,
      organization: org
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ message: "Logged out successfully" });
}

export async function getProfile(req, res) {
  const profile = req.user;
  const org = store.organizations.find(o => o.id === profile.organization_id);
  res.json({ user: profile, organization: org });
}

export async function updateProfile(req, res) {
  const profile = store.profiles.find(p => p.id === req.user.id);
  if (profile) {
    if (req.body.full_name) profile.full_name = req.body.full_name;
    if (req.body.role) profile.role = req.body.role;
    profile.updated_at = new Date().toISOString();
  }
  res.json({ user: profile || req.user });
}
