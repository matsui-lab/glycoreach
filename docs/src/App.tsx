import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Concepts from './pages/docs/Concepts';
import QuickStart from './pages/docs/QuickStart';
import GtexTutorial from './pages/docs/GtexTutorial';
import ApiReference from './pages/docs/ApiReference';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs/concepts" element={<Concepts />} />
        <Route path="/docs/quickstart" element={<QuickStart />} />
        <Route path="/docs/gtex-tutorial" element={<GtexTutorial />} />
        <Route path="/docs/api" element={<ApiReference />} />
      </Routes>
    </div>
  );
}
