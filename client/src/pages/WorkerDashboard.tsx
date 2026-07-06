import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { DatabaseDriver, WorkerProfile, JobRequest, Review } from '../drivers/DatabaseDriver';
import { 
  User, CheckCircle, Clock, ShieldCheck, MapPin, Star, AlertCircle, Phone, Sparkles, MessageCircle, LogOut 
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [session, setSession] = useState<any>(null);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loginPhone, setLoginPhone] = useState('');

  // Reload data helper
  const reloadData = () => {
    const activeSession = DatabaseDriver.getCurrentSession();
    setSession(activeSession);

    if (activeSession && activeSession.role === 'labor') {
      const profile = DatabaseDriver.getWorkerById(activeSession.id);
      if (profile) {
        setWorker(profile);
        // Load jobs for this worker
        const allJobs = DatabaseDriver.getJobRequests();
        setJobs(allJobs.filter(j => j.workerId === profile.id));
        // Load reviews
        setReviews(DatabaseDriver.getReviews(profile.id));
      }
    }
  };

  useEffect(() => {
    reloadData();

    // Subscribe to database realtime updates
    const unsubscribe = DatabaseDriver.subscribe((event) => {
      if (['JOB_REQUEST_CREATED', 'JOB_STATUS_UPDATED', 'WORKER_STATUS_UPDATED', 'REVIEW_SUBMITTED', 'AUTH_STATE_CHANGED'].includes(event.type)) {
        reloadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = (status: 'Available' | 'Busy' | 'Already Hired') => {
    if (!worker) return;
    DatabaseDriver.updateWorkerAvailability(worker.id, status);
    showToast(t('statusChangedSuccess'), 'success');
  };

  const handleJobAction = (jobId: string, action: 'Accepted' | 'Declined' | 'Completed') => {
    DatabaseDriver.updateJobStatus(jobId, action);
    showToast(`Job status marked as ${action}`, 'success');
  };

  // Mock Login Handler
  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone) {
      showToast("Please enter a registered phone number", "error");
      return;
    }
    const res = DatabaseDriver.loginAsWorker(loginPhone);
    if (res.success) {
      showToast("Logged in successfully!", "success");
      reloadData();
    } else {
      showToast(res.error || "Login failed", "error");
    }
  };

  // Quick select login to help testing
  const selectMockWorker = (phone: string) => {
    setLoginPhone(phone);
    const res = DatabaseDriver.loginAsWorker(phone);
    if (res.success) {
      showToast("Logged in successfully!", "success");
      reloadData();
    }
  };

  const handleLogout = () => {
    DatabaseDriver.logout();
    setSession(null);
    setWorker(null);
    showToast("Logged out successfully.", "info");
    navigate('/');
  };

  // If not logged in as labor, show a beautiful login selector page
  if (!session || session.role !== 'labor' || !worker) {
    const registeredLabors = DatabaseDriver.getWorkers();
    return (
      <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-premium space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-display">{t('workerDashboardTitle')} Login</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Log in to manage jobs and toggle availability status.</p>
          </div>

          <form onSubmit={handleMockLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('mobileNumber')}</label>
              <input
                type="tel"
                value={loginPhone}
                onChange={e => setLoginPhone(e.target.value)}
                placeholder="Enter registered mobile number"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-all"
            >
              Sign In with OTP Simulation
            </button>
          </form>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase">Quick Select Demo Accounts:</h4>
            <div className="flex flex-col gap-2">
              {registeredLabors.slice(0, 3).map((w) => (
                <button
                  key={w.id}
                  onClick={() => selectMockWorker(w.phone)}
                  className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs font-semibold transition-all text-left text-slate-700 dark:text-slate-300"
                >
                  <div>
                    <strong>{w.name}</strong> ({w.primarySkill})
                  </div>
                  <span className="text-slate-400">{w.phone} →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    let score = 30; // base registered
    if (worker.email) score += 10;
    if (worker.education) score += 10;
    if (worker.languages.length > 1) score += 10;
    if (worker.description.length > 50) score += 10;
    if (worker.portfolioPhotos.length > 0) score += 15;
    if (worker.isVerified) score += 15;
    return score;
  };

  const completeness = calculateCompleteness();

  const activeJobs = jobs.filter(j => j.status === 'Accepted');
  const pendingRequests = jobs.filter(j => j.status === 'Pending');
  const pastJobs = jobs.filter(j => j.status === 'Completed' || j.status === 'Declined');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-slide-up">
      {/* Worker Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-premium flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative">
          <img
            src={worker.profilePhoto}
            alt={worker.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow"
          />
          {worker.isVerified && (
            <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white shadow" title="Aadhaar Verified">
              <CheckCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        
        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-bold font-display">{worker.name}</h2>
            {worker.isGroup && (
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[10px] font-bold self-center">
                👥 Team ({worker.groupDetails?.totalMembers} members)
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">{worker.primarySkill}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{worker.location.village}, {worker.location.city} • Exp: {worker.experience} yrs</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl hover:bg-rose-100 transition-all shrink-0 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>

      {/* Grid: Profile Completion & Status Picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Completeness */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" /> {t('profileCompleteness')}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Status Score</span>
              <span className="text-primary">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {completeness < 100 ? "💡 Add details, certificate uploads and get Aadhaar verification to hit 100%!" : "🌟 Perfect! You profile is fully complete and trusted."}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> {t('todayStatus')}
          </h3>
          
          <div className="flex flex-col gap-2">
            {[
              { status: 'Available', label: '🟢 Available Today (Online/Visible)', style: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900' },
              { status: 'Busy', label: '🟡 Busy Today (Unavailable temporarily)', style: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900' },
              { status: 'Already Hired', label: '🔴 Already Hired (Working on job)', style: 'bg-rose-50 text-rose-800 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900' }
            ].map((st) => {
              const isActive = worker.availabilityStatus === st.status;
              return (
                <button
                  key={st.status}
                  onClick={() => handleStatusChange(st.status as any)}
                  className={`w-full px-4 py-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                    isActive 
                      ? `${st.style} scale-102 border-2 shadow-sm` 
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{st.label}</span>
                  {isActive && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Requests Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t('jobRequests')}</h3>
          <p className="text-xs text-slate-400">Review incoming requests directly from local businesses.</p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <Clock className="w-8 h-8 text-slate-300 animate-pulse" />
            No new hiring requests right now. Toggle your status to "Available Today" to attract hirers.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(job => (
              <div 
                key={job.id} 
                className="p-5 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{job.hirerName}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {job.hirerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold block mb-1">
                      WAGE OFFER
                    </span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">₹{job.expectedWage}/Day</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl italic">
                  "{job.description}"
                </p>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleJobAction(job.id, 'Declined')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all active:scale-95"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleJobAction(job.id, 'Accepted')}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accepted / Ongoing Jobs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t('acceptedJobs')}</h3>
        {activeJobs.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-xs">No active ongoing projects.</div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map(job => (
              <div 
                key={job.id} 
                className="p-4 border-l-4 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-r-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{job.hirerName}</h4>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{job.description}</p>
                </div>
                <button
                  onClick={() => handleJobAction(job.id, 'Completed')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 self-start sm:self-center"
                >
                  {t('markCompleted')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t('ratingsReviews')}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{worker.rating}</span>
            <span className="text-xs text-slate-400">• {reviews.length} reviews</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-xs">No customer reviews yet.</div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {reviews.map((rev, idx) => (
              <div key={rev.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{rev.reviewerName}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
