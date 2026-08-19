/** Browser plugin for the OpenCode Go usage status bar. */
import { StatusBar } from "./StatusBar.js";
import { USAGE_NS, zh, en } from "./locales.js";
/**
 * The status bar needs the locale service (dictionaries) and the slot
 * registry (the `conversation.composer.dock` seat). The model directory is
 * reached through the optional `ctx.get('modelDirectories')` lookup, so a
 * profile without the model-selection plugin never shows the bar rather than
 * failing to mount.
 */
export const inject = ['locale', 'slots'];
/**
 * Register a status-bar entry under the composer card (the band below the
 * chat input window), once ui-conversation declares the seat, and provide
 * the session's shared model-directory store through the inject face so the
 * bar can follow the active provider (visible only while an OpenCode Go
 * model is selected). Cleans up on plugin unload.
 */
export function apply(ctx) {
    // Register before the first render so the slot-synthesized translator
    // resolves against the complete dictionary.
    const locale = ctx.locale;
    ctx.effect(() => locale.register(USAGE_NS, { zh, en }), 'opencode-go-usage: dictionaries');
    ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
        name: 'conversation.composer.dock',
        id: 'opencode-go-usage',
        order: 1,
        locale: USAGE_NS,
        inject: (sessionId) => {
            const models = ctx.get('modelDirectories');
            return { directory: models?.directoryFor(sessionId).store };
        },
    }, StatusBar));
}
