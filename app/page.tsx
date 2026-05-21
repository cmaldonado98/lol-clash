import { redirect } from 'next/navigation'

/**
 * Root route — redirects to the demo invitation for "samuel".
 * In production, share the /invite/[slug] URL directly with each person.
 */
export default function HomePage() {
  redirect('/invite/samuel')
}
