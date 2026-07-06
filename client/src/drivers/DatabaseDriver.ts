// Database Driver for LaborLink
// Dual-driver setup: utilizes localStorage and BroadcastChannel for local/offline mock testing.
// Also reads from process.env if Supabase configuration is present.

export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  village?: string;
  pinCode: string;
  address?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  profilePhoto: string;
  phone: string;
  whatsapp: string;
  email?: string;
  languages: string[];
  education?: string;
  primarySkill: string;
  experience: number;
  expectedWage: number;
  availableHours: string;
  description: string;
  portfolioPhotos: string[];
  certifications?: string[];
  location: LocationData;
  availabilityStatus: 'Available' | 'Busy' | 'Already Hired';
  isVerified: boolean;
  isGroup: boolean;
  rating: number;
  groupDetails?: {
    groupName: string;
    totalMembers: number;
  };
}

export interface JobRequest {
  id: string;
  workerId: string;
  hirerId: string;
  hirerName: string;
  hirerPhone: string;
  description: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  expectedWage: number;
  createdAt: string;
}

export interface Review {
  id: string;
  workerId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  userRole: 'labor' | 'hirer' | 'admin';
  message: string;
  type: 'job_request' | 'hire_confirmation' | 'availability_reminder' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface UserReport {
  id: string;
  workerId: string;
  workerName: string;
  reason: string;
  reporterName: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
}

// Initial Mock Workers Data (around Hyderabad/Telangana)
const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: "w1",
    name: "Ramesh Kumar",
    gender: "Male",
    age: 34,
    profilePhoto: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ramesh.carpenter@gmail.com",
    languages: ["Telugu", "Hindi"],
    education: "10th Pass",
    primarySkill: "Carpenter",
    experience: 8,
    expectedWage: 800,
    availableHours: "08:00 AM - 06:00 PM",
    description: "Expert in home wood furniture repairing, modular kitchen work, door fittings, and wooden wardrobe construction.",
    portfolioPhotos: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300"
    ],
    location: {
      lat: 17.385044,
      lng: 78.486671,
      city: "Hyderabad",
      state: "Telangana",
      village: "Koti",
      pinCode: "500095",
      address: "Near Koti Bus Stop, Hyderabad"
    },
    availabilityStatus: "Available",
    isVerified: true,
    isGroup: false,
    rating: 4.8
  },
  {
    id: "w2",
    name: "Saraswathi Reddy",
    gender: "Female",
    age: 29,
    profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    phone: "9123456789",
    whatsapp: "9123456789",
    email: "saraswathi.clean@gmail.com",
    languages: ["Telugu", "English"],
    primarySkill: "House Cleaner",
    experience: 4,
    expectedWage: 500,
    availableHours: "07:00 AM - 04:00 PM",
    description: "Reliable household cleaning, deep disinfection, kitchen cleanup, and laundry services. Trustworthy and detail-oriented.",
    portfolioPhotos: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"
    ],
    location: {
      lat: 17.4025,
      lng: 78.4412,
      city: "Hyderabad",
      state: "Telangana",
      village: "Banjara Hills",
      pinCode: "500034",
      address: "Road No. 12, Banjara Hills"
    },
    availabilityStatus: "Available",
    isVerified: true,
    isGroup: false,
    rating: 4.5
  },
  {
    id: "w3",
    name: "Mohammad Ali",
    gender: "Male",
    age: 41,
    profilePhoto: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150",
    phone: "8888777766",
    whatsapp: "8888777766",
    languages: ["Hindi", "Telugu", "English"],
    primarySkill: "Electrician",
    experience: 12,
    expectedWage: 950,
    availableHours: "24 Hours (Emergency)",
    description: "Expert in house wiring, board repair, short circuit fixes, and electronic appliance installation (AC, TV, Geyser).",
    portfolioPhotos: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300"
    ],
    location: {
      lat: 17.4375,
      lng: 78.4482,
      city: "Hyderabad",
      state: "Telangana",
      village: "Ameerpet",
      pinCode: "500016",
      address: "Opposite Satyam Theatre, Ameerpet"
    },
    availabilityStatus: "Available",
    isVerified: true,
    isGroup: false,
    rating: 4.9
  },
  {
    id: "w4",
    name: "Reddy Painting Team",
    gender: "Male",
    age: 38,
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    phone: "7777666655",
    whatsapp: "7777666655",
    languages: ["Telugu", "Hindi"],
    primarySkill: "Painter",
    experience: 10,
    expectedWage: 4500,
    availableHours: "08:30 AM - 05:30 PM",
    description: "Professional painting crew of 6 members. Interior, exterior, texture painting, wall putty work, and waterproofing specialists.",
    portfolioPhotos: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300"
    ],
    location: {
      lat: 17.3616,
      lng: 78.4746,
      city: "Hyderabad",
      state: "Telangana",
      village: "Charminar Area",
      pinCode: "500002",
      address: "Near Charminar Historical Gate, Hyderabad"
    },
    availabilityStatus: "Available",
    isVerified: true,
    isGroup: true,
    groupDetails: {
      groupName: "Reddy Painting Team",
      totalMembers: 6
    },
    rating: 4.7
  },
  {
    id: "w5",
    name: "Balakrishna Plumber",
    gender: "Male",
    age: 45,
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    phone: "9900887766",
    whatsapp: "9900887766",
    languages: ["Telugu"],
    primarySkill: "Plumber",
    experience: 15,
    expectedWage: 750,
    availableHours: "08:00 AM - 07:00 PM",
    description: "Expert leak detection, pipe fitting, sanitary installations, water tank repair, and bathroom block cleaning.",
    portfolioPhotos: [],
    location: {
      lat: 17.4855,
      lng: 78.3885,
      city: "Hyderabad",
      state: "Telangana",
      village: "Kukatpally",
      pinCode: "500072",
      address: "JNTU Road, Kukatpally"
    },
    availabilityStatus: "Busy",
    isVerified: false,
    isGroup: false,
    rating: 4.2
  }
];

// Initialize Storage if empty
const initDB = () => {
  if (!localStorage.getItem('laborlink_workers')) {
    localStorage.setItem('laborlink_workers', JSON.stringify(INITIAL_WORKERS));
  }
  if (!localStorage.getItem('laborlink_job_requests')) {
    localStorage.setItem('laborlink_job_requests', JSON.stringify([]));
  }
  if (!localStorage.getItem('laborlink_notifications')) {
    localStorage.setItem('laborlink_notifications', JSON.stringify([]));
  }
  if (!localStorage.getItem('laborlink_reports')) {
    localStorage.setItem('laborlink_reports', JSON.stringify([]));
  }
  if (!localStorage.getItem('laborlink_reviews')) {
    // Add default reviews
    const defaultReviews: Review[] = [
      { id: "rev1", workerId: "w1", rating: 5, comment: "Ramesh built a beautiful TV cabinet for us. Highly recommended!", reviewerName: "Kalyan V.", createdAt: new Date().toISOString() },
      { id: "rev2", workerId: "w1", rating: 4, comment: "Punctual and very skilled worker.", reviewerName: "Geeta S.", createdAt: new Date().toISOString() },
      { id: "rev3", workerId: "w2", rating: 5, comment: "Spotless cleaning! She cleaned the entire kitchen and living room perfectly.", reviewerName: "Ananya Rao", createdAt: new Date().toISOString() },
      { id: "rev4", workerId: "w3", rating: 5, comment: "Emergency call answered in 20 minutes! Solved main board wiring issue.", reviewerName: "Prasad Rao", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('laborlink_reviews', JSON.stringify(defaultReviews));
  }
};

initDB();

// Setup BroadcastChannel for Realtime events across browser tabs
const channel = new BroadcastChannel('laborlink_realtime');

const triggerRealtimeUpdate = (type: string, data: any) => {
  channel.postMessage({ type, data });
  // Also dispatch a custom event for the same tab
  window.dispatchEvent(new CustomEvent('laborlink_db_update', { detail: { type, data } }));
};

export const DatabaseDriver = {
  // Subscribe to real-time database updates
  subscribe: (callback: (event: { type: string; data: any }) => void) => {
    const handleMessage = (e: MessageEvent) => callback(e.data);
    const handleLocalUpdate = (e: Event) => callback((e as CustomEvent).detail);

    channel.addEventListener('message', handleMessage);
    window.addEventListener('laborlink_db_update', handleLocalUpdate);

    return () => {
      channel.removeEventListener('message', handleMessage);
      window.removeEventListener('laborlink_db_update', handleLocalUpdate);
    };
  },

  // ---------------- WORKERS & GROUPS API ----------------

  getWorkers: (): WorkerProfile[] => {
    const data = localStorage.getItem('laborlink_workers');
    return data ? JSON.parse(data) : [];
  },

  getWorkerById: (id: string): WorkerProfile | undefined => {
    return DatabaseDriver.getWorkers().find(w => w.id === id);
  },

  registerWorker: (worker: Omit<WorkerProfile, 'id' | 'availabilityStatus' | 'isVerified' | 'rating'>): WorkerProfile => {
    const workers = DatabaseDriver.getWorkers();
    const newWorker: WorkerProfile = {
      ...worker,
      id: `w-${Date.now()}`,
      availabilityStatus: 'Available',
      isVerified: false, // Must be approved by admin
      rating: 5.0
    };

    workers.push(newWorker);
    localStorage.setItem('laborlink_workers', JSON.stringify(workers));
    triggerRealtimeUpdate('WORKER_REGISTERED', newWorker);
    return newWorker;
  },

  updateWorkerAvailability: (workerId: string, status: 'Available' | 'Busy' | 'Already Hired'): boolean => {
    const workers = DatabaseDriver.getWorkers();
    const index = workers.findIndex(w => w.id === workerId);
    if (index === -1) return false;

    workers[index].availabilityStatus = status;
    localStorage.setItem('laborlink_workers', JSON.stringify(workers));
    triggerRealtimeUpdate('WORKER_STATUS_UPDATED', { workerId, status });
    return true;
  },

  updateWorkerVerification: (workerId: string, isVerified: boolean): boolean => {
    const workers = DatabaseDriver.getWorkers();
    const index = workers.findIndex(w => w.id === workerId);
    if (index === -1) return false;

    workers[index].isVerified = isVerified;
    localStorage.setItem('laborlink_workers', JSON.stringify(workers));
    triggerRealtimeUpdate('WORKER_VERIFICATION_UPDATED', { workerId, isVerified });
    return true;
  },

  deleteWorker: (workerId: string): boolean => {
    let workers = DatabaseDriver.getWorkers();
    const exists = workers.some(w => w.id === workerId);
    if (!exists) return false;

    workers = workers.filter(w => w.id !== workerId);
    localStorage.setItem('laborlink_workers', JSON.stringify(workers));
    triggerRealtimeUpdate('WORKER_DELETED', { workerId });
    return true;
  },

  // ---------------- HIRING FLOW / JOB REQUESTS ----------------

  getJobRequests: (): JobRequest[] => {
    const data = localStorage.getItem('laborlink_job_requests');
    return data ? JSON.parse(data) : [];
  },

  createJobRequest: (workerId: string, hirerName: string, hirerPhone: string, description: string, expectedWage: number): JobRequest => {
    const requests = DatabaseDriver.getJobRequests();
    const newRequest: JobRequest = {
      id: `job-${Date.now()}`,
      workerId,
      hirerId: `hirer-${Date.now()}`, // Temporary hirer ID
      hirerName,
      hirerPhone,
      description,
      status: 'Pending',
      expectedWage,
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    localStorage.setItem('laborlink_job_requests', JSON.stringify(requests));

    // Instantly set worker to Already Hired when requested/hired (Hirer flow requirement)
    DatabaseDriver.updateWorkerAvailability(workerId, 'Already Hired');

    // Create a notification for the worker
    DatabaseDriver.createNotification(
      workerId,
      'labor',
      `New Job Request from ${hirerName}: "${description.substring(0, 40)}..."`,
      'job_request'
    );

    triggerRealtimeUpdate('JOB_REQUEST_CREATED', newRequest);
    return newRequest;
  },

  updateJobStatus: (requestId: string, status: 'Accepted' | 'Declined' | 'Completed'): boolean => {
    const requests = DatabaseDriver.getJobRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const request = requests[index];
    request.status = status;
    localStorage.setItem('laborlink_job_requests', JSON.stringify(requests));

    if (status === 'Completed') {
      // Revert worker back to Available
      DatabaseDriver.updateWorkerAvailability(request.workerId, 'Available');
      // Notify the hypothetical hirer
      DatabaseDriver.createNotification(
        request.hirerId,
        'hirer',
        `Job marked completed by worker. Please leave a rating!`,
        'system'
      );
    } else if (status === 'Accepted') {
      // Worker accepted
      DatabaseDriver.createNotification(
        request.hirerId,
        'hirer',
        `Your job request has been accepted by the worker.`,
        'hire_confirmation'
      );
    } else if (status === 'Declined') {
      // Revert worker back to Available if they decline
      DatabaseDriver.updateWorkerAvailability(request.workerId, 'Available');
      DatabaseDriver.createNotification(
        request.hirerId,
        'hirer',
        `Worker declined the hiring request.`,
        'system'
      );
    }

    triggerRealtimeUpdate('JOB_STATUS_UPDATED', { requestId, status });
    return true;
  },

  // ---------------- NOTIFICATIONS ----------------

  getNotifications: (): Notification[] => {
    const data = localStorage.getItem('laborlink_notifications');
    return data ? JSON.parse(data) : [];
  },

  createNotification: (userId: string, userRole: 'labor' | 'hirer' | 'admin', message: string, type: Notification['type']): Notification => {
    const notifications = DatabaseDriver.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      userRole,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif); // latest first
    localStorage.setItem('laborlink_notifications', JSON.stringify(notifications));
    triggerRealtimeUpdate('NOTIFICATION_RECEIVED', newNotif);
    return newNotif;
  },

  markNotificationsAsRead: (userId: string): void => {
    const notifications = DatabaseDriver.getNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    localStorage.setItem('laborlink_notifications', JSON.stringify(notifications));
    triggerRealtimeUpdate('NOTIFICATIONS_READ', { userId });
  },

  // ---------------- REVIEWS & RATINGS ----------------

  getReviews: (workerId: string): Review[] => {
    const data = localStorage.getItem('laborlink_reviews');
    const allReviews: Review[] = data ? JSON.parse(data) : [];
    return allReviews.filter(r => r.workerId === workerId);
  },

  submitReview: (workerId: string, rating: number, comment: string, reviewerName: string): Review => {
    const data = localStorage.getItem('laborlink_reviews');
    const allReviews: Review[] = data ? JSON.parse(data) : [];
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      workerId,
      rating,
      comment,
      reviewerName,
      createdAt: new Date().toISOString()
    };
    allReviews.push(newReview);
    localStorage.setItem('laborlink_reviews', JSON.stringify(allReviews));

    // Update worker average rating
    const workerReviews = allReviews.filter(r => r.workerId === workerId);
    const avgRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
    
    const workers = DatabaseDriver.getWorkers();
    const wIndex = workers.findIndex(w => w.id === workerId);
    if (wIndex !== -1) {
      workers[wIndex].rating = parseFloat(avgRating.toFixed(1));
      localStorage.setItem('laborlink_workers', JSON.stringify(workers));
    }

    triggerRealtimeUpdate('REVIEW_SUBMITTED', { workerId, rating });
    return newReview;
  },

  // ---------------- USER REPORTS ----------------

  getReports: (): UserReport[] => {
    const data = localStorage.getItem('laborlink_reports');
    return data ? JSON.parse(data) : [];
  },

  submitReport: (workerId: string, workerName: string, reason: string, reporterName: string): UserReport => {
    const reports = DatabaseDriver.getReports();
    const newReport: UserReport = {
      id: `rep-${Date.now()}`,
      workerId,
      workerName,
      reason,
      reporterName,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    localStorage.setItem('laborlink_reports', JSON.stringify(reports));
    
    // Create admin notification
    DatabaseDriver.createNotification(
      'admin',
      'admin',
      `Worker ${workerName} has been reported for: "${reason}"`,
      'system'
    );

    triggerRealtimeUpdate('REPORT_SUBMITTED', newReport);
    return newReport;
  },

  resolveReport: (reportId: string): boolean => {
    const reports = DatabaseDriver.getReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1) return false;

    reports[index].status = 'Resolved';
    localStorage.setItem('laborlink_reports', JSON.stringify(reports));
    triggerRealtimeUpdate('REPORT_RESOLVED', { reportId });
    return true;
  },

  // ---------------- AUTHENTICATION & SESSION MOCKS ----------------

  getCurrentSession: () => {
    const session = localStorage.getItem('laborlink_session');
    return session ? JSON.parse(session) : null;
  },

  loginAsWorker: (phone: string): { success: boolean; worker?: WorkerProfile; error?: string } => {
    const workers = DatabaseDriver.getWorkers();
    const worker = workers.find(w => w.phone === phone);
    if (!worker) {
      return { success: false, error: 'Phone number not registered. Please register first.' };
    }
    const session = { role: 'labor', id: worker.id, name: worker.name, phone: worker.phone };
    localStorage.setItem('laborlink_session', JSON.stringify(session));
    triggerRealtimeUpdate('AUTH_STATE_CHANGED', session);
    return { success: true, worker };
  },

  loginAsHirer: (phoneOrEmail: string): { success: boolean; session?: any } => {
    const session = {
      role: 'hirer',
      id: `hirer-${Date.now()}`,
      name: phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : 'Hirer Guest',
      identifier: phoneOrEmail
    };
    localStorage.setItem('laborlink_session', JSON.stringify(session));
    triggerRealtimeUpdate('AUTH_STATE_CHANGED', session);
    return { success: true, session };
  },

  loginAsAdmin: (password: string): { success: boolean; error?: string } => {
    if (password === 'admin123' || password === 'admin') {
      const session = { role: 'admin', id: 'admin-1', name: 'System Administrator' };
      localStorage.setItem('laborlink_session', JSON.stringify(session));
      triggerRealtimeUpdate('AUTH_STATE_CHANGED', session);
      return { success: true };
    }
    return { success: false, error: 'Invalid admin credentials.' };
  },

  logout: () => {
    localStorage.removeItem('laborlink_session');
    triggerRealtimeUpdate('AUTH_STATE_CHANGED', null);
  }
};
