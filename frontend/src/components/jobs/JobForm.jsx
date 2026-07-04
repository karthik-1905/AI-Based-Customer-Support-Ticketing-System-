import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../../utils/formatters.js';
import { Check, ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = ['Basic Info', 'Requirements', 'Details & Preview'];

const JobForm = ({ onSubmit, initialData = {}, loading = false }) => {
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState(initialData.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [requirements, setRequirements] = useState(initialData.requirements || ['']);

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm({
    defaultValues: {
      title: initialData.title || '',
      company: initialData.company || '',
      department: initialData.department || '',
      location: initialData.location || '',
      type: initialData.type || 'full_time',
      experience: initialData.experience || 'mid',
      salaryMin: initialData.salaryMin || '',
      salaryMax: initialData.salaryMax || '',
      currency: initialData.currency || 'USD',
      description: initialData.description || '',
      deadline: initialData.deadline || '',
      remote: initialData.remote || false,
    },
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 15) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((sk) => sk !== s));

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (i) => setRequirements(requirements.filter((_, idx) => idx !== i));
  const updateRequirement = (i, val) => {
    const newReqs = [...requirements];
    newReqs[i] = val;
    setRequirements(newReqs);
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 0
      ? ['title', 'company', 'department', 'location', 'type', 'experience']
      : step === 1
      ? ['description']
      : [];
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const formData = watch();

  const handleFinalSubmit = (data) => {
    if (skills.length === 0) {
      toast.error('Add at least one required skill');
      return;
    }
    onSubmit?.({ ...data, skills, requirements: requirements.filter(Boolean) });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step ? 'bg-accent text-white' :
                  i === step ? 'bg-primary text-white' :
                  'bg-slate-100 text-slate-400'
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-text' : 'text-text-muted'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i < step ? 'bg-accent' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFinalSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="label">Job Title *</label>
                  <input {...register('title', { required: 'Job title is required' })} placeholder="e.g. Senior Frontend Engineer" className="input-field" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="label">Company *</label>
                  <input {...register('company', { required: 'Company is required' })} placeholder="Company name" className="input-field" />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="label">Department *</label>
                  <input {...register('department', { required: 'Department is required' })} placeholder="e.g. Engineering" className="input-field" />
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="label">Location *</label>
                  <input {...register('location', { required: 'Location is required' })} placeholder="e.g. San Francisco, CA" className="input-field" />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="label">Job Type *</label>
                  <select {...register('type')} className="input-field">
                    {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Experience Level *</label>
                  <select {...register('experience')} className="input-field">
                    {EXPERIENCE_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Min Salary</label>
                  <div className="flex gap-2">
                    <select {...register('currency')} className="input-field !w-20 flex-shrink-0">
                      <option value="USD">$</option>
                      <option value="EUR">€</option>
                      <option value="GBP">£</option>
                    </select>
                    <input {...register('salaryMin')} type="number" placeholder="80,000" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Max Salary</label>
                  <input {...register('salaryMax')} type="number" placeholder="120,000" className="input-field" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('remote')} id="remote" className="w-4 h-4 accent-primary" />
                <label htmlFor="remote" className="text-sm text-text font-medium cursor-pointer">This is a remote-friendly position</label>
              </div>
            </motion.div>
          )}

          {/* Step 2: Requirements */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className="label">Job Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'At least 50 characters required' } })}
                  rows={6}
                  placeholder="Describe the role, responsibilities, team culture..."
                  className="input-field resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="label">Requirements</label>
                <div className="space-y-2">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={req}
                        onChange={(e) => updateRequirement(i, e.target.value)}
                        placeholder={`Requirement ${i + 1}...`}
                        className="input-field"
                      />
                      {requirements.length > 1 && (
                        <button type="button" onClick={() => removeRequirement(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addRequirement} className="flex items-center gap-1 text-sm text-primary hover:text-primary-700 font-medium">
                    <Plus size={14} /> Add requirement
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Required Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                    placeholder="e.g. React, TypeScript, AWS..."
                    className="input-field"
                  />
                  <button type="button" onClick={addSkill} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex-shrink-0">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Application Deadline</label>
                <input {...register('deadline')} type="date" className="input-field" />
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-100">
                <h2 className="text-xl font-bold text-text mb-1">{formData.title || 'Job Title'}</h2>
                <p className="text-text-light text-sm mb-4">{formData.company} · {formData.department} · {formData.location}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-primary">{formData.type?.replace('_', ' ')}</span>
                  <span className="badge badge-secondary">{formData.experience} level</span>
                  {formData.remote && <span className="badge bg-teal-100 text-teal-700">🌐 Remote</span>}
                </div>
                <p className="text-sm text-text-light whitespace-pre-wrap line-clamp-4">{formData.description}</p>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((s) => (
                      <span key={s} className="text-xs bg-white text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-text-muted text-center">Review your job posting above before publishing.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-text-light hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-60"
            >
              {loading ? 'Publishing...' : '🚀 Publish Job'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default JobForm;
