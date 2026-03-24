import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

const SIDEBAR = [
  { to: '/docs/concepts', label: 'Concepts', desc: 'Glycan biosynthesis & reachability' },
  { to: '/docs/quickstart', label: 'Quick Start', desc: 'Installation & first analysis' },
  { to: '/docs/gtex-tutorial', label: 'GTEx Tutorial', desc: 'Bulk RNA-seq walkthrough' },
  { to: '/docs/api', label: 'API Reference', desc: 'Functions & parameters' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav className="sticky top-20 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
              Documentation
            </div>
            {SIDEBAR.map(({ to, label, desc }) => (
              <Link
                key={to}
                to={to}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === to ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <div>{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 max-w-3xl">
          <article className="prose prose-slate prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-pre:bg-slate-100 prose-pre:text-slate-800 prose-pre:border prose-pre:border-slate-200 prose-code:text-blue-700 prose-code:before:content-none prose-code:after:content-none max-w-none">
            {children}
          </article>
        </main>
      </div>
      <Footer />
    </>
  );
}
