import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import Landing from './pages/Landing'
import Checker from './pages/Checker'
import Result from './pages/Result'
import ScanCheck from './pages/ScanCheck'
import CommunityReports from './pages/CommunityReports'
import About from './pages/About'
import ModelTransparency from './pages/ModelTransparency'
import Admin from './pages/Admin'
import BackgroundPreview from './pages/BackgroundPreview'

export default function App() {
  const location = useLocation()

  // Standalone full-screen background viewer (also used for the MP4 export)
  if (location.pathname === '/background') return <BackgroundPreview />

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="bg-scrim" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main key={location.pathname} className="page-enter flex-1">
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
    </div>
  )
}
