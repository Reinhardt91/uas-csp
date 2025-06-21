'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = Cookies.get('user')
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/signin')
    }
    setLoading(false)
  }, [router])

  

  return null
}