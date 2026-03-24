import { Link, useLocation } from 'react-router-dom';
import { Github, Globe, BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const DOC_LINKS = [
  { to: '/docs/concepts', label: 'Concepts' },
  { to: '/docs/quickstart', label: 'Quick Start' },
  { to: '/docs/gtex-tutorial', label: 'GTEx Tutorial' },
  { to: '/docs/api', label: 'API Reference' },
];

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDoc = location.pathname.startsWith('/docs');
  const [open, setOpen] = useState(false);

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors ${isHome ? 'bg-white/80 backdrop-blur border-slate-200/50' : 'bg-white border-slate-200'}`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors">
          glycoreach
        </Link>

        <div className="flex items-center gap-1">
          {/* Docs dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${isDoc ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <BookOpen className="w-4 h-4" />
              Documentation
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  {DOC_LINKS.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${location.pathname === to ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <a href="https://133.6.53.210:3939/glycoreach/" target="_blank" rel="noreferrer"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1">
            <Globe className="w-4 h-4" /> App
          </a>
          <a href="https://github.com/matsui-lab/glycoreach" target="_blank" rel="noreferrer"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1">
            <Github className="w-4 h-4" /> GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
