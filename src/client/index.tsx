/** Browser plugin for the OpenCode Go usage status bar. */

import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only import: loads dsh-client-locale's `Context.locale` augmentation
// so `ctx.locale` is typed on the apply context.
import type { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { StatusBar } from './StatusBar.tsx'
import { USAGE_NS, zh, en } from './locales.ts'
import type { ModelDirectoryStateLike } from './usage-model.ts'

/** Structural slice of the model-selection resolver, reached via ctx.get(). */
interface ModelDirectoryResolverLike {
  directoryFor(sessionId: string): { store: SnapshotStore<ModelDirectoryStateLike> }
}

/**
 * The status bar needs the locale service (dictionaries) and the slot
 * registry (the `conversation.composer.dock` seat). The model directory is
 * reached through the optional `ctx.get('modelDirectories')` lookup, so a
 * profile without the model-selection plugin never shows the bar rather than
 * failing to mount.
 */
export const inject: readonly string[] = ['locale', 'slots']

/**
 * Register a status-bar entry under the composer card (the band below the
 * chat input window), once ui-conversation declares the seat, and provide
 * the session's shared model-directory store through the inject face so the
 * bar can follow the active provider (visible only while an OpenCode Go
 * model is selected). Cleans up on plugin unload.
 */
export function apply(ctx: ClientContext): void {
  // Register before the first render so the slot-synthesized translator
  // resolves against the complete dictionary.
  const locale: LocaleRuntime = ctx.locale
  ctx.effect(() => locale.register(USAGE_NS, { zh, en }), 'opencode-go-usage: dictionaries')

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'opencode-go-usage',
    order: 1,
    locale: USAGE_NS,
    inject: (sessionId) => {
      const models = ctx.get('modelDirectories') as ModelDirectoryResolverLike | undefined
      return { directory: models?.directoryFor(sessionId).store }
    },
  }, StatusBar))
}
