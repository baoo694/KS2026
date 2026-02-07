"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Trophy,
  Zap,
  Star,
  CheckCircle2,
  Play,
  Users,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";

// Sample course data
const courses = [
  {
    id: 1,
    title: "Biology Basics",
    icon: "🧬",
    color: "from-emerald-400 to-teal-500",
    cardBg: "bg-emerald-50",
    cards: 42,
    students: 1234,
  },
  {
    id: 2,
    title: "World History",
    icon: "🌍",
    color: "from-amber-400 to-orange-500",
    cardBg: "bg-amber-50",
    cards: 56,
    students: 892,
  },
  {
    id: 3,
    title: "Spanish 101",
    icon: "🇪🇸",
    color: "from-rose-400 to-pink-500",
    cardBg: "bg-rose-50",
    cards: 78,
    students: 2156,
  },
  {
    id: 4,
    title: "Math Mastery",
    icon: "📐",
    color: "from-indigo-400 to-blue-500",
    cardBg: "bg-indigo-50",
    cards: 64,
    students: 1567,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    avatar: "SC",
    color: "bg-gradient-to-br from-rose-400 to-pink-500",
    text: "Quizzlet helped me ace my anatomy exam! The spaced repetition really works.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Language Learner",
    avatar: "MJ",
    color: "bg-gradient-to-br from-emerald-400 to-teal-500",
    text: "Learning Spanish has never been this fun. The match game is addictive!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "High School Teacher",
    avatar: "ER",
    color: "bg-gradient-to-br from-amber-400 to-orange-500",
    text: "My students love using Quizzlet. Their test scores have improved by 40%.",
    rating: 5,
  },
];

const features = [
  {
    icon: Zap,
    title: "Learn Faster",
    description:
      "Spaced repetition algorithm ensures you remember more in less time.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Target,
    title: "Track Progress",
    description: "Visual progress circles show exactly what you've mastered.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description: "Match games and timed challenges make studying addictive.",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Smart Tests",
    description: "Auto-generated quizzes that adapt to your learning style.",
    color: "from-indigo-400 to-blue-500",
  },
];

// Claymorphism card component
function ClayCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        relative bg-white rounded-3xl border-4 border-slate-900/5
        shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08),inset_0_-4px_0px_0px_rgba(0,0,0,0.05)]
        ${hover ? "cursor-pointer transition-all duration-200 hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1),inset_0_-4px_0px_0px_rgba(0,0,0,0.05)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Google Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap");

        .font-display {
          font-family: "Fredoka", sans-serif;
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-amber-50">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-300/30 to-blue-300/30 blur-2xl" />
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-300/30 blur-2xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-rose-300/20 to-pink-300/20 blur-2xl" />
        <div className="absolute bottom-20 right-1/3 w-36 h-36 rounded-full bg-gradient-to-br from-emerald-300/30 to-teal-300/30 blur-2xl" />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative pt-8 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>10,000+ students learning daily</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
                Study Smart,
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-orange-500 bg-clip-text text-transparent">
                  Not Hard!
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Transform boring flashcards into an adventure. Learn with games,
                track your progress, and ace every exam!
              </p>

              <div className="flex flex-row gap-3 justify-center lg:justify-start">
                <Link href="/sets/all" className="flex-1 sm:flex-none">
                  <button className="w-full group flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm sm:text-lg shadow-lg shadow-indigo-500/30 border-4 border-indigo-600/20 cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/40">
                    Browse All Sets
                    <ArrowRight className="hidden sm:block w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-2xl bg-white text-slate-700 font-bold text-sm sm:text-lg border-4 border-slate-200 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:bg-slate-50">
                  <Play className="w-4 h-4 sm:w-5 h-5 text-indigo-500" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12">
                {[
                  { value: "10K+", label: "Active Users" },
                  { value: "500K+", label: "Flashcards Created" },
                  { value: "4.9", label: "App Rating", icon: Star },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center gap-1 font-display text-3xl font-bold text-slate-900">
                      {stat.value}
                      {stat.icon && (
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Illustration - Claymorphism Cards Stack */}
            <div className="relative mt-8 lg:mt-0 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-10 lg:animate-none">
              <div className="relative w-full aspect-square max-w-[320px] sm:max-w-lg mx-auto scale-90 sm:scale-100 origin-top">
                {/* Background card */}
                <ClayCard
                  className="absolute top-8 left-8 w-72 h-48 bg-gradient-to-br from-rose-100 to-pink-50 rotate-[-8deg]"
                  hover={false}
                >
                  <div className="p-6">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="font-display font-bold text-slate-800">
                      Master Mode
                    </div>
                    <div className="text-sm text-slate-500">98% accuracy</div>
                  </div>
                </ClayCard>

                {/* Middle card */}
                <ClayCard
                  className="absolute top-16 left-24 w-72 h-48 bg-gradient-to-br from-amber-100 to-orange-50 rotate-[4deg]"
                  hover={false}
                >
                  <div className="p-6">
                    <div className="text-4xl mb-2">⚡</div>
                    <div className="font-display font-bold text-slate-800">
                      Speed Round
                    </div>
                    <div className="text-sm text-slate-500">
                      Beat your best time!
                    </div>
                  </div>
                </ClayCard>

                {/* Front card */}
                <ClayCard
                  className="absolute top-24 left-16 w-80 h-52 bg-gradient-to-br from-indigo-100 to-blue-50"
                  hover={false}
                >
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-4xl mb-2">🧠</div>
                      <div className="font-display text-xl font-bold text-slate-800">
                        What is photosynthesis?
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-indigo-200 overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">
                        75%
                      </span>
                    </div>
                  </div>
                </ClayCard>

                {/* Floating badges */}
                <div className="absolute -top-4 right-8 px-4 py-2 rounded-full bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 border-2 border-emerald-600/20">
                  +15 XP
                </div>
                <div className="absolute bottom-20 -right-4 px-4 py-2 rounded-full bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/30 border-2 border-amber-600/20">
                  🔥 5 Day Streak
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === COURSE CATALOG SECTION === */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Explore Popular Courses
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of students mastering these subjects every day
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <ClayCard
                key={course.id}
                className={`${course.cardBg} overflow-hidden`}
              >
                <div className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} text-2xl mb-4 shadow-lg`}
                  >
                    {course.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.cards} cards
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
              </ClayCard>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/sets">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-800">
                View All Courses
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-indigo-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Why Students Love Us
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features that make learning feel like playing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <ClayCard key={feature.title} className="p-6 text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </ClayCard>
            ))}
          </div>
        </div>
      </section>

      {/* === PROGRESS TRACKING DEMO === */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Demo UI */}
            <div className="order-2 lg:order-1">
              <ClayCard
                className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50"
                hover={false}
              >
                <h4 className="font-display text-xl font-bold text-slate-900 mb-6">
                  Your Progress This Week
                </h4>

                {/* Progress bars */}
                <div className="space-y-5">
                  {[
                    {
                      subject: "Biology",
                      progress: 85,
                      color: "from-emerald-400 to-teal-500",
                    },
                    {
                      subject: "History",
                      progress: 62,
                      color: "from-amber-400 to-orange-500",
                    },
                    {
                      subject: "Spanish",
                      progress: 94,
                      color: "from-rose-400 to-pink-500",
                    },
                  ].map((item) => (
                    <div key={item.subject}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-700">
                          {item.subject}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.progress}%
                        </span>
                      </div>
                      <div className="h-4 rounded-full bg-white border-2 border-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t-2 border-slate-200">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-indigo-600">
                      156
                    </div>
                    <div className="text-xs text-slate-500">Cards Learned</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-emerald-600">
                      12
                    </div>
                    <div className="text-xs text-slate-500">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-amber-600">
                      4.2h
                    </div>
                    <div className="text-xs text-slate-500">Study Time</div>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Track Every
                <span className="text-indigo-600"> Victory</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Watch your knowledge grow with beautiful progress tracking. See
                exactly what you&apos;ve mastered and what needs more practice.
              </p>
              <ul className="space-y-4">
                {[
                  "Daily streak motivation to keep you going",
                  "Subject-by-subject progress breakdown",
                  "Weekly study time insights",
                  "Achievement badges and rewards",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-slate-700"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS SECTION === */}
      <section className="py-20 px-4 bg-gradient-to-b from-indigo-50/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Loved by Students Everywhere
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands who&apos;ve transformed their study habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <ClayCard key={testimonial.name} className="p-6" hover={false}>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </ClayCard>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ClayCard
            className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 p-12 text-center"
            hover={false}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 mb-6">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>

              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join over 10,000 students who are studying smarter, not harder.
                Start your learning journey today!
              </p>

              <div className="flex flex-row gap-3 justify-center">
                <Link href="/sets/all" className="flex-1 sm:flex-none">
                  <button className="w-full group flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-2xl bg-white text-indigo-600 font-bold text-sm sm:text-lg shadow-lg cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl">
                    Browse All Sets
                    <ArrowRight className="hidden sm:block w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-2xl bg-white/20 text-white font-bold text-sm sm:text-lg border-2 border-white/30 cursor-pointer backdrop-blur-sm transition-all duration-200 hover:bg-white/30">
                  <Clock className="w-4 h-4 sm:w-5 h-5" />
                  30s
                </button>
              </div>
            </div>
          </ClayCard>
        </div>
      </section>
    </div>
  );
}
