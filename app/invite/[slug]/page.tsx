import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Groomsman } from '@/types'
import ClashCard from '@/components/ClashCard'
import TeamLobby from '@/components/TeamLobby'

/* Always render at request time — Supabase data is user-specific */
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/* ── Dynamic metadata ────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase.from('groomsmen').select('name, role').eq('slug', slug).single()
  if (!data) return { title: 'Invitación | Copa Mexicali' }
  return {
    title: `${data.name} · Copa Mexicali`,
    description: `${data.name} ha sido reclutado para la Copa Mexicali – Torneo Clash 10/10/2026`,
  }
}

/* ── Page ────────────────────────────────────────────────── */
export default async function InvitePage({ params }: PageProps) {
  const { slug } = await params

  /* Fetch the invited player */
  const { data: groomsman, error } = await supabase
    .from('groomsmen')
    .select('*')
    .eq('slug', slug)
    .single<Groomsman>()

  /* Show a helpful dev message if the DB/table isn't set up yet */
  if (error || !groomsman) {
    const isSetupError =
      error?.code === '42P01' || // table does not exist
      error?.message?.includes('relation') ||
      error?.message?.includes('supabase') ||
      !groomsman

    if (process.env.NODE_ENV === 'development' && isSetupError) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-hextech-black px-6 text-center">
          <div className="hextech-panel max-w-md rounded-sm p-6">
            <h1 className="font-beaufort text-xl text-hextech-gold">Falta configurar la base de datos</h1>
            <div className="hextech-divider my-4" />
            <ol className="mt-2 space-y-2 text-left font-spiegel text-sm text-hextech-gray list-decimal list-inside">
              <li>Ve a tu proyecto en <span className="text-hextech-blue">supabase.com/dashboard</span></li>
              <li>Abre el <strong className="text-hextech-gold-light">SQL Editor</strong></li>
              <li>Copia y ejecuta el contenido de <code className="text-hextech-blue">supabase/schema.sql</code></li>
              <li>Recarga esta página</li>
            </ol>
            {error && (
              <p className="mt-4 rounded-sm bg-red-950/30 p-2 font-spiegel text-xs text-red-400">
                {error.code}: {error.message}
              </p>
            )}
          </div>
        </main>
      )
    }
    notFound()
  }

  /* Fetch the whole team (for the lobby) */
  const { data: allPlayers } = await supabase
    .from('groomsmen')
    .select('*')
    .order('role', { ascending: true })
    .returns<Groomsman[]>()

  return (
    <main>
      {groomsman.status === 'pending' ? (
        <ClashCard groomsman={groomsman} />
      ) : (
        <TeamLobby currentPlayer={groomsman} allPlayers={allPlayers ?? []} />
      )}
    </main>
  )
}
