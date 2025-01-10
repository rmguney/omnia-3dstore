'use client'
import './styles.css'
import Link from 'next/link'
import Scene from '@/components/Scene'

export default function App() {
  return (
    <>
      <Link href="/parameters" className="parameters-button">
        Parametre Testi
      </Link>
      <Scene />
    </>
  )
}
