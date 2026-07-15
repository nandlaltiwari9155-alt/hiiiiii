import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        resendClient = new Resend(apiKey);
        console.log("📨 Resend Client successfully initialized.");
      } catch (err) {
        console.error("❌ Failed to initialize Resend client:", err);
      }
    } else {
      console.warn("⚠️ RESEND_API_KEY is not defined. Email notifications will be logged to console instead of being sent.");
    }
  }
  return resendClient;
}

export async function sendBookingConfirmationEmail(data: {
  email: string;
  name: string;
  appointmentId: string;
  projectId?: string;
  date: string;
  time: string;
  projectType: string;
  budget: string;
}) {
  const client = getResendClient();
  const subject = `🎉 Project Booking Scheduled: ID ${data.appointmentId}`;
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 11px; background-color: #3b0764; color: #d8b4fe; border: 1px solid #581c87; padding: 4px 10px; border-radius: 4px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">AESTHETIC DEVS</span>
        <h2 style="color: #ffffff; margin-top: 15px; margin-bottom: 5px; font-weight: 800; font-size: 24px;">Appointment Confirmed</h2>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 0;">We've received your project request and scheduled your slot!</p>
      </div>

      <div style="background-color: #18181b; padding: 25px; border-radius: 8px; border: 1px solid #27272a; margin-bottom: 25px;">
        <h3 style="color: #a855f7; margin-top: 0; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Booking Details</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600; width: 40%;">Client Name:</td>
            <td style="padding: 6px 0; color: #f4f4f5; font-weight: bold;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Appointment ID:</td>
            <td style="padding: 6px 0; color: #10b981; font-family: monospace; font-weight: bold; font-size: 14px;">${data.appointmentId}</td>
          </tr>
          ${data.projectId ? `
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Project Track ID:</td>
            <td style="padding: 6px 0; color: #a855f7; font-family: monospace; font-weight: bold; font-size: 14px;">${data.projectId}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Scheduled Date:</td>
            <td style="padding: 6px 0; color: #f4f4f5;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Scheduled Time:</td>
            <td style="padding: 6px 0; color: #f4f4f5;">${data.time} (IST)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Service/Project:</td>
            <td style="padding: 6px 0; color: #3b82f6; font-weight: bold;">${data.projectType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Budget tier:</td>
            <td style="padding: 6px 0; color: #10b981; font-weight: bold;">${data.budget}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
        <p>You can track the progress of your project live on our platform using either your <strong>Appointment ID</strong> or <strong>Project Track ID</strong>.</p>
        <p style="margin-top: 20px; font-size: 11px; color: #71717a;">This is an automated notification from your dev workspace. Resend integration is active.</p>
      </div>
    </div>
  `;

  if (!client) {
    console.log(`[EMAIL LOG - CONFIRMATION] To: ${data.email}, Subject: ${subject}\nDetails: ${JSON.stringify(data, null, 2)}`);
    return { success: true, simulated: true };
  }

  try {
    const response = await client.emails.send({
      from: 'Aesthetic Devs <onboarding@resend.dev>',
      to: [data.email],
      subject: subject,
      html: htmlContent,
    });
    console.log("📨 Booking confirmation email sent successfully via Resend:", response);
    return { success: true, response };
  } catch (err: any) {
    console.error("❌ Failed to send confirmation email via Resend:", err);
    return { success: false, error: err.message };
  }
}

export async function sendBookingUpdateEmail(data: {
  email: string;
  name: string;
  appointmentId: string;
  projectId?: string;
  projectStatus?: string;
  progress?: number;
  currentWork?: string;
  estimatedDelivery?: string;
  developerNotes?: string;
  status: string;
}) {
  const client = getResendClient();
  const trackId = data.projectId || data.appointmentId;
  const subject = `🔔 Project Progress Update: ${trackId}`;
  
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    completed: '#3b82f6',
    cancelled: '#ef4444'
  };
  const statusColor = statusColors[data.status.toLowerCase()] || '#a855f7';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 11px; background-color: #1e1b4b; color: #818cf8; border: 1px solid #312e81; padding: 4px 10px; border-radius: 4px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">STATUS TRACKER</span>
        <h2 style="color: #ffffff; margin-top: 15px; margin-bottom: 5px; font-weight: 800; font-size: 24px;">Project Status Updated</h2>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 0;">The latest progress report and lead architect updates for your project.</p>
      </div>

      <div style="background-color: #18181b; padding: 25px; border-radius: 8px; border: 1px solid #27272a; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 15px;">
          <h3 style="color: #a855f7; margin: 0; font-size: 16px;">Development Tracking</h3>
          <span style="font-size: 11px; background-color: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 3px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">
            ${data.status}
          </span>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600; width: 40%;">Project Tracker ID:</td>
            <td style="padding: 6px 0; color: #a855f7; font-family: monospace; font-weight: bold; font-size: 14px;">${trackId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Current Project Status:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: bold;">${data.projectStatus || 'In Progress'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Completion Progress:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: bold;">
              <div style="display: inline-block; vertical-align: middle; width: 100px; background-color: #27272a; height: 8px; border-radius: 4px; overflow: hidden; margin-right: 8px;">
                <div style="background-color: #a855f7; height: 100%; width: ${data.progress ?? 0}%;"></div>
              </div>
              <span style="color: #a855f7; font-family: monospace;">${data.progress ?? 0}%</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Current Active Task:</td>
            <td style="padding: 6px 0; color: #e4e4e7;">${data.currentWork || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-weight: 600;">Estimated Delivery:</td>
            <td style="padding: 6px 0; color: #3b82f6; font-weight: bold; font-family: monospace;">${data.estimatedDelivery || 'TBD'}</td>
          </tr>
        </table>

        ${data.developerNotes ? `
        <div style="background-color: #09090b; padding: 15px; border-radius: 6px; border: 1px solid #27272a; margin-top: 15px;">
          <h4 style="margin: 0 0 8px 0; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Lead Developer Notes:</h4>
          <p style="margin: 0; color: #d4d4d8; font-size: 12px; font-family: monospace; line-height: 1.5; white-space: pre-wrap;">${data.developerNotes}</p>
        </div>
        ` : ''}
      </div>

      <div style="text-align: center; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
        <p>You can view full real-time details and interact with development timelines on your client portal dashboard.</p>
        <p style="margin-top: 20px; font-size: 11px; color: #71717a;">This is a live system update sent via Resend API.</p>
      </div>
    </div>
  `;

  if (!client) {
    console.log(`[EMAIL LOG - UPDATE] To: ${data.email}, Subject: ${subject}\nDetails: ${JSON.stringify(data, null, 2)}`);
    return { success: true, simulated: true };
  }

  try {
    const response = await client.emails.send({
      from: 'Aesthetic Devs <onboarding@resend.dev>',
      to: [data.email],
      subject: subject,
      html: htmlContent,
    });
    console.log("📨 Project update email sent successfully via Resend:", response);
    return { success: true, response };
  } catch (err: any) {
    console.error("❌ Failed to send update email via Resend:", err);
    return { success: false, error: err.message };
  }
}
