import { useState, useEffect, useRef, type ReactNode } from 'react'
import './App.css'

/* Auto-scroll a section into view on mobile after a user action.
   No-op on desktop (>960px). */
const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 960
const scrollToOnMobile = (el: HTMLElement | null) => {
  if (!el || !isMobileViewport()) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

type ScreenId = 'dashboard' | 'triage' | 'whatsapp' | 'medication' | 'paylater' | 'dependents' | 'wallet' | 'history' | 'records' | 'insurance'

const fmt = (n: number) => n.toLocaleString()

// ============ ICONS (reused inline SVGs) ============
const IconHome = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconHeart = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconBag = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h18l-2 13H5L3 3zM7 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconClock = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconUsers = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h2m6-4a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconProfile = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

// ============ DATA ============
type UtilRow = { type: string; label: string; date: string; provider: string; amount: number; wallet: number; copay: number; note: string }
const utilData: UtilRow[] = [
  { type: 'consult', label: 'Consultation', date: '06 May 2026', provider: 'Dr. Akinyi · CheckUps Lavington', amount: 3500, wallet: 2800, copay: 700, note: 'Cardiology follow-up' },
  { type: 'lab', label: 'Lab', date: '02 May 2026', provider: 'Lancet · Westlands', amount: 4200, wallet: 4200, copay: 0, note: 'Lipid panel + CBC' },
  { type: 'pharm', label: 'Pharmacy', date: '28 Apr 2026', provider: 'Goodlife Pharmacy · Yaya', amount: 6800, wallet: 5440, copay: 1360, note: 'NCD medication refill' },
  { type: 'scan', label: 'Scan', date: '22 Apr 2026', provider: 'Aga Khan Imaging', amount: 12000, wallet: 9000, copay: 3000, note: 'Echocardiogram' },
  { type: 'consult', label: 'Consultation', date: '14 Apr 2026', provider: 'Telehealth · CheckUps Virtual', amount: 1200, wallet: 1200, copay: 0, note: 'Mental health session' },
  { type: 'spec', label: 'Specialist', date: '08 Apr 2026', provider: 'Dr. Wanjiku · Endocrinology', amount: 5500, wallet: 4400, copay: 1100, note: 'Thyroid review' },
  { type: 'pharm', label: 'Pharmacy', date: '02 Apr 2026', provider: 'Goodlife Pharmacy · Yaya', amount: 6800, wallet: 5440, copay: 1360, note: 'NCD medication refill' },
  { type: 'lab', label: 'Lab', date: '28 Mar 2026', provider: 'Pathologists Lancet', amount: 3800, wallet: 3800, copay: 0, note: 'HbA1c + fasting glucose' },
  { type: 'consult', label: 'Consultation', date: '20 Mar 2026', provider: 'Dr. Otieno · GP CheckUps Karen', amount: 2800, wallet: 2800, copay: 0, note: 'Annual physical' },
  { type: 'spec', label: 'Specialist', date: '12 Mar 2026', provider: 'Dr. Akinyi · Cardiology', amount: 6500, wallet: 5200, copay: 1300, note: 'Initial cardiology consult' },
  { type: 'pharm', label: 'Pharmacy', date: '04 Mar 2026', provider: 'Goodlife Pharmacy · Yaya', amount: 6800, wallet: 5440, copay: 1360, note: 'NCD medication refill' },
  { type: 'scan', label: 'Scan', date: '18 Feb 2026', provider: 'Mediheal Imaging', amount: 6000, wallet: 4800, copay: 1200, note: 'Chest X-ray' }
]

type PayRow = { pkg: string; kind: string; date: string; time: string; amount: number; method: string; status: string }
const payData: PayRow[] = [
  { pkg: 'Standard plan', kind: 'standard', date: '01 May 2026', time: '09:14', amount: 5000, method: 'M-Pesa STK · auto-debit', status: 'paid' },
  { pkg: 'Top-up boost', kind: 'topup', date: '22 Apr 2026', time: '17:42', amount: 3000, method: 'Rukisha rail', status: 'paid' },
  { pkg: 'Standard plan', kind: 'standard', date: '01 Apr 2026', time: '09:01', amount: 5000, method: 'M-Pesa STK · auto-debit', status: 'paid' },
  { pkg: 'Save-as-you-spend', kind: 'say', date: '18 Mar 2026', time: '23:59', amount: 2400, method: 'KCB Bank · round-up', status: 'paid' },
  { pkg: 'Standard plan', kind: 'standard', date: '01 Mar 2026', time: '09:08', amount: 5000, method: 'M-Pesa STK · auto-debit', status: 'paid' },
  { pkg: 'Top-up boost', kind: 'topup', date: '14 Feb 2026', time: '11:22', amount: 2000, method: 'Rukisha rail', status: 'paid' },
  { pkg: 'Save-as-you-spend', kind: 'say', date: '12 Feb 2026', time: '20:14', amount: 1800, method: 'KCB Bank · round-up', status: 'paid' },
  { pkg: 'Standard plan', kind: 'standard', date: '01 Feb 2026', time: '09:03', amount: 5000, method: 'M-Pesa STK · auto-debit', status: 'paid' },
  { pkg: 'Standard plan', kind: 'standard', date: '01 Jan 2026', time: '09:11', amount: 5000, method: 'M-Pesa STK · auto-debit', status: 'paid' }
]

type LoanRow = { ref: string; drawn: string; amount: number; outstanding: number; next: string; state: string; purpose: string }
const loanData: LoanRow[] = [
  { ref: 'HNPL-26-01142', drawn: '14 Mar 2026', amount: 18000, outstanding: 11500, next: '15 May · KES 2,200', state: 'active', purpose: 'Echocardiogram + cardiology follow-up' },
  { ref: 'HNPL-26-00874', drawn: '02 Feb 2026', amount: 8500, outstanding: 0, next: '— settled —', state: 'settled', purpose: 'Specialist referral · endocrinology' },
  { ref: 'HNPL-25-09321', drawn: '18 Nov 2025', amount: 22000, outstanding: 0, next: '— settled —', state: 'settled', purpose: 'Dependent dental · Sarah' }
]

type LeaveRow = { ref: string; period: string; days: number; reason: string; status: string; state: string }
const leaveData: LeaveRow[] = [
  { ref: 'SL-2026-007', period: '02–03 May 2026', days: 2, reason: 'Acute viral illness', status: 'approved', state: 'approved' },
  { ref: 'SL-2026-005', period: '15 Apr 2026', days: 1, reason: 'Migraine — confirmed by Dr. Akinyi', status: 'approved', state: 'approved' },
  { ref: 'SL-2026-009', period: '20–21 May 2026', days: 2, reason: 'Pre-scheduled procedure', status: 'pending', state: 'pending' },
  { ref: 'SL-2026-003', period: '22 Mar 2026', days: 1, reason: 'Dependent care · son fever', status: 'approved', state: 'approved' },
  { ref: 'SL-2026-001', period: '08 Feb 2026', days: 1, reason: 'Stomach upset', status: 'approved', state: 'approved' }
]

type Vitals = { bps: number; bpd: number; hr: number; wt: number; temp: number; mood: string }
type Dep = { id: string; initials: string; name: string; meta: string; vitalsDate: string; vitals: Vitals }
const dependents: Dep[] = [
  { id: 'self', initials: 'DM', name: 'Daniel Moka (you)', meta: 'Self · 42 · Active cover', vitalsDate: '06 May 2026', vitals: { bps: 128, bpd: 82, hr: 72, wt: 78, temp: 36.6, mood: 'Calm' } },
  { id: 'sarah', initials: 'SM', name: 'Sarah Moka', meta: 'Spouse · 36 · Active cover', vitalsDate: '28 Apr 2026', vitals: { bps: 118, bpd: 76, hr: 68, wt: 62, temp: 36.5, mood: 'Stable' } },
  { id: 'james', initials: 'JM', name: 'James Moka', meta: 'Son · 9 · Active cover', vitalsDate: '12 Apr 2026', vitals: { bps: 102, bpd: 64, hr: 88, wt: 28, temp: 36.7, mood: 'Energized' } },
  { id: 'amelia', initials: 'AM', name: 'Amelia Moka', meta: 'Daughter · 6 · Active cover', vitalsDate: '04 Apr 2026', vitals: { bps: 98, bpd: 62, hr: 92, wt: 21, temp: 36.6, mood: 'Calm' } }
]

type MedItem = { kind: string; date: string; title: string; d: string }
const medHistory: Record<string, MedItem[]> = {
  self: [
    { kind: 'consult', date: '06 May', title: 'Cardiology consult — Dr. Akinyi', d: 'BP 128/82, advised to continue current antihypertensive. Re-check 6 weeks.' },
    { kind: 'report', date: '02 May', title: 'Lab report — Lipid panel + CBC', d: 'LDL 142 mg/dL (slightly elevated), HDL 51, fasting glucose 5.4 mmol/L. CBC within limits.' },
    { kind: 'consult', date: '22 Apr', title: 'Echocardiogram — Aga Khan Imaging', d: 'Mild LVH, normal ejection fraction 58%. No regional wall motion abnormalities.' },
    { kind: 'consult', date: '14 Apr', title: 'Mental health session — telehealth', d: 'CBT session 4 of 8. Sleep hygiene targets discussed; PHQ-9 score: 6.' },
    { kind: 'report', date: '28 Mar', title: 'Visit summary — annual physical', d: 'Comprehensive review. Action items: weight management, lipid recheck in 6 weeks.' }
  ],
  sarah: [
    { kind: 'consult', date: '28 Apr', title: 'Annual gynecology — Dr. Mwangi', d: 'Routine review, all parameters within normal range. Next due 12 months.' },
    { kind: 'report', date: '14 Apr', title: 'Lab report — full blood count', d: 'Hb 13.4, all parameters normal.' },
    { kind: 'consult', date: '02 Mar', title: 'Dental cleaning — Smile Studios', d: 'Routine cleaning. No cavities. Floss daily reinforced.' }
  ],
  james: [
    { kind: 'consult', date: '12 Apr', title: 'Pediatric consult — Dr. Kamau', d: 'Growth on 50th percentile. Vaccinations up to date. Mild seasonal cough — supportive care.' },
    { kind: 'report', date: '22 Mar', title: 'School health screening', d: 'Vision 20/20, hearing normal. No issues flagged.' }
  ],
  amelia: [
    { kind: 'consult', date: '04 Apr', title: 'Pediatric consult — Dr. Kamau', d: 'Routine well-child visit. Growth on 60th percentile. Feeding well.' },
    { kind: 'consult', date: '18 Feb', title: 'Vaccination — DPT booster', d: 'DPT booster administered. No adverse reactions. Next due in 5 years.' }
  ]
}

type PrevCard = { id: string; iconPath: string; label: string; value: string; sub: string; status: 'ontrack' | 'duesoon' | 'action'; cta: { kind: 'coral' | 'ghost'; text: string } }
const prevHealthData: Record<string, { name: string; cards: PrevCard[] }> = {
  self: {
    name: 'Daniel',
    cards: [
      { id: 'wellness', iconPath: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', label: 'Wellness check', value: 'Done · 14 Mar 2026', sub: '', status: 'ontrack', cta: { kind: 'ghost', text: 'View report' } },
      { id: 'mental', iconPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Mental health check', value: 'Done · 14 Apr 2026', sub: 'PHQ-9 score 6', status: 'ontrack', cta: { kind: 'ghost', text: 'Book follow-up' } },
      { id: 'visits', iconPath: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Outpatient visits (90d)', value: '4 visits', sub: 'Last: 06 May · Cardiology', status: 'ontrack', cta: { kind: 'ghost', text: 'View history' } },
      { id: 'refill', iconPath: 'M3 3h18l-2 13H5L3 3zM7 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z', label: 'Medication refill', value: 'Due in 4 days', sub: 'Atorvastatin · Telmisartan', status: 'action', cta: { kind: 'coral', text: 'Order refill now' } },
      { id: 'sickleave', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Sick leave', value: '3 of 14 used', sub: 'Balance 11 days · resets 31 Dec', status: 'ontrack', cta: { kind: 'ghost', text: 'Request leave' } },
      { id: 'pain', iconPath: 'M9 12l2 2 4-4M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9', label: 'Pain management', value: 'Score 3.2 / 10', sub: '↓ down from 5.1 last month', status: 'ontrack', cta: { kind: 'ghost', text: 'Log symptom' } }
    ]
  },
  sarah: {
    name: 'Sarah',
    cards: [
      { id: 'wellness', iconPath: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', label: 'Wellness check', value: 'Last done 28 Apr 2025', sub: 'Annual screening overdue', status: 'duesoon', cta: { kind: 'coral', text: 'Schedule wellness' } },
      { id: 'mental', iconPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Mental health check', value: 'Not yet captured', sub: 'No prior session on file', status: 'action', cta: { kind: 'coral', text: 'Book session' } },
      { id: 'visits', iconPath: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Outpatient visits (90d)', value: '2 visits', sub: 'Last: 28 Apr · OB-GYN', status: 'ontrack', cta: { kind: 'ghost', text: 'View history' } },
      { id: 'refill', iconPath: 'M3 3h18l-2 13H5L3 3zM7 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z', label: 'Medication refill', value: 'No active prescription', sub: 'No refills due', status: 'ontrack', cta: { kind: 'ghost', text: 'Book consult' } },
      { id: 'sickleave', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Sick leave', value: '0 of 14 used', sub: '14 days available', status: 'ontrack', cta: { kind: 'ghost', text: 'Request leave' } },
      { id: 'pain', iconPath: 'M9 12l2 2 4-4M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9', label: 'Pain management', value: 'No program', sub: 'Not currently active', status: 'ontrack', cta: { kind: 'ghost', text: 'Log symptom' } }
    ]
  },
  james: {
    name: 'James',
    cards: [
      { id: 'wellness', iconPath: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', label: 'Wellness check', value: 'Done · 12 Apr 2026', sub: 'School health screening', status: 'ontrack', cta: { kind: 'ghost', text: 'View report' } },
      { id: 'mental', iconPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Mental health check', value: 'Pediatric check 12 Apr', sub: 'No concerns flagged', status: 'ontrack', cta: { kind: 'ghost', text: 'View notes' } },
      { id: 'visits', iconPath: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Outpatient visits (90d)', value: '3 visits', sub: 'Last: 12 Apr · Dr. Kamau', status: 'ontrack', cta: { kind: 'ghost', text: 'View history' } },
      { id: 'refill', iconPath: 'M3 3h18l-2 13H5L3 3zM7 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z', label: 'Medication refill', value: 'No active prescription', sub: 'Last cough syrup 22 Mar', status: 'ontrack', cta: { kind: 'ghost', text: 'Book consult' } },
      { id: 'sickleave', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'School absence', value: '2 days used', sub: 'Last: 22 Mar', status: 'ontrack', cta: { kind: 'ghost', text: 'Submit note' } },
      { id: 'pain', iconPath: 'M9 12l2 2 4-4M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9', label: 'Pain management', value: 'No program', sub: 'Not currently active', status: 'ontrack', cta: { kind: 'ghost', text: 'Log symptom' } }
    ]
  },
  amelia: {
    name: 'Amelia',
    cards: [
      { id: 'wellness', iconPath: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', label: 'Wellness check', value: 'Done · 04 Apr 2026', sub: 'Well-child visit', status: 'ontrack', cta: { kind: 'ghost', text: 'View report' } },
      { id: 'mental', iconPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', label: 'Mental health check', value: 'Age-appropriate', sub: 'Behavioral screening normal', status: 'ontrack', cta: { kind: 'ghost', text: 'View notes' } },
      { id: 'visits', iconPath: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Outpatient visits (90d)', value: '2 visits', sub: 'Last: 04 Apr · Pediatrics', status: 'ontrack', cta: { kind: 'ghost', text: 'View history' } },
      { id: 'refill', iconPath: 'M3 3h18l-2 13H5L3 3zM7 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z', label: 'Vaccination', value: 'DPT done · 18 Feb', sub: 'Next due in 5 yrs', status: 'ontrack', cta: { kind: 'ghost', text: 'Vaccine schedule' } },
      { id: 'sickleave', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'School absence', value: '0 days used', sub: 'No absences this term', status: 'ontrack', cta: { kind: 'ghost', text: 'Submit note' } },
      { id: 'pain', iconPath: 'M9 12l2 2 4-4M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9', label: 'Pain management', value: 'No program', sub: 'Not currently active', status: 'ontrack', cta: { kind: 'ghost', text: 'Log symptom' } }
    ]
  }
}

const triageCategories = [
  { id: 'resp', name: 'Respiratory', sub: 'Chest, breathing, cough', iconPath: 'M12 2v6m0 14v-6m-7-1a5 5 0 015-5h4a5 5 0 015 5v0a5 5 0 01-5 5h-4a5 5 0 01-5-5z', signs: ['Persistent cough', 'Shortness of breath', 'Wheezing', 'Chest tightness', 'Phlegm production', 'Sore throat', 'Runny nose', 'Hoarse voice'] },
  { id: 'gi', name: 'Digestive', sub: 'Stomach, bowel, appetite', iconPath: 'M9 11l3 3 3-3M12 4v10m0 0c-3 0-7 1-7 4v2h14v-2c0-3-4-4-7-4z', signs: ['Abdominal pain', 'Nausea', 'Vomiting', 'Diarrhoea', 'Constipation', 'Loss of appetite', 'Bloating', 'Heartburn'] },
  { id: 'cardio', name: 'Cardiac', sub: 'Heart, BP, palpitations', iconPath: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', signs: ['Chest pain', 'Palpitations', 'Dizziness', 'Fainting episodes', 'Swollen ankles', 'Shortness of breath on exertion', 'Irregular heartbeat'] },
  { id: 'mental', name: 'Mental health', sub: 'Mood, sleep, anxiety', iconPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', signs: ['Persistent low mood', 'Anxiety / panic', 'Sleep difficulty', 'Loss of interest', 'Difficulty concentrating', 'Excessive worry', 'Feeling overwhelmed', 'Irritability'] },
  { id: 'derm', name: 'Skin', sub: 'Rash, itching, lesions', iconPath: 'M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z', signs: ['Rash', 'Itching', 'Skin lesion', 'Discoloration', 'Dry / flaking skin', 'Bumps or lumps'] },
  { id: 'msk', name: 'Musculoskeletal', sub: 'Joints, muscles, back', iconPath: 'M12 4v16m-8-8h16', signs: ['Joint pain', 'Back pain', 'Muscle stiffness', 'Reduced range of motion', 'Swelling', 'Numbness or tingling'] },
  { id: 'neuro', name: 'Neurological', sub: 'Headache, vision, balance', iconPath: 'M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z', signs: ['Persistent headache', 'Migraine', 'Vision changes', 'Dizziness', 'Memory concerns', 'Numbness'] },
  { id: 'gyn', name: "Women's health", sub: 'Cycle, pregnancy, reproductive', iconPath: 'M12 4a4 4 0 110 8 4 4 0 010-8zm0 8v6m-3 0h6', signs: ['Irregular cycles', 'Pelvic pain', 'Heavy bleeding', 'Pregnancy concerns', 'Hot flashes', 'Discharge'] }
]

type Doctor = { id: number; av: string; name: string; spec: string; specName: string; meta: string; avail: 'online' | 'busy' | 'offline'; rate: number; rating: number; sessions: number }
const doctors: Doctor[] = [
  { id: 1, av: 'AK', name: 'Dr. Mary Akinyi', spec: 'cardio', specName: 'Cardiology · MMed', meta: '12 yrs · CheckUps Lavington', avail: 'online', rate: 1500, rating: 4.9, sessions: 248 },
  { id: 2, av: 'JO', name: 'Dr. Joseph Otieno', spec: 'gp', specName: 'GP · Family medicine', meta: '8 yrs · CheckUps Karen', avail: 'online', rate: 800, rating: 4.8, sessions: 412 },
  { id: 3, av: 'GW', name: 'Dr. Grace Wanjiku', spec: 'cardio', specName: 'Endocrinology', meta: '15 yrs · CheckUps Westlands', avail: 'busy', rate: 2000, rating: 4.9, sessions: 187 },
  { id: 4, av: 'PK', name: 'Dr. Peter Kamau', spec: 'peds', specName: 'Pediatrics', meta: '10 yrs · CheckUps Karen', avail: 'online', rate: 1200, rating: 4.9, sessions: 326 },
  { id: 5, av: 'NM', name: 'Dr. Nala Mwangi', spec: 'mental', specName: 'Psychiatry · CBT', meta: '7 yrs · Telehealth', avail: 'online', rate: 1800, rating: 4.7, sessions: 198 },
  { id: 6, av: 'SO', name: 'Dr. Samuel Omondi', spec: 'gp', specName: 'GP · Internal medicine', meta: '14 yrs · Eldoret', avail: 'offline', rate: 800, rating: 4.8, sessions: 287 }
]

const recentChats = [
  { who: 'Dr. Akinyi', last: '"Continue current dose, recheck BP in 2 weeks"', date: '06 May', unread: 0 },
  { who: 'Dr. Mwangi', last: '"PHQ-9 dropped to 6, great progress"', date: '14 Apr', unread: 1 },
  { who: 'Dr. Kamau', last: '"James OK to return to school tomorrow"', date: '12 Apr', unread: 0 }
]

type Partner = { logo: string; logoSrc?: string; name: string; desc: string; featured?: boolean }
const partners: Record<string, Partner[]> = {
  salaried: [
    { logo: 'CO-OP', logoSrc: '/images/coop-logo.jpg', name: 'Co-operative Bank', desc: 'Salaried Co-op Bank account holders get instant credit at point of need.', featured: true },
    { logo: 'KCB',   logoSrc: '/images/kcb.png',      name: 'KCB Bank',           desc: 'Linked to your KCB salary account. Auto-deduct on next pay date.' },
    { logo: 'SBM',   logoSrc: '/images/sbm.jpg',      name: 'SBM Bank',           desc: 'For SBM payroll clients. Same-day approval on healthcare credit lines.' },
  ],
  business: [
    { logo: 'CKM',   logoSrc: '/images/checkupsLogo.png', name: 'CheckUps direct', desc: 'Independent fast-track approval through CheckUps — no bank required.', featured: true },
    { logo: 'CO-OP', logoSrc: '/images/coop-logo.jpg',    name: 'Co-op Business',  desc: 'For SMEs sponsoring staff health. Bulk approval against business banking.' },
  ],
  members: [
    { logo: 'INK', logoSrc: '/images/inuka-logo.png',  name: 'Inuka Africa',                desc: 'For Inuka member households. Backed by your savings and contribution history.', featured: true },
    { logo: 'PCI', logoSrc: '/images/pensionclub.jpg', name: 'Pension Club International',  desc: 'Pension Club members can draw against future pension contributions.' },
    { logo: 'SAC',                                     name: 'SACCO partners',              desc: 'For members of partner SACCOs — verified through your SACCO record.' },
  ],
}

// ============ SIDEBAR ============
const IconTopup = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14M19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconRecords = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 2h6a2 2 0 012 2v0a2 2 0 01-2 2H9a2 2 0 01-2-2v0a2 2 0 012-2zM5 6h14v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6zM9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconActivity = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconShield = () => (
  <svg className="nav-icon ic18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

const Sidebar = ({ screen, setScreen }: { screen: ScreenId; setScreen: (s: ScreenId) => void }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <img src="/images/checkupsLogo.png" alt="CheckUps" className="sidebar-brand-logo" />
    </div>
    <div className="nav-group">
      <div className="nav-group-title">Health</div>
      <div className={`nav-item${screen === 'dashboard' ? ' active' : ''}`} onClick={() => setScreen('dashboard')}>
        <IconHome /> Dashboard
      </div>
      <div className={`nav-item${screen === 'triage' ? ' active' : ''}`} onClick={() => setScreen('triage')}>
        <IconHeart /> Consult Doctor
      </div>
      <div className={`nav-item${screen === 'medication' ? ' active' : ''}`} onClick={() => setScreen('medication')}>
        <IconBag /> Order Medication
      </div>
    </div>
    <div className="nav-group">
      <div className="nav-group-title">Money</div>
      <div className={`nav-item${screen === 'wallet' ? ' active' : ''}`} onClick={() => setScreen('wallet')}>
        <IconTopup /> Wallet & Top-up
      </div>
      <div className={`nav-item${screen === 'paylater' ? ' active' : ''}`} onClick={() => setScreen('paylater')}>
        <IconClock /> HealthNOW PayLater
      </div>
      <div className={`nav-item${screen === 'history' ? ' active' : ''}`} onClick={() => setScreen('history')}>
        <IconActivity /> Activity & Statements
      </div>
    </div>
    <div className="nav-group">
      <div className="nav-group-title">Family</div>
      <div className={`nav-item${screen === 'dependents' ? ' active' : ''}`} onClick={() => setScreen('dependents')}>
        <IconUsers /> Dependents
      </div>
      <div className={`nav-item${screen === 'records' ? ' active' : ''}`} onClick={() => setScreen('records')}>
        <IconRecords /> Medical Records
      </div>
    </div>
    <div className="nav-group">
      <div className="nav-group-title">Account</div>
      <div className={`nav-item${screen === 'insurance' ? ' active' : ''}`} onClick={() => setScreen('insurance')}>
        <IconShield /> Insurance & Integrations
      </div>
      <div className="nav-item">
        <IconProfile /> Profile
      </div>
    </div>
    <a href="tel:+254111050290" className="sidebar-support">
      <span className="sidebar-support-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="sidebar-support-text">
        <span className="sidebar-support-label">Customer care · 24/7</span>
        <span className="sidebar-support-num">+254 111 050 290</span>
      </span>
    </a>
  </aside>
)

const ScreenHeader = ({ title, em, meta, onBack, role = 'Member', action }: { title: string; em: string; meta: string; onBack: () => void; role?: string; action?: ReactNode }) => (
  <div className="screen-header">
    <div>
      <div className="back-chip" onClick={onBack}>← Back to dashboard</div>
      <h2>{title} <em>{em}</em></h2>
      <div className="meta-line">{meta}</div>
    </div>
    <div className="greet-actions">
      {action}
      <div className="avatar-chip"><div className="avatar">DM</div><div className="name">Daniel Moka<span>{role}</span></div></div>
    </div>
  </div>
)

// ============ DASHBOARD SCREEN ============
function DashboardScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [activePrevDep, setActivePrevDep] = useState<string>('self')

  const prevData = prevHealthData[activePrevDep]

  return (
    <div className="screen active" id="screen-dashboard">
      <div className="greet-row">
        <div>
          <h2>Good afternoon, <em>Daniel</em></h2>
          <div className="meta-line">Member since 14 March 2024 · Active plan: COVA Standard</div>
        </div>
        <div className="greet-actions">
          <div className="icon-btn" title="Notifications">
            <svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.4L4 17h5m6 0a3 3 0 11-6 0" strokeLinecap="round" /></svg>
            <span className="pulse"></span>
          </div>
          <div className="icon-btn" title="Support">
            <svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="avatar-chip">
            <div className="avatar">DM</div>
            <div className="name">Daniel Moka<span>Individual member</span></div>
          </div>
        </div>
      </div>

      {/* ZONE 1 — PREVENTIVE HEALTH */}
      <div className="zone-head">
        <div>
          <div className="zone-eyebrow">Zone 1 · Preventive health</div>
          <h3 className="zone-h">What's done. What's due. What's next.</h3>
        </div>
        <div className="dep-pill-row">
          {(['self', 'sarah', 'james', 'amelia'] as const).map(id => (
            <button key={id} className={`dep-pill${activePrevDep === id ? ' active' : ''}`} onClick={() => setActivePrevDep(id)}>
              {prevHealthData[id].name}
            </button>
          ))}
          <button className="dep-pill add" onClick={() => setScreen('dependents')}>+ Add</button>
        </div>
      </div>
      <div className="prevhealth-grid">
        {prevData.cards.map(c => {
          const statusLbl = c.status === 'ontrack' ? 'On track' : c.status === 'duesoon' ? 'Due soon' : 'Action needed'
          const isUrgent = c.status === 'action'
          return (
            <div key={c.id} className={`prev-card${isUrgent ? ' urgent' : ''}`}>
              <div className="row1">
                <div className="ic-square"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d={c.iconPath} /></svg></div>
                <span className={`status-pill ${c.status}`}>{statusLbl}</span>
              </div>
              <div>
                <div className="label">{c.label}</div>
                <div className="value">{c.value}{c.sub && <span className="sub">{c.sub}</span>}</div>
              </div>
              <button className={`prev-cta ${c.cta.kind}`}>{c.cta.text}</button>
            </div>
          )
        })}
      </div>

      {/* ZONE 2 — UTILIZATION */}
      <div className="zone-head">
        <div>
          <div className="zone-eyebrow">Zone 2 · Utilization at a glance</div>
          <h3 className="zone-h">Your wallet · enrollment to date</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="cta light">Monthly</button>
          <button className="cta" style={{ background: 'var(--slate)', color: 'var(--white)' }}>Lifetime</button>
        </div>
      </div>
      <div className="grid-2-1">
        <div className="wallet-card">
          <div className="wallet-top">
            <div style={{ flex: 1 }}>
              <div className="label">Balance available</div>
              <div className="balance"><span className="ccy">KES</span>128,000</div>
              <div className="sub">Pooled across your family · spend on any service line</div>
            </div>
            <div className="wallet-stat-grid">
              <div className="wallet-stat-panel">
                <div className="l">You contributed</div>
                <div className="v"><span className="ccy">KES</span>55,000</div>
              </div>
              <div className="wallet-stat-panel gold">
                <div className="l">Benefits unlocked <span className="mult-tag-gold">4×</span></div>
                <div className="v gold-num"><span className="ccy">KES</span>220,000</div>
                <div className="caption">the COVA multiplier at work</div>
              </div>
              <div className="wallet-stat-panel">
                <div className="l">Utilization to date</div>
                <div className="v"><span className="ccy">KES</span>92,000</div>
              </div>
              <div className="wallet-stat-panel">
                <div className="l">Savings vs retail</div>
                <div className="v"><span className="ccy">KES</span>165,000</div>
              </div>
            </div>
          </div>
          <div className="wallet-bar">
            <div className="track">
              <div className="seg unlocked" style={{ width: '100%' }}></div>
              <div className="seg used" style={{ width: '42%' }}></div>
            </div>
            <div className="legend">
              <span><span className="dot s"></span>Unlocked KES 220,000</span>
              <span><span className="dot c"></span>Used KES 92,000</span>
              <span><span className="dot" style={{ background: 'rgba(255,255,255,.2)' }}></span>Available KES 128,000</span>
            </div>
          </div>
          <div className="wallet-cta-row">
            <button className="cta" onClick={() => setScreen('wallet')}>TopUp Wallet →</button>
            <button className="cta outline" onClick={() => setScreen('paylater')}>HealthNOW PayLater</button>
            <button className="cta outline">⤓ Download report</button>
          </div>
        </div>

        <div className="quick-actions">
          <h4>Quick actions · Zone 7</h4>
          <div className="sub">Six pinned actions. One tap.</div>
          <div className="qa-grid qa-grid-3">
            <button className="qa-btn coral" title="Order medication">
              <div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h18l-2 13H5L3 3z" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="lbl">Order Medication</div>
            </button>
            <button className="qa-btn whatsapp" onClick={() => setScreen('triage')} title="Talk to a doctor — start a consult">
              <div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="lbl">Talk to Doctor</div>
            </button>
            <button className="qa-btn" onClick={() => setScreen('triage')} title="Symptom Checker">
              <div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="lbl">Symptom Check</div>
            </button>
            <button className="qa-btn" onClick={() => setScreen('dependents')} title="Add dependents">
              <div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h2m6-4a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="lbl">Dependents</div>
            </button>
            <button className="qa-btn" title="Transfer benefits">
              <div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M7 16l-4-4m0 0l4-4m-4 4h14M17 8l4 4m0 0l-4 4m4-4H7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="lbl">Transfer Benefits</div>
            </button>
            <button className="qa-btn" title="Download utilization report">
              <div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="lbl">Download Report</div>
            </button>
          </div>
        </div>
      </div>

      {/* ZONE 3 — SERVICE-LINE BREAKDOWN */}
      <div className="benefits-card">
        <div className="benefits-head">
          <div>
            <div className="zone-eyebrow">Zone 3 · Service-line breakdown</div>
            <h3>Purchased · used · balance — by line</h3>
            <div style={{ fontSize: '12.5px', color: 'var(--slate-60)', marginTop: 2 }}>One row per benefit line. Click order to spend the balance.</div>
          </div>
        </div>
        <div className="service-line-list">
          {[
            { key: 'consult', name: 'Consultations', icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />, unlocked: 44000, used: 18000, balance: 26000 },
            { key: 'lab',     name: 'Labs',          icon: <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" />, unlocked: 33000, used: 14000, balance: 19000 },
            { key: 'med',     name: 'Medication',    icon: <path d="M19 11H5m14 0a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2m14 0v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8" strokeLinecap="round" strokeLinejoin="round" />, unlocked: 66000, used: 30000, balance: 36000 },
            { key: 'scan',    name: 'Scans',         icon: <><circle cx="12" cy="12" r="3" /><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" strokeLinecap="round" /></>, unlocked: 33000, used: 9000,  balance: 24000 },
            { key: 'spec',    name: 'Specialist',    icon: <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-7-3l7 3 7-3" strokeLinecap="round" strokeLinejoin="round" />, unlocked: 44000, used: 21000, balance: 23000 },
          ].map(b => {
            const usedPct = Math.round((b.used / b.unlocked) * 100)
            return (
              <div key={b.key} className="sl-row">
                <div className="sl-head">
                  <div className="sl-ic"><svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">{b.icon}</svg></div>
                  <div className="sl-name">{b.name}</div>
                </div>
                <div className="sl-bar-wrap">
                  <div className="sl-bar"><div className="sl-bar-fill" style={{ width: `${usedPct}%` }} /></div>
                  <div className="sl-bar-meta"><span>{usedPct}% used</span><span className="sl-bar-sep">·</span><span>KES {b.balance.toLocaleString()} left</span></div>
                </div>
                <div className="sl-stats">
                  <span className="sl-stat"><span className="sl-stat-k">Unlocked</span><span className="sl-stat-v">{b.unlocked.toLocaleString()}</span></span>
                  <span className="sl-stat"><span className="sl-stat-k">Used</span><span className="sl-stat-v">{b.used.toLocaleString()}</span></span>
                  <span className="sl-stat"><span className="sl-stat-k">Balance</span><span className="sl-stat-v">{b.balance.toLocaleString()}</span></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="trust-strip">
        <div className="badges">
          <div className="trust-pill"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" /></svg>ISO 27001 certified</div>
          <div className="trust-pill"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>End-to-end encrypted</div>
          <div className="trust-pill"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>Kenya DPA compliant</div>
        </div>
        <div className="item"><div className="l">Need help?</div><div className="v"><a href="tel:+254111050290" className="support-link">+254 111 050 290</a> · 24/7 support</div></div>
        <div className="footer-actions">
          <button className="cta ghost">Privacy policy</button>
          <button className="cta">Get support</button>
        </div>
      </div>
      <div className="footer-disclaim">COVA is a CheckUps Medical Hub product. Healthcare benefits are non-insurance and operate as alternative health benefits under Kenyan health financing regulations. Your data is never sold.</div>
    </div>
  )
}

// ============ WALLET SCREEN ============
function WalletScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [topupAmt, setTopupAmt] = useState<number>(10000)
  const [activePkgMini, setActivePkgMini] = useState<string>('smart')
  const [railSayOn, setRailSayOn] = useState(true)
  const [railRukishaOn, setRailRukishaOn] = useState(true)
  const cardsRef = useRef<HTMLDivElement | null>(null)

  // Mobile only: when the user picks an amount chip, smoothly bring the
  // package-card grid into view so they see the new breakdown without scrolling.
  const pickAmountChip = (v: number) => {
    setTopupAmt(v)
    setTimeout(() => scrollToOnMobile(cardsRef.current), 80)
  }

  const PACKAGES = [
    { id: 'meds',    name: 'MedsOnly',       short: 'Meds',    tag: 'Pharmacy only',   mult: 1, multCls: 'mt1', featured: false, alloc: { consult: 0,  lab: 0,  scan: 0,  pharm: 100, spec: 0   } },
    { id: 'spec',    name: 'SpecialistCare', short: 'Spec',    tag: 'Specialist only', mult: 1, multCls: 'mt1', featured: false, alloc: { consult: 0,  lab: 0,  scan: 0,  pharm: 0,   spec: 100 } },
    { id: 'medi',    name: 'MEDICare',       short: 'MEDI',    tag: 'Chronic care',    mult: 2, multCls: 'mt2', featured: false, alloc: { consult: 35, lab: 20, scan: 0,  pharm: 45,  spec: 0   } },
    { id: 'classic', name: 'ClassicCare',    short: 'Classic', tag: 'Starter family',  mult: 4, multCls: '',    featured: false, alloc: { consult: 25, lab: 15, scan: 10, pharm: 35,  spec: 15  } },
    { id: 'smart',   name: 'SMARTCare',      short: 'SMART',   tag: 'Most popular',    mult: 4, multCls: '',    featured: true,  alloc: { consult: 30, lab: 20, scan: 15, pharm: 25,  spec: 10  } },
    { id: 'deluxe',  name: 'DELUXECare',     short: 'DELUXE',  tag: 'Premium family',  mult: 4, multCls: '',    featured: false, alloc: { consult: 20, lab: 15, scan: 15, pharm: 30,  spec: 20  } },
  ]

  return (
    <div className="screen active" id="screen-wallet">
      <ScreenHeader title="Wallet" em="& top-up" meta="Top up your COVA wallet, connect savings rails, or get pre-approved medical credit." onBack={() => setScreen('dashboard')} />

      {/* MOBILE-ONLY balance hero — gives the wallet tab a clear identity */}
      <div className="wallet-mobile-hero">
        <div className="wmh-row">
          <div className="wmh-info">
            <div className="wmh-label">Wallet balance</div>
            <div className="wmh-value"><span className="ccy">KES</span> 128,000</div>
          </div>
          <div className="wmh-mult">
            <span className="wmh-mult-num">4×</span>
            <span className="wmh-mult-lbl">multiplier</span>
          </div>
        </div>
        <div className="wmh-stats">
          <div className="wmh-stat"><span className="k">Contributed</span><span className="v">KES 55,000</span></div>
          <div className="wmh-stat"><span className="k">PayLater</span><span className="v">KES 45,000</span></div>
        </div>
      </div>

      {/* ZONE 4 — TOP UP */}
      <div className="topup-card">
        <div className="topup-head" style={{ marginBottom: 18 }}>
          <div>
            <div className="zone-eyebrow">Zone 4 · Top up the wallet</div>
            <h3>Pick an amount. See exactly what each plan unlocks.</h3>
            <div className="sub">Every shilling you contribute unlocks up to <strong style={{ color: 'var(--gold)', fontWeight: 700 }}>4× the value</strong> in benefits. Pick a plan below to top up at that multiplier.</div>
          </div>
        </div>

        <div className="topup-input-row">
          <div className="amount-chips">
            {[5000, 10000, 15000, 20000, 25000, 50000].map(v => (
              <button key={v} className={`amount-chip${topupAmt === v ? ' active' : ''}`} onClick={() => pickAmountChip(v)}>
                <span className="amt-full">KES {v.toLocaleString()}</span>
                <span className="amt-short">{`${v / 1000}K`}</span>
              </button>
            ))}
          </div>
          <div className="custom-amount">
            <span className="ccy-prefix">KES</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="or type any amount"
              value={topupAmt || ''}
              onChange={e => setTopupAmt(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        <div ref={cardsRef} className="pkg-cards-grid" style={{ scrollMarginTop: 76 }}>
          {PACKAGES.map(p => {
            const unlocked = topupAmt * p.mult
            const lines = [
              { k: 'Consultations', v: Math.round(unlocked * p.alloc.consult / 100) },
              { k: 'Labs',          v: Math.round(unlocked * p.alloc.lab / 100) },
              { k: 'Scans',         v: Math.round(unlocked * p.alloc.scan / 100) },
              { k: 'Pharmacy',      v: Math.round(unlocked * p.alloc.pharm / 100) },
              { k: 'Specialist',    v: Math.round(unlocked * p.alloc.spec / 100) },
            ]
            const selected = activePkgMini === p.id
            return (
              <div key={p.id} className={`pkg-card${p.featured ? ' featured' : ''}${selected ? ' selected' : ''}`}>
                {p.featured && <div className="pkg-ribbon">Most popular</div>}
                <div className="pkg-card-head">
                  <div className="pkg-info">
                    <div className="pkg-name-row">
                      <span className="pkg-name">{p.name}</span>
                      <span className={`pkg-mult ${p.multCls}`}>{p.mult}×</span>
                    </div>
                    <div className="pkg-tagline">{p.tag}</div>
                  </div>
                  <div className="pkg-unlock-block">
                    <div className="pkg-unlock-label">You unlock</div>
                    <div className="pkg-unlock-value"><span className="ccy">KES</span> {unlocked.toLocaleString()}</div>
                  </div>
                </div>
                <div className="pkg-breakdown">
                  {lines.map(l => (
                    <div key={l.k} className="pkg-line">
                      <span className="pkg-line-k">{l.k}</span>
                      <span className={`pkg-line-v${l.v === 0 ? ' empty' : ''}`}>{l.v > 0 ? `KES ${l.v.toLocaleString()}` : '—'}</span>
                    </div>
                  ))}
                </div>
                <button className="pkg-choose-btn" onClick={() => setActivePkgMini(p.id)}>{selected ? 'Selected ✓' : 'Choose'}</button>
              </div>
            )
          })}
        </div>

        {/* MOBILE-ONLY: single selector card + dynamic preview card.
            Hides the 6-card grid above on mobile. */}
        {(() => {
          const sel = PACKAGES.find(p => p.id === activePkgMini) || PACKAGES[4]
          const unlocked = topupAmt * sel.mult
          const lines = [
            { k: 'Consultations', v: Math.round(unlocked * sel.alloc.consult / 100) },
            { k: 'Labs',          v: Math.round(unlocked * sel.alloc.lab / 100) },
            { k: 'Scans',         v: Math.round(unlocked * sel.alloc.scan / 100) },
            { k: 'Pharmacy',      v: Math.round(unlocked * sel.alloc.pharm / 100) },
            { k: 'Specialist',    v: Math.round(unlocked * sel.alloc.spec / 100) },
          ]
          return (
            <div className="pkg-mobile-stack">
              <div className="pkg-selector-card">
                <div className="pkg-selector-label">Choose a plan</div>
                <div className="pkg-selector-list">
                  {PACKAGES.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`pkg-chip${activePkgMini === p.id ? ' selected' : ''}${p.featured ? ' featured' : ''}`}
                      onClick={() => setActivePkgMini(p.id)}
                    >
                      <span className={`pkg-chip-mult ${p.multCls}`}>{p.mult}×</span>
                      <span className="pkg-chip-name">{p.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pkg-preview-card">
                <div className="pkg-preview-head">
                  <div className="pkg-preview-info">
                    <div className="pkg-preview-eyebrow">With {sel.name}</div>
                    <div className="pkg-preview-tagline">{sel.tag}</div>
                  </div>
                  <div className={`pkg-preview-mult ${sel.multCls}`}>{sel.mult}×</div>
                </div>
                <div className="pkg-preview-unlock">
                  <div className="pkg-preview-unlock-label">You unlock</div>
                  <div className="pkg-preview-unlock-value">
                    <span className="ccy">KES</span> {unlocked.toLocaleString()}
                  </div>
                </div>
                <div className="pkg-preview-breakdown">
                  {lines.map(l => (
                    <div key={l.k} className="pkg-preview-line">
                      <span className="pkg-preview-line-k">{l.k}</span>
                      <span className={`pkg-preview-line-v${l.v === 0 ? ' empty' : ''}`}>
                        {l.v > 0 ? `KES ${l.v.toLocaleString()}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="cta pkg-preview-cta">Top up KES {topupAmt.toLocaleString()} →</button>
              </div>
            </div>
          )
        })()}

        <div className="paylater-strip" onClick={() => setScreen('paylater')}>
          <div className="pl-ic"><svg className="ic20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <div className="pl-text">
            <div className="pl-h">Top up on credit · HealthNOW PayLater</div>
            <div className="pl-s">Get treated today, pay tomorrow. Pre-approved up to <strong>KES 45,000</strong> through Co-op Bank · KCB · SBM · Inuka · Pension Club · partner SACCOs.</div>
          </div>
          <button className="cta">Explore PayLater →</button>
        </div>
      </div>

      {/* MOBILE-ONLY ZONE 4 — compact amount picker + 6 packages + live preview */}
      {(() => {
        const sel = PACKAGES.find(p => p.id === activePkgMini) || PACKAGES[4]
        const unlocked = topupAmt * sel.mult
        const lines = [
          { k: 'Consultations', v: Math.round(unlocked * sel.alloc.consult / 100) },
          { k: 'Labs',          v: Math.round(unlocked * sel.alloc.lab / 100) },
          { k: 'Scans',         v: Math.round(unlocked * sel.alloc.scan / 100) },
          { k: 'Pharmacy',      v: Math.round(unlocked * sel.alloc.pharm / 100) },
          { k: 'Specialist',    v: Math.round(unlocked * sel.alloc.spec / 100) },
        ]
        return (
          <div className="z4m">
            <div className="z4m-head">
              <div className="z4m-eyebrow">Zone 4 · Top up</div>
              <h3 className="z4m-title">Pick an amount, see what you unlock</h3>
            </div>

            <div className="z4m-amount-card">
              <div className="z4m-section-label">Amount</div>
              <div className="z4m-chips">
                {[5000, 10000, 15000, 20000, 25000, 50000].map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`z4m-chip${topupAmt === v ? ' active' : ''}`}
                    onClick={() => setTopupAmt(v)}
                  >
                    {`${v / 1000}K`}
                  </button>
                ))}
              </div>
              <div className="z4m-input">
                <span className="z4m-ccy">KES</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  placeholder="custom amount"
                  value={topupAmt || ''}
                  onChange={e => setTopupAmt(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>

            <div className="z4m-pkg-card">
              <div className="z4m-section-label">Choose a plan</div>
              <div className="z4m-pkg-grid">
                {PACKAGES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`z4m-pkg${activePkgMini === p.id ? ' active' : ''}${p.featured ? ' featured' : ''}`}
                    onClick={() => setActivePkgMini(p.id)}
                  >
                    {p.featured && <span className="z4m-pkg-badge">Popular</span>}
                    <span className={`z4m-pkg-mult ${p.multCls}`}>{p.mult}×</span>
                    <span className="z4m-pkg-name">{p.short}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="z4m-preview">
              <div className="z4m-preview-head">
                <div className="z4m-preview-info">
                  <div className="z4m-preview-eyebrow">With {sel.name}</div>
                  <div className="z4m-preview-tag">{sel.tag}</div>
                </div>
                <div className={`z4m-preview-mult ${sel.multCls}`}>{sel.mult}×</div>
              </div>
              <div className="z4m-preview-unlock">
                <div className="z4m-preview-unlock-label">You unlock</div>
                <div className="z4m-preview-unlock-value">
                  <span className="ccy">KES</span> {unlocked.toLocaleString()}
                </div>
              </div>
              <div className="z4m-preview-lines">
                {lines.map(l => (
                  <div key={l.k} className="z4m-preview-line">
                    <span className="z4m-preview-line-k">{l.k}</span>
                    <span className={`z4m-preview-line-v${l.v === 0 ? ' empty' : ''}`}>
                      {l.v > 0 ? `KES ${l.v.toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="cta z4m-cta">Top up KES {topupAmt.toLocaleString()} →</button>
            </div>
          </div>
        )
      })()}

      {/* ZONE 5 — SAVINGS RAILS */}
      <div className="zone-head">
        <div>
          <div className="zone-eyebrow">Zone 5 · Savings rails</div>
          <h3 className="zone-h">Save as you spend. Convert savings into care.</h3>
        </div>
      </div>
      {/* MOBILE-ONLY compact savings rails — toggle list */}
      <div className="rails-mobile-list">
        <div className="rml-row">
          <div className="rml-logo">SaY</div>
          <div className="rml-info">
            <div className="rml-name">Save-as-you-Spend</div>
            <div className="rml-sub">+ KES 2,180 saved this month</div>
          </div>
          <div className={`toggle${railSayOn ? ' on' : ' off'}`} onClick={() => setRailSayOn(v => !v)}></div>
        </div>
        <div className="rml-row">
          <div className="rml-logo">Rk</div>
          <div className="rml-info">
            <div className="rml-name">Rukisha Wallet</div>
            <div className="rml-sub">3 top-ups · KES 5,000 in 90d</div>
          </div>
          <div className={`toggle${railRukishaOn ? ' on' : ' off'}`} onClick={() => setRailRukishaOn(v => !v)}></div>
        </div>
        <div className="rml-row">
          <div className="rml-logo">Bk</div>
          <div className="rml-info">
            <div className="rml-name">Bank auto-debit</div>
            <div className="rml-sub">KCB · 1st of month · KES 5,000</div>
          </div>
          <select className="bank-picker rml-bank">
            <option>KCB</option>
            <option>Co-op</option>
            <option>SBM</option>
            <option>Equity</option>
            <option>NCBA</option>
          </select>
        </div>
      </div>

      <div className="savings-rails">
        <div className="rail-card">
          <div className="rail-head">
            <div className="rail-logo">SaY</div>
            <div className="rail-title">
              <div className="rail-name">Save-as-you-Spend</div>
              <div className="rail-meta"><strong>In partnership with CPF and Mastercard</strong></div>
            </div>
            <div className={`toggle${railSayOn ? ' on' : ' off'}`} onClick={() => setRailSayOn(v => !v)}></div>
          </div>
          <div className="rail-body">Round up your everyday card spending. The spare change converts into healthcare benefits at the COVA multiplier. Average member adds KES 2,400 / month without noticing.</div>
          <div className="rail-stat-row">
            <div className="rail-stat"><div className="l">Saved this month</div><div className="v">KES 2,180</div></div>
            <div className="rail-stat"><div className="l">Converted to date</div><div className="v">KES 18,400</div></div>
            <div className="rail-stat"><div className="l">Round-up rule</div><div className="v">Nearest 100</div></div>
          </div>
        </div>

        <div className="rail-card">
          <div className="rail-head">
            <div className="rail-logo">Rk</div>
            <div className="rail-title">
              <div className="rail-name">Rukisha Wallet</div>
              <div className="rail-meta">Wallet activity · STK rail</div>
            </div>
            <div className={`toggle${railRukishaOn ? ' on' : ' off'}`} onClick={() => setRailRukishaOn(v => !v)}></div>
          </div>
          <div className="rail-body">Authorize Rukisha to share wallet activity with CheckUps. Power top-ups by Rukisha rail. Used for save-as-you-spend round-ups. Revoke anytime.</div>
          <div className="rail-stat-row">
            <div className="rail-stat"><div className="l">Status</div><div className="v" style={{ color: 'var(--sage)' }}>Authorized</div></div>
            <div className="rail-stat"><div className="l">Top-ups (90d)</div><div className="v">3 · KES 5,000</div></div>
            <div className="rail-stat"><div className="l">Connected since</div><div className="v">14 Mar 2024</div></div>
          </div>
        </div>

        <div className="rail-card">
          <div className="rail-head">
            <div className="rail-logo">Bk</div>
            <div className="rail-title">
              <div className="rail-name">Bank partner</div>
              <div className="rail-meta">Auto-debit + SaY rail</div>
            </div>
            <select className="bank-picker">
              <option>KCB Bank · primary</option>
              <option>Co-op Bank</option>
              <option>SBM Bank</option>
              <option>Equity Bank</option>
              <option>NCBA Bank</option>
            </select>
          </div>
          <div className="rail-body">Choose the bank that funds top-ups and Save-as-you-Spend round-ups. Auto-debit handles the monthly contribution. Switch any time without losing benefit balance.</div>
          <div className="rail-stat-row">
            <div className="rail-stat"><div className="l">Auto-debit</div><div className="v" style={{ color: 'var(--sage)' }}>Active · 1st of month</div></div>
            <div className="rail-stat"><div className="l">Last top-up</div><div className="v">01 May · KES 5,000</div></div>
            <div className="rail-stat"><div className="l">SaY enabled</div><div className="v">Yes</div></div>
          </div>
        </div>
      </div>

      <div className="privacy-disclosure">
        <div className="pd-ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <div className="pd-text">
          <div className="pd-h">Privacy disclosure · third-party data sharing</div>
          <div className="pd-s">Save-as-you-Spend, in partnership with CPF and Mastercard, rounds up your everyday spending and converts the savings into healthcare benefits. By connecting Rukisha or your bank, you authorize wallet activity to be shared with CheckUps for benefit conversion. We never share with employers, marketers, or third parties. You can revoke any authorization in <strong>Privacy & Control</strong> at any time.</div>
        </div>
      </div>

      {/* ZONE 6 — PAYLATER HERO */}
      <div className="zone-head" style={{ marginTop: 30 }}>
        <div>
          <div className="zone-eyebrow">Zone 6 · HealthNOW PayLater</div>
          <h3 className="zone-h">Treated today. Paid tomorrow.</h3>
        </div>
        <button className="cta light" onClick={() => setScreen('paylater')}>See all partners →</button>
      </div>

      {/* MOBILE-ONLY slim PayLater card (replaces the big hero on phones) */}
      <div className="paylater-mobile-card" onClick={() => setScreen('paylater')}>
        <div className="pmc-left">
          <div className="pmc-eyebrow">Pre-approved · HealthNOW PayLater</div>
          <div className="pmc-amount"><span className="ccy">KES</span> 45,000</div>
          <div className="pmc-sub">Based on your KCB · Co-op wallet history</div>
        </div>
        <button className="cta pmc-cta" onClick={e => { e.stopPropagation(); setScreen('paylater') }}>Request →</button>
      </div>

      <div className="paylater-hero" onClick={() => setScreen('paylater')}>
        <div className="ph-left">
          <div className="ph-eyebrow">You're pre-approved up to</div>
          <div className="ph-amount"><span className="ccy">KES</span> 45,000</div>
          <div className="ph-sub">Based on your wallet history with KCB · Co-op Bank. Funds post to your wallet at the COVA multiplier.</div>
        </div>
        <div className="ph-partners">
          <div className="ph-pgrid">
            {['Co-op Bank', 'KCB', 'SBM', 'Inuka', 'Pension Club', 'SACCOs', 'Microfinance', 'Rukisha'].map(n => (
              <div key={n} className="ph-pchip">{n}</div>
            ))}
          </div>
          <button className="cta" style={{ marginTop: 14 }}>Request medical credit →</button>
        </div>
      </div>
    </div>
  )
}

// ============ HISTORY SCREEN ============
function HistoryScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [activeTab, setActiveTab] = useState<'util' | 'pay' | 'loan' | 'leave'>('util')
  const [utilFilter, setUtilFilter] = useState<string>('all')
  const [payFilter, setPayFilter] = useState<string>('all')
  const [loanFilter, setLoanFilter] = useState<string>('active')
  const [leaveFilter, setLeaveFilter] = useState<string>('all')

  const utilRows = utilData.filter(r => utilFilter === 'all' || r.type === utilFilter)
  const payRows = payData.filter(r => payFilter === 'all' || r.kind === payFilter)
  const loanRows = loanData.filter(r => r.state === loanFilter)
  const leaveRows = leaveData.filter(r => leaveFilter === 'all' || r.state === leaveFilter)

  return (
    <div className="screen active" id="screen-history">
      <ScreenHeader title="Activity" em="& statements" meta="Utilization, top-ups, sick leave, and loan history. Filter and download anytime." onBack={() => setScreen('dashboard')} />

      {/* HISTORY TABS */}
      <div className="history-card">
        <div className="tabs-row">
          <div className={`tab${activeTab === 'util' ? ' active' : ''}`} onClick={() => setActiveTab('util')}>Utilization history</div>
          <div className={`tab${activeTab === 'pay' ? ' active' : ''}`} onClick={() => setActiveTab('pay')}>Payment history</div>
          <div className={`tab${activeTab === 'loan' ? ' active' : ''}`} onClick={() => setActiveTab('loan')}>Loan ledger</div>
          <div className={`tab${activeTab === 'leave' ? ' active' : ''}`} onClick={() => setActiveTab('leave')}>Sick leave log</div>
        </div>

        {activeTab === 'util' && (
          <div className="tab-content active">
            <div className="tab-action-row">
              <div className="filter-group">
                {[['all', 'All'], ['consult', 'Consultation'], ['lab', 'Lab'], ['pharm', 'Pharmacy'], ['scan', 'Scan'], ['spec', 'Specialist']].map(([f, lbl]) => (
                  <button key={f} className={`filter-pill${utilFilter === f ? ' active' : ''}`} onClick={() => setUtilFilter(f)}>{lbl}</button>
                ))}
              </div>
              <button className="cta ghost">⤓ Download utilization report</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Visit type</th><th>Date</th><th>Provider</th><th>Amount spent</th><th>Deduction breakdown</th></tr>
              </thead>
              <tbody>
                {utilRows.length === 0 ? <tr><td colSpan={5} className="empty-row">No transactions match this filter</td></tr> :
                  utilRows.map((r, i) => (
                    <tr key={i} className="row-clickable">
                      <td><span className={`visit-type ${r.type}`}>{r.label}</span></td>
                      <td>{r.date}</td>
                      <td>{r.provider}</td>
                      <td className="amount">KES {fmt(r.amount)}</td>
                      <td><div>COVA paid {fmt(r.wallet)} · You paid {fmt(r.copay)}</div><div className="breakdown">{r.note}</div></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="tab-content active">
            <div className="tab-action-row">
              <div className="filter-group">
                {[['all', 'All'], ['standard', 'Standard plan'], ['topup', 'Top-up'], ['say', 'Save-as-you-spend']].map(([f, lbl]) => (
                  <button key={f} className={`filter-pill${payFilter === f ? ' active' : ''}`} onClick={() => setPayFilter(f)}>{lbl}</button>
                ))}
              </div>
              <button className="cta ghost">⤓ Download statement</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Package</th><th>Date · Time</th><th>Amount</th><th>Method</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payRows.length === 0 ? <tr><td colSpan={5} className="empty-row">No payments match this filter</td></tr> :
                  payRows.map((r, i) => (
                    <tr key={i} className="row-clickable">
                      <td>{r.pkg}</td>
                      <td>{r.date} · {r.time}</td>
                      <td className="amount">KES {fmt(r.amount)}</td>
                      <td>{r.method}</td>
                      <td><span className={`status-pill ${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'loan' && (
          <div className="tab-content active">
            <div className="tab-action-row">
              <div className="filter-group">
                {[['active', 'Active'], ['settled', 'Settled']].map(([f, lbl]) => (
                  <button key={f} className={`filter-pill${loanFilter === f ? ' active' : ''}`} onClick={() => setLoanFilter(f)}>{lbl}</button>
                ))}
              </div>
              <button className="cta">Request new loan →</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Reference</th><th>Drawn</th><th>Amount</th><th>Outstanding</th><th>Next instalment</th></tr>
            </thead>
              <tbody>
                {loanRows.length === 0 ? <tr><td colSpan={5} className="empty-row">No loans in this category</td></tr> :
                  loanRows.map((r, i) => (
                    <tr key={i} className="row-clickable">
                      <td><strong>{r.ref}</strong><br /><span style={{ fontSize: 11, color: 'var(--slate-60)' }}>{r.purpose}</span></td>
                      <td>{r.drawn}</td>
                      <td className="amount">KES {fmt(r.amount)}</td>
                      <td className="amount">KES {fmt(r.outstanding)}</td>
                      <td>{r.next}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="tab-content active">
            <div className="tab-action-row">
              <div className="filter-group">
                {[['all', 'All 2026'], ['approved', 'Approved'], ['pending', 'Pending']].map(([f, lbl]) => (
                  <button key={f} className={`filter-pill${leaveFilter === f ? ' active' : ''}`} onClick={() => setLeaveFilter(f)}>{lbl}</button>
                ))}
              </div>
              <button className="cta light">+ Request sick leave</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Reference</th><th>Period</th><th>Days</th><th>Reason</th><th>Status</th></tr>
              </thead>
              <tbody>
                {leaveRows.length === 0 ? <tr><td colSpan={5} className="empty-row">No sick leave records match</td></tr> :
                  leaveRows.map((r, i) => (
                    <tr key={i} className="row-clickable">
                      <td><strong>{r.ref}</strong></td>
                      <td>{r.period}</td>
                      <td className="amount">{r.days}</td>
                      <td>{r.reason}</td>
                      <td><span className={`status-pill ${r.state === 'approved' ? 'complete' : 'pending'}`}>{r.status}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ RECORDS SCREEN ============
function RecordsScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [activeDep, setActiveDep] = useState<string>('self')
  const [vBPs, setVBPs] = useState('128')
  const [vBPd, setVBPd] = useState('82')
  const [vHR, setVHR] = useState('72')
  const [vWt, setVWt] = useState('78')
  const [vTemp, setVTemp] = useState('36.6')
  const [vMood, setVMood] = useState('Mood — Calm')

  const dep = dependents.find(d => d.id === activeDep)!
  const tlItems = medHistory[activeDep] || []

  return (
    <div className="screen active" id="screen-records">
      <ScreenHeader title="Medical records" em="& family timeline" meta="Wellness reports, visit summaries, prescriptions, labs, and vitals — per dependent." onBack={() => setScreen('dashboard')} />

      {/* DEPENDENTS + MEDICAL HISTORY */}
      <div className="grid-1-1">
        <div className="panel">
          <div className="panel-head">
            <h3>Dependents</h3>
            <button className="cta light">+ Add dependent</button>
          </div>
          <div className="dependents-list">
            {dependents.map(d => (
              <div key={d.id} className={`dependent-row${d.id === activeDep ? ' selected' : ''}`} onClick={() => {
                setActiveDep(d.id)
                setVBPs(String(d.vitals.bps))
                setVBPd(String(d.vitals.bpd))
                setVHR(String(d.vitals.hr))
                setVWt(String(d.vitals.wt))
                setVTemp(String(d.vitals.temp))
              }}>
                <div className="av">{d.initials}</div>
                <div className="info"><div className="n">{d.name}</div><div className="r">{d.meta}</div></div>
                <div className="actions">
                  <button className="mini-btn" title="View history" onClick={e => e.stopPropagation()}><svg className="ic16" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9" strokeLinecap="round" /></svg></button>
                  <button className="mini-btn" title="Add vitals" onClick={e => e.stopPropagation()}><svg className="ic16" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg></button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--slate-60)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Capture vitals</div>
            <div className="vitals-context">Selected: {dep.name} · last vitals {dep.vitalsDate}</div>
            <div className="vitals-form">
              <input placeholder="BP systolic" value={vBPs} onChange={e => setVBPs(e.target.value)} />
              <input placeholder="BP diastolic" value={vBPd} onChange={e => setVBPd(e.target.value)} />
              <input placeholder="Heart rate" value={vHR} onChange={e => setVHR(e.target.value)} />
              <input placeholder="Weight (kg)" value={vWt} onChange={e => setVWt(e.target.value)} />
              <input placeholder="Temperature (°C)" value={vTemp} onChange={e => setVTemp(e.target.value)} />
              <select value={vMood} onChange={e => setVMood(e.target.value)}>
                <option>Mood — Calm</option><option>Anxious</option><option>Low</option><option>Stable</option><option>Energized</option>
              </select>
            </div>
            <button className="cta light" style={{ marginTop: 12, width: '100%' }}>Save vitals to record</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Medical history & reports</h3>
            <button className="cta ghost">View all →</button>
          </div>
          <div className="timeline">
            {tlItems.length === 0 ? <div className="empty-row">No medical history yet — capture the first record to begin.</div> :
              tlItems.map((x, i) => (
                <div key={i} className={`timeline-item${x.kind === 'report' ? ' report' : ''}`}>
                  <div className="date">{x.date}</div>
                  <div className="body">
                    <div className="t">{x.title}</div>
                    <div className="d">{x.d}</div>
                    <div className="actions-row">
                      <span className="pill">View summary</span>
                      <span className="pill">Download PDF</span>
                      {x.kind === 'report' && <span className="pill">Share with doctor</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ INSURANCE SCREEN ============
function InsuranceScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [rukishaOn, setRukishaOn] = useState(true)
  const [kcbOn, setKcbOn] = useState(true)
  const [equityOn, setEquityOn] = useState(false)
  const [sayOn, setSayOn] = useState(true)
  const [rating, setRating] = useState(4)

  return (
    <div className="screen active" id="screen-insurance">
      <ScreenHeader title="Insurance" em="& integrations" meta="Upload your insurance card and manage third-party data integrations." onBack={() => setScreen('dashboard')} />

      {/* INSURANCE + INTEGRATIONS + PRIVACY */}
      <div className="grid-1-1">
        <div>
          <div className="insurance-card">
            <div className="ttl">Insurance on file</div>
            <div className="nm">APA Insurance · Family CDM Plus</div>
            <div className="ins-grid">
              <div><div className="l">Policy no.</div><div className="v">APA-CDM-2026-04412</div></div>
              <div><div className="l">Start date</div><div className="v">01 Jan 2026</div></div>
              <div><div className="l">End date</div><div className="v">31 Dec 2026</div></div>
            </div>
            <div className="upload-row">
              <button className="cta light">⤓ Download card</button>
              <button className="cta outline">Update policy</button>
            </div>
          </div>
          <div className="integrations-card">
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 16, marginBottom: 4 }}>Integrations & rails</div>
            <div style={{ fontSize: '11.5px', color: 'var(--slate-60)', marginBottom: 8 }}>Connect once — pay, save, and unlock benefits seamlessly.</div>
            <div className="integration-row">
              <div className="logo">Rk</div>
              <div className="meta"><div className="nm">Rukisha Wallet</div><div className="desc">Authorized to share wallet activity · save-as-you-spend on</div></div>
              <div className={`toggle${rukishaOn ? '' : ' off'}`} onClick={() => setRukishaOn(v => !v)}></div>
            </div>
            <div className="integration-row">
              <div className="logo">KCB</div>
              <div className="meta"><div className="nm">KCB Bank</div><div className="desc">Primary bank partner · auto-debit linked</div></div>
              <div className={`toggle${kcbOn ? '' : ' off'}`} onClick={() => setKcbOn(v => !v)}></div>
            </div>
            <div className="integration-row">
              <div className="logo">EQ</div>
              <div className="meta"><div className="nm">Equity Bank</div><div className="desc">Tap to switch bank partner</div></div>
              <div className={`toggle${equityOn ? '' : ' off'}`} onClick={() => setEquityOn(v => !v)}></div>
            </div>
            <div className="integration-row">
              <div className="logo">SaY</div>
              <div className="meta"><div className="nm">Save-as-you-Spend</div><div className="desc">Round-ups convert into health benefits</div></div>
              <div className={`toggle${sayOn ? '' : ' off'}`} onClick={() => setSayOn(v => !v)}></div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Privacy & control</h3>
            <span style={{ fontSize: '11.5px', color: 'var(--sage)', letterSpacing: '0.05em' }}>SECURE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, background: 'var(--sage-tint)', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--sage)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg className="ic16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Your data, your decision</div>
                <div style={{ fontSize: '11.5px', color: 'var(--slate-60)', marginTop: 3 }}>Health records are encrypted end-to-end. We share only what you explicitly authorize — never with employers, never with marketers.</div>
              </div>
            </div>
            <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Active data-sharing authorizations</div>
              <div style={{ fontSize: '11.5px', color: 'var(--slate-80)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rukisha · wallet activity</span><span style={{ color: rukishaOn ? 'var(--sage)' : 'var(--slate-40)' }}>{rukishaOn ? 'on' : 'off'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>KCB · auto-debit</span><span style={{ color: kcbOn ? 'var(--sage)' : 'var(--slate-40)' }}>{kcbOn ? 'on' : 'off'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>APA · claims sync</span><span style={{ color: 'var(--sage)' }}>on</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Save-as-you-Spend partner</span><span style={{ color: sayOn ? 'var(--sage)' : 'var(--slate-40)' }}>{sayOn ? 'on' : 'off'}</span></div>
              </div>
              <button className="cta ghost" style={{ width: '100%', marginTop: 12 }}>Manage authorizations</button>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--slate-60)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Satisfaction this month</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(r => (
                  <svg key={r} fill={r <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={r <= rating ? undefined : '1.6'} viewBox="0 0 24 24" onClick={() => setRating(r)}><path d="M12 2l2.6 7.5h7.4l-6 4.4 2.4 7.6-6.4-4.6-6.4 4.6 2.4-7.6-6-4.4h7.4z" /></svg>
                ))}
                <span className="label">{rating}.0 — rate this month</span>
              </div>
            </div>
            <button className="cta" style={{ width: '100%' }}>Request support →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ TRIAGE SCREEN ============
function TriageScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedSigns, setSelectedSigns] = useState<Set<string>>(new Set())
  const [files, setFiles] = useState<string[]>([])
  const signsRef = useRef<HTMLDivElement | null>(null)
  const filesRef = useRef<HTMLDivElement | null>(null)

  // After picking a body system, slide the clinical-signs card into view on mobile.
  useEffect(() => {
    if (selectedCat) scrollToOnMobile(signsRef.current)
  }, [selectedCat])

  // After ticking the first sign, slide the file-upload + generate cards into view on mobile.
  useEffect(() => {
    if (selectedSigns.size === 1) scrollToOnMobile(filesRef.current)
  }, [selectedSigns.size])

  const cat = selectedCat ? triageCategories.find(c => c.id === selectedCat) : null
  const step1Done = !!selectedCat
  const step2Active = step1Done && selectedSigns.size === 0
  const step2Done = step1Done && selectedSigns.size > 0
  const step3Active = step2Done

  const toggleSign = (s: string) => {
    const next = new Set(selectedSigns)
    if (next.has(s)) next.delete(s); else next.add(s)
    setSelectedSigns(next)
  }

  const addFile = () => {
    const dummy = ['lab_report.pdf', 'prescription_2026-04.jpg', 'BP_log_april.pdf'][files.length % 3]
    setFiles([...files, dummy])
  }

  return (
    <div className="screen active" id="screen-triage">
      <ScreenHeader
        title="Consult"
        em="a doctor"
        meta="Tell us how you're feeling. We'll generate a triage summary and connect you with a CheckUps clinician on WhatsApp."
        onBack={() => setScreen('dashboard')}
        role="Patient"
        action={
          <button className="whatsapp-cta" onClick={() => setScreen('whatsapp')}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: 16, height: 16 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp Doctor
          </button>
        }
      />

      <div className="stepper">
        <div className={`step${!step1Done ? ' active' : step1Done ? ' done' : ''}`}><div className="num">1</div><div className="lbl">Choose category</div><div className="ln"></div></div>
        <div className={`step${step2Active ? ' active' : step2Done ? ' done' : ''}`}><div className="num">2</div><div className="lbl">Select clinical signs</div><div className="ln"></div></div>
        <div className={`step${step3Active ? ' active' : ''}`}><div className="num">3</div><div className="lbl">Attach files</div><div className="ln"></div></div>
        <div className="step"><div className="num">4</div><div className="lbl">Generate summary</div></div>
      </div>

      <div className="benefits-card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19 }}>Choose a body system</h3>
          <span style={{ fontSize: 12, color: 'var(--slate-60)' }}>Pick the one that best matches your concern</span>
        </div>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <label htmlFor="body-system">Body system</label>
          <select
            id="body-system"
            value={selectedCat || ''}
            onChange={e => { setSelectedCat(e.target.value || null); setSelectedSigns(new Set()) }}
          >
            <option value="">— Select a body system —</option>
            {triageCategories.map(t => (
              <option key={t.id} value={t.id}>{t.name} — {t.sub}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCat && cat && (
        <div ref={signsRef} className="benefits-card" style={{ marginBottom: 22, scrollMarginTop: 76 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19 }}>{cat.name} — clinical signs</h3>
            <span style={{ fontSize: 12, color: 'var(--sage)' }}>{selectedSigns.size} selected</span>
          </div>
          <div className="signs-list">
            {cat.signs.map(s => (
              <div key={s} className={`sign-row${selectedSigns.has(s) ? ' checked' : ''}`} onClick={() => toggleSign(s)}>
                <div className="check">{selectedSigns.has(s) && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</div>
                <div className="label">{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCat && (
        <div ref={filesRef} className="grid-2" style={{ marginBottom: 22, scrollMarginTop: 76 }}>
          <div className="benefits-card">
            <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 14 }}>Attach supporting files</h3>
            <div style={{ fontSize: 12, color: 'var(--slate-60)', marginBottom: 14 }}>Test results, prescription photos, or doctor notes — optional but helpful.</div>
            <div className="upload-zone" onClick={addFile}>
              <div className="ic-big"><svg className="ic20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v12" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="t1">Drop files or click to browse</div>
              <div className="t2">JPG · PNG · PDF · up to 10 MB each</div>
            </div>
            <div style={{ marginTop: 12 }}>
              {files.map((f, i) => (
                <span key={i} className="uploaded-pill">📎 {f} <span className="x" onClick={e => { e.stopPropagation(); setFiles(files.filter((_, j) => j !== i)) }}>×</span></span>
              ))}
            </div>
          </div>
          <div className="benefits-card">
            <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 14 }}>Triage summary preview</h3>
            <div style={{ fontSize: '12.5px', color: 'var(--slate-80)', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 10 }}><strong>Patient:</strong> Daniel Moka · 42yo</div>
              <div style={{ marginBottom: 10 }}><strong>Body system:</strong> {cat?.name}</div>
              <div style={{ marginBottom: 10 }}><strong>Clinical signs ({selectedSigns.size}):</strong> {selectedSigns.size > 0 ? Array.from(selectedSigns).join(', ') : <em style={{ color: 'var(--slate-60)' }}>none selected yet</em>}</div>
              <div style={{ marginBottom: 10 }}><strong>Attached files:</strong> {files.length > 0 ? files.join(', ') : 'none'}</div>
              <div style={{ marginBottom: 10 }}><strong>Date:</strong> 09 May 2026</div>
              <div style={{ marginTop: 14, padding: 10, background: 'var(--sage-tint)', borderRadius: 8, fontSize: '11.5px', color: 'var(--slate-60)', fontStyle: 'italic' }}>This summary will be formatted into a CheckUps clinical PDF and tagged to your member record.</div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="cta">⤓ Generate PDF summary</button>
              <button className="whatsapp-cta">Send to doctor on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ WHATSAPP DOCTOR SCREEN ============
function WhatsappScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [filter, setFilter] = useState<string>('all')
  const list = filter === 'all' ? doctors : doctors.filter(d => d.spec === filter)

  return (
    <div className="screen active" id="screen-whatsapp">
      <ScreenHeader title="WhatsApp" em="doctor consultations" meta="Talk to a licensed CheckUps doctor in 5 minutes — no app to install. If you can text your family, you can talk to a doctor. Available for chronic disease management, primary care, and specialist follow-up." onBack={() => setScreen('dashboard')} />

      <div className="grid-3-2" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19 }}>Available doctors right now</h3>
            <div className="filter-group" style={{ gap: 6 }}>
              {[['all', 'All'], ['gp', 'GP'], ['cardio', 'Cardiology'], ['mental', 'Mental health'], ['peds', 'Pediatrics']].map(([f, lbl]) => (
                <button key={f} className={`filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{lbl}</button>
              ))}
            </div>
          </div>
          <div className="grid-2">
            {list.map(d => (
              <div key={d.id} className="doctor-card">
                <div className="head">
                  <div className="av">{d.av}</div>
                  <div className="info">
                    <div className="nm">{d.name}</div>
                    <div className="spec">{d.specName}</div>
                    <div className="meta">{d.meta}</div>
                    <div style={{ marginTop: 6 }}><span className={`avail-pill ${d.avail}`}>{d.avail === 'online' ? 'Online now' : d.avail === 'busy' ? 'In session' : 'Offline'}</span></div>
                  </div>
                </div>
                <div className="stat-row">
                  <div className="item"><span className="k">Rate</span> <span className="v">KES {d.rate}</span></div>
                  <div className="item"><span className="k">Rating</span> <span className="v">{d.rating} ★</span></div>
                  <div className="item"><span className="k">Sessions</span> <span className="v">{d.sessions}</span></div>
                </div>
                <button className="whatsapp-cta" disabled={d.avail === 'offline'} style={{ width: '100%', justifyContent: 'center' }}>{d.avail === 'offline' ? 'Currently offline' : '💬 Start WhatsApp chat'}</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="benefits-card" style={{ marginBottom: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 18, marginBottom: 6 }}>How it works</div>
            <div style={{ fontSize: '11.5px', color: 'var(--slate-60)', marginBottom: 16 }}>Three steps to a doctor in your pocket</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['1', 'Pick a doctor', 'Browse availability and specialty'], ['2', 'Tap "Start chat"', 'Opens directly in WhatsApp'], ['3', 'Pay from wallet', 'Auto-deducted at session end']].map(([n, t, s]) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sage)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{n}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div><div style={{ fontSize: '11.5px', color: 'var(--slate-60)', marginTop: 2 }}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="benefits-card" style={{ padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 18, marginBottom: 14 }}>Recent conversations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentChats.map(c => (
                <div key={c.who} style={{ padding: '11px 12px', background: 'var(--sage-tint)', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>{c.who} {c.unread > 0 && <span style={{ background: 'var(--coral)', color: 'white', width: 16, height: 16, borderRadius: '50%', fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate-60)', marginTop: 2, fontStyle: 'italic' }}>{c.last}</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--slate-60)', whiteSpace: 'nowrap' }}>{c.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ MEDICATION SCREEN ============
function MedicationScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  type Drug = { id: number; name: string; sub: string; retail: number; price: number; qty: number; discount: number }
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [basket, setBasket] = useState<Drug[]>([
    { id: 1, name: 'Atorvastatin 20mg', sub: 'Generic · 30 tablets', retail: 1850, price: 1295, qty: 1, discount: 30 },
    { id: 2, name: 'Telmisartan 40mg', sub: 'Brand: Micardis · 30 tablets', retail: 3200, price: 2400, qty: 1, discount: 25 },
    { id: 3, name: 'Aspirin 75mg', sub: 'Generic · 30 tablets', retail: 450, price: 320, qty: 1, discount: 28 }
  ])
  const [payMethod, setPayMethod] = useState<string>('wallet')
  const [delivery, setDelivery] = useState<string>('standard')

  const subtotal = basket.reduce((s, d) => s + d.price * d.qty, 0)
  const retail = basket.reduce((s, d) => s + d.retail * d.qty, 0)
  const savings = retail - subtotal
  const deliveryCost = delivery === 'standard' ? 200 : delivery === 'urgent' ? 500 : 0
  const total = subtotal + deliveryCost
  const itemUnits = basket.reduce((s, d) => s + d.qty, 0)

  const updateQty = (id: number, dir: '+' | '-') => {
    setBasket(basket.map(d => d.id === id ? { ...d, qty: dir === '+' ? d.qty + 1 : Math.max(1, d.qty - 1) } : d))
  }

  const summary = (
    <>
      <div className="ttl">Order summary</div>
      <div className="row"><span>{basket.length} item{basket.length === 1 ? '' : 's'} ({itemUnits} units)</span><span className="v">KES {subtotal.toLocaleString()}</span></div>
      <div className="row" style={{ color: 'var(--sage)' }}><span>You saved (vs retail)</span><span className="v">−KES {savings.toLocaleString()}</span></div>
      {delivery !== 'pickup' ? <div className="row"><span>Delivery ({delivery})</span><span className="v">KES {deliveryCost}</span></div> : <div className="row"><span>Pickup at Goodlife Yaya</span><span className="v" style={{ color: 'var(--sage)' }}>free</span></div>}
      <div className="row tot"><span>Total</span><span className="v">KES {total.toLocaleString()}</span></div>
      <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--white)', borderRadius: 8, fontSize: '11.5px', color: 'var(--slate-60)' }}>Pay method: <strong style={{ color: 'var(--slate)' }}>{payMethod === 'wallet' ? 'COVA wallet' : payMethod === 'paylater' ? 'HealthNOW PayLater' : 'M-Pesa STK'}</strong></div>
    </>
  )

  return (
    <div className="screen active" id="screen-medication">
      <ScreenHeader title="Order" em="medication" meta="" onBack={() => setScreen('dashboard')} />

      <div className="stepper">
        <div className={`step${step > 1 ? ' done' : step === 1 ? ' active' : ''}`}><div className="num">1</div><div className="lbl">Upload prescription</div><div className="ln"></div></div>
        <div className={`step${step > 2 ? ' done' : step === 2 ? ' active' : ''}`}><div className="num">2</div><div className="lbl">Identify & pay</div><div className="ln"></div></div>
        <div className={`step${step === 3 ? ' active' : ''}`}><div className="num">3</div><div className="lbl">Delivery</div></div>
      </div>

      {step === 1 && (
        <div>
          <div className="grid-2" style={{ marginBottom: 22 }}>
            <div className="benefits-card">
              <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 6 }}>Upload your prescription</h3>
              <div style={{ fontSize: 12, color: 'var(--slate-60)', marginBottom: 16 }}>Snap a photo or upload a PDF. Our system extracts drug names automatically.</div>
              <div className="upload-zone" onClick={() => setStep(2)}>
                <div className="ic-big"><svg className="ic20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="3" /></svg></div>
                <div className="t1">Drop prescription image or PDF</div>
                <div className="t2">JPG · PNG · PDF · OCR processes in 5–8 seconds</div>
              </div>
              <div style={{ marginTop: 14, fontSize: '11.5px', color: 'var(--slate-60)', textAlign: 'center' }}>Or <span style={{ color: 'var(--sage)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(2)}>use my existing active prescription →</span></div>
            </div>
            <div className="benefits-card">
              <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 14 }}>Why CheckUps pharmacy</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['15–30% off retail', 'Permanent partner pricing — never marked up'], ['Same-day delivery in Nairobi', 'Or 1-hour express for urgent meds'], ['Pay from COVA wallet', 'Or HealthNOW PayLater for big orders'], ['WhatsApp tracking', 'Get updates as your order moves']].map(([t, s]) => (
                  <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: 'var(--sage-tint)', borderRadius: 10 }}>
                    <span style={{ color: 'var(--sage)', fontSize: 18 }}>✓</span>
                    <div><div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div><div style={{ fontSize: '11.5px', color: 'var(--slate-60)' }}>{s}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="grid-3-2" style={{ marginBottom: 22 }}>
            <div className="benefits-card">
              <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 6 }}>Drugs identified from your prescription</h3>
              <div style={{ fontSize: 12, color: 'var(--slate-60)', marginBottom: 16 }}>Adjust quantity if needed. Prices include the COVA partner discount.</div>
              <div>
                {basket.map(d => (
                  <div key={d.id} className="drug-list-row">
                    <div className="name">{d.name}<div className="sub">{d.sub}</div></div>
                    <div className="qty-stepper"><button onClick={() => updateQty(d.id, '-')}>−</button><input value={d.qty} readOnly /><button onClick={() => updateQty(d.id, '+')}>+</button></div>
                    <div><div className="price">KES {(d.price * d.qty).toLocaleString()} <span className="discount">−{d.discount}%</span></div><div style={{ fontSize: '10.5px', color: 'var(--slate-60)', textDecoration: 'line-through', marginTop: 2 }}>KES {(d.retail * d.qty).toLocaleString()}</div></div>
                    <button className="mini-btn" style={{ marginLeft: 'auto', width: 32, height: 32 }} onClick={() => setBasket(basket.filter(x => x.id !== d.id))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="order-summary">{summary}</div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--slate-60)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pay with</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className={`delivery-option${payMethod === 'wallet' ? ' selected' : ''}`} onClick={() => setPayMethod('wallet')}><div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 11h6m-3-3v6m-7 4V7a2 2 0 012-2h10a2 2 0 012 2v11l-4-2-3 2-3-2-4 2z" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="info"><div className="nm">COVA wallet</div><div className="sub">Balance: KES 36,000 (Medication line)</div></div></div>
                  <div className={`delivery-option${payMethod === 'paylater' ? ' selected' : ''}`} onClick={() => setPayMethod('paylater')}><div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="info"><div className="nm">HealthNOW PayLater</div><div className="sub">3 / 6 / 12 month plans</div></div></div>
                  <div className={`delivery-option${payMethod === 'mpesa' ? ' selected' : ''}`} onClick={() => setPayMethod('mpesa')}><div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM12 12v6M9 15h6" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="info"><div className="nm">M-Pesa STK</div><div className="sub">+254 712 ••• 678</div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="grid-3-2" style={{ marginBottom: 22 }}>
            <div className="benefits-card">
              <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 14 }}>Delivery details</h3>
              <div className="form-grid">
                <div className="form-row" style={{ gridColumn: '1/-1' }}><label>Delivery address</label><input defaultValue="Apartment 4B, Riverside Drive, Westlands, Nairobi" /></div>
                <div className="form-row"><label>City / area</label><select><option>Nairobi · Westlands</option><option>Nairobi · Karen</option><option>Nairobi · Lavington</option><option>Mombasa</option><option>Kisumu</option></select></div>
                <div className="form-row"><label>Phone (for driver)</label><input defaultValue="+254 712 ••• 678" /></div>
                <div className="form-row" style={{ gridColumn: '1/-1' }}><label>Notes for driver (optional)</label><textarea rows={2} placeholder="e.g. Building gate code, leave at security"></textarea></div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--slate-60)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>Delivery speed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className={`delivery-option${delivery === 'standard' ? ' selected' : ''}`} onClick={() => setDelivery('standard')}><div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 7h13l3 4h2v6h-3a2 2 0 11-4 0H9a2 2 0 11-4 0H3V7z" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="info"><div className="nm">Same-day delivery</div><div className="sub">Within 4 hours · Nairobi area</div></div><div className="price"><span style={{ fontSize: 11, color: 'var(--slate-60)' }}>KES</span> 200</div></div>
                <div className={`delivery-option${delivery === 'urgent' ? ' selected' : ''}`} onClick={() => setDelivery('urgent')}><div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="info"><div className="nm">1-hour express</div><div className="sub">Urgent · medication needed today</div></div><div className="price"><span style={{ fontSize: 11, color: 'var(--slate-60)' }}>KES</span> 500</div></div>
                <div className={`delivery-option${delivery === 'pickup' ? ' selected' : ''}`} onClick={() => setDelivery('pickup')}><div className="ic"><svg className="ic18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="info"><div className="nm">Pickup at Goodlife Yaya</div><div className="sub">Ready in 30 minutes</div></div><div className="price">free</div></div>
              </div>
            </div>
            <div>
              <div className="order-summary">{summary}</div>
              <button className="cta" style={{ width: '100%', marginTop: 14, padding: 14 }}>Place order →</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        <button className="cta light" disabled={step === 1} style={{ opacity: step === 1 ? 0.4 : 1 }} onClick={() => step > 1 && setStep((step - 1) as 1 | 2 | 3)}>← Previous</button>
        <button className="cta" onClick={() => step < 3 ? setStep((step + 1) as 1 | 2 | 3) : setScreen('dashboard')}>{step === 3 ? 'Place order →' : 'Continue →'}</button>
      </div>
    </div>
  )
}

// ============ PAYLATER SCREEN ============
function PaylaterScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const [tab, setTab] = useState<'salaried' | 'business' | 'members'>('salaried')
  const list = partners[tab]

  return (
    <div className="screen active" id="screen-paylater">
      <ScreenHeader title="HealthNOW" em="PayLater" meta="Get treated today, pay tomorrow. Approved through partner banks (Co-op Bank, KCB, SBM) or our independent fast-track pathway in minutes." onBack={() => setScreen('dashboard')} />

      <div className="benefits-card" style={{ marginBottom: 22, background: 'linear-gradient(135deg, var(--sage) 0%, #5A857A 100%)', color: 'var(--white)', border: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 6 }}>You're pre-approved</div>
            <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 32, fontWeight: 300, letterSpacing: '-0.02em' }}><span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginRight: 5 }}>up to KES</span>45,000</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>Based on your wallet history with Co-op Bank · KCB</div>
          </div>
          <button className="cta" style={{ background: 'var(--white)', color: 'var(--slate)' }}>Request now →</button>
        </div>
      </div>

      <div className="partner-tabs">
        <button className={`partner-tab${tab === 'salaried' ? ' active' : ''}`} onClick={() => setTab('salaried')}>Salaried professionals</button>
        <button className={`partner-tab${tab === 'business' ? ' active' : ''}`} onClick={() => setTab('business')}>Businesses & SMEs</button>
        <button className={`partner-tab${tab === 'members' ? ' active' : ''}`} onClick={() => setTab('members')}>SACCOs & member groups</button>
      </div>

      <div className="package-grid">
        {list.map(p => (
          <div key={p.name} className="partner-card">
            <div className="logo-block">
              {p.logoSrc
                ? <img src={p.logoSrc} alt={p.name} className="partner-logo-img" />
                : <span className="partner-logo-text">{p.logo}</span>
              }
            </div>
            <div className="nm">{p.name}{p.featured && <span className="featured-flag">RECOMMENDED</span>}</div>
            <div className="desc">{p.desc}</div>
            <button className="partner-cta">Apply through {p.name} →</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }} className="benefits-card">
        <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 400, fontSize: 19, marginBottom: 6 }}>How approval works</h3>
        <div style={{ fontSize: '12.5px', color: 'var(--slate-60)', marginBottom: 18 }}>Most requests resolve in under 2 hours. Larger amounts may go through a partner bank's standard credit check.</div>
        <div className="grid-3">
          {[['①', 'Request amount', 'Pick a partner. Enter what you need. Choose tenure.'], ['②', 'Verification', 'Bank confirms account standing. Wallet history is shared (with your consent).'], ['③', 'Funds unlocked', 'Loan posts directly to your COVA wallet — at the 4× multiplier.']].map(([n, t, d]) => (
            <div key={n} style={{ padding: 18, background: 'var(--sage-tint)', borderRadius: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--white)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{n}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--slate-60)', marginTop: 4, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ DEPENDENTS FULL SCREEN ============
function DependentsScreen({ setScreen }: { setScreen: (s: ScreenId) => void }) {
  const usage: Record<string, { visits: number; used: string }> = {
    self: { visits: 8, used: 'KES 32,400' },
    sarah: { visits: 4, used: 'KES 18,200' },
    james: { visits: 3, used: 'KES 24,600' },
    amelia: { visits: 2, used: 'KES 16,800' }
  }

  return (
    <div className="screen active" id="screen-dependents">
      <ScreenHeader title="Family" em="dependents" meta="Add unlimited dependents — parents in the village, kids at school, spouse, in-laws. Every member shares the same wallet. No age limits, no medical underwriting wall." onBack={() => setScreen('dashboard')} role="Primary member" />

      <div className="zone-head" style={{ marginBottom: 14 }}>
        <div>
          <div className="zone-eyebrow">Family · {dependents.length} members</div>
          <h3 className="zone-h">Everyone on your wallet</h3>
        </div>
        <button className="cta" onClick={() => { /* hook to add-dependent flow */ }}>
          <svg className="ic16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          Add dependent
        </button>
      </div>

      <div className="dep-list">
        {dependents.map(d => {
          const u = usage[d.id]
          return (
            <div key={d.id} className="dep-row">
              <div className="dep-row-av">{d.initials}</div>
              <div className="dep-row-info">
                <div className="dep-row-name">{d.name}</div>
                <div className="dep-row-meta">{d.meta}</div>
                <div className="dep-row-stats">
                  <span><strong>{u.visits}</strong> visits '26</span>
                  <span><strong>{u.used}</strong> used</span>
                  <span>BP <strong>{d.vitals.bps}/{d.vitals.bpd}</strong> · HR <strong>{d.vitals.hr}</strong> · <strong>{d.vitals.wt}kg</strong></span>
                  <span className="dep-row-vdate">Last vitals {d.vitalsDate}</span>
                </div>
              </div>
              <div className="dep-row-actions">
                <button className="mini-cta">History</button>
                <button className="mini-cta">+ Vitals</button>
                <button className="mini-cta coral">Book visit →</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============ MOBILE BOTTOM NAV (per UX brief §06) ============
function MobileBottomNav({
  screen,
  setScreen,
  onPlus,
  onServices,
}: {
  screen: ScreenId
  setScreen: (s: ScreenId) => void
  onPlus: () => void
  onServices: () => void
}) {
  const item = (id: ScreenId | 'services', label: string, icon: ReactNode, onClick?: () => void) => {
    const active = screen === id
    return (
      <button
        type="button"
        className={`mbn-item${active ? ' active' : ''}`}
        onClick={onClick ?? (() => setScreen(id as ScreenId))}
        aria-current={active ? 'page' : undefined}
      >
        <span className="mbn-icon">{icon}</span>
        <span className="mbn-lbl">{label}</span>
      </button>
    )
  }
  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      {item('dashboard', 'Home', (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12l9-9 9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ))}
      {item('wallet', 'Wallet', (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 11H5m14 0a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2m14 0v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ))}
      <button type="button" className="mbn-plus" aria-label="Quick actions" onClick={onPlus}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
      </button>
      {item('records', 'Records', (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 2h6a2 2 0 012 2v0a2 2 0 01-2 2H9a2 2 0 01-2-2v0a2 2 0 012-2zM5 6h14v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6zM9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ))}
      {item('services', 'Services', (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
      ), onServices)}
    </nav>
  )
}

// ============ SERVICES SHEET (mobile bottom-nav · Services tab) ============
function ServicesSheet({
  onClose,
  go,
}: {
  onClose: () => void
  go: (s: ScreenId) => void
}) {
  const action = (label: string, sub: string, target: ScreenId, icon: ReactNode, coral = false) => (
    <button
      type="button"
      className={`qas-item${coral ? ' coral' : ''}`}
      onClick={() => { go(target); onClose() }}
    >
      <span className="qas-icon">{icon}</span>
      <span className="qas-text">
        <span className="qas-lbl">{label}</span>
        <span className="qas-sub">{sub}</span>
      </span>
    </button>
  )
  return (
    <div className="qas-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Services">
      <div className="qas-sheet" onClick={e => e.stopPropagation()}>
        <div className="qas-handle" />
        <div className="qas-title">Services</div>
        {action('Order medicine', 'Refill or new prescription', 'medication',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h18l-2 13H5L3 3z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
          true
        )}
        {action('Consult doctor', 'WhatsApp consultation', 'whatsapp',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
        <button type="button" className="qas-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

// ============ QUICK-ACTION SHEET (per UX brief §06 — big Coral [+]) ============
function QuickActionSheet({
  onClose,
  go,
}: {
  onClose: () => void
  go: (s: ScreenId) => void
}) {
  const action = (label: string, sub: string, target: ScreenId, icon: ReactNode, coral = false) => (
    <button
      type="button"
      className={`qas-item${coral ? ' coral' : ''}`}
      onClick={() => { go(target); onClose() }}
    >
      <span className="qas-icon">{icon}</span>
      <span className="qas-text">
        <span className="qas-lbl">{label}</span>
        <span className="qas-sub">{sub}</span>
      </span>
    </button>
  )
  return (
    <div className="qas-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Quick actions">
      <div className="qas-sheet" onClick={e => e.stopPropagation()}>
        <div className="qas-handle" />
        <div className="qas-title">Quick actions</div>
        {action('Order medication', 'Refill or new prescription', 'medication',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h18l-2 13H5L3 3z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
          true
        )}
        {action('Talk to doctor', 'WhatsApp consult', 'whatsapp',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
        {action('Top-up wallet', 'Add to your COVA balance', 'wallet',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 11H5m14 0a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2m14 0v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
        {action('Add dependent', 'Cover another family member', 'dependents',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h2m6-4a4 4 0 11-8 0 4 4 0 018 0zM19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
        {action('Symptom check', 'Find the right care', 'triage',
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
        <button type="button" className="qas-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

// ============ TOP-LEVEL APP ============
function App() {
  const [screen, setScreen] = useState<ScreenId>('dashboard')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="mobile-topbar">
        <div className="mobile-brand">
          <img src="/images/checkupsLogo.png" alt="CheckUps" className="mobile-brand-logo" />
        </div>
        <button className="topbar-icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.4L4 17h5m6 0a3 3 0 11-6 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="dot" />
        </button>
      </header>

      <div className="app-body">
        <Sidebar screen={screen} setScreen={setScreen} />
        <main className="main">
          {screen === 'dashboard' && <DashboardScreen setScreen={setScreen} />}
          {screen === 'triage' && <TriageScreen setScreen={setScreen} />}
          {screen === 'whatsapp' && <WhatsappScreen setScreen={setScreen} />}
          {screen === 'medication' && <MedicationScreen setScreen={setScreen} />}
          {screen === 'paylater' && <PaylaterScreen setScreen={setScreen} />}
          {screen === 'dependents' && <DependentsScreen setScreen={setScreen} />}
          {screen === 'wallet' && <WalletScreen setScreen={setScreen} />}
          {screen === 'history' && <HistoryScreen setScreen={setScreen} />}
          {screen === 'records' && <RecordsScreen setScreen={setScreen} />}
          {screen === 'insurance' && <InsuranceScreen setScreen={setScreen} />}
          <a href="tel:+254111050290" className="mobile-support-strip">
            <span className="mobile-support-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="mobile-support-text">
              <span className="mobile-support-label">Customer care · 24/7</span>
              <span className="mobile-support-num">+254 111 050 290</span>
            </span>
            <span className="mobile-support-cta">Call</span>
          </a>
        </main>
      </div>

      <MobileBottomNav
        screen={screen}
        setScreen={setScreen}
        onPlus={() => setSheetOpen(true)}
        onServices={() => setServicesOpen(true)}
      />
      {sheetOpen && (
        <QuickActionSheet onClose={() => setSheetOpen(false)} go={setScreen} />
      )}
      {servicesOpen && (
        <ServicesSheet onClose={() => setServicesOpen(false)} go={setScreen} />
      )}
    </div>
  )
}

export default App
