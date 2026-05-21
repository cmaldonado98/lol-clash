'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

/**
 * Marks a groomsman as "locked_in" by slug.
 * Called from the ClashCard client component.
 */
export async function lockIn(slug: string): Promise<void> {
  const { error } = await supabase
    .from('groomsmen')
    .update({ status: 'locked_in' })
    .eq('slug', slug)

  if (error) {
    throw new Error(`Error al fijar invocación: ${error.message}`)
  }

  revalidatePath(`/invite/${slug}`)
}
