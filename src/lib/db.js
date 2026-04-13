import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'crm.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT DEFAULT 'Walk-in',
    stage TEXT DEFAULT 'New',
    plan_type TEXT,
    rate_quoted REAL,
    visited INTEGER DEFAULT 0,
    visit_date TEXT,
    next_steps TEXT,
    follow_up_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lead_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'note',
    description TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );
`);

export function getAllLeads() {
  return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
}

export function getLeadById(id) {
  return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
}

export function createLead(data) {
  const stmt = db.prepare(`
    INSERT INTO leads (name, email, phone, company, source, stage, plan_type, rate_quoted, visited, visit_date, next_steps, follow_up_date, notes)
    VALUES (@name, @email, @phone, @company, @source, @stage, @plan_type, @rate_quoted, @visited, @visit_date, @next_steps, @follow_up_date, @notes)
  `);
  const result = stmt.run({
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    source: data.source || 'Walk-in',
    stage: data.stage || 'New',
    plan_type: data.plan_type || null,
    rate_quoted: data.rate_quoted || null,
    visited: data.visited ? 1 : 0,
    visit_date: data.visit_date || null,
    next_steps: data.next_steps || null,
    follow_up_date: data.follow_up_date || null,
    notes: data.notes || null,
  });
  return getLeadById(result.lastInsertRowid);
}

export function updateLead(id, data) {
  const existing = getLeadById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE leads SET
      name = @name,
      email = @email,
      phone = @phone,
      company = @company,
      source = @source,
      stage = @stage,
      plan_type = @plan_type,
      rate_quoted = @rate_quoted,
      visited = @visited,
      visit_date = @visit_date,
      next_steps = @next_steps,
      follow_up_date = @follow_up_date,
      notes = @notes,
      updated_at = datetime('now')
    WHERE id = @id
  `);
  stmt.run({
    id,
    name: data.name ?? existing.name,
    email: data.email ?? existing.email,
    phone: data.phone ?? existing.phone,
    company: data.company ?? existing.company,
    source: data.source ?? existing.source,
    stage: data.stage ?? existing.stage,
    plan_type: data.plan_type ?? existing.plan_type,
    rate_quoted: data.rate_quoted ?? existing.rate_quoted,
    visited: data.visited !== undefined ? (data.visited ? 1 : 0) : existing.visited,
    visit_date: data.visit_date ?? existing.visit_date,
    next_steps: data.next_steps ?? existing.next_steps,
    follow_up_date: data.follow_up_date ?? existing.follow_up_date,
    notes: data.notes ?? existing.notes,
  });
  return getLeadById(id);
}

export function deleteLead(id) {
  return db.prepare('DELETE FROM leads WHERE id = ?').run(id);
}

export function getLeadsByStage() {
  return db.prepare('SELECT stage, COUNT(*) as count FROM leads GROUP BY stage').all();
}

export function getLeadsBySource() {
  return db.prepare('SELECT source, COUNT(*) as count FROM leads GROUP BY source').all();
}

export function getDashboardStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM leads').get();
  const won = db.prepare("SELECT COUNT(*) as count FROM leads WHERE stage = 'Won'").get();
  const lost = db.prepare("SELECT COUNT(*) as count FROM leads WHERE stage = 'Lost'").get();
  const pipeline = db.prepare("SELECT SUM(rate_quoted) as total FROM leads WHERE stage NOT IN ('Won', 'Lost')").get();
  const upcomingVisits = db.prepare("SELECT * FROM leads WHERE visit_date >= date('now') AND visited = 0 ORDER BY visit_date ASC LIMIT 5").all();
  const upcomingFollowUps = db.prepare("SELECT * FROM leads WHERE follow_up_date >= date('now') ORDER BY follow_up_date ASC LIMIT 5").all();
  const byStage = db.prepare('SELECT stage, COUNT(*) as count FROM leads GROUP BY stage').all();
  const bySource = db.prepare('SELECT source, COUNT(*) as count FROM leads GROUP BY source').all();

  return {
    totalLeads: total.count,
    wonLeads: won.count,
    lostLeads: lost.count,
    conversionRate: total.count > 0 ? ((won.count / total.count) * 100).toFixed(1) : 0,
    pipelineValue: pipeline.total || 0,
    upcomingVisits,
    upcomingFollowUps,
    byStage,
    bySource,
  };
}

export function getActivitiesByLeadId(leadId) {
  return db.prepare('SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC').all(leadId);
}

export function createActivity(data) {
  const stmt = db.prepare(`
    INSERT INTO lead_activities (lead_id, type, description)
    VALUES (@lead_id, @type, @description)
  `);
  const result = stmt.run({
    lead_id: data.lead_id,
    type: data.type || 'note',
    description: data.description,
  });
  return db.prepare('SELECT * FROM lead_activities WHERE id = ?').get(result.lastInsertRowid);
}

export function deleteActivity(id) {
  return db.prepare('DELETE FROM lead_activities WHERE id = ?').run(id);
}

export default db;
