// src/App.tsx
import { Navbar } from './components/Navbar'
import { Hero } from './sections/Hero'
import { DocsPage } from './pages/DocsPage'

export default function App() {
  return (
    <div className="font-sans bg-hero">
      <Navbar />
      <Hero />
      <DocsPage />
    </div>
  )
}
