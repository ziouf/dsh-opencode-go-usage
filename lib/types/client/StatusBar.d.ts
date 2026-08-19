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
import type { ReactElement } from 'react';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import { type ModelDirectoryStateLike } from './usage-model.ts';
/**
 * Root status-bar props: the session's model-directory store (injected) and
 * the namespace-bound translator (slot locale seat). The framework injects
 * nothing else the bar needs — it is a pure reader of the two stores.
 */
export interface StatusBarProps {
    /** The session's shared model-directory store; absent without the model-selection plugin. */
    directory?: SnapshotStore<ModelDirectoryStateLike>;
    /** Namespace-bound translate for this plugin's dictionary. */
    t: TranslateNS<'opencode-usage'>;
}
/** The status bar under the composer card, gated on an active OpenCode Go model. */
export declare function StatusBar({ directory, t }: StatusBarProps): ReactElement | null;
