import './globals.css'
import ThemeToggle from '../components/ThemeToggle'

export const metadata = {
  title: 'Platform Promosi Digital | SPK SAW',
  description: 'Sistem Pendukung Keputusan Pemilihan Platform Promosi Digital dengan Metode SAW',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ThemeToggle />
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}
