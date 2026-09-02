import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoadingProvider } from './context/LoadingProvider'
import { ContentProvider } from './context/ContentProvider'
import Navbar      from './components/Navbar/Navbar'
import Loader      from './components/Loader/Loader'
import Cursor      from './components/Cursor/Cursor'
import Footer      from './components/Footer/Footer'
import Home        from './pages/Home'
import Story       from './pages/Story'
import Results     from './pages/Results'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import OwnerPanel  from './pages/OwnerPanel'

// ─────────────────────────────────────────────────────────────────────────────
//  SECRET OWNER PANEL URL: https://yoursite.vercel.app/kgadmin-9x2
//  Not shown anywhere on the website. Only owner knows this URL.
//  To change the secret path: edit "kgadmin-9x2" below.
// ─────────────────────────────────────────────────────────────────────────────

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    // No basename needed for Vercel — site is at root /
    <BrowserRouter>
      <ContentProvider>
        <LoadingProvider>
          <Cursor />
          <Loader />
          <Routes>
            <Route path="/"         element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/story"    element={<PublicLayout><Story /></PublicLayout>} />
            <Route path="/results"  element={<PublicLayout><Results /></PublicLayout>} />
            <Route path="/gallery"  element={<PublicLayout><GalleryPage /></PublicLayout>} />
            <Route path="/contact"  element={<PublicLayout><ContactPage /></PublicLayout>} />
            {/* SECRET OWNER PANEL — no navbar/footer */}
            <Route path="/kgadmin-9x2" element={<OwnerPanel />} />
            <Route path="*"         element={<PublicLayout><Home /></PublicLayout>} />
          </Routes>
        </LoadingProvider>
      </ContentProvider>
    </BrowserRouter>
  )
}
