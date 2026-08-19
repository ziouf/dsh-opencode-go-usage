/**
 * OpenCode Go usage status bar — the browser surface.
 *
 * Rendered in the `conversation.composer.dock` seat (the band under the
 * composer card) by `client/index.tsx`, so it always sits directly below the
 * chat input. It shows the three OpenCode Go quota windows (5h-rolling /
 * weekly / monthly) as a compact threshold-colored readout with the
 * 5h-rolling reset countdown, a live health dot, the sample age, and a quiet
 * manual refresh affordance.
 *
 * Model gating: the bar is only VISIBLE while the session's active model
 * comes from the `opencode-go` provider route. The per-session shared model
 * directory (resolved by the inject factory in `client/index.tsx` from
 * `ctx.modelDirectories`) is read through `useSyncExternalStore`; the moment
 * the active provider is anything else (or the directory is unavailable) the
 * component returns `null`, contributing zero layout — switching away from
 * OpenCode Go hides the bar, switching back restores it.
 *
 * Copy is locale-aware: `t` is the namespace-bound translate synthesized by
 * the slot seat, so a language switch re-renders the bar in place.
 * @module dsh-opencode-go-usage/client/statusbar
 */

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactElement } from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only import that loads ui-conversation's SlotMap merge, so the
// 'conversation.composer.dock' seat is declared at the register call site.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { OpenCodeUsageState } from '../types.ts'
import {
  fetchState, formatRelative, formatRemainingCompact,
  isOpenCodeGoActive, percentTone, refreshState, stateHasUsage, usageWindows,
  OPENCODE_GO_PROVIDER, type ModelDirectoryStateLike, type WindowView,
} from './usage-model.ts'
import styles from './usage.module.css'

/** Poll cadence for the host quota cache (the bar is always collapsed). */
const POLL_MS = 60_000

/**
 * Root status-bar props: the session's model-directory store (injected) and
 * the namespace-bound translator (slot locale seat). The framework injects
 * nothing else the bar needs — it is a pure reader of the two stores.
 */
export interface StatusBarProps {
  /** The session's shared model-directory store; absent without the model-selection plugin. */
  directory?: SnapshotStore<ModelDirectoryStateLike>
  /** Namespace-bound translate for this plugin's dictionary. */
  t: TranslateNS<'opencode-usage'>
}

/** The status bar under the composer card, gated on an active OpenCode Go model. */
export function StatusBar({ directory, t }: StatusBarProps): ReactElement | null {
  // Reactive active-provider signal: null store / null selection → not OpenCode Go.
  const modelState = useSyncExternalStore(
    (subscribe) => directory?.subscribe(subscribe) ?? (() => {}),
    () => directory?.getSnapshot() ?? null,
  )
  const active = isOpenCodeGoActive(modelState)

  const [state, setState] = useState<OpenCodeUsageState | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  // Re-rendered once a second so the 5h-rolling countdown stays live.
  const [now, setNow] = useState(() => Date.now())

  // Poll the host cache while the bar is active; never poll while hidden.
  useEffect(() => {
    if (!active) return
    let alive = true
    const tick = async (): Promise<void> => {
      try {
        const next = await fetchState()
        if (alive) setState(next)
      } catch {
        // Keep the last sample; transient network failures must not blank the bar.
      }
    }
    void tick()
    const id = window.setInterval(() => { void tick() }, POLL_MS)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [active])

  // Countdown ticker: only while active.
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return
    setRefreshing(true)
    try {
      setState(await refreshState())
      setNow(Date.now())
    } catch {
      // The next poll will surface host-side health; keep the current sample.
    } finally {
      setRefreshing(false)
    }
  }

  // Only OpenCode Go sessions render the bar — zero layout otherwise.
  if (!active) return null

  const windows = usageWindows(stateHasUsage(state) ? state.usage : undefined, t)

  // State-dot semantics: connecting → ongoing, live → done, stale → warning,
  // error/unconfigured → error.
  const dotState = state === null ? 'ongoing'
    : state.health.status === 'ok' ? 'done'
    : stateHasUsage(state) ? 'warning'
    : 'error'

  /** Resolve the user-visible failure detail from a structured health error. */
  const errorText = (): string => {
    if (state === null) return t('error.connecting.detail')
    const error = state.health.error
    if (error === undefined) return ''
    return t(`error.${error.code}`, error.params ?? {})
  }

  // Full detail rides the hover title; the visible row stays compact.
  const title = state === null
    ? t('error.connecting')
    : state.health.status === 'ok'
      ? t('health.live')
      : stateHasUsage(state)
        ? `${errorText()} · ${t('health.stale')}`
        : errorText()

  return (
    <div
      className={styles.bar}
      title={title}
      aria-label={t('bar.aria')}
      data-provider={OPENCODE_GO_PROVIDER}
    >
      <StateDot state={dotState} size={8} />
      {windows.length > 0 ? (
        <div className={styles.windows}>
          {windows.map((window, index) => (
            <WindowChip
              key={window.key}
              window={window}
              now={now}
              t={t}
              separator={index > 0}
              isRolling={window.key === 'rolling'}
            />
          ))}
        </div>
      ) : (
        <span className={styles.emptyNote}>{t('empty.note')}</span>
      )}
      <div className={styles.meta}>
        {state !== null && (
          <span className={styles.updated}>
            {t('bar.updated', { relative: formatRelative(state.usageFetchedAt ?? state.health.fetchedAt, now, t) })}
          </span>
        )}
        {state !== null && stateHasUsage(state) && state.health.status !== 'ok' && (
          <span className={styles.staleNote}>{t('bar.stale')}</span>
        )}
        <button
          type="button"
          className={styles.refresh}
          onClick={() => { void handleRefresh() }}
          disabled={refreshing}
          aria-label={refreshing ? t('refresh.loading') : t('refresh.idle')}
          title={refreshing ? t('refresh.loading') : t('refresh.idle')}
        >
          {refreshing ? '…' : '↻'}
        </button>
      </div>
    </div>
  )
}

/**
 * One quota window's compact readout: threshold-colored dot + localized label
 * + used percent + (for the 5h-rolling window) the live reset countdown.
 */
function WindowChip({ window, now, t, separator, isRolling }: {
  window: WindowView
  now: number
  t: TranslateNS<'opencode-usage'>
  separator: boolean
  isRolling: boolean
}): ReactElement {
  const tone = percentTone(window.percent)
  return (
    <>
      {separator && <span className={styles.sep} aria-hidden="true">|</span>}
      <span className={styles.window}>
        <span className={styles.windowDot} data-tone={tone} aria-hidden="true" />
        <span className={styles.windowLabel}>{window.label}</span>
        <span className={styles.windowPercent} data-tone={tone}>{window.percent}%</span>
        {isRolling && (
          <span className={styles.windowCountdown} title={t('bar.rolling.title')}>
            <span aria-hidden="true">↻</span>
            {formatRemainingCompact(window.resetsAt, now, t)}
          </span>
        )}
      </span>
    </>
  )
}
