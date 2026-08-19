/** Browser plugin for the OpenCode Go usage status bar. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * The status bar needs the locale service (dictionaries) and the slot
 * registry (the `conversation.composer.dock` seat). The model directory is
 * reached through the optional `ctx.get('modelDirectories')` lookup, so a
 * profile without the model-selection plugin never shows the bar rather than
 * failing to mount.
 */
export declare const inject: readonly string[];
/**
 * Register a status-bar entry under the composer card (the band below the
 * chat input window), once ui-conversation declares the seat, and provide
 * the session's shared model-directory store through the inject face so the
 * bar can follow the active provider (visible only while an OpenCode Go
 * model is selected). Cleans up on plugin unload.
 */
export declare function apply(ctx: ClientContext): void;
