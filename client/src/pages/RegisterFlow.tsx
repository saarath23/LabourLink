import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { MapSelector } from '../components/MapSelector';
import { DatabaseDriver, LocationData } from '../drivers/DatabaseDriver';
import { 
  User, Users, MapPin, Phone, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, Upload, Loader2 
} from 'lucide-react';

const SKILLS_LIST = [
  "Carpenter", "Mason", "Electrician", "Plumber", "Painter", "Welder", "Tile Worker", 
  "Construction Worker", "AC Technician", "Mechanic", "Driver", "Gardener", "House Cleaner", 
  "Farm Worker", "Interior Worker", "Furniture Worker", "POP Worker", "Roofer", "Steel Fixer", 
  "Marble Worker", "Excavator Operator", "Crane Operator", "Others"
];

const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];

export const RegisterFlow: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [regType, setRegType] = useState<'select' | 'solo' | 'group'>('select');
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [age, setAge] = useState<number>(25);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [education, setEducation] = useState('');
  
  const [primarySkill, setPrimarySkill] = useState(SKILLS_LIST[0]);
  const [experience, setExperience] = useState<number>(2);
  const [expectedWage, setExpectedWage] = useState<number>(600);
  const [availableHours, setAvailableHours] = useState('08:00 AM - 06:00 PM');
  const [description, setDescription] = useState('');
  const [totalMembers, setTotalMembers] = useState<number>(5);

  // Verification Mocks
  const [aadhaar, setAadhaar] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Location State
  const [location, setLocation] = useState<LocationData>({
    lat: 17.3850,
    lng: 78.4867,
    city: 'Hyderabad',
    state: 'Telangana',
    village: 'Koti',
    pinCode: '500095',
    address: 'Near Koti Bus Stop, Hyderabad'
  });
  const [detectingGps, setDetectingGps] = useState(false);

  // Media Mock Uploader
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);

  // GPS Auto-detect
  const handleGPSDetect = () => {
    setDetectingGps(true);
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      setDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          address: `GPS Detected at Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
        }));
        showToast(t('gpsSuccess'), "success");
        setDetectingGps(false);
      },
      (error) => {
        console.error(error);
        showToast(t('gpsError'), "error");
        setDetectingGps(false);
      }
    );
  };

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  // OTP MOCK LOGIC (Hits server proxy or simulates client-side)
  const sendOtpRequest = async () => {
    if (!phone || phone.length < 10) {
      showToast("Please enter a valid mobile number", "error");
      return;
    }

    setOtpSent(true);
    showToast(t('otpSent'), "info");

    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.otp) {
        console.log(`[DEV ONLY] SMS OTP Code is: ${data.otp}`);
      }
    } catch (e) {
      console.warn("Backend server not responding. Falling back to local client OTP simulation.");
    }
  };

  const verifyOtpRequest = async () => {
    if (!otpCode) {
      showToast("Please enter the 6-digit verification code", "error");
      return;
    }

    setIsVerifyingOtp(true);
    
    // Express simulation check
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOtpVerified(true);
        showToast(t('otpSuccess'), "success");
        setIsVerifyingOtp(false);
        return;
      }
    } catch (e) {
      console.warn("Fallback to client verification check");
    }

    // Client-side master bypass fallback code
    if (otpCode === '123456' || otpCode.length === 6) {
      setIsOtpVerified(true);
      showToast(t('otpSuccess'), "success");
    } else {
      showToast(t('otpError'), "error");
    }
    setIsVerifyingOtp(false);
  };

  // Register worker execution
  const handleRegisterSubmit = () => {
    if (!isOtpVerified) {
      showToast("Please verify your phone number via OTP first", "error");
      return;
    }

    const isGroup = regType === 'group';

    const baseData = {
      name: isGroup ? leaderName : name,
      gender,
      age,
      profilePhoto: isGroup ? "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150" : profilePhoto,
      phone,
      whatsapp: whatsapp || phone,
      email,
      languages: selectedLanguages.length > 0 ? selectedLanguages : ["Telugu"],
      education,
      primarySkill,
      experience,
      expectedWage,
      availableHours,
      description: description || `${primarySkill} looking for jobs near ${location.city}`,
      portfolioPhotos: portfolioPhotos.length > 0 ? portfolioPhotos : [
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300"
      ],
      location,
      isGroup,
      ...(isGroup && {
        groupDetails: {
          groupName,
          totalMembers
        }
      })
    };

    const newWorker = DatabaseDriver.registerWorker(baseData);
    
    // Automatically log in as the registered user
    DatabaseDriver.loginAsWorker(phone);
    
    showToast("Registration successful! Undergoing admin review.", "success");
    navigate('/dashboard');
  };

  // Group register leaders details fallback names
  const [leaderName, setLeaderName] = useState('');

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {regType === 'select' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-display">{t('registerLabor')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Select your registration format to list your services.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div 
              onClick={() => setRegType('solo')}
              className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-primary p-6 rounded-3xl cursor-pointer shadow-premium hover:shadow-lg transition-all group flex gap-6 items-center active:scale-98"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('soloWorker')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('soloWorkerDesc')}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 ml-auto" />
            </div>

            <div 
              onClick={() => setRegType('group')}
              className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-primary p-6 rounded-3xl cursor-pointer shadow-premium hover:shadow-lg transition-all group flex gap-6 items-center active:scale-98"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('groupRegistration')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('groupWorkerDesc')}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 ml-auto" />
            </div>
          </div>
        </div>
      )}

      {regType !== 'select' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-premium space-y-6 animate-slide-up">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold font-display">
                {regType === 'solo' ? t('soloRegisterTitle') : t('groupRegisterTitle')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3</p>
            </div>
            <button
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else setRegType('select');
              }}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Form Step Content */}
          <div className="space-y-5">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                {regType === 'solo' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('fullName')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar Reddy"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('groupName')}</label>
                        <input
                          type="text"
                          value={groupName}
                          onChange={e => setGroupName(e.target.value)}
                          placeholder="e.g. Reddy Painting Team"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('leaderName')}</label>
                        <input
                          type="text"
                          value={leaderName}
                          onChange={e => setLeaderName(e.target.value)}
                          placeholder="Leader's Full Name"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">{t('totalMembers')}</label>
                      <input
                        type="number"
                        value={totalMembers}
                        onChange={e => setTotalMembers(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('gender')}</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium text-slate-800 dark:text-slate-100"
                    >
                      <option value="Male">{t('male')}</option>
                      <option value="Female">{t('female')}</option>
                      <option value="Other">{t('other')}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('age')}</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('mobileNumber')}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="10 digit number"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('whatsappNumber')}</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="WhatsApp number"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('languagesKnown')}</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {LANGUAGES.map(lang => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => handleLanguageToggle(lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          selectedLanguages.includes(lang)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('primarySkill')}</label>
                    <select
                      value={primarySkill}
                      onChange={e => setPrimarySkill(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium text-slate-800 dark:text-slate-100"
                    >
                      {SKILLS_LIST.map(sk => (
                        <option key={sk} value={sk}>{sk}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('experienceYears')}</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={e => setExperience(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('expectedWage')}</label>
                    <input
                      type="number"
                      value={expectedWage}
                      onChange={e => setExpectedWage(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('availableHours')}</label>
                    <input
                      type="text"
                      value={availableHours}
                      onChange={e => setAvailableHours(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('description')}</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell hirers about your specialty projects..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('uploadWorkPhotos')}</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Tap to mock upload photos</span>
                    <span className="text-[10px] text-slate-400 mt-1">Accepts PNG, JPG (Auto compressed)</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                {/* Location Selection with GPS + Leaflet Map */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase">📍 Geo Location</label>
                    <button
                      type="button"
                      onClick={handleGPSDetect}
                      disabled={detectingGps}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {detectingGps ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
                        </>
                      ) : (
                        t('detectLocation')
                      )}
                    </button>
                  </div>

                  <div className="w-full h-[220px]">
                    <MapSelector
                      mode="select"
                      center={{ lat: location.lat, lng: location.lng }}
                      onLocationChange={(loc) => setLocation(prev => ({ ...prev, ...loc }))}
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                    <div><strong>City/State:</strong> {location.city}, {location.state}</div>
                    <div><strong>Village/Pin:</strong> {location.village || 'N/A'}, {location.pinCode}</div>
                    <div className="truncate"><strong>Address:</strong> {location.address}</div>
                  </div>
                </div>

                {/* Aadhaar (Optional) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('aadhaarOpt')}</label>
                  <input
                    type="text"
                    value={aadhaar}
                    onChange={e => setAadhaar(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-sm font-medium"
                  />
                </div>

                {/* Phone verification simulator */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-55/40 dark:bg-slate-950/20 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Phone Verification Check
                  </h4>
                  
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={sendOtpRequest}
                      className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Send Verification SMS OTP
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP code"
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold outline-none focus:border-primary text-center"
                        />
                        <button
                          type="button"
                          onClick={verifyOtpRequest}
                          disabled={isVerifyingOtp}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          {isVerifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                        </button>
                      </div>
                      {isOtpVerified ? (
                        <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Phone OTP Verified successfully!
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400">
                          Hint: Enter standard code <strong>123456</strong> to verify or check terminal.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-1 active:scale-98 transition-all"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegisterSubmit}
                className="w-full py-3.5 bg-secondary text-white rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-1 active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> {t('agreeRegister')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
