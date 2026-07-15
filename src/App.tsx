import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Linkedin, 
  Instagram, 
  Mail, 
  MapPin, 
  Code, 
  Cpu, 
  ExternalLink, 
  Layers, 
  Settings, 
  MessageSquare, 
  Check, 
  ChevronRight, 
  User, 
  Download, 
  Sparkles, 
  Send, 
  X, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Terminal, 
  ArrowRight,
  Menu,
  Heart,
  Calendar,
  Clock,
  Lock,
  Shield,
  Trash2,
  LogOut,
  RefreshCw,
  Search
} from 'lucide-react';

// Types for our portfolio components
interface Skill {
  name: string;
  category: string;
  proficiency: number;
  years: number;
  description: string;
  subskills: string[];
  sampleCode: string;
}

interface Project {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  gradient: string;
  tech: string[];
  features: string[];
  role: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

interface BackendAppointment {
  id: string;
  name: string;
  email: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  subject?: string;
  message: string;
  date: string;
  time: string;
  service?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  projectId?: string;
  projectStatus?: string;
  progress?: number;
  currentWork?: string;
  estimatedDelivery?: string;
  developerNotes?: string;
}

export default function App() {
  // Navigation active tab (smooth scrolling fallback / highlight)
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Hiring Status
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  
  // Interactive Skill state
  const [selectedSkill, setSelectedSkill] = useState<string>('React');
  
  // Interactive Project Modal state
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  // Interactive E-commerce API terminal simulation
  const [terminalMethod, setTerminalMethod] = useState<string>('GET');
  const [terminalEndpoint, setTerminalEndpoint] = useState<string>('/products');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    JSON.stringify([
      { id: 1, name: "Premium Mechanical Keyboard", price: 189.99, stock: 12 },
      { id: 2, name: "Ergonomic Mesh Chair", price: 349.50, stock: 4 }
    ], null, 2)
  );
  const [terminalLoading, setTerminalLoading] = useState<boolean>(false);

  // Custom Chart view for Admin Dashboard simulation
  const [chartMetric, setChartMetric] = useState<'sales' | 'visitors' | 'conversion'>('sales');

  // Testimonials Carousel state
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  
  // Contact Form state
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [submittedMessage, setSubmittedMessage] = useState<boolean>(false);
  const [storedMessages, setStoredMessages] = useState<ContactMessage[]>([]);

  // CV View Modal state
  const [isCVModalOpen, setIsCVModalOpen] = useState<boolean>(false);

  // Form type state: 'brief' for project brief, 'booking' for appointment booking
  const [formType, setFormType] = useState<'brief' | 'booking'>('brief');
  
  // Appointment booking fields
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('10:00');
  const [bookingService, setBookingService] = useState<string>('Free Consultation');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [bookedProjectId, setBookedProjectId] = useState<string | null>(null);
  const [bookingStatusText, setBookingStatusText] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // Track Appointment Page state
  const [trackAptId, setTrackAptId] = useState<string>('');
  const [trackPhone, setTrackPhone] = useState<string>('');
  const [trackResult, setTrackResult] = useState<BackendAppointment | null>(null);
  const [trackLoading, setTrackLoading] = useState<boolean>(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Admin Dashboard Portal state
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('narayan_admin_token');
    } catch {
      return null;
    }
  });
  const [adminUsernameInput, setAdminUsernameInput] = useState<string>('');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminAppointments, setAdminAppointments] = useState<BackendAppointment[]>([]);
  const [adminDbStatus, setAdminDbStatus] = useState<{ isFallback: boolean, dbType: string, adminUsername: string } | null>(null);
  const [adminErrorMsg, setAdminErrorMsg] = useState<string>('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<BackendAppointment | null>(null);

  // Load stored contact messages on mount
  useEffect(() => {
    try {
      const messages = localStorage.getItem('narayan_portfolio_messages');
      if (messages) {
        setStoredMessages(JSON.parse(messages));
      }
    } catch (e) {
      console.error("Could not load contact messages", e);
    }
  }, []);

  // Dynamic active tab highlighting based on scroll position
  useEffect(() => {
    const sections = ['home', 'projects', 'skills', 'services', 'pricing', 'track', 'contact'];
    
    const observerOptions = {
      root: null, // viewport
      rootMargin: '-20% 0px -60% 0px', // trigger when section occupies main part of screen
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Capitalize first letter to match activeTab string ('Home', 'Projects', etc.)
          const id = entry.target.id;
          const capitalized = id.charAt(0).toUpperCase() + id.slice(1);
          setActiveTab(capitalized);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  // Save messages helper
  const saveMessage = (msg: ContactMessage) => {
    const updated = [msg, ...storedMessages];
    setStoredMessages(updated);
    try {
      localStorage.setItem('narayan_portfolio_messages', JSON.stringify(updated));
    } catch (e) {
      console.error("Could not save contact message", e);
    }
  };

  // Delete message helper
  const deleteMessage = (id: string) => {
    const updated = storedMessages.filter(m => m.id !== id);
    setStoredMessages(updated);
    try {
      localStorage.setItem('narayan_portfolio_messages', JSON.stringify(updated));
    } catch (e) {
      console.error("Could not delete contact message", e);
    }
  };

  // Skills Dataset
  const skillsData: Record<string, Skill> = {
    'React': {
      name: 'React',
      category: 'Frontend',
      proficiency: 95,
      years: 4,
      description: 'Expertise in declarative UI building, strict lifecycle control, Hooks orchestration, and modern state containers. Specialized in responsive rendering mechanics and concurrent capabilities.',
      subskills: ['Context API & Redux', 'Next.js & Server Components', 'React Router', 'Performance Auditing & Profiling'],
      sampleCode: `export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}`
    },
    'Node.js': {
      name: 'Node.js',
      category: 'Backend',
      proficiency: 90,
      years: 5,
      description: 'Asynchronous event-driven backend systems design. Architect of highly optimized API servers, filesystem stream routers, and secure process clusterings.',
      subskills: ['Event Loop & Streams', 'Cluster Architecture', 'Native Addons & V8 Integration', 'Worker Threads'],
      sampleCode: `import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

export function compressFile(source: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    createReadStream(source)
      .pipe(createGzip())
      .pipe(createWriteStream(destination))
      .on('finish', resolve)
      .on('error', reject);
  });
}`
    },
    'Express': {
      name: 'Express',
      category: 'Backend Framework',
      proficiency: 92,
      years: 5,
      description: 'Fast, unopinionated minimalist web framework. Built microservices featuring customized middleware pipelines, automated security response structures, and advanced validation filters.',
      subskills: ['Custom Middleware Chain', 'Global Error Isolation', 'CORS & CORS-proxy Control', 'Rate Limiting Pipelines'],
      sampleCode: `const express = require('express');
const app = express();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Malfunction' 
  });
});`
    },
    'MongoDB': {
      name: 'MongoDB',
      category: 'Database',
      proficiency: 88,
      years: 4,
      description: 'Flexible JSON documents querying. Scaled write-intensive platforms using sophisticated schema optimization, custom aggregation pipelines, and strategic indexing strategies.',
      subskills: ['Aggregation Framework', 'Index Sharding', 'Mongoose Middleware', 'Multi-tenant Isolation'],
      sampleCode: `db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$customerId", totalPaid: { $sum: "$revenue" } } },
  { $sort: { totalPaid: -1 } },
  { $limit: 10 }
]);`
    },
    'MySQL': {
      name: 'MySQL',
      category: 'Database',
      proficiency: 85,
      years: 4,
      description: 'Structured database schemas designed with rigorous relational optimization, sub-millisecond execution times, advanced triggers, and ACID-compliant transactional flows.',
      subskills: ['EXPLAIN Optimization', 'Stored Procedures', 'Composite Key Indexes', 'Foreign Key Normalization'],
      sampleCode: `SELECT users.username, COUNT(orders.id) AS total_orders
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY users.id
ORDER BY total_orders DESC;`
    },
    'Tailwind CSS': {
      name: 'Tailwind CSS',
      category: 'Styling',
      proficiency: 95,
      years: 3,
      description: 'Utility-first presentation strategy. Crafting customized design systems using tailored config parameters, responsive breakpoint hierarchies, and lightning-fast build compiles.',
      subskills: ['Custom Theme Config', 'Arbitrary Modifier Chains', 'Dynamic Class Resolution', 'Container Queries'],
      sampleCode: `@import "tailwindcss";

.glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}`
    },
    'PHP': {
      name: 'PHP',
      category: 'Backend',
      proficiency: 80,
      years: 4,
      description: 'Modern object-oriented application development using structured frameworks, strict type systems, fast data persistence layers, and automated testing frameworks.',
      subskills: ['OOP & Clean Architecture', 'Composer Packaging', 'PDO Prepared Queries', 'REST Integration'],
      sampleCode: `<?php
declare(strict_types=1);

class UserController extends Controller {
    public function show(int $id): JsonResponse {
        $user = $this->db->fetchUser($id);
        return new JsonResponse($user ?? ['error' => 'Not Found'], 200);
    }
}`
    },
    'Git': {
      name: 'Git',
      category: 'Tooling',
      proficiency: 90,
      years: 5,
      description: 'Comprehensive version control architecture. Managed continuous integration chains with tailored branching schemes, interactive rebase flows, and automated conflict recovery strategies.',
      subskills: ['Interactive Rebase', 'Git Hooks Orchestration', 'Cherry-picking Logic', 'Submodules Management'],
      sampleCode: `# Squash last 3 commits together smoothly
git rebase -i HEAD~3

# Create lightweight release tag
git tag -a v2.1.4 -m "Release v2.1.4 stable"`
    },
    'JavaScript': {
      name: 'JavaScript',
      category: 'Language',
      proficiency: 96,
      years: 6,
      description: 'Comprehensive language mastering. Mastery of memory footprint reduction, strict event-loop mechanics, closures design patterns, and asynchronous process optimizations.',
      subskills: ['Event Loop Mechanics', 'Closures & Scope Chain', 'Promise Combinators', 'Prototypical Inheritance'],
      sampleCode: `// Highly optimized async pipeline
const processQueue = async (tasks) => {
  const operations = tasks.map(async (task) => {
    const result = await execute(task);
    return enrich(result);
  });
  return Promise.all(operations);
};`
    },
    'Bootstrap': {
      name: 'Bootstrap',
      category: 'Styling',
      proficiency: 85,
      years: 5,
      description: 'Speedy component layouts and legacy application upgrades. Designed highly compliant layouts supporting legacy viewframes and custom stylesheet modifications.',
      subskills: ['SASS Theme Extends', 'Flexbox Relayouts', 'Dynamic Grid Controls', 'Utility Compiles'],
      sampleCode: `<div class="container py-4">
  <div class="row g-3">
    <div class="col-md-6 col-lg-4">
      <div class="card bg-dark text-light border-secondary">...</div>
    </div>
  </div>
</div>`
    }
  };

  // Projects Dataset
  const projectsData: Project[] = [
    {
      id: 'ecommerce',
      title: 'E-Commerce API',
      shortDesc: 'Node, Express, MongoDB, Stripe',
      longDesc: 'A lightning-fast, production-ready headless commerce API engine supporting complex cart lifecycle states, atomic stock deductions, structured payment checkouts, and JWT user auth. It processes thousands of orders concurrently with double-spend prevention.',
      gradient: 'from-blue-950 to-slate-950',
      tech: ['Node.js', 'Express', 'MongoDB', 'Stripe API', 'JWT'],
      features: [
        'Atomic inventory stock locks (preventing cart overselling)',
        'Stripe Webhook synchronizers for absolute payment fidelity',
        'Multi-stage query filters with caching for fast product catalogs',
        'Automated JWT token rotation system with blacklisting support'
      ],
      role: 'Lead Backend Architect'
    },
    {
      id: 'dashboard',
      title: 'Admin Dashboard',
      shortDesc: 'React, Tailwind, Analytics Engine',
      longDesc: 'An elegant, customizable administrative panel designed for enterprise command. Incorporates responsive real-time data feeds, modular visual grid panels, advanced date queries, and secure audit trackers.',
      gradient: 'from-purple-950 to-slate-950',
      tech: ['React', 'Tailwind CSS', 'Recharts', 'Context API', 'LocalStorage'],
      features: [
        'Interactive charts visualizing performance vectors',
        'Modular bento-style responsive layout configuration',
        'Live system resource simulator & active transaction stream',
        'Custom export pipeline supporting CSV/JSON outputs'
      ],
      role: 'Full Stack Developer'
    },
    {
      id: 'portfolio',
      title: 'Portfolio Site',
      shortDesc: 'PHP, MySQL, Modern CSS3',
      longDesc: 'A pristine, high-performance portfolio application highlighting fast asset load speeds, beautiful native design, responsive layout flow, and integrated contact mechanics using durable local database configurations.',
      gradient: 'from-indigo-950 to-slate-950',
      tech: ['PHP 8.2', 'MySQL', 'Tailwind', 'JavaScript ES6'],
      features: [
        'Pristine SEO markup and optimized accessibility structure',
        'Dynamic message logging and management inbox system',
        'Custom micro-interactions and smooth scroll performance',
        'Responsive layout flow converting into structured sliders on mobile'
      ],
      role: 'Creator & Designer'
    }
  ];

  // Testimonials Dataset
  const testimonialsData: Testimonial[] = [
    {
      name: 'Jane Cooper',
      role: 'CEO',
      company: 'TechFlow Solutions',
      avatar: 'JC',
      quote: "Narayan is an exceptional developer who delivered our project ahead of schedule and with incredible polish. His code is structured beautifully and performant."
    },
    {
      name: 'Marcus Sterling',
      role: 'VP of Engineering',
      company: 'ApexLabs Inc.',
      avatar: 'MS',
      quote: "His absolute command of Node.js and REST architectures is rare. The secure Stripe APIs we launched with him are performing flawlessly without single failures."
    },
    {
      name: 'Elena Rostova',
      role: 'Product Director',
      company: 'LaunchPad Digital',
      avatar: 'ER',
      quote: "Exceptional visual eyes combined with high backend logic capability. He transformed our complex legacy database into clean, decoupled JSON models overnight."
    }
  ];

  // Simulated Endpoint Runner for E-Commerce API Preview
  const handleRunEndpoint = () => {
    setTerminalLoading(true);
    setTimeout(() => {
      setTerminalLoading(false);
      if (terminalEndpoint === '/products') {
        setTerminalOutput(JSON.stringify([
          { id: 1, name: "Premium Mechanical Keyboard", price: 189.99, stock: 12 },
          { id: 2, name: "Ergonomic Mesh Chair", price: 349.50, stock: 4 },
          { id: 3, name: "Noise-Cancelling Headphones", price: 299.00, stock: 15 }
        ], null, 2));
      } else if (terminalEndpoint === '/cart') {
        setTerminalOutput(JSON.stringify({
          cartId: "cart_8832a09",
          items: [
            { id: 1, quantity: 1, name: "Premium Mechanical Keyboard", price: 189.99 }
          ],
          subtotal: 189.99,
          tax: 15.20,
          total: 205.19
        }, null, 2));
      } else if (terminalEndpoint === '/checkout') {
        if (terminalMethod === 'POST') {
          setTerminalOutput(JSON.stringify({
            status: "success",
            orderId: "ord_994821",
            message: "Payment processed successfully",
            transactionId: "ch_3M4t82Lk7Xas92",
            amountPaid: 205.19
          }, null, 2));
        } else {
          setTerminalOutput(JSON.stringify({
            error: "Method Not Allowed",
            message: "Checkout processes must utilize POST verb triggers."
          }, null, 2));
        }
      }
    }, 450);
  };

  // Submit Contact Form
  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    const newMessage: ContactMessage = {
      id: Math.random().toString(36).substr(2, 9),
      name: contactName,
      email: contactEmail,
      subject: contactSubject || 'General Inquiry',
      message: contactMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
    };

    saveMessage(newMessage);
    setSubmittedMessage(true);
    
    // Clear inputs
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');

    // Reset success animation after a delay
    setTimeout(() => {
      setSubmittedMessage(false);
    }, 4000);
  };

  // Submit Appointment Booking Form via fetch() API
  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone || !contactMessage || !bookingDate || !bookingTime || !bookingService) {
      setBookingStatusText({ type: 'error', message: 'All fields (including Phone Number) are required to submit booking.' });
      return;
    }

    const digitsOnly = contactPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setBookingStatusText({ type: 'error', message: 'Phone number must contain between 10 and 15 digits.' });
      return;
    }

    setBookingStatusText({ type: null, message: '' });
    setBookedId(null);

    // Extract budget from package selected
    let budget = '₹4,999';
    if (bookingService.includes('₹19,999') || bookingService.includes('E-commerce')) {
      budget = '₹19,999';
    } else if (bookingService.includes('₹9,999') || bookingService.includes('Business')) {
      budget = '₹9,999';
    } else if (bookingService.includes('₹4,999') || bookingService.includes('Basic')) {
      budget = '₹4,999';
    } else {
      budget = 'Free Consultation';
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          projectType: bookingService,
          budget: budget,
          message: contactMessage,
          date: bookingDate,
          time: bookingTime
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server error occurred during booking.');
      }

      // Save generated ID
      if (data.appointment && data.appointment.id) {
        setBookedId(data.appointment.id);
      }
      if (data.appointment && data.appointment.projectId) {
        setBookedProjectId(data.appointment.projectId);
      }

      setBookingStatusText({ 
        type: 'success', 
        message: 'Success! Your project appointment has been booked. Narayan will contact you shortly.' 
      });

      // Clear inputs
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactSubject('');
      setContactMessage('');
      setBookingDate('');
      
      // Auto dismiss success status after 15 seconds so they can copy the APT-ID
      setTimeout(() => {
        setBookingStatusText({ type: null, message: '' });
        setBookedId(null);
      }, 25000);
    } catch (err: any) {
      setBookingStatusText({ 
        type: 'error', 
        message: err.message || 'Could not connect to appointment API server.' 
      });
    }
  };

  // Track Appointment Form submit handler
  const handleTrackAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackAptId || !trackPhone) {
      setTrackError('Both Appointment ID and Phone Number are required.');
      return;
    }

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const response = await fetch('/api/appointments/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: trackAptId.trim(),
          phone: trackPhone.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Appointment not found. Please double-check your tracking info.');
      }

      setTrackResult(data.appointment);
    } catch (err: any) {
      setTrackError(err.message || 'Could not connect to tracking server.');
    } finally {
      setTrackLoading(false);
    }
  };

  // Helper to pre-select a pricing plan in the booking form and scroll to contact
  const selectPlanForBooking = (planName: string, price: string) => {
    setFormType('booking');
    setBookingService(planName);
    setContactSubject(`Free Consultation: ${planName}`);
    setContactMessage(`Hi Narayan,\n\nI am interested in your "${planName}" plan for ${price}. I would love to schedule a free consultation session with you to discuss the project timeline and technical requirements.\n\nLooking forward to speaking with you!`);
    setBookingStatusText({ type: null, message: '' });
    scrollToSection('Contact');
  };

  // Admin Portal Actions
  const fetchAdminData = async (token: string) => {
    try {
      // Fetch DB status info
      const statusRes = await fetch('/api/admin/status');
      if (statusRes.ok) {
        const sData = await statusRes.json();
        setAdminDbStatus({
          isFallback: sData.isFallback,
          dbType: sData.dbType,
          adminUsername: sData.adminUsername
        });
      }

      // Fetch appointments
      const response = await fetch('/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminAppointments(data.appointments);
      } else {
        if (response.status === 401 || response.status === 403) {
          handleAdminLogout();
        }
        setAdminErrorMsg(data.error || 'Could not load admin appointments.');
      }
    } catch (err) {
      setAdminErrorMsg('Failed to connect to the backend server to load data.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErrorMsg('');
    setIsAdminSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: adminUsernameInput,
          password: adminPasswordInput
        })
      });

      const data = await response.json();
      setIsAdminSubmitting(false);

      if (!response.ok || !data.success) {
        setAdminErrorMsg(data.error || 'Login failed.');
        return;
      }

      const token = data.token;
      setAdminToken(token);
      localStorage.setItem('narayan_admin_token', token);
      
      // Clear inputs
      setAdminUsernameInput('');
      setAdminPasswordInput('');

      // Load admin list
      fetchAdminData(token);
    } catch (err) {
      setIsAdminSubmitting(false);
      setAdminErrorMsg('Failed to connect to authentication server.');
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('narayan_admin_token');
    setAdminAppointments([]);
    setAdminDbStatus(null);
    setEditingAppointment(null);
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<BackendAppointment>) => {
    if (!adminToken) return;
    setAdminErrorMsg('');

    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAdminAppointments(prev => prev.map(app => app.id === id ? data.appointment : app));
        setEditingAppointment(null);
      } else {
        setAdminErrorMsg(data.error || 'Could not update the specified appointment.');
      }
    } catch (err) {
      setAdminErrorMsg('Failed to connect to server during update.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!adminToken) return;
    if (!window.confirm('Are you sure you want to delete this appointment? This action is irreversible.')) return;
    setAdminErrorMsg('');

    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAdminAppointments(prev => prev.filter(app => app.id !== id));
      } else {
        setAdminErrorMsg(data.error || 'Could not delete the specified appointment.');
      }
    } catch (err) {
      setAdminErrorMsg('Failed to connect to server during deletion.');
    }
  };

  // Fetch admin data on initial mount or when token is present
  useEffect(() => {
    if (adminToken) {
      fetchAdminData(adminToken);
    }
  }, [adminToken]);

  // Smooth scroll handler helper
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen pb-12 overflow-x-hidden text-slate-200 selection:bg-blue-500/30 selection:text-white" id="home">
      {/* Background Glowing Blobs matching Sleek theme */}
      <div className="glow-blob -top-40 -left-40 scale-125"></div>
      <div className="glow-blob top-[40%] right-[-10%] scale-150 opacity-60"></div>
      <div className="glow-blob -bottom-40 left-[20%] scale-125"></div>

      {/* Header bar mimicking original navbar */}
      <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4 mb-8">
        <div className="glass px-6 py-4 flex justify-between items-center bg-[#050508]/80 backdrop-blur-md">
          {/* Logo */}
          <div 
            onClick={() => scrollToSection('Home')}
            className="text-xl font-bold tracking-tighter cursor-pointer select-none hover:opacity-80 transition"
          >
            Nara<span className="text-blue-500">yan</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            {['Home', 'Projects', 'Skills', 'Services', 'Pricing', 'Track', 'Contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`transition-all duration-200 relative py-1 hover:text-white ${
                  activeTab === tab 
                    ? 'text-white font-semibold' 
                    : 'text-slate-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Interactive controls (Hiring Toggle & Call to action) */}
          <div className="hidden md:flex items-center gap-5">
            {/* Live hiring status switch */}
            <div 
              onClick={() => setIsAvailable(!isAvailable)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/5 cursor-pointer hover:border-white/10 select-none transition-all"
              title="Toggle availability simulated state"
            >
              <div className="relative w-7 h-4 bg-slate-800 rounded-full transition-colors duration-300">
                <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
                  isAvailable 
                    ? 'right-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                    : 'left-0.5 bg-rose-500'
                }`} />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {isAvailable ? 'AVAILABLE' : 'BOOKED'}
              </span>
            </div>

            <button 
              onClick={() => scrollToSection('Contact')}
              className="accent-gradient accent-gradient-hover px-5 py-2 rounded-lg text-xs font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              HIRE ME
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass mt-2 p-5 bg-[#050508]/95 backdrop-blur-lg flex flex-col gap-4">
            {['Home', 'Projects', 'Skills', 'Services', 'Pricing', 'Track', 'Contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`text-left text-sm py-2 hover:text-white ${
                  activeTab === tab ? 'text-blue-400 font-bold' : 'text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="h-[1px] bg-white/10 my-1" />
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-slate-400">Availability Status</span>
              <button 
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                  isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isAvailable ? 'Available' : 'Booked'}
              </button>
            </div>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('Contact');
              }}
              className="accent-gradient w-full py-2.5 rounded-lg text-xs font-bold text-white text-center mt-2"
            >
              HIRE ME
            </button>
          </div>
        )}
      </nav>

      {/* Main Content wrapper */}
      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Profile info, bio, secondary metrics, quick download */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Profile card and Bio component */}
          <div className="glass p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-white/[0.01] to-transparent">
            {/* Top subtle visual indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {isAvailable ? 'Hire Active' : 'Offline'}
              </span>
            </div>

            {/* Avatar container */}
            <div className="w-28 h-28 rounded-full accent-gradient p-[3px] mb-5 shadow-lg relative group">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl font-black text-white group-hover:bg-slate-800 transition duration-300 overflow-hidden">
                <img 
                  src="/src/assets/images/user_photo.jpg" 
                  alt="Narayan" 
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const currentSrc = target.src;
                    if (currentSrc.includes("/user_photo.jpg")) {
                      target.src = "/src/assets/images/cleaned_mirror_selfie_1784087641721.jpg";
                    } else if (currentSrc.includes("/cleaned_mirror_selfie_1784087641721.jpg")) {
                      target.src = "/src/assets/images/user_avatar_1784087019335.jpg";
                    }
                  }}
                />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 border-4 border-[#050508] rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                ✓
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Hi, I'm <span className="text-gradient">Narayan</span>
            </h1>
            
            <p className="text-blue-400 text-sm font-semibold mb-4 tracking-wide uppercase">
              Full Stack Web Developer
            </p>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              I build robust server systems, write performant database queries, and code beautiful client interfaces. Focused on responsive design speed, technical security, and smooth user flow layouts.
            </p>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => scrollToSection('Projects')}
                className="accent-gradient px-4 py-2.5 rounded-lg text-xs font-bold flex-1 flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/10 text-white"
              >
                <span>View Projects</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              
              <button 
                onClick={() => setIsCVModalOpen(true)}
                className="border border-slate-800 hover:border-slate-700 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-lg text-xs font-bold flex-1 flex items-center justify-center gap-1.5 transition-all text-slate-300"
              >
                <Download className="w-3 h-3 text-blue-400" />
                <span>View CV</span>
              </button>
            </div>
          </div>

          {/* Quick contact and Social Links component */}
          <div className="glass p-6 bg-gradient-to-r from-white/[0.01] to-transparent">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Contact details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-xs text-slate-300 hover:text-white transition py-1 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 transition">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Email Address</p>
                  <p className="font-medium">ccontent292@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-300 hover:text-white transition py-1 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Base Location</p>
                    <p className="font-medium">Bihar, India</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">District</p>
                    <p className="font-medium">Rohtas</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Exact Address</p>
                    <p className="font-medium text-[11px] leading-tight text-slate-300 group-hover:text-white transition">Basawan Path, Station Road, Dalmianagar</p>
                  </div>
                </div>
              </div>
              
              <div className="h-[1px] bg-white/5 my-3" />

              <div className="flex justify-around items-center pt-2">
                <a href="#github" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#linkedin" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#instagram" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Persistent Message Inbox (Saves state, allowing client to test contact form inputs) */}
          <div className="glass p-6 bg-gradient-to-r from-white/[0.01] to-transparent">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Inbox Simulator
              </h3>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                {storedMessages.length} Messages
              </span>
            </div>

            {storedMessages.length === 0 ? (
              <div className="text-center py-6 text-slate-500 bg-white/[0.01] rounded-lg border border-white/5">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-[10px]">No messages received yet.</p>
                <p className="text-[9px] text-slate-600 mt-1">Submit the contact form below to test real-time state persistence!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {storedMessages.map((msg) => (
                  <div key={msg.id} className="p-3 bg-white/5 rounded-lg border border-white/5 relative group hover:border-white/10 transition">
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 transition"
                      title="Delete message"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-[10px] font-bold text-blue-400 truncate max-w-[120px]">{msg.name}</p>
                      <span className="text-[8px] text-slate-500">• {msg.timestamp}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium mb-1 line-clamp-1">Subj: {msg.subject}</p>
                    <p className="text-[10px] text-slate-300 line-clamp-2 bg-[#050508]/40 p-1.5 rounded">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Skills, Experience, Portfolio, Services, Testimonials & Contact Form */}
        <div className="md:col-span-8 space-y-8">
          
          {/* SECTION 1: Skills & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Interactive Skills Card */}
            <div className="glass p-6 flex flex-col justify-between min-h-[380px]" id="skills">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    Core Skills 
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  </h3>
                  <span className="text-[10px] text-blue-400 tracking-widest font-bold uppercase">EXPERTISE</span>
                </div>
                
                {/* Scrollable chip layout */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.keys(skillsData).map((skillKey) => {
                    const skill = skillsData[skillKey];
                    return (
                      <button
                        key={skill.name}
                        onClick={() => setSelectedSkill(skill.name)}
                        className={`skill-chip ${selectedSkill === skill.name ? 'skill-chip-active' : ''}`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expanded active skill detail box */}
              {selectedSkill && skillsData[selectedSkill] && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-3.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white">{skillsData[selectedSkill].name}</h4>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Category: {skillsData[selectedSkill].category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-400">{skillsData[selectedSkill].proficiency}%</p>
                      <p className="text-[9px] text-slate-500 font-semibold">{skillsData[selectedSkill].years} Years Exp</p>
                    </div>
                  </div>

                  {/* Custom proficiency loading bar visualizer */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full accent-gradient rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${skillsData[selectedSkill].proficiency}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {skillsData[selectedSkill].description}
                  </p>

                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Specialized Sub-skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsData[selectedSkill].subskills.map((sub, i) => (
                        <span key={i} className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive mock code snippet preview */}
                  <div className="pt-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Usage Paradigm Sample</p>
                    <pre className="text-[9px] font-mono bg-[#050508] p-2.5 rounded-lg border border-white/5 text-slate-300 overflow-x-auto max-h-28">
                      <code>{skillsData[selectedSkill].sampleCode}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Experience timeline card */}
            <div className="glass p-6 flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
                  Professional Experience
                  <Briefcase className="w-4 h-4 text-purple-400" />
                </h3>
                
                <div className="space-y-6">
                  {/* Timeline Item 1 */}
                  <div className="border-l-2 border-blue-500 pl-4 relative group hover:border-blue-400 transition-colors">
                    <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1 group-hover:scale-125 transition" />
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-white">Senior Dev @ CloudX</h4>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">2024 - Present</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Lead development of scalable Express/React architecture. Directed cloud integrations and database tuning routines.</p>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="border-l-2 border-purple-500 pl-4 relative group hover:border-purple-400 transition-colors">
                    <div className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full -left-[6px] top-1 group-hover:scale-125 transition" />
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-white">Freelance Engineer</h4>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold">2022 - 2024</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Built multi-tenant MongoDB API frameworks, interactive CSS3 layout animations, and optimized full-stack web instances.</p>
                  </div>

                  {/* Timeline Item 3 (New additional high quality detail) */}
                  <div className="border-l-2 border-slate-700 pl-4 relative group hover:border-slate-500 transition-colors">
                    <div className="absolute w-2.5 h-2.5 bg-slate-700 rounded-full -left-[6px] top-1 group-hover:scale-125 transition" />
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-white">Junior Developer @ WebMatrix</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-bold">2020 - 2022</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Responsible for PHP integration codebases, responsive UI styling setups, and MySQL indexing optimization.</p>
                  </div>
                </div>
              </div>

              {/* Interactive micro info */}
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  B.S. in Computer Science
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-blue-400" />
                  AWS Certified Dev
                </span>
              </div>
            </div>

          </div>

          {/* SECTION 2: Selected Projects & Dynamic Sandbox simulations */}
          <div className="glass p-6" id="projects">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                Selected Portfolio Projects
                <Layers className="w-4 h-4 text-blue-400" />
              </h3>
              <p className="text-[10px] text-slate-500">Click any card to explore full features and specifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {projectsData.map((proj) => (
                <div 
                  key={proj.id}
                  onClick={() => setActiveProject(proj)}
                  className="bg-slate-900/60 rounded-xl p-4 border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 group flex flex-col justify-between"
                >
                  <div>
                    {/* Visual box resembling original portfolio mockups */}
                    <div className={`h-24 bg-gradient-to-br ${proj.gradient} rounded-lg mb-3 border border-white/5 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-white/10 transition`}>
                      <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-100 transition duration-300">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                      
                      {proj.id === 'ecommerce' && (
                        <Terminal className="w-8 h-8 text-blue-400/80 group-hover:scale-110 transition duration-300" />
                      )}
                      {proj.id === 'dashboard' && (
                        <Cpu className="w-8 h-8 text-purple-400/80 group-hover:scale-110 transition duration-300" />
                      )}
                      {proj.id === 'portfolio' && (
                        <Code className="w-8 h-8 text-indigo-400/80 group-hover:scale-110 transition duration-300" />
                      )}
                    </div>
                    
                    <h4 className="text-xs font-bold text-white mb-0.5 group-hover:text-blue-400 transition">
                      {proj.title}
                    </h4>
                    
                    <p className="text-[10px] text-blue-400 font-semibold mb-2">
                      {proj.shortDesc}
                    </p>
                    
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 mb-4">
                      {proj.longDesc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {proj.tech.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[8px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-slate-300">
                        {t}
                      </span>
                    ))}
                    {proj.tech.length > 3 && (
                      <span className="text-[8px] text-slate-500 font-bold px-1">+ {proj.tech.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sandbox Simulation Widget: Dynamic Live Terminal / Live Sales Chart */}
            <div className="mt-8 border-t border-white/5 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Live Application Sandbox
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulated E-Commerce API Endpoint Box */}
                <div className="bg-[#050508] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider">
                        E-Commerce API Console
                      </span>
                      <span className="text-[9px] text-slate-500">Mock Live Server Running</span>
                    </div>

                    <p className="text-[10px] text-slate-400 mb-3.5">
                      Interact with Narayan's live microservice. Choose an API endpoint and trigger a request to witness JSON feedback structures.
                    </p>

                    {/* Selector params */}
                    <div className="grid grid-cols-12 gap-2 mb-4">
                      <select 
                        value={terminalMethod} 
                        onChange={(e) => {
                          setTerminalMethod(e.target.value);
                          if (e.target.value === 'POST') {
                            setTerminalEndpoint('/checkout');
                          } else if (terminalEndpoint === '/checkout') {
                            setTerminalEndpoint('/products');
                          }
                        }}
                        className="col-span-3 text-[10px] bg-slate-900 border border-white/10 rounded p-1 text-slate-200 outline-none focus:border-blue-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                      
                      <select 
                        value={terminalEndpoint}
                        onChange={(e) => setTerminalEndpoint(e.target.value)}
                        className="col-span-6 text-[10px] bg-slate-900 border border-white/10 rounded p-1 text-slate-200 outline-none focus:border-blue-500"
                      >
                        {terminalMethod === 'GET' ? (
                          <>
                            <option value="/products">/api/v1/products</option>
                            <option value="/cart">/api/v1/cart</option>
                          </>
                        ) : (
                          <option value="/checkout">/api/v1/checkout</option>
                        )}
                      </select>

                      <button 
                        onClick={handleRunEndpoint}
                        disabled={terminalLoading}
                        className="col-span-3 text-[10px] accent-gradient rounded py-1 font-bold text-white disabled:opacity-55"
                      >
                        {terminalLoading ? 'Sending...' : 'SEND'}
                      </button>
                    </div>
                  </div>

                  {/* Terminal shell display */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-white/5 font-mono text-[9px] min-h-[140px] relative">
                    <div className="flex items-center gap-1.5 mb-2 border-b border-white/5 pb-1.5 text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                      <span className="ml-1 font-sans text-[8px] uppercase tracking-wider text-slate-600">Response Console</span>
                    </div>

                    {terminalLoading ? (
                      <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Connecting to Node...</span>
                        </div>
                      </div>
                    ) : null}

                    <pre className="text-emerald-400 overflow-y-auto max-h-[100px]">
                      {terminalOutput}
                    </pre>
                  </div>
                </div>

                {/* Simulated Interactive Admin Dashboard Metric Box */}
                <div className="bg-[#050508] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wider">
                        React Admin Sandbox
                      </span>
                      <span className="text-[9px] text-slate-500">Live Client Simulation</span>
                    </div>

                    <p className="text-[10px] text-slate-400 mb-3.5">
                      Toggle telemetry variables on the responsive chart. Demonstrates client state performance and layout responsiveness.
                    </p>

                    {/* Metric Selector Toggles */}
                    <div className="flex gap-2 mb-4">
                      {(['sales', 'visitors', 'conversion'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setChartMetric(m)}
                          className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded transition-all flex-1 ${
                            chartMetric === m 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Built-in high fidelity bar visualizer using HTML divs */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-3 min-h-[140px] flex flex-col justify-end">
                    <div className="flex justify-between items-end h-[70px] px-2">
                      {chartMetric === 'sales' && (
                        <>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-8 bg-blue-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Mon</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-12 bg-blue-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Tue</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-16 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Wed</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-10 bg-blue-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Thu</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-14 bg-blue-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Fri</span>
                          </div>
                        </>
                      )}
                      {chartMetric === 'visitors' && (
                        <>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-14 bg-purple-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Mon</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-8 bg-purple-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Tue</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-10 bg-purple-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Wed</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-16 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Thu</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-12 bg-purple-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Fri</span>
                          </div>
                        </>
                      )}
                      {chartMetric === 'conversion' && (
                        <>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-6 bg-emerald-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Mon</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-10 bg-emerald-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Tue</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-14 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Wed</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-12 bg-emerald-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Thu</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-5 h-16 bg-emerald-500 rounded-t-sm" />
                            <span className="text-[7px] text-slate-500">Fri</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-[8px] text-slate-500 border-t border-white/5 pt-1.5">
                      <span>Telemetry Feed</span>
                      <span className="font-bold text-slate-300">
                        {chartMetric === 'sales' && 'Total Revenue: $24,910.45 (+14%)'}
                        {chartMetric === 'visitors' && 'Total Hits: 8,321 Active Users (+22%)'}
                        {chartMetric === 'conversion' && 'Average Checkout Rate: 3.48% (+5.8%)'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION 3: Services & Interactive Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="services">
            
            {/* Services Grid Card */}
            <div className="glass p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  My Offered Services
                  <Settings className="w-4 h-4 text-purple-400" />
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-[10px] bg-white/5 p-3 rounded-xl border border-white/5 hover:border-blue-500/20 hover:bg-white/10 transition group">
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition">Web Design</h4>
                    <p className="text-[8px] text-slate-400 mt-1">High fidelity UI layouts, wireframes, styling systems, typography.</p>
                  </div>
                  
                  <div className="text-[10px] bg-white/5 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 hover:bg-white/10 transition group">
                    <h4 className="font-bold text-white group-hover:text-purple-400 transition">SEO Optimization</h4>
                    <p className="text-[8px] text-slate-400 mt-1">Page speed indexing, Core Web Vitals audit, custom markup schema.</p>
                  </div>
                  
                  <div className="text-[10px] bg-white/5 p-3 rounded-xl border border-white/5 hover:border-blue-500/20 hover:bg-white/10 transition group">
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition">API Development</h4>
                    <p className="text-[8px] text-slate-400 mt-1">Decoupled REST backends, secure payload encryptions, JWT controls.</p>
                  </div>
                  
                  <div className="text-[10px] bg-white/5 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 hover:bg-white/10 transition group">
                    <h4 className="font-bold text-white group-hover:text-purple-400 transition">Maintenance</h4>
                    <p className="text-[8px] text-slate-400 mt-1">Continuous deployments, system upgrades, security vulnerability fixes.</p>
                  </div>
                </div>
              </div>

              {/* Hire indicator quick badge */}
              <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Service SLA Guarantee:</span>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  24-Hour Responding
                </span>
              </div>
            </div>

            {/* Testimonial slider Card */}
            <div className="glass p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="text-[60px] absolute -top-5 -right-2 opacity-5 font-serif select-none">"</div>
              
              <div>
                <h3 className="text-sm font-bold mb-4">Client Testimonials</h3>
                
                {/* Active testimonial details */}
                <div className="min-h-[110px] flex flex-col justify-center">
                  <p className="text-[11px] italic text-slate-400 leading-relaxed">
                    "{testimonialsData[activeTestimonial].quote}"
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full accent-gradient p-[1px]">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {testimonialsData[activeTestimonial].avatar}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white">{testimonialsData[activeTestimonial].name}</h4>
                    <p className="text-[9px] text-blue-400 font-semibold">{testimonialsData[activeTestimonial].role}, {testimonialsData[activeTestimonial].company}</p>
                  </div>
                </div>

                {/* Slider pagination dots */}
                <div className="flex gap-1.5">
                  {testimonialsData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeTestimonial === i ? 'bg-blue-500 w-4' : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 3.5: Pricing Section */}
          <div className="space-y-6 pt-6" id="pricing">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                  💰 Transparent Pricing
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">Bespoke Website Development Packages</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                  Choose an optimized website package designed with production-grade speed, premium designs, and secure code architecture. All packages include a <strong>Free Initial Consultation Session</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormType('booking');
                  setBookingService('Free Consultation');
                  setContactSubject('Free General Consultation Request');
                  setContactMessage('Hi Narayan,\n\nI would love to schedule a free general consultation session to discuss a custom web development or API engineering project.\n\nLooking forward to speaking with you!');
                  setBookingStatusText({ type: null, message: '' });
                  scrollToSection('Contact');
                }}
                className="text-[10px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/20 px-4 py-2.5 rounded-xl font-bold text-slate-300 transition-all flex items-center gap-2 group self-start md:self-auto cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:animate-pulse" />
                <span>BOOK A FREE CONSULTATION</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1-Rupee Free Call Card */}
              <div className="glass p-6 flex flex-col justify-between hover:border-purple-500/20 bg-gradient-to-b from-purple-950/5 to-[#050508]/20 transition-all group duration-300 relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded font-bold uppercase text-purple-400">1-Rupee Call</span>
                      <h4 className="text-sm font-extrabold text-white mt-1">Free Call Plan</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-purple-400">₹1</div>
                      <div className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">Token Fee</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed min-h-[45px]">
                    Schedule a rapid 1-on-1 audio/video call to audit your website, discuss milestones, or plan custom web architecture.
                  </p>
                  <div className="h-[1px] bg-white/5" />
                  <ul className="space-y-2 text-[10px] text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>30-Min High-Value Call</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>Full Architectural Brainstorm</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>SLA & Cost Estimate Outline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>Direct WhatsApp / Meet Link</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => selectPlanForBooking('1-Rupee Free Call (₹1)', '₹1')}
                    className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 group-hover:bg-purple-600 group-hover:text-white hover:border-purple-500/20 text-xs font-bold text-slate-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Book Call (₹1 Only)</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>

              {/* Basic Website Card */}
              <div className="glass p-6 flex flex-col justify-between hover:border-blue-500/20 transition-all group duration-300 relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded font-bold uppercase text-slate-400">Basic</span>
                      <h4 className="text-sm font-extrabold text-white mt-1">Basic Website</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-blue-400">₹4,999</div>
                      <div className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">One-time payment</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed min-h-[45px]">
                    Perfect for personal brands, lightweight blogs, simple startups, and quick online launches.
                  </p>
                  <div className="h-[1px] bg-white/5" />
                  <ul className="space-y-2 text-[10px] text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>1 to 3 High-fidelity Pages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>Fully Responsive (Mobile & Desktop)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>Standard SEO (Sitemap & Meta)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>Contact Inquiry Form</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500 line-through">
                      <span>Advanced Admin Dashboard View</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => selectPlanForBooking('Basic Website (₹4,999)', '₹4,999')}
                    className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 group-hover:bg-blue-600 group-hover:text-white hover:border-blue-500/20 text-xs font-bold text-slate-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Book Free Consultation</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>

              {/* Business Website Card - Popular */}
              <div className="glass p-6 flex flex-col justify-between border-purple-500/30 hover:border-purple-500/40 bg-gradient-to-b from-purple-950/10 to-[#050508]/40 transition-all group duration-300 relative overflow-hidden shadow-lg shadow-purple-500/5">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-[7px] font-black tracking-widest uppercase py-1 px-4 rounded-bl-xl shadow-md">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded font-bold uppercase text-purple-400">Business</span>
                      <h4 className="text-sm font-extrabold text-white mt-1">Business Website</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-purple-400">₹9,999</div>
                      <div className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">One-time payment</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed min-h-[45px]">
                    Tailor-made for professional offices, consulting firms, business portfolios, and service agencies.
                  </p>
                  <div className="h-[1px] bg-purple-500/10" />
                  <ul className="space-y-2 text-[10px] text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="font-semibold text-white">Up to 10 Premium Pages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>Custom Design & Interactive Layouts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>Advanced SEO & Core Web Vitals Audited</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>Custom Scheduled Booking Forms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="text-slate-400">3 Months Dev Support</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => selectPlanForBooking('Business Website (₹9,999)', '₹9,999')}
                    className="w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600 hover:text-white text-xs font-bold text-purple-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Book Free Consultation</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>

              {/* E-commerce Website Card */}
              <div className="glass p-6 flex flex-col justify-between hover:border-blue-500/20 transition-all group duration-300 relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded font-bold uppercase text-slate-400">Enterprise</span>
                      <h4 className="text-sm font-extrabold text-white mt-1">E-commerce Website</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">₹19,999</div>
                      <div className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">One-time payment</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed min-h-[45px]">
                    A fully fledged secure online store with product directories, payment options, and administration panel.
                  </p>
                  <div className="h-[1px] bg-white/5" />
                  <ul className="space-y-2 text-[10px] text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white">Unlimited Products & Listings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Complete Cart & Checkout Workflows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Multiple Payment Gateway Integrations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Live Client Admin Control Dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-400">6 Months Dedicated Dev Support</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => selectPlanForBooking('E-commerce Website (₹19,999)', '₹19,999')}
                    className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 group-hover:bg-emerald-600 group-hover:text-white hover:border-emerald-500/20 text-xs font-bold text-slate-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Book Free Consultation</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Track Appointment */}
          <div className="glass p-6 md:p-8 relative overflow-hidden" id="track">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                  <span>Track Appointment</span>
                  <Search className="w-4 h-4 text-purple-400" />
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your Appointment ID and Phone Number to verify your schedule status instantly.
                </p>
              </div>
              <span className="text-[10px] self-start md:self-auto bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Real-time Verification
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Side */}
              <div className="lg:col-span-5 space-y-4">
                <form onSubmit={handleTrackAppointment} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Appointment ID or Project ID <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={trackAptId}
                      onChange={(e) => setTrackAptId(e.target.value)}
                      placeholder="e.g. APT-1001 or WEB-1001"
                      className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-purple-500 focus:bg-slate-900 transition-all text-slate-200 uppercase font-mono tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-purple-500 focus:bg-slate-900 transition-all text-slate-200"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={trackLoading}
                    className="accent-gradient accent-gradient-hover w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50"
                  >
                    {trackLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>VERIFYING...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>TRACK STATUS</span>
                      </>
                    )}
                  </button>
                </form>

                {trackError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-lg text-xs flex items-start gap-2 animate-fadeIn">
                    <div className="w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]">!</div>
                    <p className="text-[10px] leading-relaxed">{trackError}</p>
                  </div>
                )}
              </div>

              {/* Status Display Side */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {trackResult ? (
                  <div className="bg-slate-950/80 border border-white/5 p-5 md:p-6 rounded-xl space-y-4 animate-fadeIn relative overflow-hidden">
                    {/* Visual glowing highlight */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[8px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded font-mono font-bold tracking-wider text-purple-400 uppercase">
                          MATCH FOUND
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-1">Appointment Details</h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded border border-white/5">
                        {trackResult.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status */}
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          Current Status
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            trackResult.status === 'confirmed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            trackResult.status === 'completed' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                            trackResult.status === 'cancelled' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          }`} />
                          <span className={`text-xs font-extrabold capitalize ${
                            trackResult.status === 'confirmed' ? 'text-emerald-400' :
                            trackResult.status === 'completed' ? 'text-blue-400' :
                            trackResult.status === 'cancelled' ? 'text-rose-400' :
                            'text-amber-400'
                          }`}>
                            {trackResult.status}
                          </span>
                        </div>
                      </div>

                      {/* Project Type */}
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          Project Type
                        </span>
                        <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{trackResult.projectType || 'Free Consultation'}</span>
                        </div>
                      </div>

                      {/* Booking Date */}
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          Booking Date & Slot
                        </span>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{trackResult.date} at {trackResult.time}</span>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          Package Budget
                        </span>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="text-sm font-extrabold">{trackResult.budget || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Project tracking details if available */}
                      {trackResult.projectId && (
                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg space-y-3.5 md:col-span-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <span className="text-[8px] bg-purple-950/80 border border-purple-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-wider text-purple-400 uppercase">
                                PROJECT TRACKING
                              </span>
                              <div className="text-xs font-bold text-white mt-1 flex items-center gap-1.5">
                                <span>Project ID:</span>
                                <span className="text-purple-400 font-mono text-sm tracking-wider">{trackResult.projectId}</span>
                              </div>
                            </div>
                            <div className="text-right md:text-right">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                                Project Status
                              </span>
                              <span className="text-xs font-extrabold text-purple-300 capitalize">
                                {trackResult.projectStatus || 'Project Received'}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1.5 border-b border-white/5 pb-3">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-semibold">Development Progress</span>
                              <span className="text-purple-400 font-mono font-bold">{trackResult.progress ?? 0}%</span>
                            </div>
                            <div className="w-full bg-slate-900 border border-white/5 rounded-full h-2 relative overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${trackResult.progress ?? 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Additional Supabase Custom Tracking Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-left">
                            {/* Current Work */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                                Current Active Task
                              </span>
                              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                                {trackResult.currentWork || 'N/A'}
                              </p>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                                Estimated Delivery
                              </span>
                              <p className="text-xs text-purple-300 font-bold font-mono">
                                {trackResult.estimatedDelivery || 'TBD'}
                              </p>
                            </div>

                            {/* Developer Notes */}
                            <div className="md:col-span-2 space-y-1 bg-slate-950/50 p-2.5 rounded border border-white/5">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                                Lead Architect / Developer Notes
                              </span>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">
                                {trackResult.developerNotes || 'No developer notes released yet.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/5 p-8 rounded-xl text-center space-y-2">
                    <div className="w-10 h-10 bg-slate-950 border border-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Awaiting Tracking Parameters</p>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Enter your Appointment ID and Phone Number on the left to securely retrieve status information from our live database.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: Contact Form with State Persistence */}
          <div className="glass p-6 md:p-8 relative overflow-hidden" id="contact">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {formType === 'brief' ? 'Initiate a Project' : 'Book an Appointment'}
                  {formType === 'brief' ? (
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Calendar className="w-4 h-4 text-purple-400" />
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {formType === 'brief' 
                    ? 'Have an application outline ready? Input details below and submit.' 
                    : 'Schedule a structured consulting or engineering service session with Narayan.'}
                </p>
              </div>
              <span className="text-[10px] self-start md:self-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                {formType === 'brief' ? 'Local Persistence Store' : 'Supabase Database Live API'}
              </span>
            </div>

            {/* Elegant Tab Switcher for Form Type */}
            <div className="flex gap-2 p-1 bg-slate-950/80 border border-white/5 rounded-xl mb-6 max-w-xs">
              <button 
                type="button"
                onClick={() => { setFormType('brief'); setBookingStatusText({ type: null, message: '' }); }}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formType === 'brief' 
                    ? 'bg-blue-500/10 border border-blue-500/25 text-blue-400 font-extrabold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>INQUIRY</span>
              </button>
              
              <button 
                type="button"
                onClick={() => { setFormType('booking'); setBookingStatusText({ type: null, message: '' }); }}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formType === 'booking' 
                    ? 'bg-purple-500/10 border border-purple-500/25 text-purple-400 font-extrabold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>APPOINTMENT</span>
              </button>
            </div>

            {submittedMessage && formType === 'brief' && (
              <div className="mb-4 p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                <div className="w-5 h-5 bg-emerald-500 text-[#050508] rounded-full flex items-center justify-center font-bold">✓</div>
                <div>
                  <p className="font-bold">Message Submitted Successfully!</p>
                  <p className="text-[10px] text-emerald-400/80">Your mock entry was stored in the client-side state and saved in localStorage. Check the 'Inbox Simulator' in the sidebar!</p>
                </div>
              </div>
            )}

            {bookingStatusText.type === 'success' && (
              <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex flex-col gap-3.5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-emerald-500 text-[#050508] rounded-full flex items-center justify-center font-bold text-xs">✓</div>
                  <p className="font-extrabold text-sm text-emerald-400">✅ Appointment Booked Successfully</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookedId && (
                    <div className="bg-slate-950/80 border border-white/5 p-4 rounded-lg flex flex-col gap-1.5">
                      <p className="text-xs text-slate-300 font-medium">Appointment ID: <strong className="text-emerald-400 text-sm font-mono tracking-wider">{bookedId}</strong></p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Please save this Appointment ID for future reference.</p>
                    </div>
                  )}
                  {bookedProjectId && (
                    <div className="bg-slate-950/80 border border-white/5 p-4 rounded-lg flex flex-col gap-1.5">
                      <p className="text-xs text-slate-300 font-medium">Project ID: <strong className="text-purple-400 text-sm font-mono tracking-wider">{bookedProjectId}</strong></p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Please save this Project ID for tracking your project status and progress.</p>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-emerald-400/80 leading-relaxed font-medium">
                  {bookingStatusText.message}
                </p>
              </div>
            )}

            {bookingStatusText.type === 'error' && (
              <div className="mb-4 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">!</div>
                <div>
                  <p className="font-bold">Submission Error</p>
                  <p className="text-[10px] text-rose-400/80">{bookingStatusText.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={formType === 'brief' ? handleSubmitContact : handleSubmitAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Cooper"
                    className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="cooper@techflow.io"
                    className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200"
                  />
                </div>
              </div>

              {formType === 'booking' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number <span className="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 9876543210 (10 to 15 digits)"
                    className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-purple-500 focus:bg-slate-900 transition-all text-slate-200"
                  />
                </div>
              )}

              {formType === 'booking' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Selected <span className="text-rose-500">*</span></label>
                    <select
                      value={bookingService}
                      onChange={(e) => setBookingService(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200"
                    >
                      <option value="Free Consultation">Free Consultation</option>
                      <option value="1-Rupee Free Call (₹1)">1-Rupee Free Call (₹1)</option>
                      <option value="Basic Website (₹4,999)">Basic Website (₹4,999)</option>
                      <option value="Business Website (₹9,999)">Business Website (₹9,999)</option>
                      <option value="E-commerce Website (₹19,999)">E-commerce Website (₹19,999)</option>
                      <option value="API Development">API Development</option>
                      <option value="Web Design">Web Design</option>
                      <option value="SEO Optimization">SEO Optimization</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desired Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Time Slot <span className="text-rose-500">*</span></label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200"
                    >
                      <option value="09:00">09:00 AM (Early Session)</option>
                      <option value="10:30">10:30 AM (Morning Session)</option>
                      <option value="14:00">02:00 PM (Afternoon Session)</option>
                      <option value="15:30">03:30 PM (Late Afternoon)</option>
                      <option value="17:00">05:00 PM (Evening Session)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder={formType === 'brief' ? 'E-Commerce API design requirement' : `Consultation on ${bookingService}`}
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {formType === 'brief' ? 'Project Specification / message' : 'Appointment Objectives / Details'} <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={formType === 'brief' 
                    ? "Describe your system requirements, required tech stack integration parameters, and estimated delivery milestones..."
                    : "Please list any specific challenges, repository architecture overviews, or endpoints you wish to address during our consultation..."}
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-slate-200 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="accent-gradient accent-gradient-hover w-full py-3 rounded-lg text-xs font-bold text-white transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
              >
                {formType === 'brief' ? (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND PROJECT BRIEF</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>CONFIRM & BOOK APPOINTMENT</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </main>

      {/* Footer conforming to design layout */}
      <footer className="mt-12 text-center text-[10px] text-slate-500 max-w-7xl mx-auto px-4 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          Copyright © 2026 Narayan | Designed for Modern High Performance Web
        </div>
        <div className="flex items-center gap-4 text-[9px] text-slate-600">
          <button 
            onClick={() => setIsAdminPortalOpen(true)}
            className="text-slate-500 hover:text-blue-400 transition flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3 h-3" />
            <span>Admin Portal</span>
          </button>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1.5">
            <span>Engineered with React 19 & Tailwind CSS v4</span>
            <Heart className="w-3 h-3 text-rose-500" />
          </span>
        </div>
      </footer>

      {/* MODAL 1: PROJECT DETAIL OVERLAY */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass max-w-2xl w-full bg-[#050508]/95 overflow-hidden border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Close button */}
            <button 
              onClick={() => setActiveProject(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Custom top cover visual */}
            <div className={`h-40 bg-gradient-to-br ${activeProject.gradient} p-6 flex flex-col justify-end relative border-b border-white/5`}>
              <span className="text-[9px] bg-white/10 text-white border border-white/10 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest self-start mb-2">
                Project Profile
              </span>
              <h2 className="text-2xl font-black text-white">{activeProject.title}</h2>
              <p className="text-xs text-blue-300 font-semibold">{activeProject.shortDesc}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{activeProject.longDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Role</h4>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                    <p className="text-xs font-bold text-white">{activeProject.role}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Author of core logical services, payload decoders, and architecture integration.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Tech Stack Frameworks</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeProject.tech.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-md font-semibold font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Technical Capabilities</h4>
                <div className="space-y-2">
                  {activeProject.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-slate-300 leading-normal">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal footer with actions */}
            <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setActiveProject(null)}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2 transition"
              >
                Close View
              </button>
              
              <button 
                onClick={() => {
                  setActiveProject(null);
                  scrollToSection('Contact');
                }}
                className="accent-gradient px-5 py-2 rounded-lg text-xs font-bold text-white transition-all transform hover:scale-105"
              >
                Inquire Project Integration
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE CV OVERLAY */}
      {isCVModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass max-w-2xl w-full bg-[#050508]/95 overflow-hidden border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            <button 
              onClick={() => setIsCVModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5"
              title="Close CV"
            >
              <X className="w-4 h-4" />
            </button>

            {/* CV Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-blue-950 to-purple-950 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Narayan</h2>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-0.5">Full Stack Web Developer</p>
                <p className="text-[10px] text-slate-400 mt-2">New York, USA | hello@narayan.dev</p>
              </div>
              <div className="flex gap-2">
                <a 
                  href="#download-cv"
                  onClick={(e) => { e.preventDefault(); alert("CV Download started simulated (PDF format)."); }}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {/* CV Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-slate-300">
              
              <div className="space-y-2">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Professional Profile Summary
                </h3>
                <p className="leading-relaxed">
                  Versatile Full Stack Web Developer with 5+ years of production experience in designing optimized server environments and modern client frameworks. Architect of secured headless APIs and complex database indexing schemas. Passionate about web access speeds, code modularity, and responsive layout interfaces.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Detailed Work Experience
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-bold text-white text-xs">
                      <span>Senior Developer | CloudX Inc.</span>
                      <span className="text-blue-400">2024 - Present</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 mt-1.5 text-slate-400 leading-normal">
                      <li>Designed and integrated decoupled React and Express server-side instances, increasing payload delivery speeds by 30%.</li>
                      <li>Architected AWS deployment configurations with automated Docker CI/CD pipelines.</li>
                      <li>Supervised a team of junior engineers regarding responsive styling methodologies and clean Git standards.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-white text-xs">
                      <span>Full Stack Consultant | Independent Freelance</span>
                      <span className="text-purple-400">2022 - 2024</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 mt-1.5 text-slate-400 leading-normal">
                      <li>Engineered 12+ client apps using tailored MongoDB and Node microservice networks.</li>
                      <li>Coded bespoke booking systems with Stripe pay integrations and transactional user email feedback models.</li>
                      <li>Integrated Tailwind CSS layouts featuring pixel-perfect mobile-first configurations.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    Key Core Strengths
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 font-semibold text-[10px]">
                    <div>• RESTful Backend Design</div>
                    <div>• MongoDB Aggregations</div>
                    <div>• React State Orchestration</div>
                    <div>• SQL Query Optimization</div>
                    <div>• Version Control (Git)</div>
                    <div>• Tailwind Utility Framework</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    Academic Achievements
                  </h3>
                  <p className="font-bold text-white text-[10px]">B.S. in Computer Science & Engineering</p>
                  <p className="text-slate-400 text-[10px]">Stony Brook University, New York | GPA 3.8/4.0</p>
                  <p className="text-slate-500 text-[9px] mt-1">• Outstanding Graduate Award, Dean's List (all semesters)</p>
                </div>
              </div>

            </div>

            {/* CV Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-end shrink-0">
              <button 
                onClick={() => setIsCVModalOpen(false)}
                className="accent-gradient px-6 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110"
              >
                Close CV Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: SECURE ADMIN PORTAL & APPOINTMENT DASHBOARD */}
      {isAdminPortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass max-w-5xl w-full bg-[#050508]/95 overflow-hidden border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Close button */}
            <button 
              onClick={() => { setIsAdminPortalOpen(false); setEditingAppointment(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 cursor-pointer z-10"
              title="Close Portal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Custom high contrast top banner */}
            <div className="p-6 bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-[#050508] border-b border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
              <div>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest self-start mb-1.5 flex items-center gap-1.5 w-fit">
                  <Shield className="w-3 h-3" />
                  Security Enforced Admin Access
                </span>
                <h2 className="text-xl font-black text-white">Narayan Consulting Portal</h2>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">
                  {adminToken ? `Active Session: ${adminDbStatus?.adminUsername || 'admin'}` : 'Verify developer access token parameters'}
                </p>
              </div>

              {adminToken && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Database Linkage</p>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      adminDbStatus?.isFallback 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      ● {adminDbStatus?.dbType || 'Checking...'}
                    </span>
                  </div>
                  <button 
                    onClick={handleAdminLogout}
                    className="bg-rose-500/15 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              {adminErrorMsg && (
                <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
                  <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold font-mono shrink-0">!</span>
                  <div className="flex-1">
                    <p className="font-bold">System Warning</p>
                    <p className="text-[10px] text-rose-400/80">{adminErrorMsg}</p>
                  </div>
                  <button onClick={() => setAdminErrorMsg('')} className="text-slate-400 hover:text-white font-bold px-1.5">✕</button>
                </div>
              )}

              {/* VIEW 1: LOGIN FORM (If not logged in) */}
              {!adminToken ? (
                <div className="max-w-md mx-auto my-8 space-y-6">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 md:p-8 space-y-5">
                    <div className="text-center space-y-1.5">
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Enter Portal Security Credentials</h3>
                      <p className="text-[10px] text-slate-500">Sign in to manage and manipulate Live database bookings.</p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. admin"
                          value={adminUsernameInput}
                          onChange={(e) => setAdminUsernameInput(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-purple-500 focus:bg-slate-900 transition-all text-slate-200"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secret Password</label>
                        <input 
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none focus:border-purple-500 focus:bg-slate-900 transition-all text-slate-200"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isAdminSubmitting}
                        className="accent-gradient w-full py-3 rounded-lg text-xs font-bold text-white transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50"
                      >
                        {isAdminSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>AUTHENTICATING SECURELY...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>VERIFY AND DECRYPT PORTAL</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Dev Sandbox Credentials Box */}
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-xs space-y-1.5">
                    <p className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Sandbox Developer Note
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      The admin panel connects to Node + Supabase backend endpoints. Use the configured sandbox values to log in immediately:
                    </p>
                    <div className="bg-slate-950/80 p-2 rounded border border-white/5 font-mono text-[9px] text-slate-300 space-y-0.5">
                      <p>Username: <span className="text-blue-400">admin</span></p>
                      <p>Password: <span className="text-blue-400">admin_secure_password</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW 2: LOGGED IN APPOINTMENT DASHBOARD */
                <div className="space-y-6">
                  
                  {/* METRIC BADGES GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Total Bookings</p>
                      <p className="text-xl font-black text-white mt-1">{adminAppointments.length}</p>
                    </div>
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-purple-400 uppercase font-bold tracking-widest">Pending</p>
                      <p className="text-xl font-black text-purple-400 mt-1">
                        {adminAppointments.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-emerald-400 uppercase font-bold tracking-widest">Confirmed</p>
                      <p className="text-xl font-black text-emerald-400 mt-1">
                        {adminAppointments.filter(a => a.status === 'confirmed').length}
                      </p>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-blue-400 uppercase font-bold tracking-widest">Completed</p>
                      <p className="text-xl font-black text-blue-400 mt-1">
                        {adminAppointments.filter(a => a.status === 'completed').length}
                      </p>
                    </div>
                  </div>

                  {/* ACTIVE EDIT PANEL BLOCK */}
                  {editingAppointment && (
                    <div className="bg-white/5 border border-blue-500/30 p-5 rounded-2xl space-y-4 animate-slideIn">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-400" />
                          Edit Appointment Parameters: #{editingAppointment.id}
                        </h4>
                        <button 
                          onClick={() => setEditingAppointment(null)}
                          className="text-slate-500 hover:text-white font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Client Name</label>
                          <input 
                            type="text"
                            value={editingAppointment.name}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, name: e.target.value })}
                            className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Client Email</label>
                          <input 
                            type="email"
                            value={editingAppointment.email}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, email: e.target.value })}
                            className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Booking Status</label>
                          <select 
                            value={editingAppointment.status}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as any })}
                            className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                          >
                            <option value="pending">Pending Review</option>
                            <option value="confirmed">Confirmed / Slot Held</option>
                            <option value="completed">Completed Successfully</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Selected Service</label>
                          <select 
                            value={editingAppointment.service}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, service: e.target.value })}
                            className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                          >
                            <option value="API Development">API Development</option>
                            <option value="Web Design">Web Design</option>
                            <option value="SEO Optimization">SEO Optimization</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Booking Date</label>
                          <input 
                            type="date"
                            value={editingAppointment.date}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                            className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Selected Time Slot</label>
                          <select 
                            value={editingAppointment.time}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                            className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                          >
                            <option value="09:00">09:00 AM</option>
                            <option value="10:30">10:30 AM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="15:30">03:30 PM</option>
                            <option value="17:00">05:00 PM</option>
                          </select>
                        </div>
                      </div>

                      {/* Project Tracking Parameters */}
                      <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-3">
                        <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider">Project Tracking & Progress Controls</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Project ID</label>
                            <input 
                              type="text"
                              value={editingAppointment.projectId || ''}
                              onChange={(e) => setEditingAppointment({ ...editingAppointment, projectId: e.target.value })}
                              placeholder="e.g. WEB-1001"
                              className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200 uppercase font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Project Status</label>
                            <input 
                              type="text"
                              value={editingAppointment.projectStatus || ''}
                              onChange={(e) => setEditingAppointment({ ...editingAppointment, projectStatus: e.target.value })}
                              placeholder="e.g. Project Received"
                              className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Development Progress ({editingAppointment.progress ?? 0}%)</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                value={editingAppointment.progress ?? 0}
                                onChange={(e) => setEditingAppointment({ ...editingAppointment, progress: parseInt(e.target.value, 10) })}
                                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                value={editingAppointment.progress ?? 0}
                                onChange={(e) => setEditingAppointment({ ...editingAppointment, progress: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                                className="w-14 text-xs bg-slate-950 border border-white/5 rounded p-1 outline-none text-slate-200 text-center font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Supabase Fields (current_work, estimated_delivery, developer_notes) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Current Active Task (current_work)</label>
                            <input 
                              type="text"
                              value={editingAppointment.currentWork || ''}
                              onChange={(e) => setEditingAppointment({ ...editingAppointment, currentWork: e.target.value })}
                              placeholder="e.g. Setting up DB and endpoints"
                              className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Estimated Delivery (estimated_delivery)</label>
                            <input 
                              type="text"
                              value={editingAppointment.estimatedDelivery || ''}
                              onChange={(e) => setEditingAppointment({ ...editingAppointment, estimatedDelivery: e.target.value })}
                              placeholder="e.g. 2026-08-01"
                              className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                            />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Developer Notes (developer_notes)</label>
                            <textarea 
                              rows={2}
                              value={editingAppointment.developerNotes || ''}
                              onChange={(e) => setEditingAppointment({ ...editingAppointment, developerNotes: e.target.value })}
                              placeholder="Describe developer notes or recent tasks completed..."
                              className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200 font-mono resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">Subject Line</label>
                        <input 
                          type="text"
                          value={editingAppointment.subject}
                          onChange={(e) => setEditingAppointment({ ...editingAppointment, subject: e.target.value })}
                          className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">Inquiry Objectives Description</label>
                        <textarea 
                          rows={3}
                          value={editingAppointment.message}
                          onChange={(e) => setEditingAppointment({ ...editingAppointment, message: e.target.value })}
                          className="w-full text-xs bg-slate-950 border border-white/5 rounded-lg p-2.5 outline-none text-slate-200 resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          onClick={() => setEditingAppointment(null)}
                          className="bg-white/5 border border-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold text-slate-400 transition cursor-pointer"
                        >
                          Cancel Changes
                        </button>
                        <button 
                          onClick={() => handleUpdateAppointment(editingAppointment.id, editingAppointment)}
                          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-xs font-bold text-white transition cursor-pointer font-extrabold"
                        >
                          Save Parameters
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DATA TABLE CONTAINER */}
                  <div className="bg-slate-950/60 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Live Booked Sessions Directory
                      </h4>
                      <button 
                        onClick={() => adminToken && fetchAdminData(adminToken)}
                        title="Reload directory data"
                        className="w-7 h-7 bg-white/5 border border-white/5 hover:bg-white/10 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {adminAppointments.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 space-y-2">
                        <Calendar className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                        <p className="text-xs">No active appointments stored in the database.</p>
                        <p className="text-[10px] text-slate-600">Users who schedule sessions via the Appointment tab will be cataloged here in real-time.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left border-collapse">
                          <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                              <th className="p-4">Client Detail</th>
                              <th className="p-4">Service Profile</th>
                              <th className="p-4">Scheduled Slot</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Database Operations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {adminAppointments.map((app) => (
                              <tr key={app.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="p-4">
                                  <p className="font-extrabold text-white text-xs">{app.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{app.email}</p>
                                  {app.phone && (
                                    <p className="text-[9px] text-purple-400 font-mono mt-0.5">Phone: {app.phone}</p>
                                  )}
                                </td>
                                <td className="p-4">
                                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {app.projectType || app.service || 'Consultation'}
                                  </span>
                                  <p className="text-[10px] text-slate-300 font-medium mt-1">
                                    Budget: <span className="text-emerald-400 font-bold">{app.budget || 'Free Consultation'}</span>
                                  </p>
                                  {app.projectId && (
                                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                                        {app.projectId}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-bold">
                                        {app.projectStatus || 'Project Received'}
                                      </span>
                                      <span className="text-[9px] text-purple-400 font-mono">
                                        ({app.progress ?? 0}%)
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <p className="font-bold text-white font-mono flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {app.date}
                                  </p>
                                  <p className="text-slate-400 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {app.time} slot
                                  </p>
                                </td>
                                <td className="p-4">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                    app.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                                    app.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' :
                                    app.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse'
                                  }`}>
                                    {app.status === 'pending' ? 'Pending Review' : app.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="inline-flex gap-2.5">
                                    <button 
                                      onClick={() => setEditingAppointment(app)}
                                      className="bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 text-slate-300 hover:text-blue-400 text-[10px] font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteAppointment(app.id)}
                                      className="bg-rose-500/5 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 px-2 rounded transition flex items-center justify-center cursor-pointer"
                                      title="Delete Session"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CV Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-end shrink-0">
              <button 
                onClick={() => { setIsAdminPortalOpen(false); setEditingAppointment(null); }}
                className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-lg text-xs font-bold text-slate-400 transition cursor-pointer"
              >
                Close Portal Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
