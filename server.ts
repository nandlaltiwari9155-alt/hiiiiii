import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { 
  connectToDatabase, 
  createAppointment, 
  getAllAppointments, 
  updateAppointment, 
  deleteAppointment, 
  authenticateAdmin,
  isInMemoryFallback,
  getAppointmentByTrackingId
} from './server/db.js';
import { sendBookingConfirmationEmail, sendBookingUpdateEmail } from './server/email.js';

// Load environment variables in case they are not already loaded
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-key-change-this-in-production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Connect to MongoDB Atlas (or fallback)
  await connectToDatabase();

  // JWT Verification Middleware
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, error: 'Unauthorized. Access token is missing.' });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json({ success: false, error: 'Forbidden. Access token is invalid or expired.' });
        return;
      }
      (req as any).user = decoded;
      next();
    });
  };

  // --- API ROUTES ---

  // Get Admin/DB connection status information
  app.get('/api/admin/status', (req, res) => {
    res.json({
      success: true,
      isFallback: isInMemoryFallback,
      dbType: isInMemoryFallback ? 'In-Memory (Local Dev Fallback)' : 'Supabase Database (Connected)',
      adminUsername: process.env.ADMIN_USERNAME || 'admin'
    });
  });

  // Admin Login Handler
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ success: false, error: 'Please enter both username and password.' });
        return;
      }

      const isValid = await authenticateAdmin(username, password);
      if (!isValid) {
        res.status(401).json({ success: false, error: 'Incorrect username or password. Please try again.' });
        return;
      }

      // Sign token
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
      res.json({
        success: true,
        message: 'Admin authentication completed successfully.',
        token,
        adminUser: { username }
      });
    } catch (err: any) {
      console.error("Auth error:", err);
      res.status(500).json({ success: false, error: 'An unexpected internal error occurred during login.' });
    }
  });

  // Public Booking Endpoint: Create Appointment
  app.post('/api/appointments', async (req, res) => {
    try {
      const { name, email, phone, projectType, budget, message, date, time, service, subject } = req.body;
      
      const finalPhone = phone || '';
      const finalProjectType = projectType || service || 'Free Consultation';
      const finalBudget = budget || '₹4,999';

      // Validation
      if (!name || !email || !finalPhone || !message || !date || !time) {
        res.status(400).json({ success: false, error: 'All fields (name, email, phone, projectType, budget, message, date, time) are required.' });
        return;
      }

      const digitsOnly = finalPhone.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        res.status(400).json({ success: false, error: 'Phone number must contain between 10 and 15 digits.' });
        return;
      }

      const appointment = await createAppointment({
        name,
        email,
        phone: finalPhone,
        projectType: finalProjectType,
        budget: finalBudget,
        message,
        date,
        time
      });

      // Send confirmation email via Resend (async, non-blocking)
      sendBookingConfirmationEmail({
        email: appointment.email || email,
        name: appointment.name || name,
        appointmentId: appointment.id,
        projectId: appointment.projectId,
        date: appointment.date,
        time: appointment.time,
        projectType: appointment.projectType,
        budget: appointment.budget
      }).catch(err => {
        console.error("❌ Deferred Resend confirmation error:", err);
      });

      res.status(201).json({
        success: true,
        message: 'Your appointment request has been scheduled successfully.',
        appointment
      });
    } catch (err: any) {
      console.error("Booking creation error:", err);
      res.status(500).json({ success: false, error: err.message || 'An error occurred while scheduling your appointment. Please try again.' });
    }
  });

  // Public Tracking Endpoint: Track Appointment Status
  app.post('/api/appointments/track', async (req, res) => {
    try {
      const { appointmentId, phone } = req.body;

      if (!appointmentId || !phone) {
        res.status(400).json({ success: false, error: 'Both Appointment ID and Phone Number are required.' });
        return;
      }

      const appointment = await getAppointmentByTrackingId(appointmentId, phone);
      if (!appointment) {
        res.status(404).json({ success: false, error: 'No matching appointment found with the provided ID and Phone Number.' });
        return;
      }

      res.json({
        success: true,
        appointment: {
          id: appointment.id,
          name: appointment.name,
          phone: appointment.phone,
          status: appointment.status,
          date: appointment.date,
          time: appointment.time,
          projectType: appointment.projectType,
          budget: appointment.budget,
          createdAt: appointment.createdAt,
          projectId: appointment.projectId,
          projectStatus: appointment.projectStatus,
          progress: appointment.progress,
          currentWork: appointment.currentWork,
          estimatedDelivery: appointment.estimatedDelivery,
          developerNotes: appointment.developerNotes
        }
      });
    } catch (err: any) {
      console.error("Booking tracking error:", err);
      res.status(500).json({ success: false, error: err.message || 'An error occurred while tracking your appointment.' });
    }
  });

  // Protected Admin Endpoint: Fetch all appointments
  app.get('/api/admin/appointments', authenticateToken, async (req, res) => {
    try {
      const appointments = await getAllAppointments();
      res.json({
        success: true,
        appointments
      });
    } catch (err: any) {
      console.error("Fetch bookings error:", err);
      res.status(500).json({ success: false, error: 'Could not fetch appointment list.' });
    }
  });

  // Protected Admin Endpoint: Update Appointment status / details
  app.put('/api/admin/appointments/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name, email, phone, projectType, budget, message, date, time, service, subject, status,
        projectId, projectStatus, progress, currentWork, estimatedDelivery, developerNotes
      } = req.body;

      const updated = await updateAppointment(id, {
        name,
        email,
        phone,
        projectType: projectType || service,
        budget: budget || subject,
        message,
        date,
        time,
        status,
        projectId,
        projectStatus,
        progress: progress !== undefined ? Number(progress) : undefined,
        currentWork,
        estimatedDelivery,
        developerNotes
      });

      if (!updated) {
        res.status(404).json({ success: false, error: 'Appointment not found.' });
        return;
      }

      // Send status update email via Resend (async, non-blocking)
      sendBookingUpdateEmail({
        email: updated.email || email,
        name: updated.name || name,
        appointmentId: updated.id,
        projectId: updated.projectId,
        projectStatus: updated.projectStatus,
        progress: updated.progress,
        currentWork: updated.currentWork,
        estimatedDelivery: updated.estimatedDelivery,
        developerNotes: updated.developerNotes,
        status: updated.status
      }).catch(err => {
        console.error("❌ Deferred Resend update notification error:", err);
      });

      res.json({
        success: true,
        message: 'Appointment status was updated successfully.',
        appointment: updated
      });
    } catch (err: any) {
      console.error("Update booking error:", err);
      res.status(500).json({ success: false, error: 'Could not update the specified appointment.' });
    }
  });

  // Protected Admin Endpoint: Delete Appointment
  app.delete('/api/admin/appointments/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteAppointment(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Appointment record not found or already deleted.' });
        return;
      }

      res.json({
        success: true,
        message: 'Appointment was deleted successfully.'
      });
    } catch (err: any) {
      console.error("Delete booking error:", err);
      res.status(500).json({ success: false, error: 'An error occurred while deleting the appointment.' });
    }
  });


  // --- VITE DEV OR STATIC CLIENT ROUTING ---

  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000 and host 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server booting up and listening on port ${PORT}`);
    console.log(`👉 Dev app URL is accessible online.`);
  });
}

startServer();
