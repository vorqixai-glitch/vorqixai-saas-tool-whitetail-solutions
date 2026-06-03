import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">White Tail Solutions</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/login" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Get Started</Link>
          </div>
        </nav>
      </header>

      <main>
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-b border-gray-100 pb-20">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto">
              The Complete Operating System for <span className="text-indigo-600">Sober Living</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Replace spreadsheets, manual compliance checks, and legal guesswork with a unified toolkit purpose-built for sober living operators and NARR facilities.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/login" className="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-all shadow-sm">
                Start Free Trial
              </Link>
              <Link to="/login" className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-md font-medium hover:bg-slate-50 transition-all">
                View Demos
              </Link>
            </div>
          </div>
        </div>

        <div className="py-16 sm:py-24 bg-slate-50 min-h-[400px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center md:text-left mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything you need to scale</h2>
              <p className="mt-4 text-lg text-slate-600">Built around the challenges real operators face daily.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'State Licensing Engine', desc: 'Navigate NARR and state compliance with step-by-step applications.' },
                { title: 'Resident Management', desc: 'Track intake, backgrounds, UA status, and financials securely.' },
                { title: 'Document Center', desc: 'Auto-generate house rules and resident agreements with e-signature.' }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                    <div className="w-6 h-6 bg-indigo-600 rounded-sm"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
