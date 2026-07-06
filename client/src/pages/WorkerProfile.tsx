import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { DatabaseDriver, WorkerProfile as ProfileType, Review } from '../drivers/DatabaseDriver';
import { 
  Phone, MessageSquare, Navigation, Star, ShieldCheck, MapPin, AlertTriangle, ArrowLeft, Send, CheckCircle, Image
} from 'lucide-react';

export const WorkerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [worker, setWorker] = useState<ProfileType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Reporting state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporterName, setReporterName] = useState('');

  // Hiring Form state inside profile page
  const [showHireModal, setShowHireModal] = useState(false);
  const [hiringDesc, setHiringDesc] = useState('');
  const [hiringWage, setHiringWage] = useState<number>(600);
  const [hirerName, setHirerName] = useState('');
  const [hirerPhone, setHirerPhone] = useState('');

  const loadData = () => {
    if (id) {
      const data = DatabaseDriver.getWorkerById(id);
      if (data) {
        setWorker(data);
        setReviews(DatabaseDriver.getReviews(id));
        setHiringWage(data.expectedWage);
      }
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime database updates (e.g. status updates)
    const unsubscribe = DatabaseDriver.subscribe((event) => {
      if (event.type === 'WORKER_STATUS_UPDATED' && event.data.workerId === id) {
        loadData();
      }
      if (event.type === 'REVIEW_SUBMITTED' && event.data.workerId === id) {
        loadData();
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleCall = () => {
    if (!worker) return;
    window.location.href = `tel:${worker.phone}`;
  };

  const handleWhatsApp = () => {
    if (!worker) return;
    const text = encodeURIComponent(`Hello ${worker.name}, I found your profile on LaborLink and would like to talk about a job opening.`);
    window.open(`https://wa.me/91${worker.phone}?text=${text}`, '_blank');
  };

  const handleNavigate = () => {
    if (!worker) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${worker.location.lat},${worker.location.lng}`, '_blank');
  };

  const handleHireSubmit = () => {
    if (!worker) return;
    if (!hirerName || !hirerPhone) {
      showToast("Please enter your name and phone number.", "error");
      return;
    }

    DatabaseDriver.createJobRequest(
      worker.id,
      hirerName,
      hirerPhone,
      hiringDesc || `Hiring request for ${worker.primarySkill}`,
      hiringWage
    );

    showToast(t('jobRequested'), "success");
    setShowHireModal(false);
    setHiringDesc('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !worker) return;
    if (!reviewerName || !newComment) {
      showToast("Please fill in your name and comment.", "error");
      return;
    }

    setSubmittingReview(true);
    DatabaseDriver.submitReview(id, newRating, newComment, reviewerName);
    showToast("Thank you for your rating!", "success");
    setNewComment('');
    setReviewerName('');
    setSubmittingReview(false);
    loadData();
  };

  const handleReportSubmit = () => {
    if (!worker || !id) return;
    if (!reportReason || !reporterName) {
      showToast("Please fill in your name and report reason.", "error");
      return;
    }

    DatabaseDriver.submitReport(id, worker.name, reportReason, reporterName);
    showToast(t('reportedSuccess'), "success");
    setShowReportModal(false);
    setReportReason('');
    setReporterName('');
  };

  if (!worker) {
    return (
      <div className="max-w-md mx-auto text-center py-20 text-slate-400">
        Worker profile not found.
        <button onClick={() => navigate('/find')} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold block mx-auto">
          Back to Find Workers
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'Available') return 'bg-emerald-500 text-white';
    if (status === 'Busy') return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8 animate-slide-up">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search results
      </button>

      {/* Main Profile Info Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-premium">
        {/* Banner work image placeholder */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-primary to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Details Wrapper */}
        <div className="p-6 relative pt-0">
          {/* Circular Photo positioned over banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 -mt-12 mb-4">
            <div className="relative">
              <img
                src={worker.profilePhoto}
                alt={worker.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-md"
              />
              {worker.isVerified && (
                <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900 shadow" title="Aadhaar Verified">
                  <CheckCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto mt-12 sm:mt-0">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm ${getStatusColor(worker.availabilityStatus)}`}>
                {worker.availabilityStatus === 'Available' ? t('statusAvailable') : worker.availabilityStatus === 'Busy' ? t('statusBusy') : t('statusHired')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-display text-slate-850 dark:text-slate-150">{worker.name}</h1>
                {worker.isGroup && (
                  <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded text-[10px] font-bold">
                    👥 Team ({worker.groupDetails?.totalMembers} members)
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">{worker.primarySkill}</p>
              
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{worker.location.village ? `${worker.location.village}, ` : ''}{worker.location.city}, {worker.location.state}</span>
              </div>
            </div>

            {/* Quick Metrics details Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-xs font-semibold">
              <div className="border-r border-slate-200 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Daily Wage</span>
                <strong className="text-slate-800 dark:text-slate-150 text-sm">₹{worker.expectedWage}</strong>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Experience</span>
                <strong className="text-slate-800 dark:text-slate-150 text-sm">{worker.experience} Yrs</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Rating</span>
                <strong className="text-amber-500 text-sm flex items-center justify-center gap-0.5">★ {worker.rating}</strong>
              </div>
            </div>

            {/* General Info list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t border-slate-100 dark:border-slate-800 pt-4">
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Languages Known</span>
                <span className="text-slate-700 dark:text-slate-300">{worker.languages.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Gender / Age</span>
                <span className="text-slate-700 dark:text-slate-300">{worker.gender} ({worker.age} yrs old)</span>
              </div>
              {worker.education && (
                <div>
                  <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Education Qualification</span>
                  <span className="text-slate-700 dark:text-slate-300">{worker.education}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase text-[9px] font-bold">Working hours</span>
                <span className="text-slate-700 dark:text-slate-300">{worker.availableHours}</span>
              </div>
            </div>

            {/* Description Text */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">About / Description</h4>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                {worker.description}
              </p>
            </div>

            {/* Trigger Button Drawer Panel */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCall}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" /> {t('call')}
              </button>
              
              <button
                onClick={handleWhatsApp}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> {t('whatsapp')}
              </button>

              <button
                onClick={handleNavigate}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" /> {t('directions')}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowHireModal(true)}
                disabled={worker.availabilityStatus !== 'Available'}
                className={`w-full py-4 text-sm font-extrabold rounded-2xl shadow-premium transition-all active:scale-97 flex items-center justify-center gap-2 ${
                  worker.availabilityStatus === 'Available'
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                ⚡ {worker.availabilityStatus === 'Available' ? t('hireNow') : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Photos list */}
      {worker.portfolioPhotos && worker.portfolioPhotos.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Image className="w-4 h-4 text-primary" /> {t('portfolio')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {worker.portfolioPhotos.map((photo, i) => (
              <a href={photo} key={i} target="_blank" rel="noopener noreferrer">
                <img
                  src={photo}
                  alt={`Portfolio ${i + 1}`}
                  className="rounded-2xl w-full h-32 object-cover hover:opacity-90 active:scale-98 transition-all border border-slate-50 dark:border-slate-800"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* User Reviews & Rating Submission */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Ratings & Reviews</h3>
        
        {/* Input Review Form */}
        <form onSubmit={handleReviewSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">Leave a Review</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-primary"
            />
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">RATING</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setNewRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-4 h-4 ${i < newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Describe your experience with this worker..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="py-4 text-center text-slate-450 text-xs">No client reviews listed.</div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {reviews.map((rev, idx) => (
              <div key={rev.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-1.5`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{rev.reviewerName}</span>
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

      {/* Safety / Report Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-500/80 hover:text-rose-600 transition-all hover:underline"
        >
          <AlertTriangle className="w-4 h-4" /> {t('reportWorker')}
        </button>
      </div>

      {/* Report Modal Popup */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold font-display flex items-center gap-1.5 text-rose-500">
              🚨 Report Worker Profile
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit details of fake credentials, dynamic wage disputes, or improper behavioral conduct.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-xs font-semibold"
              />
              <textarea
                placeholder="Describe reason for reporting in detail..."
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {t('submitReport')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hiring Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-150">
              ⚡ Book {worker.name} Now?
            </h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Full Name"
                value={hirerName}
                onChange={e => setHirerName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-xs font-semibold"
              />
              <input
                type="tel"
                placeholder="Your Mobile Number"
                value={hirerPhone}
                onChange={e => setHirerPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-xs font-semibold"
              />
              <textarea
                placeholder="Describe project details (e.g. Wardrobe repair, room styling)..."
                value={hiringDesc}
                onChange={e => setHiringDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-xs font-semibold"
              />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">OFFERED DAILY WAGE (INR)</label>
                <input
                  type="number"
                  value={hiringWage}
                  onChange={e => setHiringWage(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowHireModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleHireSubmit}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Hiring Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
