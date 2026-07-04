import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Brain, Sparkles, Target, GitBranch, Calendar, BarChart3, FileText, ArrowRight, CheckCircle, Star, Twitter, Linkedin, Github, Mail, Play, Users, Building2, TrendingUp, Award } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import { testimonials } from '../data/mockData.js';

// Animated counter hook
const useCounter = (target, duration = 2000, inView) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);
  return count;
};

const AnimatedSection = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StatItem = ({ value, suffix, label, inView }) => {
  const count = useCounter(value, 2000, inView);
  return (
    <div className="text-center">
      <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-blue-200 text-sm font-medium">{label}</p>
    </div>
  );
};

const features = [
  {
    icon: FileText,
    title: 'AI Resume Parsing',
    description: 'Extract skills, experience, and qualifications from any resume format instantly with 99% accuracy.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Target,
    title: 'Smart Skill Matching',
    description: 'Intelligently match candidate skills to job requirements and surface the best fits automatically.',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'Candidate Ranking',
    description: 'AI-powered scoring ranks candidates by fit, reducing time-to-shortlist by up to 80%.',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    icon: GitBranch,
    title: 'Hiring Pipeline',
    description: 'Visual Kanban board to manage candidates through every stage of your hiring process.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Calendar,
    title: 'Interview Scheduling',
    description: 'One-click scheduling with calendar sync, automated reminders, and panel management.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights into your hiring funnel, time-to-hire, source effectiveness, and more.',
    color: 'from-pink-500 to-rose-500',
  },
];

const steps = [
  { num: '01', title: 'Post Your Job', desc: 'Create a detailed job listing in minutes. Our AI helps craft optimal descriptions to attract top talent.' },
  { num: '02', title: 'AI Screens Candidates', desc: 'Resumes are automatically parsed, scored, and ranked. You get a prioritized shortlist instantly.' },
  { num: '03', title: 'Hire the Best', desc: 'Move candidates through your pipeline, schedule interviews, and extend offers — all in one place.' },
];

const Landing = () => {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── Hero Section ───────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-bg">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
          {/* Grid dots */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-primary/20"
              >
                <Sparkles size={14} />
                AI-Powered Recruitment Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-text leading-tight mb-6"
              >
                Smarter Hiring
                <br />
                <span className="text-gradient">Powered by AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-text-light leading-relaxed mb-8 max-w-lg"
              >
                Automate resume screening, rank candidates by AI match score, and fill positions 3x faster with our intelligent recruitment platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <Link to="/register" className="btn-primary flex items-center gap-2 text-base !px-7 !py-3.5 shadow-glow-primary">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-lg border-2 border-slate-200 text-text font-semibold hover:border-primary/40 hover:bg-primary/3 transition-all duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Play size={12} className="text-white ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-6 text-sm text-text-muted"
              >
                {['No credit card required', 'Free 14-day trial', '24/7 support'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-accent" />
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Floating mockup cards */}
            <div className="relative hidden lg:block h-[480px]">
              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-8 left-8 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-text">AI Match Results</p>
                    <p className="text-xs text-text-muted">Senior Frontend Engineer</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">47 applicants</span>
                </div>

                {[
                  { name: 'Sarah Chen', score: 94, skills: ['React', 'TypeScript', 'AWS'] },
                  { name: 'Marcus Williams', score: 88, skills: ['React', 'Node.js', 'GraphQL'] },
                  { name: 'Priya Patel', score: 76, skills: ['Vue', 'JavaScript', 'CSS'] },
                ].map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/80 to-accent/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {c.name.split(' ').map((w) => w[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text">{c.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {c.skills.map((s) => <span key={s} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{s}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                        style={{
                          borderColor: c.score >= 85 ? '#22C55E' : c.score >= 70 ? '#2563EB' : '#F59E0B',
                          color: c.score >= 85 ? '#16A34A' : c.score >= 70 ? '#2563EB' : '#D97706',
                        }}
                      >
                        {c.score}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Floating stats cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-2 -left-4 bg-white rounded-xl shadow-xl border border-slate-100 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Time to Hire</p>
                  <p className="font-bold text-text text-sm">↓ 62% faster</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-0 -right-4 bg-white rounded-xl shadow-xl border border-slate-100 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Match Accuracy</p>
                  <p className="font-bold text-text text-sm">95.3%</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────── */}
      <section ref={statsRef} className="animated-gradient py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={50} suffix="K+" label="Companies Trust Us" inView={statsInView} />
            <StatItem value={2} suffix="M+" label="Candidates Processed" inView={statsInView} />
            <StatItem value={95} suffix="%" label="Match Accuracy" inView={statsInView} />
            <StatItem value={3} suffix="x" label="Faster Hiring" inView={statsInView} />
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-text mt-3 mb-4">
              Everything You Need to <span className="text-gradient">Hire Smarter</span>
            </h2>
            <p className="text-text-light text-xl max-w-2xl mx-auto">
              Our AI-powered suite handles the heavy lifting so you can focus on what matters — finding the right people.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card h-full transition-all duration-300 cursor-default"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                    <feature.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">{feature.title}</h3>
                  <p className="text-text-light text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Process</span>
            <h2 className="text-4xl font-extrabold text-text mt-3">How It Works</h2>
          </AnimatedSection>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {steps.map((step, i) => (
                <AnimatedSection key={step.num} delay={i * 0.15}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20 text-white text-xl font-black">
                      {step.num}
                    </div>
                    <h3 className="text-xl font-bold text-text mb-3">{step.title}</h3>
                    <p className="text-text-light text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-extrabold text-text mt-3">Loved by Hiring Teams</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card h-full flex flex-col"
                >
                  <div className="flex mb-4">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-text-light text-sm leading-relaxed flex-1 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-50">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.name.split(' ').map((w) => w[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-text text-sm">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.title} · {t.company}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <AnimatedSection>
        <section className="py-24 mx-4 sm:mx-8 lg:mx-16 mb-12 rounded-3xl animated-gradient overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Start Hiring Smarter Today
            </h2>
            <p className="text-blue-100 text-xl mb-10">
              Join 50,000+ companies using RecruitAI to build world-class teams faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your work email"
                className="flex-1 px-5 py-3.5 rounded-xl text-text bg-white/90 backdrop-blur-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
              />
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap"
              >
                Get Started Free →
              </Link>
            </div>
            <p className="text-blue-200 text-xs mt-4">No credit card required · 14-day free trial</p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Brain size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">RecruitAI</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                The AI-powered recruitment platform that helps you hire the right people, faster.
              </p>
              <div className="flex gap-3 mt-5">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
                    <Icon size={16} className="text-slate-400 hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Enterprise', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm">© 2026 RecruitAI. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-sm">
              <Mail size={14} /> support@recruitai.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
