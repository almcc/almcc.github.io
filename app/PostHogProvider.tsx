'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export default function PostHogProvider() {
  useEffect(() => {
    posthog.init('phc_CH1FLSiQOl0gZyR2LEesPz6H42CCM95H0lA4ljB761X', {
      api_host: 'https://a.almcc.me',
      defaults: '2026-01-30',
    })
  }, [])

  return null
}
