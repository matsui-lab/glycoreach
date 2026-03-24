import { motion } from 'motion/react';
import { ArrowRight, Github, FileText, Globe } from 'lucide-react';

const Hexagon = ({ className, delay }: { className: string, delay: number }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
    animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.8, 1, 0.8], rotate: 0 }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
    className={`absolute ${className}`}
    width="100" height="115" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
  </motion.svg>
);

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50 text-slate-900">
      {/* Artistic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Hexagon className="text-blue-300 top-1/4 left-1/4 w-32" delay={0} />
        <Hexagon className="text-indigo-300 top-1/3 left-1/2 w-48" delay={2} />
        <Hexagon className="text-emerald-300 bottom-1/4 right-1/4 w-40" delay={4} />
        <Hexagon className="text-slate-300 top-2/3 left-1/3 w-24" delay={1} />
        <Hexagon className="text-blue-200 top-[15%] right-1/3 w-28" delay={3} />
        
        {/* Connecting lines abstractly representing pathways */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
           <motion.path 
             d="M 25vw 25vh L 50vw 33vh L 75vw 75vh" 
             stroke="#3B82F6" strokeWidth="2" fill="none"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
           />
           <motion.path 
             d="M 50vw 33vh L 33vw 66vh" 
             stroke="#3B82F6" strokeWidth="2" fill="none"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
           />
        </svg>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold tracking-wider uppercase shadow-sm">
            Computational Glycobiology
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900">
            Glycan Reachability Analysis
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto font-normal leading-relaxed">
            A Bottleneck-Aware Framework for Inferring Glycan Biosynthetic Potential from Transcriptomics.
          </p>
          
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-sm">
              <div className="absolute -top-4 -left-2 text-6xl text-blue-200 font-serif leading-none">"</div>
              <div className="text-xl md:text-2xl font-medium text-slate-800 italic relative z-10">
                A system is only as strong as its weakest step.
              </div>
              <div className="absolute -bottom-8 -right-2 text-6xl text-blue-200 font-serif leading-none">"</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#concept" className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              Explore the Concept <ArrowRight className="w-5 h-5" />
            </a>
            <a href="https://133.6.53.210:3939/glycoreach/" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2">
              <Globe className="w-5 h-5" /> Open Web App
            </a>
            <a href="https://github.com/matsui-lab/glycoreach" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2">
              <Github className="w-5 h-5" /> View on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
