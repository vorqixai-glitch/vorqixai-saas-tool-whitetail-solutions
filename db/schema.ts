import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const localUsers = sqliteTable('local_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('user'), // 'user', 'admin'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: integer('owner_id').notNull(),
  localOwnerId: integer('local_owner_id').references(() => localUsers.id),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  phone: text('phone'),
  website: text('website'),
  licenseNumber: text('license_number'),
  licenseStatus: text('license_status'), // 'active', 'pending', 'expired', 'none'
  licenseExpiry: text('license_expiry'),
  narLevel: text('nar_level').default('none'), // 'level_1', 'level_2', 'level_3', 'level_4', 'none'
  beds: integer('beds').default(0),
  subscriptionTier: text('subscription_tier').default('doe_eyes'), // 'doe_eyes', 'white_tail_alpha', 'herd_leader'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const residents = sqliteTable('residents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').notNull().references(() => organizations.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  intakeDate: text('intake_date').default(sql`CURRENT_TIMESTAMP`),
  dischargeDate: text('discharge_date'),
  status: text('status').default('active'), // 'active','inactive','graduated','violated'
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  roomNumber: text('room_number'),
  backgroundCheckStatus: text('background_check_status').default('pending'), // 'pending','passed','failed','not_required'
  drugTestStatus: text('drug_test_status').default('pending'), // 'pending','passed','failed','scheduled'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const licenseApplications = sqliteTable('license_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').notNull().references(() => organizations.id),
  state: text('state').notNull(),
  stateCode: text('state_code').notNull(),
  licenseType: text('license_type'),
  status: text('status').default('draft'), // 'draft','submitted','approved','denied','pending_review','renewal_needed'
  submissionDate: text('submission_date'),
  approvalDate: text('approval_date'),
  expiryDate: text('expiry_date'),
  progress: integer('progress').default(0),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').notNull().references(() => organizations.id),
  title: text('title').notNull(),
  category: text('category'), // 'resident_agreement','house_rules','drug_testing','emergency_plan','financial_policy','other'
  docType: text('doc_type').default('generated'), // 'template','generated'
  content: text('content'),
  signed: text('signed').default('no'), // 'no','yes'
  signedAt: text('signed_at'),
  signedBy: text('signed_by'),
  version: integer('version').default(1),
  parentId: integer('parent_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const complianceItems = sqliteTable('compliance_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').notNull().references(() => organizations.id),
  title: text('title').notNull(),
  category: text('category'), // 'licensing','documentation','facility','staffing','resident_care','reporting'
  status: text('status').default('pending'), // 'pending','in_progress','completed','overdue'
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  priority: text('priority').default('medium'), // 'low','medium','high'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const consultingBookings = sqliteTable('consulting_bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => localUsers.id),
  topic: text('topic').notNull(),
  description: text('description'),
  scheduledAt: text('scheduled_at'),
  duration: integer('duration').default(60),
  status: text('status').default('pending'), // 'pending','confirmed','completed','cancelled'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const stateRequirements = sqliteTable('state_requirements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  state: text('state').notNull(),
  stateCode: text('state_code').notNull(),
  licenseType: text('license_type').notNull(),
  requirement: text('requirement').notNull(),
  description: text('description'),
  category: text('category'), // 'application','facility','staffing','documentation','financial','inspection'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orgId: integer('org_id').notNull().references(() => organizations.id),
  userId: integer('user_id'),
  localUserId: integer('local_user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  details: text('details'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => localUsers.id),
  receiverId: integer('receiver_id').notNull().references(() => localUsers.id),
  text: text('text').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const licenseDocuments = sqliteTable('license_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull().references(() => licenseApplications.id),
  fileName: text('file_name').notNull(),
  fileData: text('file_data'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
