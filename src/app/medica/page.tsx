"use client";

import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Maximize2,
  MoreHorizontal,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const NAV_ITEMS = ["Dashboard", "Analytics", "Reports", "Settings", "Help"];

const STAT_CARDS = [
  {
    icon: TrendingUp,
    value: "4,820",
    label: "Total Sessions",
    sub: "Updated 5m ago",
    badge: "bg-[#FFF3DC] text-[#B8860B]",
    bar: "bg-[#F2B84B]",
  },
  {
    icon: Users,
    value: "1,240",
    label: "Active Users",
    sub: "Updated 1h ago",
    badge: "bg-[#E3F2FD] text-[#0369A1]",
    bar: "bg-[#4FB3EF]",
  },
  {
    icon: Activity,
    value: "96%",
    label: "Success Rate",
    sub: "Updated today",
    badge: "bg-[#E6F7EE] text-[#0F7B3D]",
    bar: "bg-[#54C98C]",
  },
];

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS = [3, 4, 5, 6, 7, 8, 9];

const CHART_DATA = [
  { day: "Sun", a: 22, b: 12 },
  { day: "Mon", a: 30, b: 18 },
  { day: "Tue", a: 26, b: 15 },
  { day: "Wed", a: 38, b: 21 },
  { day: "Thu", a: 34, b: 26 },
  { day: "Fri", a: 48, b: 30 },
  { day: "Sat", a: 52, b: 36 },
];

const UPDATES = [
  {
    initials: "LF",
    name: "Lena Fischer",
    sub: "Completed a review · 2h ago",
    avatar: "bg-[#E3F2FD] text-[#0369A1]",
  },
  {
    initials: "OF",
    name: "Omar Fields",
    sub: "Uploaded a new batch · 5h ago",
    avatar: "bg-[#E6F7EE] text-[#0F7B3D]",
  },
];

const round = "flex h-8 w-8 items-center justify-center rounded-full border border-[#EDEFF2] text-[#9AA5B1] transition-colors hover:text-[#0D1B2A] hover:border-[#D5DBE2]";

export default function MedicaDashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [activeDay, setActiveDay] = useState(5);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#0D1B2A]">
      {/* ── Top Navbar ─────────────────────────────────── */}
      <header className="border-b border-[#EDEFF2] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1F2A] text-white">
              <Activity className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Medica</span>
          </div>

          {/* Center pill nav */}
          <nav className="hidden items-center gap-0.5 rounded-full bg-[#F4F6F8] p-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  activeNav === item
                    ? "bg-[#0B1F2A] text-white shadow-sm"
                    : "text-[#9AA5B1] hover:text-[#0D1B2A]"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-[#F4F6F8] py-1 pl-1 pr-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1F2A] text-xs font-bold text-white">
                AM
              </span>
              <span className="hidden text-sm font-medium sm:block">
                Welcome, Alex
              </span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F6F8] text-[#0D1B2A] transition-colors hover:bg-[#E8EBEF]">
              <Bell className="h-4 w-4" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F6F8] text-[#0D1B2A] transition-colors hover:bg-[#E8EBEF]">
              <Settings className="h-4 w-4" />
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-6 py-6">
        {/* ── Top Stats Row ────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="relative overflow-hidden rounded-[22px] bg-white p-5 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)]">
              <span className={`absolute inset-x-0 top-0 h-1 ${s.bar}`} />
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.badge}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[#9AA5B1]">{s.sub}</span>
              </div>
              <p className="mt-4 text-[22px] font-extrabold tracking-tight">
                {s.value}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#0D1B2A]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Main Content Grid (2-col) ────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Left large card */}
          <div className="lg:col-span-3">
            <div className="flex h-full flex-col rounded-[22px] bg-white p-6 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[26px] font-extrabold tracking-tight md:text-[29px]">
                    Perception Score
                  </h2>
                  <p className="mt-1 text-sm text-[#9AA5B1]">
                    Based on your recent activity over the last 30 days
                  </p>
                </div>
                <div className="flex items-center gap-2.5 rounded-full bg-[#F4F6F8] px-4 py-2">
                  <span className="text-xl font-extrabold">78%</span>
                  <span className="rounded-full bg-[#E6F7EE] px-2.5 py-0.5 text-xs font-semibold text-[#0F7B3D]">
                    Excellent
                  </span>
                </div>
              </div>

              {/* Central illustration with callouts */}
              <div className="flex flex-1 items-center justify-center py-6">
                <svg viewBox="0 0 400 240" className="w-full max-w-md" aria-hidden>
                  <defs>
                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0B1F2A" />
                      <stop offset="100%" stopColor="#27536B" />
                    </linearGradient>
                  </defs>

                  {/* ring */}
                  <circle cx="200" cy="130" r="62" fill="none" stroke="#EDEFF2" strokeWidth="20" />
                  <circle
                    cx="200" cy="130" r="62" fill="none" stroke="url(#ring)" strokeWidth="20"
                    strokeLinecap="round" strokeDasharray="292 390" strokeDashoffset="0"
                    transform="rotate(-90 200 130)"
                  />
                  <text x="200" y="126" textAnchor="middle" fontSize="34" fontWeight="800" fill="#0D1B2A">
                    78%
                  </text>
                  <text x="200" y="152" textAnchor="middle" fontSize="12" fontWeight="500" fill="#9AA5B1">
                    Overall Score
                  </text>

                  {/* callouts */}
                  <circle cx="38" cy="108" r="5" fill="#F2B84B" />
                  <line x1="50" y1="112" x2="138" y2="124" stroke="#D5DBE2" strokeWidth="2" strokeDasharray="4 5" />
                  <text x="34" y="88" fontSize="13" fontWeight="600" fill="#0D1B2A">
                    Responsiveness
                  </text>
                  <text x="34" y="104" fontSize="11" fill="#9AA5B1">
                    92 / 100
                  </text>

                  <circle cx="362" cy="108" r="5" fill="#4FB3EF" />
                  <line x1="350" y1="112" x2="262" y2="124" stroke="#D5DBE2" strokeWidth="2" strokeDasharray="4 5" />
                  <text x="366" y="88" fontSize="13" fontWeight="600" fill="#0D1B2A" textAnchor="end">
                    Clarity
                  </text>
                  <text x="366" y="104" fontSize="11" fill="#9AA5B1" textAnchor="end">
                    71 / 100
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:col-span-2">
            {/* Day selector strip */}
            <div className="rounded-[22px] bg-white p-4 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)]">
              <div className="flex items-center justify-between px-1 pb-3">
                <button className={`${round}`} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-bold tracking-tight">August 2026</span>
                <button className={`${round}`} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEK.map((w) => (
                  <span key={w} className="pb-1 text-center text-[11px] font-medium text-[#9AA5B1]">
                    {w}
                  </span>
                ))}
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => setActiveDay(i)}
                    className={`rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${
                      activeDay === i
                        ? "bg-[#0B1F2A] text-white shadow-sm"
                        : "text-[#0D1B2A] hover:bg-[#F4F6F8]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile header row */}
            <div className="flex items-center gap-3 rounded-[22px] bg-white p-4 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F2A] text-sm font-bold text-white">
                AM
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight">Alex Morgan</p>
                <p className="truncate text-[13px] text-[#9AA5B1]">
                  Senior Analyst · Berlin
                </p>
              </div>
              <span className="ml-auto rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#0369A1]">
                Active
              </span>
            </div>

            {/* Area chart */}
            <div className="rounded-[22px] bg-white p-5 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)]">
              <div className="mb-1 flex items-center justify-between px-1">
                <p className="text-sm font-bold">Weekly Trends</p>
              </div>
              <div className="mb-3 flex items-center gap-4 px-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#9AA5B1]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0B1F2A]" /> Series A
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#9AA5B1]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4FB3EF]" /> Series B
                </span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B1F2A" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#0B1F2A" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4FB3EF" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#4FB3EF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDEFF2" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9AA5B1" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9AA5B1" }}
                    />
                    <Tooltip
                      cursor={{ stroke: "#D5DBE2", strokeDasharray: "3 3" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #EDEFF2",
                        boxShadow: "0 12px 40px -18px rgba(11,31,42,0.25)",
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="a" stroke="#0B1F2A" strokeWidth={2} fill="url(#gA)" />
                    <Area type="monotone" dataKey="b" stroke="#4FB3EF" strokeWidth={2} fill="url(#gB)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row (3-col) ───────────────────────── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Preview card 1 */}
          <div className="group rounded-[22px] bg-white p-3 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)] transition-shadow duration-200 hover:shadow-[0_18px_48px_-20px_rgba(11,31,42,0.28)]">
            <div className="relative flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF3DC] to-[#FBE1B3]">
              <ImageIcon className="h-8 w-8 text-[#B8860B]" />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#0F7B3D] shadow-sm">
                New
              </span>
            </div>
            <div className="flex items-center justify-between px-1.5 pt-3 pb-1">
              <p className="text-sm font-bold tracking-tight">Snapshot 01</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#9AA5B1] transition-colors group-hover:bg-[#F4F6F8] group-hover:text-[#0D1B2A]">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Preview card 2 */}
          <div className="group rounded-[22px] bg-white p-3 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)] transition-shadow duration-200 hover:shadow-[0_18px_48px_-20px_rgba(11,31,42,0.28)]">
            <div className="relative flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E3F2FD] to-[#C5E4FA]">
              <ImageIcon className="h-8 w-8 text-[#0369A1]" />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#B8860B] shadow-sm">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between px-1.5 pt-3 pb-1">
              <p className="text-sm font-bold tracking-tight">Snapshot 02</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#9AA5B1] transition-colors group-hover:bg-[#F4F6F8] group-hover:text-[#0D1B2A]">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Wide updates card */}
          <div className="rounded-[22px] bg-white p-5 shadow-[0_12px_40px_-18px_rgba(11,31,42,0.18)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold tracking-tight">Updates</p>
              <span className="flex items-center gap-2 text-[13px] text-[#9AA5B1]">
                Aug 7, 2026
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEFF2] text-[#0D1B2A]">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              {UPDATES.map((u) => (
                <div
                  key={u.name}
                  className="flex items-center gap-3 rounded-2xl border border-[#EDEFF2] p-3 transition-colors duration-200 hover:bg-[#F8FAFB]"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${u.avatar}`}>
                    {u.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight">{u.name}</p>
                    <p className="truncate text-[13px] text-[#9AA5B1]">{u.sub}</p>
                  </div>
                  <div className="ml-auto flex shrink-0 gap-1.5">
                    <span className={round}><Eye className="h-3.5 w-3.5" /></span>
                    <span className={round}><Download className="h-3.5 w-3.5" /></span>
                    <span className={round}><MoreHorizontal className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}