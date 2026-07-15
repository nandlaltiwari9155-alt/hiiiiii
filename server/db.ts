import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Clean the Supabase URL to strip out any trailing /rest/v1/ or slashes
const rawUrl = process.env.SUPABASE_URL || '';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export interface IAppointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  projectId?: string;
  projectStatus?: string;
  progress?: number;
  currentWork?: string;
  estimatedDelivery?: string;
  developerNotes?: string;
}

export function formatId(numericId: any): string {
  const num = parseInt(numericId, 10);
  if (isNaN(num)) return String(numericId);
  return `APT-${1000 + num}`;
}

export function parseId(idStr: string): string {
  if (!idStr) return '';
  const match = idStr.trim().toUpperCase().match(/^APT-(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return (num - 1000).toString();
  }
  return idStr;
}

export let isInMemoryFallback = false;
export let hasProjectColumns = false;
let supabase: any = null;

// Pre-populate in-memory appointments with high quality demo data (in case of fallback)
let inMemoryAppointments: IAppointment[] = [
  {
    id: "APT-1001",
    name: "John Smith",
    email: "john.smith@acmetech.io",
    phone: "9876543210",
    projectType: "API Development",
    budget: "₹19,999",
    message: "We need an architectural review of our Express-based distributed microservices and database indexing design. Looking for a weekend deep-dive session.",
    date: "2026-07-18",
    time: "10:30",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    projectId: "WEB-1001",
    projectStatus: "Under Development",
    progress: 45,
    currentWork: "Refactoring backend services and indexing PostgreSQL tables.",
    estimatedDelivery: "2026-08-01",
    developerNotes: "Completed code architecture review. Starting database optimizations now."
  },
  {
    id: "APT-1002",
    name: "Sarah Jenkins",
    email: "sarah@growthflow.co",
    phone: "8765432109",
    projectType: "Web Design",
    budget: "₹9,999",
    message: "Interested in hiring Narayan to develop a high-performance React + Tailwind web store with Stripe payment routes and sub-second load times.",
    date: "2026-07-20",
    time: "14:00",
    status: "pending",
    createdAt: new Date().toISOString(),
    projectId: "WEB-1002",
    projectStatus: "Project Received",
    progress: 0,
    currentWork: "Awaiting initial consultation session.",
    estimatedDelivery: "TBD",
    developerNotes: "Scheduled initial briefing call."
  }
];

// In-Memory admin login credentials
const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME || "admin",
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin_secure_password", 10)
};

// Database Column & Value Mappers to map from app state to Supabase table
const sanitizeDate = (val: any): string | null => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (str === '' || str.toUpperCase() === 'TBD') return null;
  
  // If it already matches YYYY-MM-DD, let's validate it
  const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (ymdRegex.test(str)) {
    const parsed = Date.parse(str);
    return isNaN(parsed) ? null : str;
  }
  
  const parsed = Date.parse(str);
  if (isNaN(parsed)) {
    return null;
  }
  try {
    const d = new Date(parsed);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
};

const toDbStatus = (status: string): string => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const fromDbStatus = (status: string): 'pending' | 'confirmed' | 'completed' | 'cancelled' => {
  if (!status) return 'pending';
  const lowered = status.toLowerCase();
  if (['pending', 'confirmed', 'completed', 'cancelled'].includes(lowered)) {
    return lowered as any;
  }
  return 'pending';
};

const serializeMessage = (
  projectType: string,
  budget: string,
  message: string,
  projectId?: string,
  projectStatus?: string,
  progress?: number,
  currentWork?: string,
  estimatedDelivery?: string,
  developerNotes?: string
): string => {
  let text = `Project Type: [${projectType || ''}]\nBudget: [${budget || ''}]\n`;
  if (projectId) {
    text += `Project ID: [${projectId}]\n`;
  }
  if (projectStatus) {
    text += `Project Status: [${projectStatus}]\n`;
  }
  if (progress !== undefined) {
    text += `Progress: [${progress}]\n`;
  }
  if (currentWork) {
    text += `Current Work: [${currentWork}]\n`;
  }
  if (estimatedDelivery) {
    text += `Estimated Delivery: [${estimatedDelivery}]\n`;
  }
  if (developerNotes) {
    text += `Developer Notes: [${developerNotes}]\n`;
  }
  text += `\n${message || ''}`;
  return text;
};

interface IParsedMessage {
  projectType: string;
  budget: string;
  message: string;
  projectId?: string;
  projectStatus?: string;
  progress?: number;
  currentWork?: string;
  estimatedDelivery?: string;
  developerNotes?: string;
}

const deserializeMessage = (messageText: string): IParsedMessage => {
  const text = messageText || '';
  const projectTypeMatch = text.match(/^Project Type: \[(.*?)\]/m);
  const budgetMatch = text.match(/^Budget: \[(.*?)\]/m);
  const projectIdMatch = text.match(/^Project ID: \[(.*?)\]/m);
  const projectStatusMatch = text.match(/^Project Status: \[(.*?)\]/m);
  const progressMatch = text.match(/^Progress: \[(.*?)\]/m);
  const currentWorkMatch = text.match(/^Current Work: \[(.*?)\]/m);
  const estimatedDeliveryMatch = text.match(/^Estimated Delivery: \[(.*?)\]/m);
  const developerNotesMatch = text.match(/^Developer Notes: \[(.*?)\]/m);

  let projectType = 'Consultation';
  let budget = 'N/A';
  let projectId: string | undefined;
  let projectStatus: string | undefined;
  let progress: number | undefined;
  let currentWork: string | undefined;
  let estimatedDelivery: string | undefined;
  let developerNotes: string | undefined;

  if (projectTypeMatch || budgetMatch) {
    projectType = projectTypeMatch ? projectTypeMatch[1] : 'Consultation';
    budget = budgetMatch ? budgetMatch[1] : 'N/A';
    projectId = projectIdMatch ? projectIdMatch[1] : undefined;
    projectStatus = projectStatusMatch ? projectStatusMatch[1] : undefined;
    progress = progressMatch ? parseInt(progressMatch[1], 10) : undefined;
    currentWork = currentWorkMatch ? currentWorkMatch[1] : undefined;
    estimatedDelivery = estimatedDeliveryMatch ? estimatedDeliveryMatch[1] : undefined;
    developerNotes = developerNotesMatch ? developerNotesMatch[1] : undefined;
    
    let originalMessage = text;
    originalMessage = originalMessage.replace(/^Project Type: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Budget: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Project ID: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Project Status: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Progress: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Current Work: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Estimated Delivery: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.replace(/^Developer Notes: \[(.*?)\]\r?\n?/m, '');
    originalMessage = originalMessage.trim();

    return { 
      projectType, 
      budget, 
      message: originalMessage, 
      projectId, 
      projectStatus, 
      progress,
      currentWork,
      estimatedDelivery,
      developerNotes
    };
  }

  // Fallback to old format
  const serviceMatch = text.match(/^Service: \[(.*?)\]/m);
  const subjectMatch = text.match(/^Subject: \[(.*?)\]/m);

  const fallbackProjectType = serviceMatch ? serviceMatch[1] : 'Consultation';
  const fallbackBudget = 'N/A';
  
  let originalMessage = text;
  originalMessage = originalMessage.replace(/^Service: \[(.*?)\]\r?\n?/m, '');
  originalMessage = originalMessage.replace(/^Subject: \[(.*?)\]\r?\n?/m, '');
  originalMessage = originalMessage.trim();

  return { projectType: fallbackProjectType, budget: fallbackBudget, message: originalMessage };
};

export async function connectToDatabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes("your-project")) {
    console.warn("⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured or has placeholder values. Falling back to secure in-memory database.");
    isInMemoryFallback = true;
    return;
  }

  try {
    console.log(`🔌 Initializing Supabase client with cleaned URL: ${SUPABASE_URL}`);
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Test query to verify connection and table existence
    const { data, error } = await supabase.from('appointments').select('*').limit(1);
    if (error) {
      console.error("❌ Supabase table connection error details:", error);
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.code === '42P01') {
        console.warn("⚠️ appointments table not found in Supabase database. Please run the SQL schema in your Supabase SQL Editor!");
        console.warn("Table auto-verification failed. Falling back to in-memory mode.");
        isInMemoryFallback = true;
        return;
      }
      throw error;
    }

    console.log("🔌 Connected successfully to Supabase Database (appointments table verified).");
    isInMemoryFallback = false;

    // Detect if database includes custom project columns
    try {
      const { error: colError } = await supabase
        .from('appointments')
        .select('project_id, project_status, progress, current_work, estimated_delivery, developer_notes')
        .limit(1);
      if (!colError) {
        console.log("✅ Custom project tracking columns (project_id, project_status, progress, current_work, estimated_delivery, developer_notes) detected in database.");
        hasProjectColumns = true;
      } else {
        console.info("ℹ️ Custom project tracking columns not detected. Using serialized fallback storage in 'message' field.");
        hasProjectColumns = false;
      }
    } catch {
      hasProjectColumns = false;
    }

    // Ensure default admin exists (if admins table exists)
    await ensureDatabaseAdmin();
  } catch (error: any) {
    console.error("❌ Supabase connection error:", error.message || error);
    console.warn("⚠️ Falling back to in-memory database to prevent service interruption.");
    isInMemoryFallback = true;
  }
}

async function ensureDatabaseAdmin() {
  try {
    if (isInMemoryFallback || !supabase) return;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    
    const { data: exists, error } = await supabase
      .from('admins')
      .select('username')
      .eq('username', adminUsername)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        console.info("ℹ️ 'admins' table not present in Supabase yet. Standard admin credentials from environment will be used for logins.");
        return;
      }
      console.warn("Could not query admins table:", error.message);
      return;
    }

    if (!exists) {
      const adminPassword = process.env.ADMIN_PASSWORD || "admin_secure_password";
      const hash = await bcrypt.hash(adminPassword, 10);
      
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          username: adminUsername,
          password_hash: hash
        });

      if (insertError) {
        console.error("Could not seed default database admin:", insertError.message);
      } else {
        console.log(`👤 Seeded default database admin account: '${adminUsername}'`);
      }
    }
  } catch (err: any) {
    console.error("Could not ensure database admin:", err.message || err);
  }
}

export async function generateNextProjectId(): Promise<string> {
  let highestNum = 1000;
  if (isInMemoryFallback || !supabase) {
    for (const app of inMemoryAppointments) {
      if (app.projectId && app.projectId.startsWith('WEB-')) {
        const num = parseInt(app.projectId.replace('WEB-', ''), 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  } else {
    try {
      const selectCol = hasProjectColumns ? 'project_id' : 'message';
      const { data, error } = await supabase.from('appointments').select(selectCol);
      if (!error && data) {
        for (const row of data) {
          let pId: string | undefined = undefined;
          if (hasProjectColumns) {
            pId = row.project_id;
          } else {
            const des = deserializeMessage(row.message);
            pId = des.projectId;
          }
          if (pId && pId.startsWith('WEB-')) {
            const num = parseInt(pId.replace('WEB-', ''), 10);
            if (!isNaN(num) && num > highestNum) {
              highestNum = num;
            }
          }
        }
      }
    } catch (e) {
      console.error("Error finding highest project ID", e);
    }
  }
  return `WEB-${highestNum + 1}`;
}

export async function createAppointment(data: Omit<IAppointment, 'id' | 'createdAt' | 'status'>) {
  const nextProjectId = await generateNextProjectId();
  const defaultProjectStatus = "Project Received";
  const defaultProgress = 0;
  const defaultCurrentWork = "Project review and initial setup.";
  const defaultEstimatedDelivery = null; // Use null so it inserts correctly into a DATE column
  const defaultDeveloperNotes = "Initial booking received.";

  if (isInMemoryFallback || !supabase) {
    const nextIntId = (inMemoryAppointments.length > 0 ? Math.max(...inMemoryAppointments.map(a => {
      const parsed = parseInt(parseId(a.id), 10);
      return isNaN(parsed) ? 0 : parsed;
    })) : 0) + 1;

    const newAppointment: IAppointment = {
      id: formatId(nextIntId),
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectType: data.projectType,
      budget: data.budget,
      message: data.message,
      date: data.date,
      time: data.time,
      status: 'pending',
      createdAt: new Date().toISOString(),
      projectId: nextProjectId,
      projectStatus: defaultProjectStatus,
      progress: defaultProgress,
      currentWork: defaultCurrentWork,
      estimatedDelivery: defaultEstimatedDelivery || undefined,
      developerNotes: defaultDeveloperNotes
    };
    inMemoryAppointments.push(newAppointment);
    return newAppointment;
  } else {
    // Map to existing database columns
    const dbPayload: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      appointment_date: data.date,
      appointment_time: data.time,
      status: 'Pending'
    };

    if (hasProjectColumns) {
      dbPayload.project_id = nextProjectId;
      dbPayload.project_status = defaultProjectStatus;
      dbPayload.progress = defaultProgress;
      dbPayload.current_work = defaultCurrentWork;
      dbPayload.estimated_delivery = sanitizeDate(defaultEstimatedDelivery);
      dbPayload.developer_notes = defaultDeveloperNotes;
      dbPayload.message = serializeMessage(data.projectType, data.budget, data.message);
    } else {
      dbPayload.message = serializeMessage(
        data.projectType, 
        data.budget, 
        data.message, 
        nextProjectId, 
        defaultProjectStatus, 
        defaultProgress,
        defaultCurrentWork,
        defaultEstimatedDelivery ? defaultEstimatedDelivery : undefined,
        defaultDeveloperNotes
      );
    }

    const { data: inserted, error } = await supabase
      .from('appointments')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error details:", error);
      throw new Error(`Failed to create appointment in Supabase: ${error.message} (Code: ${error.code})`);
    }

    if (!inserted) {
      throw new Error("Failed to insert appointment: No data returned from Supabase.");
    }

    const deserialized = deserializeMessage(inserted.message);
    return {
      id: formatId(inserted.id),
      name: inserted.name,
      email: inserted.email,
      phone: inserted.phone || '',
      projectType: deserialized.projectType,
      budget: deserialized.budget,
      message: deserialized.message,
      date: inserted.appointment_date,
      time: inserted.appointment_time,
      status: fromDbStatus(inserted.status),
      createdAt: inserted.created_at,
      projectId: hasProjectColumns ? inserted.project_id : deserialized.projectId,
      projectStatus: hasProjectColumns ? inserted.project_status : deserialized.projectStatus,
      progress: hasProjectColumns ? inserted.progress : deserialized.progress,
      currentWork: hasProjectColumns ? inserted.current_work : deserialized.currentWork,
      estimatedDelivery: hasProjectColumns ? inserted.estimated_delivery : deserialized.estimatedDelivery,
      developerNotes: hasProjectColumns ? inserted.developer_notes : deserialized.developerNotes
    };
  }
}

export async function getAllAppointments() {
  if (isInMemoryFallback || !supabase) {
    return inMemoryAppointments;
  } else {
    const { data: docs, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase select error details:", error);
      throw new Error(`Failed to fetch appointments from Supabase: ${error.message}`);
    }

    return (docs || []).map((inserted: any) => {
      const deserialized = deserializeMessage(inserted.message);
      return {
        id: formatId(inserted.id),
        name: inserted.name,
        email: inserted.email,
        phone: inserted.phone || '',
        projectType: deserialized.projectType,
        budget: deserialized.budget,
        message: deserialized.message,
        date: inserted.appointment_date,
        time: inserted.appointment_time,
        status: fromDbStatus(inserted.status),
        createdAt: inserted.created_at,
        projectId: hasProjectColumns ? inserted.project_id : deserialized.projectId,
        projectStatus: hasProjectColumns ? inserted.project_status : deserialized.projectStatus,
        progress: hasProjectColumns ? inserted.progress : deserialized.progress,
        currentWork: hasProjectColumns ? inserted.current_work : deserialized.currentWork,
        estimatedDelivery: hasProjectColumns ? inserted.estimated_delivery : deserialized.estimatedDelivery,
        developerNotes: hasProjectColumns ? inserted.developer_notes : deserialized.developerNotes
      };
    });
  }
}

export async function updateAppointment(id: string, updates: Partial<IAppointment>) {
  if (isInMemoryFallback || !supabase) {
    const formattedId = id.startsWith('APT-') ? id : formatId(id);
    const index = inMemoryAppointments.findIndex(app => app.id === formattedId);
    if (index === -1) return null;
    inMemoryAppointments[index] = { ...inMemoryAppointments[index], ...updates };
    return inMemoryAppointments[index];
  } else {
    const parsedRawId = parseId(id);
    const dbId = parseInt(parsedRawId, 10);
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', isNaN(dbId) ? parsedRawId : dbId)
      .maybeSingle();

    if (fetchError || !existing) {
      console.error(`Fetch existing row error for ID ${id} (dbId: ${dbId}):`, fetchError);
      throw new Error(`Failed to find appointment to update: ${fetchError?.message || 'Not found'}`);
    }

    const parsedMsg = deserializeMessage(existing.message);

    const finalName = updates.name !== undefined ? updates.name : existing.name;
    const finalEmail = updates.email !== undefined ? updates.email : existing.email;
    const finalPhone = updates.phone !== undefined ? updates.phone : (existing.phone || '');
    const finalDate = updates.date !== undefined ? updates.date : existing.appointment_date;
    const finalTime = updates.time !== undefined ? updates.time : existing.appointment_time;
    const finalStatus = updates.status !== undefined ? toDbStatus(updates.status) : existing.status;

    const finalProjectType = updates.projectType !== undefined ? updates.projectType : parsedMsg.projectType;
    const finalBudget = updates.budget !== undefined ? updates.budget : parsedMsg.budget;
    const finalMessageBody = updates.message !== undefined ? updates.message : parsedMsg.message;

    const finalProjectId = updates.projectId !== undefined ? updates.projectId : (hasProjectColumns ? existing.project_id : parsedMsg.projectId);
    const finalProjectStatus = updates.projectStatus !== undefined ? updates.projectStatus : (hasProjectColumns ? existing.project_status : parsedMsg.projectStatus);
    const finalProgress = updates.progress !== undefined ? updates.progress : (hasProjectColumns ? existing.progress : parsedMsg.progress);
    const finalCurrentWork = updates.currentWork !== undefined ? updates.currentWork : (hasProjectColumns ? existing.current_work : parsedMsg.currentWork);
    const finalEstimatedDelivery = sanitizeDate(updates.estimatedDelivery !== undefined ? updates.estimatedDelivery : (hasProjectColumns ? existing.estimated_delivery : parsedMsg.estimatedDelivery));
    const finalDeveloperNotes = updates.developerNotes !== undefined ? updates.developerNotes : (hasProjectColumns ? existing.developer_notes : parsedMsg.developerNotes);

    const updatePayload: any = {
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      appointment_date: finalDate,
      appointment_time: finalTime,
      status: finalStatus
    };

    if (hasProjectColumns) {
      updatePayload.project_id = finalProjectId;
      updatePayload.project_status = finalProjectStatus;
      updatePayload.progress = finalProgress;
      updatePayload.current_work = finalCurrentWork;
      updatePayload.estimated_delivery = finalEstimatedDelivery;
      updatePayload.developer_notes = finalDeveloperNotes;
      updatePayload.message = serializeMessage(finalProjectType, finalBudget, finalMessageBody);
    } else {
      updatePayload.message = serializeMessage(
        finalProjectType,
        finalBudget,
        finalMessageBody,
        finalProjectId,
        finalProjectStatus,
        finalProgress,
        finalCurrentWork,
        finalEstimatedDelivery || undefined,
        finalDeveloperNotes
      );
    }

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', isNaN(dbId) ? parsedRawId : dbId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase update error details:", error);
      throw new Error(`Failed to update appointment in Supabase: ${error.message}`);
    }

    if (!updated) return null;

    const deserialized = deserializeMessage(updated.message);
    return {
      id: formatId(updated.id),
      name: updated.name,
      email: updated.email,
      phone: updated.phone || '',
      projectType: deserialized.projectType,
      budget: deserialized.budget,
      message: deserialized.message,
      date: updated.appointment_date,
      time: updated.appointment_time,
      status: fromDbStatus(updated.status),
      createdAt: updated.created_at,
      projectId: hasProjectColumns ? updated.project_id : deserialized.projectId,
      projectStatus: hasProjectColumns ? updated.project_status : deserialized.projectStatus,
      progress: hasProjectColumns ? updated.progress : deserialized.progress,
      currentWork: hasProjectColumns ? updated.current_work : deserialized.currentWork,
      estimatedDelivery: hasProjectColumns ? updated.estimated_delivery : deserialized.estimatedDelivery,
      developerNotes: hasProjectColumns ? updated.developer_notes : deserialized.developerNotes
    };
  }
}

export async function deleteAppointment(id: string) {
  if (isInMemoryFallback || !supabase) {
    const formattedId = id.startsWith('APT-') ? id : formatId(id);
    const initialLen = inMemoryAppointments.length;
    inMemoryAppointments = inMemoryAppointments.filter(app => app.id !== formattedId);
    return inMemoryAppointments.length < initialLen;
  } else {
    const parsedRawId = parseId(id);
    const dbId = parseInt(parsedRawId, 10);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', isNaN(dbId) ? parsedRawId : dbId);

    if (error) {
      console.error("Supabase delete error details:", error);
      throw new Error(`Failed to delete appointment in Supabase: ${error.message}`);
    }

    return true;
  }
}

export async function getAppointmentByTrackingId(trackingId: string, phone: string) {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const searchId = trackingId.trim().toUpperCase();

  if (isInMemoryFallback || !supabase) {
    const app = inMemoryAppointments.find(a => {
      const matchPhone = (a.phone || '').trim().replace(/\s+/g, '') === cleanPhone;
      const matchId = (a.id === searchId || a.projectId === searchId);
      return matchPhone && matchId;
    });
    return app || null;
  } else {
    let record: any = null;

    if (searchId.startsWith('WEB-')) {
      if (hasProjectColumns) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('project_id', searchId)
          .maybeSingle();
        if (!error && data) record = data;
      } else {
        // Fallback: fetch all and scan
        const { data, error } = await supabase.from('appointments').select('*');
        if (!error && data) {
          record = data.find((r: any) => {
            const des = deserializeMessage(r.message);
            return des.projectId === searchId;
          });
        }
      }
    } else {
      const parsedRawId = parseId(searchId);
      const dbId = parseInt(parsedRawId, 10);
      if (!isNaN(dbId)) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', dbId)
          .maybeSingle();
        if (!error && data) record = data;
      }
    }

    if (!record) return null;

    const dbPhoneClean = (record.phone || '').trim().replace(/\s+/g, '');
    if (dbPhoneClean !== cleanPhone) return null;

    const deserialized = deserializeMessage(record.message);
    return {
      id: formatId(record.id),
      name: record.name,
      email: record.email,
      phone: record.phone || '',
      projectType: deserialized.projectType,
      budget: deserialized.budget,
      message: deserialized.message,
      date: record.appointment_date,
      time: record.appointment_time,
      status: fromDbStatus(record.status),
      createdAt: record.created_at,
      projectId: hasProjectColumns ? record.project_id : deserialized.projectId,
      projectStatus: hasProjectColumns ? record.project_status : deserialized.projectStatus,
      progress: hasProjectColumns ? record.progress : deserialized.progress,
      currentWork: hasProjectColumns ? record.current_work : deserialized.currentWork,
      estimatedDelivery: hasProjectColumns ? record.estimated_delivery : deserialized.estimatedDelivery,
      developerNotes: hasProjectColumns ? record.developer_notes : deserialized.developerNotes
    };
  }
}

export async function authenticateAdmin(username: string, passwordPlain: string) {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin_secure_password";

  // Check against static environment configurations first for seamless and robust access
  if (username === adminUsername) {
    const isEnvMatch = await bcrypt.compare(passwordPlain, bcrypt.hashSync(adminPassword, 10));
    if (isEnvMatch) return true;
  }

  if (isInMemoryFallback || !supabase) {
    if (username !== adminUsername) return false;
    return await bcrypt.compare(passwordPlain, DEFAULT_ADMIN.passwordHash);
  } else {
    try {
      const { data: adminDoc, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error || !adminDoc) return false;
      return await bcrypt.compare(passwordPlain, adminDoc.password_hash);
    } catch {
      return false;
    }
  }
}
