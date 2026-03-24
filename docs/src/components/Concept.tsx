import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical, Activity, AlertTriangle, Info, RefreshCw, HelpCircle, ArrowDown, GitMerge, Split } from 'lucide-react';

type PresetKey = 'Salivary Gland' | 'Pancreas' | 'Blood' | 'Tumor (Salvage Active)';

interface PathwayValues {
  // Step 1: Sialylation
  st3gal3: number;
  st3gal4: number;
  st3gal6: number;
  // Step 1 Donor: CMP-Sia
  cmpSia_synth: number;
  cmpSia_cmas: number;
  cmpSia_trans: number;
  
  // Step 2: Fucosylation
  fut3: number;
  fut5: number;
  fut6: number;
  // Step 2 Donor: GDP-Fuc
  gdpFuc_denovo: number;
  gdpFuc_salvage: number;
  gdpFuc_trans: number;
}

const PRESETS: Record<PresetKey, PathwayValues> = {
  'Salivary Gland': { 
    st3gal3: 1.0, st3gal4: 1.5, st3gal6: 0.8, 
    cmpSia_synth: 1.2, cmpSia_cmas: 1.5, cmpSia_trans: 1.0,
    fut3: 2.1, fut5: 1.5, fut6: 1.8,
    gdpFuc_denovo: 1.0, gdpFuc_salvage: -0.5, gdpFuc_trans: 1.2
  },
  'Pancreas': { 
    st3gal3: -1.0, st3gal4: -1.5, st3gal6: -1.2, 
    cmpSia_synth: -0.5, cmpSia_cmas: -0.8, cmpSia_trans: -1.0,
    fut3: 0.5, fut5: 0.2, fut6: 0.8,
    gdpFuc_denovo: 1.5, gdpFuc_salvage: -1.0, gdpFuc_trans: 1.0
  },
  'Blood': { 
    st3gal3: 0.5, st3gal4: 0.8, st3gal6: 0.2, 
    cmpSia_synth: 1.2, cmpSia_cmas: 1.0, cmpSia_trans: 1.5,
    fut3: -1.8, fut5: -2.0, fut6: -1.5,
    gdpFuc_denovo: 0.5, gdpFuc_salvage: -0.5, gdpFuc_trans: 0.8
  },
  'Tumor (Salvage Active)': {
    st3gal3: 1.5, st3gal4: 1.8, st3gal6: 1.2, 
    cmpSia_synth: 1.5, cmpSia_cmas: 1.8, cmpSia_trans: 1.5,
    fut3: 1.5, fut5: 1.2, fut6: 1.0,
    gdpFuc_denovo: -2.0, gdpFuc_salvage: 2.5, gdpFuc_trans: 1.5 // De novo broken, salvage compensates
  }
};

const PRESET_DESCRIPTIONS: Record<PresetKey, string> = {
  'Salivary Gland': 'High sLeX capacity. All enzymes and donors are highly expressed.',
  'Pancreas': 'Low sLeX capacity. Uniformly low expression across all steps creates a severe bottleneck.',
  'Blood': 'Different rate-limiting step. Fucosylation (FUT3/5/6) is the primary bottleneck here.',
  'Tumor (Salvage Active)': 'De novo GDP-Fuc synthesis is broken, but the Salvage pathway compensates, maintaining high capacity.',
};

// SNFG Glycan Components
const LacNAc = () => (
  <svg width="80" height="40" viewBox="0 0 80 40" className="overflow-visible">
    <line x1="25" y1="20" x2="55" y2="20" stroke="#333" strokeWidth="2" />
    <circle cx="25" cy="20" r="10" fill="#FFD100" stroke="#333" strokeWidth="1.5"/>
    <rect x="45" y="10" width="20" height="20" fill="#005CFF" stroke="#333" strokeWidth="1.5"/>
  </svg>
);

const SialylLacNAc = () => (
  <svg width="110" height="40" viewBox="0 0 110 40" className="overflow-visible">
    <line x1="25" y1="20" x2="55" y2="20" stroke="#333" strokeWidth="2" />
    <line x1="55" y1="20" x2="85" y2="20" stroke="#333" strokeWidth="2" />
    <polygon points="25,8 37,20 25,32 13,20" fill="#A50082" stroke="#333" strokeWidth="1.5"/>
    <circle cx="55" cy="20" r="10" fill="#FFD100" stroke="#333" strokeWidth="1.5"/>
    <rect x="75" y="10" width="20" height="20" fill="#005CFF" stroke="#333" strokeWidth="1.5"/>
  </svg>
);

const SLeX = () => (
  <svg width="110" height="70" viewBox="0 0 110 70" className="overflow-visible">
    <line x1="25" y1="20" x2="55" y2="20" stroke="#333" strokeWidth="2" />
    <line x1="55" y1="20" x2="85" y2="20" stroke="#333" strokeWidth="2" />
    <line x1="85" y1="20" x2="85" y2="50" stroke="#333" strokeWidth="2" />
    <polygon points="25,8 37,20 25,32 13,20" fill="#A50082" stroke="#333" strokeWidth="1.5"/>
    <circle cx="55" cy="20" r="10" fill="#FFD100" stroke="#333" strokeWidth="1.5"/>
    <rect x="75" y="10" width="20" height="20" fill="#005CFF" stroke="#333" strokeWidth="1.5"/>
    <polygon points="85,40 95,55 75,55" fill="#E60012" stroke="#333" strokeWidth="1.5"/>
  </svg>
);

const getThickness = (val: number) => Math.max(8, ((val + 3) / 6) * 100);

const getStatusColors = (val: number, isBottleneck: boolean = false) => {
  if (isBottleneck) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', accent: 'accent-red-500', lightBg: 'bg-red-50', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' };
  if (val >= 1.0) return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', accent: 'accent-emerald-500', lightBg: 'bg-emerald-50', glow: '' };
  if (val <= -1.0) return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', accent: 'accent-amber-500', lightBg: 'bg-amber-50', glow: '' };
  return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', accent: 'accent-blue-500', lightBg: 'bg-blue-50', glow: '' };
};

export default function Concept() {
  const [activePreset, setActivePreset] = useState<PresetKey>('Salivary Gland');
  const [values, setValues] = useState<PathwayValues>(PRESETS['Salivary Gland']);
  const [hasChanged, setHasChanged] = useState(false);

  // --- Step B: Logic Aggregation ---
  // Step 1 Enzyme: Isozyme OR (Mean)
  const st3galMean = (values.st3gal3 + values.st3gal4 + values.st3gal6) / 3;
  // Step 1 Donor: Sequential AND (Min)
  const cmpSiaSupply = Math.min(values.cmpSia_synth, values.cmpSia_cmas, values.cmpSia_trans);
  
  // Step 2 Enzyme: Isozyme OR (Mean)
  const futMean = (values.fut3 + values.fut5 + values.fut6) / 3;
  // Step 2 Donor: Alternative OR (Max) then Sequential AND (Min)
  const gdpFucProd = Math.max(values.gdpFuc_denovo, values.gdpFuc_salvage);
  const gdpFucSupply = Math.min(gdpFucProd, values.gdpFuc_trans);

  // --- Step C: Final Reachability ---
  const step1 = Math.min(st3galMean, cmpSiaSupply);
  const step2 = Math.min(futMean, gdpFucSupply);
  const reachability = Math.min(step1, step2);

  // Base Calculations (for comparison)
  const baseValues = PRESETS[activePreset];
  const baseSt3galMean = (baseValues.st3gal3 + baseValues.st3gal4 + baseValues.st3gal6) / 3;
  const baseCmpSiaSupply = Math.min(baseValues.cmpSia_synth, baseValues.cmpSia_cmas, baseValues.cmpSia_trans);
  const baseFutMean = (baseValues.fut3 + baseValues.fut5 + baseValues.fut6) / 3;
  const baseGdpFucProd = Math.max(baseValues.gdpFuc_denovo, baseValues.gdpFuc_salvage);
  const baseGdpFucSupply = Math.min(baseGdpFucProd, baseValues.gdpFuc_trans);
  const baseStep1 = Math.min(baseSt3galMean, baseCmpSiaSupply);
  const baseStep2 = Math.min(baseFutMean, baseGdpFucSupply);
  const baseReachability = Math.min(baseStep1, baseStep2);

  // Determine Bottleneck Category and Specific Cause
  let bottleneckCategory = '';
  let bottleneckSpecific = '';
  
  if (reachability === st3galMean) {
    bottleneckCategory = 'Isozyme-group bottleneck';
    bottleneckSpecific = 'ST3GAL3/4/6 mean activity';
  } else if (reachability === cmpSiaSupply) {
    bottleneckCategory = 'Donor-pathway bottleneck';
    if (cmpSiaSupply === values.cmpSia_synth) bottleneckSpecific = 'CMP-Sia Synthesis';
    else if (cmpSiaSupply === values.cmpSia_cmas) bottleneckSpecific = 'CMP-Sia Activation (CMAS)';
    else bottleneckSpecific = 'CMP-Sia Transport';
  } else if (reachability === futMean) {
    bottleneckCategory = 'Isozyme-group bottleneck';
    bottleneckSpecific = 'FUT3/5/6 mean activity';
  } else if (reachability === gdpFucSupply) {
    bottleneckCategory = 'Donor-pathway bottleneck';
    if (gdpFucSupply === values.gdpFuc_trans) bottleneckSpecific = 'GDP-Fuc Transport';
    else if (gdpFucProd === values.gdpFuc_denovo) bottleneckSpecific = 'GDP-Fuc Production (De novo limited)';
    else bottleneckSpecific = 'GDP-Fuc Production (Salvage limited)';
  }

  useEffect(() => {
    const isDifferent = JSON.stringify(values) !== JSON.stringify(PRESETS[activePreset]);
    setHasChanged(isDifferent);
  }, [values, activePreset]);

  const handlePresetClick = (preset: PresetKey) => {
    setActivePreset(preset);
    setValues(PRESETS[preset]);
    setHasChanged(false);
  };

  const handleSliderChange = (key: keyof PathwayValues, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const MiniSlider = ({ id, label, value, isBottleneck = false }: { id: keyof PathwayValues, label: string, value: number, isBottleneck?: boolean }) => {
    const colors = getStatusColors(value, isBottleneck);
    return (
      <div className="mb-2 last:mb-0">
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="font-medium text-slate-700">{label}</span>
          <span className={`font-mono font-bold ${colors.text}`}>{value.toFixed(1)}</span>
        </div>
        <input 
          type="range" min="-3" max="3" step="0.1" 
          value={value}
          onChange={(e) => handleSliderChange(id, parseFloat(e.target.value))}
          className={`w-full h-1 rounded-lg appearance-none cursor-pointer bg-slate-200 ${colors.accent}`}
        />
      </div>
    );
  };

  const MiniPipes = ({ r, s1, c1, s2, c2 }: { r: number, s1: number, c1: number, s2: number, c2: number }) => {
    const arr = [s1, c1, s2, c2];
    return (
      <div className="flex items-center h-12 w-full gap-1 bg-slate-100 p-2 rounded-lg border border-slate-200">
        {arr.map((v, i) => {
          const isB = v === r;
          const colors = getStatusColors(v, isB);
          return (
            <div key={i} className="flex-1 flex items-center justify-center h-full relative">
              <motion.div 
                className={`w-full rounded-sm ${colors.bg}`} 
                animate={{ height: `${getThickness(v)}%` }} 
              />
            </div>
          );
        })}
        <div className="text-slate-400 text-xs mx-1">→</div>
        <div className="flex-1 flex items-center justify-center h-full">
          <motion.div 
            className={`w-full rounded-sm ${getStatusColors(r, false).bg}`} 
            animate={{ height: `${getThickness(r)}%` }} 
          />
        </div>
      </div>
    );
  };

  const abstractSteps = [
    { id: 'st3gal', label: 'ST3GAL Isozymes', value: st3galMean, isBottleneck: reachability === st3galMean },
    { id: 'cmpsia', label: 'CMP-Sia Supply', value: cmpSiaSupply, isBottleneck: reachability === cmpSiaSupply },
    { id: 'fut', label: 'FUT Isozymes', value: futMean, isBottleneck: reachability === futMean },
    { id: 'gdpfuc', label: 'GDP-Fuc Supply', value: gdpFucSupply, isBottleneck: reachability === gdpFucSupply }
  ];

  return (
    <section id="concept" className="py-24 bg-slate-50">
      <style>{`
        @keyframes flow-move {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-flow {
          background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          background-size: 50% 100%;
          animation: flow-move 1.5s linear infinite;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mb-4">
            <FlaskConical className="w-4 h-4" /> Interactive Pathway Explorer
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Discover the Bottleneck Principle</h2>
          <div className="text-xl font-medium text-blue-600 mb-6">
            "Reachability is determined not only by the weakest enzyme, but by the weakest integrated step after isozyme and donor-pathway logic are resolved."
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {(Object.keys(PRESETS) as PresetKey[]).map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activePreset === preset 
                  ? 'bg-blue-600 text-white shadow-md scale-105' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Visualization Area */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Layer 1: Abstract Flow Diagram */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">1</span>
                    Flow Constraint Diagram
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-lg border border-purple-200 whitespace-nowrap">
                    Final Integrated Capacity
                  </span>
                </div>
                <p className="text-sm text-slate-500">Final pathway capacity is limited after logic steps are integrated.</p>
              </div>

              <div className="w-full h-40 bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-center relative">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-400 font-mono text-xs tracking-widest uppercase font-semibold">
                  Output = min(all integrated steps)
                </div>
                
                <div className="flex items-center w-full h-16 gap-1 mt-6">
                  <div className="w-8 h-full bg-slate-200 rounded-l-lg flex items-center justify-center text-slate-500 text-xs font-bold rotate-180" style={{ writingMode: 'vertical-rl' }}>IN</div>
                  
                  {abstractSteps.map((step) => {
                    const colors = getStatusColors(step.value, step.isBottleneck);
                    return (
                    <div key={step.id} className="flex-1 flex flex-col items-center justify-center relative h-full">
                      <motion.div
                        className={`w-full rounded-sm relative overflow-hidden ${colors.bg} ${colors.glow}`}
                        animate={{ height: `${getThickness(step.value)}%` }}
                        transition={{ type: 'spring', bounce: 0.4 }}
                      >
                        <div className="absolute inset-0 animate-flow" />
                      </motion.div>
                      <div className={`absolute -bottom-6 text-[10px] font-bold whitespace-nowrap ${colors.text}`}>{step.label}</div>
                    </div>
                  )})}
                  
                  <div className="w-4 h-full flex items-center justify-center text-slate-400">→</div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center relative h-full">
                    <motion.div
                      className={`w-full rounded-r-lg relative overflow-hidden ${getStatusColors(reachability, false).bg} ${getStatusColors(reachability, false).glow}`}
                      animate={{ height: `${getThickness(reachability)}%` }}
                      transition={{ type: 'spring', bounce: 0.4 }}
                    >
                      <div className="absolute inset-0 animate-flow" />
                    </motion.div>
                    <div className={`absolute -bottom-6 text-[10px] font-bold whitespace-nowrap ${getStatusColors(reachability, false).text}`}>OUTPUT</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting Concept */}
            <div className="flex flex-col items-center justify-center py-1 relative">
              <div className="absolute inset-0 flex items-center justify-center"><div className="w-full border-t border-dashed border-slate-300"></div></div>
              <div className="bg-white px-4 py-1 border border-slate-200 rounded-full shadow-sm flex items-center gap-2 z-10">
                <ArrowDown className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Integrated from</span>
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Layer 2: Logic Layer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">2</span>
                    Logic Layer
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-lg border border-amber-200 whitespace-nowrap">
                    AND / OR / Alternative
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3 text-center">
                {/* ST3GAL Logic */}
                <div className={`p-3 rounded-xl border-l-4 ${reachability === st3galMean ? 'border-l-red-500 border-y-slate-200 border-r-slate-200 bg-red-50/30' : 'border-l-blue-500 border-y-slate-200 border-r-slate-200 bg-slate-50/50'}`}>
                  <GitMerge className={`w-5 h-5 mx-auto mb-1 ${reachability === st3galMean ? 'text-red-500' : 'text-blue-500'}`} />
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Isozyme OR</div>
                  <div className="text-[9px] text-slate-500">Aggregated as Mean</div>
                  <div className={`font-mono text-sm font-bold mt-1 ${reachability === st3galMean ? 'text-red-600' : 'text-slate-700'}`}>{st3galMean.toFixed(1)}</div>
                </div>
                
                {/* CMP-Sia Logic */}
                <div className={`p-3 rounded-xl border-l-4 ${reachability === cmpSiaSupply ? 'border-l-red-500 border-y-slate-200 border-r-slate-200 bg-red-50/30' : 'border-l-purple-500 border-y-slate-200 border-r-slate-200 bg-slate-50/50'}`}>
                  <ArrowDown className={`w-5 h-5 mx-auto mb-1 ${reachability === cmpSiaSupply ? 'text-red-500' : 'text-purple-500'}`} />
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Sequential AND</div>
                  <div className="text-[9px] text-slate-500">Aggregated as Min</div>
                  <div className={`font-mono text-sm font-bold mt-1 ${reachability === cmpSiaSupply ? 'text-red-600' : 'text-slate-700'}`}>{cmpSiaSupply.toFixed(1)}</div>
                </div>

                {/* FUT Logic */}
                <div className={`p-3 rounded-xl border-l-4 ${reachability === futMean ? 'border-l-red-500 border-y-slate-200 border-r-slate-200 bg-red-50/30' : 'border-l-blue-500 border-y-slate-200 border-r-slate-200 bg-slate-50/50'}`}>
                  <GitMerge className={`w-5 h-5 mx-auto mb-1 ${reachability === futMean ? 'text-red-500' : 'text-blue-500'}`} />
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Isozyme OR</div>
                  <div className="text-[9px] text-slate-500">Aggregated as Mean</div>
                  <div className={`font-mono text-sm font-bold mt-1 ${reachability === futMean ? 'text-red-600' : 'text-slate-700'}`}>{futMean.toFixed(1)}</div>
                </div>

                {/* GDP-Fuc Logic */}
                <div className={`p-3 rounded-xl border-l-4 ${reachability === gdpFucSupply ? 'border-l-red-500 border-y-slate-200 border-r-slate-200 bg-red-50/30' : 'border-l-purple-500 border-y-slate-200 border-r-slate-200 bg-slate-50/50'}`}>
                  <Split className={`w-5 h-5 mx-auto mb-1 ${reachability === gdpFucSupply ? 'text-red-500' : 'text-purple-500'}`} />
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Alternative OR</div>
                  <div className="text-[9px] text-slate-500">Max(De novo, Salvage)</div>
                  <div className={`font-mono text-sm font-bold mt-1 ${reachability === gdpFucSupply ? 'text-red-600' : 'text-slate-700'}`}>{gdpFucSupply.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Connecting Concept */}
            <div className="flex flex-col items-center justify-center py-1 relative">
              <div className="absolute inset-0 flex items-center justify-center"><div className="w-full border-t border-dashed border-slate-300"></div></div>
              <div className="bg-white px-4 py-1 border border-slate-200 rounded-full shadow-sm flex items-center gap-2 z-10">
                <ArrowDown className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Calculated from</span>
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Layer 3: Molecular Pathway (SNFG) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">3</span>
                    Molecular Components
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 whitespace-nowrap">
                    Normalized Expression (Z-score)
                  </span>
                </div>
                <p className="text-sm text-slate-500">{PRESET_DESCRIPTIONS[activePreset]}</p>
              </div>

              <div className="flex flex-col items-center space-y-2">
                {/* Precursor */}
                <div className="flex flex-col items-center">
                  <LacNAc />
                </div>

                {/* Step 1 */}
                <div className="w-full grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                  {/* ST3GAL Isozymes */}
                  <div className={`p-4 rounded-xl border ${reachability === st3galMean ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                    <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1">
                      {reachability === st3galMean && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      ST3GAL Isozymes
                    </div>
                    <MiniSlider id="st3gal3" label="ST3GAL3" value={values.st3gal3} isBottleneck={reachability === st3galMean} />
                    <MiniSlider id="st3gal4" label="ST3GAL4" value={values.st3gal4} isBottleneck={reachability === st3galMean} />
                    <MiniSlider id="st3gal6" label="ST3GAL6" value={values.st3gal6} isBottleneck={reachability === st3galMean} />
                  </div>
                  
                  <div className="flex flex-col items-center pt-8">
                    <div className={`h-6 w-1 ${[st3galMean, cmpSiaSupply].includes(reachability) ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                    <div className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 my-1 shadow-sm">AND</div>
                    <div className={`h-6 w-1 relative ${[st3galMean, cmpSiaSupply].includes(reachability) ? 'bg-red-400' : 'bg-slate-200'}`}>
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 rotate-45 ${[st3galMean, cmpSiaSupply].includes(reachability) ? 'border-red-400' : 'border-slate-200'}`}></div>
                    </div>
                  </div>

                  {/* CMP-Sia Substeps */}
                  <div className={`p-4 rounded-xl border ${reachability === cmpSiaSupply ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                    <div className="text-xs font-bold text-purple-700 mb-3 flex items-center gap-1">
                      {reachability === cmpSiaSupply && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      CMP-Sia Supply
                    </div>
                    <MiniSlider id="cmpSia_synth" label="Synthesis" value={values.cmpSia_synth} isBottleneck={reachability === cmpSiaSupply && cmpSiaSupply === values.cmpSia_synth} />
                    <MiniSlider id="cmpSia_cmas" label="Activation (CMAS)" value={values.cmpSia_cmas} isBottleneck={reachability === cmpSiaSupply && cmpSiaSupply === values.cmpSia_cmas} />
                    <MiniSlider id="cmpSia_trans" label="Transport" value={values.cmpSia_trans} isBottleneck={reachability === cmpSiaSupply && cmpSiaSupply === values.cmpSia_trans} />
                  </div>
                </div>

                {/* Intermediate */}
                <div className="flex flex-col items-center py-2">
                  <SialylLacNAc />
                </div>

                {/* Step 2 */}
                <div className="w-full grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                  {/* FUT Isozymes */}
                  <div className={`p-4 rounded-xl border ${reachability === futMean ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                    <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1">
                      {reachability === futMean && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      FUT Isozymes
                    </div>
                    <MiniSlider id="fut3" label="FUT3" value={values.fut3} isBottleneck={reachability === futMean} />
                    <MiniSlider id="fut5" label="FUT5" value={values.fut5} isBottleneck={reachability === futMean} />
                    <MiniSlider id="fut6" label="FUT6" value={values.fut6} isBottleneck={reachability === futMean} />
                  </div>
                  
                  <div className="flex flex-col items-center pt-8">
                    <div className={`h-6 w-1 ${[futMean, gdpFucSupply].includes(reachability) ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                    <div className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 my-1 shadow-sm">AND</div>
                    <div className={`h-6 w-1 relative ${[futMean, gdpFucSupply].includes(reachability) ? 'bg-red-400' : 'bg-slate-200'}`}>
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 rotate-45 ${[futMean, gdpFucSupply].includes(reachability) ? 'border-red-400' : 'border-slate-200'}`}></div>
                    </div>
                  </div>

                  {/* GDP-Fuc Alternative Pathways */}
                  <div className={`p-4 rounded-xl border ${reachability === gdpFucSupply ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                    <div className="text-xs font-bold text-purple-700 mb-3 flex items-center gap-1">
                      {reachability === gdpFucSupply && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      GDP-Fuc Supply
                    </div>
                    <div className="pl-3 border-l-2 border-slate-300 mb-3">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Production (Max)</div>
                      <MiniSlider id="gdpFuc_denovo" label="De novo branch" value={values.gdpFuc_denovo} isBottleneck={reachability === gdpFucSupply && gdpFucSupply === gdpFucProd && gdpFucProd === values.gdpFuc_denovo} />
                      <MiniSlider id="gdpFuc_salvage" label="Salvage branch" value={values.gdpFuc_salvage} isBottleneck={reachability === gdpFucSupply && gdpFucSupply === gdpFucProd && gdpFucProd === values.gdpFuc_salvage} />
                    </div>
                    <MiniSlider id="gdpFuc_trans" label="Transport" value={values.gdpFuc_trans} isBottleneck={reachability === gdpFucSupply && gdpFucSupply === values.gdpFuc_trans} />
                  </div>
                </div>

                {/* Product */}
                <div className="flex flex-col items-center pt-2">
                  <SLeX />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Calculation Trace & Thought Experiment */}
          <div className="lg:col-span-5 space-y-6">
            {/* Reachability Score Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Synthetic Capacity (Reachability)</h3>
              <div className="text-6xl font-bold font-mono text-blue-600 mb-6">
                {reachability.toFixed(2)}
              </div>
              
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                  Calculation Trace (3 Steps)
                </div>
                
                {/* Step A */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-600 mb-2 font-bold">Step A: Raw Components (Examples)</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                    <div>ST3GAL4: {values.st3gal4.toFixed(1)}</div>
                    <div>De novo: {values.gdpFuc_denovo.toFixed(1)}</div>
                    <div>Salvage: {values.gdpFuc_salvage.toFixed(1)}</div>
                    <div>Transport: {values.gdpFuc_trans.toFixed(1)}</div>
                  </div>
                </div>

                {/* Step B */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-600 mb-2 font-bold">Step B: Logic Aggregation</div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ST3GAL (Mean):</span>
                      <span className={st3galMean === reachability ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : 'text-slate-700'}>{st3galMean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CMP-Sia (Min):</span>
                      <span className={cmpSiaSupply === reachability ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : 'text-slate-700'}>{cmpSiaSupply.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">FUT (Mean):</span>
                      <span className={futMean === reachability ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : 'text-slate-700'}>{futMean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GDP-Fuc (Max→Min):</span>
                      <span className={gdpFucSupply === reachability ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : 'text-slate-700'}>{gdpFucSupply.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Step C */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-emerald-800 mb-1 font-bold">Step C: Final Reachability (Min of all)</div>
                    <div className="font-mono text-xs text-emerald-700 font-medium">min({st3galMean.toFixed(1)}, {cmpSiaSupply.toFixed(1)}, {futMean.toFixed(1)}, {gdpFucSupply.toFixed(1)})</div>
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-emerald-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-100">
                    {reachability.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottleneck Alert */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={bottleneckCategory + bottleneckSpecific}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Current Bottleneck: {bottleneckCategory}</h4>
                    <p className="text-red-800 text-sm mb-2 font-semibold">
                      Cause: {bottleneckSpecific}
                    </p>
                    <p className="text-red-700 text-xs">
                      {bottleneckCategory === 'Isozyme-group bottleneck' && 'Increasing just one isozyme slightly may not lift the mean enough. You need broad upregulation.'}
                      {bottleneckCategory === 'Donor-pathway bottleneck' && gdpFucSupply === reachability && 'Check if activating the salvage pathway can bypass the de novo limitation.'}
                      {bottleneckCategory === 'Donor-pathway bottleneck' && cmpSiaSupply === reachability && 'A single weak link in synthesis, activation, or transport restricts the entire donor supply.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Thought Experiment Results */}
            <AnimatePresence>
              {hasChanged && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <Activity className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="w-full">
                        <h4 className="font-bold text-emerald-900 mb-2">Thought Experiment Results</h4>
                        
                        {/* Before / After Visual */}
                        <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-emerald-100">
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Before</div>
                            <MiniPipes r={baseReachability} s1={baseSt3galMean} c1={baseCmpSiaSupply} s2={baseFutMean} c2={baseGdpFucSupply} />
                          </div>
                          <div className="text-slate-300 font-bold">→</div>
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">After</div>
                            <MiniPipes r={reachability} s1={st3galMean} c1={cmpSiaSupply} s2={futMean} c2={gdpFucSupply} />
                          </div>
                        </div>

                        {reachability > baseReachability ? (
                          <p className="text-emerald-800 text-sm mb-4">
                            <strong>Hypothesis Confirmed:</strong> You successfully lifted the bottleneck! Reachability improved from <span className="font-mono font-bold">{baseReachability.toFixed(2)}</span> to <span className="font-mono font-bold">{reachability.toFixed(2)}</span>.
                          </p>
                        ) : reachability < baseReachability ? (
                          <p className="text-emerald-800 text-sm mb-4">
                            <strong>Capacity Reduced:</strong> You created a new, more severe bottleneck. Reachability dropped from <span className="font-mono font-bold">{baseReachability.toFixed(2)}</span> to <span className="font-mono font-bold">{reachability.toFixed(2)}</span>.
                          </p>
                        ) : (
                          <p className="text-emerald-800 text-sm mb-4">
                            <strong>No Effect:</strong> You changed a component that is not the rate-limiting step, or the change wasn't large enough to shift the logic aggregate (e.g., mean).
                          </p>
                        )}
                        <button 
                          onClick={() => handlePresetClick(activePreset)}
                          className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" /> Reset to {activePreset}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h4 className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Logic Guide</h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li><strong className="font-semibold">Isozymes (OR):</strong> Parallel enzymes for the same reaction. Aggregated as a mean.</li>
                <li><strong className="font-semibold">Alternative Pathways (OR):</strong> e.g., De novo vs Salvage. The system uses the strongest path (Max).</li>
                <li><strong className="font-semibold">Sequential Steps (AND):</strong> e.g., Donor synthesis → activation → transport. Limited by the weakest link (Min).</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
