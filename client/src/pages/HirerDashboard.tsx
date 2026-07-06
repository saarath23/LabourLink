import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { VoiceSearch } from '../components/VoiceSearch';
import { MapSelector } from '../components/MapSelector';
import { DatabaseDriver, WorkerProfile } from '../drivers/DatabaseDriver';
import { 
  SlidersHorizontal, Map, Grid, Phone, MessageSquare, MapPin, Navigation, Star, CheckCircle, ShieldCheck, UserCheck
} from 'lucide-react';

const SKILLS_LIST = [
  "All", "Carpenter", "Mason", "Electrician", "Plumber", "Painter", "Welder", "Tile Worker", 
  "Construction Worker", "AC Technician", "Mechanic", "Driver", "Gardener", "House Cleaner", 
  "Farm Worker", "Interior Worker", "Furniture Worker", "POP Worker", "Roofer", "Steel Fixer", 
  "Marble Worker", "Excavator Operator", "Crane Operator"
];

// Helper to calculate Haversine distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
};

export const HirerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Hirer current location (defaults to Hyderabad center)
  const [hirerLocation, setHirerLocation] = useState({
    lat: 17.3850,
    lng: 78.4867
  });

  // Filter States
  const [filterType, setFilterType] = useState<'All' | 'Solo' | 'Group'>('All');
  const [maxWage, setMaxWage] = useState<number>(5000);
  const [minExp, setMinExp] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  // Hiring Dialog state
  const [hiringWorker, setHiringWorker] = useState<WorkerProfile | null>(null);
  const [hiringDesc, setHiringDesc] = useState('');
  const [hiringWage, setHiringWage] = useState<number>(600);
  const [hirerName, setHirerName] = useState('');
  const [hirerPhone, setHirerPhone] = useState('');

  // Initial read of URL skill param
  useEffect(() => {
    const urlSkill = searchParams.get('skill');
    if (urlSkill && SKILLS_LIST.includes(urlSkill)) {
      setSelectedSkill(urlSkill);
    }
  }, [searchParams]);

  // Load active workers from Database Driver
  const [allWorkers, setAllWorkers] = useState<WorkerProfile[]>([]);

  const reloadWorkers = () => {
    setAllWorkers(DatabaseDriver.getWorkers());
  };

  useEffect(() => {
    reloadWorkers();

    const unsubscribe = DatabaseDriver.subscribe((event) => {
      if (['WORKER_STATUS_UPDATED', 'WORKER_REGISTERED', 'WORKER_DELETED', 'JOB_REQUEST_CREATED', 'JOB_STATUS_UPDATED'].includes(event.type)) {
        reloadWorkers();
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync hiring wages default with worker expectations when selected
  useEffect(() => {
    if (hiringWorker) {
      setHiringWage(hiringWorker.expectedWage);
    }
  }, [hiringWorker]);

  // Try to locate hirer to calculate real dynamic distance
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setHirerLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          console.log("Using default Hyderabad coords for search boundary.");
        }
      );
    }
  }, []);

  // Filter Logic (Calculated efficiently via useMemo)
  const filteredWorkers = useMemo(() => {
    return allWorkers
      .map(w => ({
        ...w,
        // Append dynamically calculated distance from hirer current center
        distance: getDistance(hirerLocation.lat, hirerLocation.lng, w.location.lat, w.location.lng)
      }))
      .filter(w => {
        // Query match (Search by skill name, worker name, city, village)
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          !q ||
          w.name.toLowerCase().includes(q) ||
          w.primarySkill.toLowerCase().includes(q) ||
          w.location.city.toLowerCase().includes(q) ||
          (w.location.village && w.location.village.toLowerCase().includes(q));

        // Category dropdown match
        const matchesSkill = selectedSkill === 'All' || w.primarySkill === selectedSkill;

        // Type match (Solo vs Group)
        const matchesType = 
          filterType === 'All' ||
          (filterType === 'Solo' && !w.isGroup) ||
          (filterType === 'Group' && w.isGroup);

        // Max wage match
        const matchesWage = w.expectedWage <= maxWage;

        // Experience match
        const matchesExp = w.experience >= minExp;

        // Distance match
        const matchesDistance = w.distance <= maxDistance;

        // Verified status match
        const matchesVerified = !onlyVerified || w.isVerified;

        // Availability status match
        const matchesAvailability = !onlyAvailable || w.availabilityStatus === 'Available';

        return (
          matchesQuery &&
          matchesSkill &&
          matchesType &&
          matchesWage &&
          matchesExp &&
          matchesDistance &&
          matchesVerified &&
          matchesAvailability
        );
      });
  }, [allWorkers, searchQuery, selectedSkill, filterType, maxWage, minExp, maxDistance, onlyVerified, onlyAvailable, hirerLocation]);

  // Execute Direct Dial action
  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  // Execute WhatsApp click
  const handleWhatsApp = (phone: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(`Hello ${name}, I found your profile on LaborLink and would like to talk about a job opening.`);
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  // Google Maps route navigation redirection
  const handleNavigate = (worker: WorkerProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open in map navigation
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${worker.location.lat},${worker.location.lng}`, '_blank');
  };

  // Confirmed booking flow logic
  const handleConfirmHiring = () => {
    if (!hiringWorker) return;
    if (!hirerName || !hirerPhone) {
      showToast("Please enter your name and phone number to request a booking.", "error");
      return;
    }

    DatabaseDriver.createJobRequest(
      hiringWorker.id,
      hirerName,
      hirerPhone,
      hiringDesc || `Hiring request for ${hiringWorker.primarySkill}`,
      hiringWage
    );

    showToast(t('jobRequested'), "success");
    setHiringWorker(null);
    setHiringDesc('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Search Header Row */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <VoiceSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by worker name, city, village or specific trade..."
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto shrink-0 justify-between sm:justify-start">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                showFilters 
                  ? 'bg-primary text-white border-primary shadow-premium' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> {t('filterTitle')}
            </button>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl flex gap-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'map' 
                    ? 'bg-primary text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Map className="w-3.5 h-3.5" /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Skill Filter Pills Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-image">
          {SKILLS_LIST.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border whitespace-nowrap shrink-0 active:scale-95 transition-all ${
                selectedSkill === skill
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {skill === 'All' ? '🌟 All Trades' : skill}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-out Advanced Filter Menu */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-premium grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">{t('filterWorkerType')}</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                {['All', 'Solo', 'Group'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterType === type 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={e => setOnlyVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary focus:ring-1"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Only Verified Workers
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary focus:ring-1"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Only Available Today
                </span>
              </label>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{t('filterWage').toUpperCase()}</span>
                <span className="text-primary font-bold">₹{maxWage}/Day</span>
              </div>
              <input
                type="range"
                min="300"
                max="5000"
                step="100"
                value={maxWage}
                onChange={e => setMaxWage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{t('filterExperience').toUpperCase()}</span>
                <span className="text-primary font-bold">{minExp}+ Years</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={minExp}
                onChange={e => setMinExp(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{t('filterDistance').toUpperCase()}</span>
                <span className="text-primary font-bold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={maxDistance}
                onChange={e => setMaxDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button
              onClick={() => {
                setFilterType('All');
                setMaxWage(5000);
                setMinExp(0);
                setMaxDistance(15);
                setOnlyVerified(false);
                setOnlyAvailable(true);
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {viewMode === 'map' ? (
        <div className="w-full h-[65vh] relative rounded-3xl overflow-hidden shadow-premium">
          <MapSelector
            mode="view"
            center={hirerLocation}
            workers={filteredWorkers}
            radius={maxDistance}
            onWorkerSelect={(w) => navigate(`/profile/${w.id}`)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkers.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              🔍 No workers found matching these active search criteria. Try modifying your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map(worker => (
                <div
                  key={worker.id}
                  onClick={() => navigate(`/profile/${worker.id}`)}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-premium hover:shadow-lg hover:-translate-y-0.5 active:scale-99 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
                >
                  {/* Photo & Availability Badging */}
                  <div className="flex gap-4">
                    <img
                      src={worker.profilePhoto}
                      alt={worker.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow border border-slate-50 dark:border-slate-800 shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{worker.name}</h4>
                        {worker.isVerified && (
                          <span className="shrink-0 text-emerald-500" title="Aadhaar Verified">
                            <CheckCircle className="w-3.5 h-3.5 fill-current text-white bg-emerald-500 rounded-full" />
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-primary uppercase text-[10px] tracking-wider truncate">{worker.primarySkill}</span>
                        {worker.isGroup && (
                          <span className="bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            👥 Team ({worker.groupDetails?.totalMembers})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        <span className="truncate">{worker.location.village || worker.location.city} • {worker.distance} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Wage / Rating info */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block mb-0.5">WAGE</span>
                      <strong className="text-slate-800 dark:text-slate-150">₹{worker.expectedWage}/Day</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-center">
                      <span className="text-[10px] text-slate-400 block mb-0.5">RATING</span>
                      <strong className="text-amber-500 flex items-center justify-center gap-0.5">★ {worker.rating}</strong>
                    </div>
                  </div>

                  {/* Core Action Trigger Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={(e) => handleCall(worker.phone, e)}
                      className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all active:scale-95"
                      title={t('call')}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => handleWhatsApp(worker.phone, worker.name, e)}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all active:scale-95"
                      title={t('whatsapp')}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleNavigate(worker, e)}
                      className="p-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all active:scale-95"
                      title={t('directions')}
                    >
                      <Navigation className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHiringWorker(worker);
                      }}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 text-center"
                    >
                      {t('hireNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hiring Confirmation Popup Drawer Modal */}
      {hiringWorker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold font-display flex items-center gap-1.5 text-slate-800 dark:text-slate-150">
              ⚡ Hire {hiringWorker.name}?
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This request immediately marks their status to <strong>Already Hired</strong> and sends a job alert.
            </p>

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
                placeholder="Briefly describe the task (e.g. Painting living room, pipe leak fix)..."
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

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setHiringWorker(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-semibold active:scale-95 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmHiring}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
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
