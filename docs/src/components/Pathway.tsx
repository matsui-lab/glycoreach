import { motion } from 'motion/react';

export default function Pathway() {
  return (
    <section className="py-24 bg-white text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Pathway Logic & Aggregation</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Reachability integrates expression data across biosynthetic steps using <strong>AND/OR logic</strong>. 
            Sequential steps require all components (AND = minimum), while isozymes provide alternative routes (OR = mean).
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Diagram */}
          <div className="relative p-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center space-y-8">
              {/* Step 1 */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-12 bg-white rounded-lg flex items-center justify-center text-sm font-mono border border-slate-200 text-slate-700 shadow-sm">Precursor</div>
                <div className="w-8 h-0.5 bg-blue-400 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-blue-400 rotate-45"></div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-sm">
                  <div className="text-xs font-bold text-blue-800 mb-2">Isozymes (OR Logic)</div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-white border border-blue-100 rounded text-sm text-blue-700 font-medium shadow-sm">B4GALT1</div>
                    <div className="px-3 py-1 bg-white border border-blue-100 rounded text-sm text-blue-700 font-medium shadow-sm">B4GALT2</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 uppercase font-semibold tracking-wider">Aggregated by Mean</div>
                </div>
              </div>

              {/* AND Logic connector */}
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-emerald-400 relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 border-emerald-400 rotate-45"></div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 my-2 shadow-sm">
                  AND (Minimum)
                </div>
                <div className="h-8 w-0.5 bg-emerald-400 relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 border-emerald-400 rotate-45"></div>
                </div>
              </div>

              {/* Step 2 with Donor */}
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center shadow-sm">
                  <div className="text-xs font-bold text-purple-800 mb-2">Donor Substrate</div>
                  <div className="px-3 py-1 bg-white border border-purple-100 rounded text-sm text-purple-700 font-medium shadow-sm">CMP-Sia Supply</div>
                </div>
                <div className="w-8 h-0.5 bg-emerald-400 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-emerald-400 rotate-45"></div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-sm">
                  <div className="text-xs font-bold text-blue-800 mb-2">Enzyme Step</div>
                  <div className="px-3 py-1 bg-white border border-blue-100 rounded text-sm text-blue-700 font-medium shadow-sm">ST3GAL3/4/6</div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Isozyme Aggregation (OR)</h3>
                <p className="text-slate-600">When multiple isozymes can catalyze the same reaction, their expression Z-scores are averaged. This reflects that expression of multiple family members can increase total enzymatic potential.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-200 shadow-sm">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Donor Substrates</h3>
                <p className="text-slate-600">Nucleotide sugar donors (like CMP-Sia or GDP-Fuc) require their own synthesis, activation, and transport steps. These are calculated as independent sub-pathways and integrated into the main pathway.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Bottleneck Integration (AND)</h3>
                <p className="text-slate-600">Sequential steps and required donors are combined using the minimum function. The step with the lowest relative expression determines the overall reachability score for the glycan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
