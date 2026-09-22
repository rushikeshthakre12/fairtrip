import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Checker from './pages/Checker'
import Result from './pages/Result'
import ScanCheck from './pages/ScanCheck'
import CommunityReports from './pages/CommunityReports'
import About from './pages/About'
import ModelTransparency from './pages/ModelTransparency'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/checker" element={<Checker />} />
          <Route path="/result" element={<Result />} />
          <Route path="/scan" element={<ScanCheck />} />
          <Route path="/community" element={<CommunityReports />} />
          <Route path="/about" element={<About />} />
          <Route path="/model" element={<ModelTransparency />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
