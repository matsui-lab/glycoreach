import Hero from './components/Hero';
import Concept from './components/Concept';
import Pathway from './components/Pathway';
import Results from './components/Results';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      <Hero />
      <Concept />
      <Pathway />
      <Results />
      <Footer />
    </div>
  );
}
