import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Users, MapPin, ShieldCheck, HeartHandshake, PhoneCall, ArrowRight, CheckCircle2, ChevronDown, Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const skillsList = [
    { name: 'Carpenter', count: '45+ Workers', icon: '🪚' },
    { name: 'Mason', count: '60+ Workers', icon: '🧱' },
    { name: 'Electrician', count: '50+ Workers', icon: '⚡' },
    { name: 'Plumber', count: '35+ Workers', icon: '🔧' },
    { name: 'Painter', count: '40+ Workers', icon: '🖌️' },
    { name: 'Welder', count: '20+ Workers', icon: '🧑‍🏭' },
    { name: 'Tile Worker', count: '28+ Workers', icon: '📐' },
    { name: 'House Cleaner', count: '75+ Workers', icon: '🧹' }
  ];

  const faqs = [
    {
      q: "How does GPS matching work?",
      a: "When workers register, we automatically record their coordinates using their device's GPS. When you search for workers, we show you the closest available workers and teams matching your criteria, complete with direct navigation routes."
    },
    {
      q: "Is there any commission or platform fee?",
      a: "No! LaborLink connects workers directly with hirers. The daily wages or team fees are settled directly between you and the worker, using cash, UPI, or other methods."
    },
    {
      q: "How are workers verified?",
      a: "Workers have the option to verify their Aadhaar identity and mobile number (OTP check). Verified workers get a 'Verified' green check badge, making them much more trustworthy to hirers."
    },
    {
      q: "What is Group Registration?",
      a: "If you run a painting, construction, or tiling team, you can register as a Group. Only the leader registers, specifying the total team members and group daily rates. Hirers can book the entire team with one click."
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pb-24">
        {/* Colorful Abstract Background Blurs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 dark:bg-primary/20 rounded-full text-xs font-semibold text-primary mb-4 animate-fade-in border border-primary/20">
            <Award className="w-3.5 h-3.5" /> India's Smartest Labor Connection Portal
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-display leading-[1.15] bg-gradient-to-r from-slate-900 via-primary to-slate-900 dark:from-white dark:via-primary-light dark:to-white bg-clip-text text-transparent">
            {t('tagline')}
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 max-w-sm sm:max-w-md mx-auto">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-base font-semibold shadow-premium hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group active:scale-95"
            >
              {t('registerLabor')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/find')}
              className="px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95"
            >
              {t('hireWorkers')}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-display">{t('howItWorks')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Three simple steps to connect and get your work completed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Search Location & Skill", desc: "Select the required trade skill (e.g., Electrician, Carpenter) and locate workers on the live map near you.", color: "text-primary" },
            { step: "02", title: "Review & Connect Directly", desc: "Browse workers' verified credentials, past work portfolios, wages, and start a direct mobile call or WhatsApp text.", color: "text-secondary" },
            { step: "03", title: "Book Instantly", desc: "Click 'Hire Now' to reserve the labor. Once the task is finished, workers revert back to 'Available' for their next booking.", color: "text-accent" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-premium flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
              <span className={`text-5xl font-black ${item.color} opacity-40 font-display mb-4`}>{item.step}</span>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Skills */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-display">{t('popularSkills')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Instant support for multiple specialized handymen crafts.</p>
          </div>
          <button
            onClick={() => navigate('/find')}
            className="text-primary hover:text-primary-dark text-sm font-semibold flex items-center gap-1 active:translate-x-0.5 transition-all"
          >
            Explore all categories →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {skillsList.map((skill, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/find?skill=${skill.name}`)}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-premium hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer flex flex-col items-center text-center space-y-3"
            >
              <span className="text-4xl">{skill.icon}</span>
              <div>
                <h4 className="font-bold text-sm">{skill.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{skill.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-900 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-8 rounded-3xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">{t('whyChooseUs')}</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We leverage direct technology integrations to bypass middleman brokerages and provide maximum daily wages directly to working laborers.
            </p>
            <ul className="space-y-3">
              {[
                { title: "Direct Dial & WhatsApp Integration", desc: "No complex scheduling setups. Chat directly with labors." },
                { title: "GPS Centered Search Radius", desc: "Identify active tradesmen living in your neighborhood." },
                { title: "Safe & Verified Badging", desc: "Secure Aadhaar authentication checks." }
              ].map((li, index) => (
                <li key={index} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">{li.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{li.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Card Mockup Visual */}
          <div className="bg-slate-800 border border-slate-700/60 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span className="text-xs font-semibold text-slate-400">🟡 Hired Status Demo</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">🟢 AVAILABLE</span>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold">RK</div>
              <div>
                <h4 className="font-bold text-sm">Raju Kumar (Electrician)</h4>
                <p className="text-xs text-slate-400">Hyderabad • 6 Years Exp</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700">Daily Wage: <strong>₹600</strong></div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700">Rating: <strong>★ 4.8</strong></div>
            </div>
            <button className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-dark transition-all">
              Instant Booking
            </button>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-display">{t('successStories')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Hear from real workers and hirers who trust LaborLink.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              quote: "With LaborLink, I registered in just 2 minutes and selected my location. In the first week, I got 4 plumbing job requests directly on WhatsApp. I earn full wages without paying commissions to contractors!",
              author: "Satish Prasad (Plumber, Secunderabad)",
              role: "Labor"
            },
            {
              quote: "I needed a tile painting crew urgently for our new apartment. Using LaborLink, I found a 5-member team just 2 kilometers away. I could review their work photos, call the leader, and confirm everything within 10 minutes.",
              author: "Meenakshi Reddy (Homeowner, Vijayawada)",
              role: "Hirer"
            }
          ].map((story, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-premium relative">
              <span className="text-6xl text-slate-200 dark:text-slate-800 font-serif absolute top-4 left-6 pointer-events-none">“</span>
              <div className="space-y-4 relative z-10 pt-4">
                <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                  {story.quote}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{story.author}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${story.role === 'Labor' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                    {story.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 space-y-10">
        <h2 className="text-3xl font-bold font-display text-center">{t('faq')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === index && (
                <div className="p-5 pt-0 border-t border-slate-50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
