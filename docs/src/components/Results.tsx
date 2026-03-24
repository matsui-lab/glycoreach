import { BarChart3, Activity, Layers } from 'lucide-react';

export default function Results() {
  const findings = [
    {
      icon: <Layers className="w-6 h-6 text-blue-500" />,
      title: "Reveals Hidden Tissue Differences",
      description: "Binary methods classify the pancreas as 'capable' of synthesizing sLeX (96% positive). Reachability reveals it has among the lowest potential (Z = -1.86) due to uniformly low expression across all steps."
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-500" />,
      title: "Predicts Downstream Signaling",
      description: "Reachability scores strongly correlate with downstream signaling cascades (e.g., WNT/heparan sulfate ρ = 0.83), outperforming naive mean expression of pathway genes."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      title: "Identifies Specific Bottlenecks",
      description: "The framework pinpoints exactly which step limits production. For example, identifying donor substrate availability (CMP-Sia transport) as the hidden bottleneck for ganglioside GM3 in the brain."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">What Reachability Reveals</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Applied to 17,382 RNA-seq samples across 54 human tissues from GTEx v8, the framework provides new biological insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {findings.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
