import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { DatabaseDriver, WorkerProfile, UserReport, JobRequest } from '../drivers/DatabaseDriver';
import { 
  ShieldCheck, Users, Ban, Trash2, CheckCircle2, XCircle, BarChart3, AlertTriangle, Key, LogOut 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [session, setSession] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [jobs, setJobs] = useState<JobRequest[]>([]);

  const reloadData = () => {
    setSession(DatabaseDriver.getCurrentSession());
    setWorkers(DatabaseDriver.getWorkers());
    setReports(DatabaseDriver.getReports());
    setJobs(DatabaseDriver.getJobRequests());
  };

  useEffect(() => {
    reloadData();

    const unsubscribe = DatabaseDriver.subscribe((event) => {
      if (['WORKER_STATUS_UPDATED', 'WORKER_REGISTERED', 'WORKER_DELETED', 'REPORT_SUBMITTED', 'REPORT_RESOLVED', 'WORKER_VERIFICATION_UPDATED', 'AUTH_STATE_CHANGED'].includes(event.type)) {
        reloadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = DatabaseDriver.loginAsAdmin(adminPassword);
    if (res.success) {
      showToast("Access Granted. Welcome Administrator.", "success");
      reloadData();
    } else {
      showToast(res.error || "Access Denied.", "error");
    }
  };

  const handleApproveRegistration = (workerId: string) => {
    DatabaseDriver.updateWorkerVerification(workerId, true);
    showToast("Worker registration successfully verified!", "success");
  };

  const handleSuspendWorker = (workerId: string, reportId?: string) => {
    // Delete worker from search listings
    DatabaseDriver.deleteWorker(workerId);
    if (reportId) {
      DatabaseDriver.resolveReport(reportId);
    }
    showToast("Worker suspended and account deleted from search database.", "success");
  };

  const handleDismissReport = (reportId: string) => {
    DatabaseDriver.resolveReport(reportId);
    showToast("Report marked as resolved (dismissed).", "info");
  };

  const handleLogout = () => {
    DatabaseDriver.logout();
    setSession(null);
    showToast("Logged out from Admin panel.", "info");
    navigate('/');
  };

  // Secure login prompt if not admin session
  if (!session || session.role !== 'admin') {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-premium space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-display">{t('adminDashboardTitle')} Secure Area</h1>
            <p className="text-xs text-slate-400">Restricted to authorized system operators.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Operator Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Enter password (use 'admin')"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium text-center"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark transition-all active:scale-95"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // System Stats calculations
  const pendingRegistrations = workers.filter(w => !w.isVerified);
  const activeCount = workers.filter(w => w.availabilityStatus === 'Available').length;
  const busyCount = workers.filter(w => w.availabilityStatus === 'Busy').length;
  const hiredCount = workers.filter(w => w.availabilityStatus === 'Already Hired').length;
  const totalHiresCount = jobs.filter(j => j.status === 'Completed' || j.status === 'Accepted').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-slide-up">
      {/* Header Operator Panel */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-display flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-secondary" /> System Administrator Terminal
          </h2>
          <p className="text-xs text-slate-400">Monitoring real-time database state and verification claims.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
        >
          <LogOut className="w-4 h-4" /> Exit Secure Session
        </button>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: t('totalRegistrations'), value: workers.length, sub: "Total Database profiles", color: "text-primary" },
          { title: "Active Available", value: activeCount, sub: "🟢 Online Search Visible", color: "text-emerald-500" },
          { title: "Active Hired", value: hiredCount, sub: "🔴 Working on jobs", color: "text-rose-500" },
          { title: t('hiringRate'), value: totalHiresCount, sub: "Successful connections", color: "text-indigo-500" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">{stat.title}</span>
            <strong className={`text-2xl font-black block mt-1 ${stat.color}`}>{stat.value}</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Analytics Chart Visualization (HTML flex bar chart representation) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-primary" /> Trades Distribution Analytics
        </h3>
        
        {/* Simple inline Flexbar Chart */}
        <div className="space-y-3 max-w-xl">
          {[
            { skill: "Painter", count: workers.filter(w => w.primarySkill === 'Painter').length, max: workers.length, percent: workers.length ? (workers.filter(w => w.primarySkill === 'Painter').length / workers.length) * 100 : 0 },
            { skill: "Carpenter", count: workers.filter(w => w.primarySkill === 'Carpenter').length, max: workers.length, percent: workers.length ? (workers.filter(w => w.primarySkill === 'Carpenter').length / workers.length) * 100 : 0 },
            { skill: "Electrician", count: workers.filter(w => w.primarySkill === 'Electrician').length, max: workers.length, percent: workers.length ? (workers.filter(w => w.primarySkill === 'Electrician').length / workers.length) * 100 : 0 },
            { skill: "Plumber", count: workers.filter(w => w.primarySkill === 'Plumber').length, max: workers.length, percent: workers.length ? (workers.filter(w => w.primarySkill === 'Plumber').length / workers.length) * 100 : 0 },
            { skill: "Others", count: workers.filter(w => !['Painter', 'Carpenter', 'Electrician', 'Plumber'].includes(w.primarySkill)).length, max: workers.length, percent: workers.length ? (workers.filter(w => !['Painter', 'Carpenter', 'Electrician', 'Plumber'].includes(w.primarySkill)).length / workers.length) * 100 : 0 }
          ].map((bar, idx) => (
            <div key={idx} className="flex items-center gap-4 text-xs font-semibold">
              <span className="w-24 text-slate-600 dark:text-slate-300 truncate">{bar.skill}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(bar.percent, 8)}%` }} // minimum visual width
                />
              </div>
              <span className="w-8 text-right text-slate-500">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Registrations Verification claims */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Pending Registrations Approval</h3>
            <p className="text-xs text-slate-400">Click approve to verify identity certificates & list on dashboard.</p>
          </div>

          {pendingRegistrations.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No pending registrations awaiting operator review.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map(w => (
                <div 
                  key={w.id} 
                  className="p-4 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img src={w.profilePhoto} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs">{w.name}</h4>
                      <span className="text-[10px] font-semibold text-primary uppercase">{w.primarySkill}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSuspendWorker(w.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg text-xs font-semibold transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveRegistration(w.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Reports resolution list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">User Infractions Reports</h3>
            <p className="text-xs text-slate-400">Review reported claims of worker profile inaccuracies or disputes.</p>
          </div>

          {reports.filter(r => r.status === 'Pending').length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No active reported profiles flagged.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.filter(r => r.status === 'Pending').map(rep => (
                <div 
                  key={rep.id} 
                  className="p-4 border border-rose-100 dark:border-rose-950/20 bg-rose-500/5 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Worker Flagged: {rep.workerName}</h4>
                      <p className="text-[10px] text-slate-400">Reporter: {rep.reporterName}</p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  </div>
                  
                  <p className="text-xs text-rose-800 dark:text-rose-300 italic">
                    "{rep.reason}"
                  </p>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleSuspendWorker(rep.workerId, rep.id)}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      Suspend Worker
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
