import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useEffect, useState, useSyncExternalStore } from 'react';
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives';
import { fetchState, formatRelative, formatRemainingCompact, isOpenCodeGoActive, percentTone, refreshState, stateHasUsage, usageWindows, OPENCODE_GO_PROVIDER, } from "./usage-model.js";
import styles from './usage.module.css';
/** Poll cadence for the host quota cache (the bar is always collapsed). */
const POLL_MS = 60_000;
/** The status bar under the composer card, gated on an active OpenCode Go model. */
export function StatusBar({ directory, t }) {
    // Reactive active-provider signal: null store / null selection → not OpenCode Go.
    const modelState = useSyncExternalStore((subscribe) => directory?.subscribe(subscribe) ?? (() => { }), () => directory?.getSnapshot() ?? null);
    const active = isOpenCodeGoActive(modelState);
    const [state, setState] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    // Re-rendered once a second so the 5h-rolling countdown stays live.
    const [now, setNow] = useState(() => Date.now());
    // Poll the host cache while the bar is active; never poll while hidden.
    useEffect(() => {
        if (!active)
            return;
        let alive = true;
        const tick = async () => {
            try {
                const next = await fetchState();
                if (alive)
                    setState(next);
            }
            catch {
                // Keep the last sample; transient network failures must not blank the bar.
            }
        };
        void tick();
        const id = window.setInterval(() => { void tick(); }, POLL_MS);
        return () => {
            alive = false;
            window.clearInterval(id);
        };
    }, [active]);
    // Countdown ticker: only while active.
    useEffect(() => {
        if (!active)
            return;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [active]);
    const handleRefresh = async () => {
        if (refreshing)
            return;
        setRefreshing(true);
        try {
            setState(await refreshState());
            setNow(Date.now());
        }
        catch {
            // The next poll will surface host-side health; keep the current sample.
        }
        finally {
            setRefreshing(false);
        }
    };
    // Only OpenCode Go sessions render the bar — zero layout otherwise.
    if (!active)
        return null;
    const windows = usageWindows(stateHasUsage(state) ? state.usage : undefined, t);
    // State-dot semantics: connecting → ongoing, live → done, stale → warning,
    // error/unconfigured → error.
    const dotState = state === null ? 'ongoing'
        : state.health.status === 'ok' ? 'done'
            : stateHasUsage(state) ? 'warning'
                : 'error';
    /** Resolve the user-visible failure detail from a structured health error. */
    const errorText = () => {
        if (state === null)
            return t('error.connecting.detail');
        const error = state.health.error;
        if (error === undefined)
            return '';
        return t(`error.${error.code}`, error.params ?? {});
    };
    // Full detail rides the hover title; the visible row stays compact.
    const title = state === null
        ? t('error.connecting')
        : state.health.status === 'ok'
            ? t('health.live')
            : stateHasUsage(state)
                ? `${errorText()} · ${t('health.stale')}`
                : errorText();
    return (_jsxs("div", { className: styles.bar, title: title, "aria-label": t('bar.aria'), "data-provider": OPENCODE_GO_PROVIDER, children: [_jsx(StateDot, { state: dotState, size: 8 }), windows.length > 0 ? (_jsx("div", { className: styles.windows, children: windows.map((window, index) => (_jsx(WindowChip, { window: window, now: now, t: t, separator: index > 0, isRolling: window.key === 'rolling' }, window.key))) })) : (_jsx("span", { className: styles.emptyNote, children: t('empty.note') })), _jsxs("div", { className: styles.meta, children: [state !== null && (_jsx("span", { className: styles.updated, children: t('bar.updated', { relative: formatRelative(state.usageFetchedAt ?? state.health.fetchedAt, now, t) }) })), state !== null && stateHasUsage(state) && state.health.status !== 'ok' && (_jsx("span", { className: styles.staleNote, children: t('bar.stale') })), _jsx("button", { type: "button", className: styles.refresh, onClick: () => { void handleRefresh(); }, disabled: refreshing, "aria-label": refreshing ? t('refresh.loading') : t('refresh.idle'), title: refreshing ? t('refresh.loading') : t('refresh.idle'), children: refreshing ? '…' : '↻' })] })] }));
}
/**
 * One quota window's compact readout: threshold-colored dot + localized label
 * + used percent + (for the 5h-rolling window) the live reset countdown.
 */
function WindowChip({ window, now, t, separator, isRolling }) {
    const tone = percentTone(window.percent);
    return (_jsxs(_Fragment, { children: [separator && _jsx("span", { className: styles.sep, "aria-hidden": "true", children: "|" }), _jsxs("span", { className: styles.window, children: [_jsx("span", { className: styles.windowDot, "data-tone": tone, "aria-hidden": "true" }), _jsx("span", { className: styles.windowLabel, children: window.label }), _jsxs("span", { className: styles.windowPercent, "data-tone": tone, children: [window.percent, "%"] }), isRolling && (_jsxs("span", { className: styles.windowCountdown, title: t('bar.rolling.title'), children: [_jsx("span", { "aria-hidden": "true", children: "\u21BB" }), formatRemainingCompact(window.resetsAt, now, t)] }))] })] }));
}
