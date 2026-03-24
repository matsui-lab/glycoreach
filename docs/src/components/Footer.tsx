import { Github, FileText, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-600 py-12 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="text-slate-900 font-bold text-lg mb-1">GlycoReach</div>
          <div className="text-sm text-slate-500">A Bottleneck-Aware Framework for Glycan Biosynthetic Potential</div>
        </div>
        
        <div className="flex gap-6">
          <a href="https://133.6.53.210:3939/glycoreach/" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
            <Globe className="w-4 h-4" /> Web App
          </a>
          <a href="https://github.com/matsui-lab/glycoreach" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
            <Github className="w-4 h-4" /> GitHub Repository
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
            <FileText className="w-4 h-4" /> Read the Paper
          </a>
        </div>
      </div>
    </footer>
  );
}
