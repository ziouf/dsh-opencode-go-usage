/**
 * Locale dictionaries for the OpenCode Go usage status bar.
 *
 * The plugin owns one namespace (`opencode-usage`) merged into the shared
 * {@link LocaleNamespaceMap}, so `ctx.locale.register(USAGE_NS, { zh, en })`
 * is typed: zh is the key-set source of truth, en is checked complete against
 * it at compile time, and the merged namespace makes the slot-synthesized
 * `t` (typed by the `locale` seat) resolve to exactly these keys.
 *
 * Templates use `{name}` placeholders; `createTranslator` interpolates them
 * for pure tests. Values follow the active locale chosen by dsh's
 * `locale.preference` (with a browser-language fallback) — see the locale
 * plugin's README.
 * @module dsh-opencode-go-usage/client/locales
 */
/** `opencode-usage` namespace dictionaries. */
/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
    // Window names (status-bar readout).
    'window.rolling': '5h 滚动',
    'window.weekly': '本周',
    'window.monthly': '本月',
    // Countdown units.
    'countdown.reset': '已重置',
    'countdown.daysHours': '{days}天{hours}小时',
    'countdown.hoursMinutes': '{hours}小时{minutes}分',
    'countdown.minutesSeconds': '{minutes}分{seconds}秒',
    'countdown.seconds': '{seconds}秒',
    // Relative sample age.
    'relative.justNow': '刚刚',
    'relative.secondsAgo': '{seconds}秒前',
    'relative.minutesAgo': '{minutes}分钟前',
    'relative.hoursAgo': '{hours}小时前',
    'relative.daysAgo': '{days}天前',
    // Host-reported failure codes.
    'error.idle': '尚未刷新',
    'error.unconfigured': '未找到 OpenCode Go API Key：请在 Web 设置 → 模型 中选择「官方渠道 · OpenCode Go」并填入 API Key',
    'error.connect': '无法连接 OpenCode 用量服务：{detail}',
    'error.timeout': '请求超时',
    'error.unauthorized': 'API Key 无效或已过期（HTTP 401/403），请检查 OPENCODE_GO_API_KEY',
    'error.http': 'OpenCode 用量服务返回 HTTP {status}',
    'error.parse': 'OpenCode 用量服务返回了无法解析的响应',
    'error.no-data': '响应中没有可用的用量数据（usage.rolling/weekly/monthly 均缺失）',
    // Status bar chrome.
    'bar.aria': 'OpenCode Go 用量：5h 滚动/周/月配额与重置倒计时',
    'bar.updated': '更新于 {relative}',
    'bar.rolling.title': '5h 滚动窗口重置倒计时',
    'bar.stale': '刷新失败，显示上次数据',
    'empty.note': '用量服务未返回任何窗口数据。',
    'health.live': '实时',
    'health.stale': '数据过期',
    'error.connecting': '正在连接用量服务…',
    'error.connecting.detail': '如果长时间停留在该状态，请检查 dsh 服务是否运行了 dsh-opencode-go-usage 插件。',
    'refresh.idle': '立即刷新',
    'refresh.loading': '刷新中…',
};
/** `opencode-usage` namespace dictionaries. */
/** English dictionary, checked complete against the zh key set. */
export const en = {
    'window.rolling': '5h Rolling',
    'window.weekly': 'This Week',
    'window.monthly': 'This Month',
    'countdown.reset': 'Reset',
    'countdown.daysHours': '{days}d {hours}h',
    'countdown.hoursMinutes': '{hours}h {minutes}m',
    'countdown.minutesSeconds': '{minutes}m {seconds}s',
    'countdown.seconds': '{seconds}s',
    'relative.justNow': 'just now',
    'relative.secondsAgo': '{seconds}s ago',
    'relative.minutesAgo': '{minutes} min ago',
    'relative.hoursAgo': '{hours} h ago',
    'relative.daysAgo': '{days} d ago',
    'error.idle': 'Not refreshed yet',
    'error.unconfigured': 'No OpenCode Go API key found: open Web Settings → Models, choose "Official · OpenCode Go" and enter the API key',
    'error.connect': 'Cannot reach the OpenCode usage service: {detail}',
    'error.timeout': 'Request timed out',
    'error.unauthorized': 'Invalid or expired API key (HTTP 401/403); check OPENCODE_GO_API_KEY',
    'error.http': 'The OpenCode usage service returned HTTP {status}',
    'error.parse': 'The OpenCode usage service returned an unparsable response',
    'error.no-data': 'No usable usage data in the response (usage.rolling/weekly/monthly all missing)',
    'bar.aria': 'OpenCode Go usage: 5h rolling / weekly / monthly quotas and reset countdown',
    'bar.updated': 'Updated {relative}',
    'bar.rolling.title': '5h rolling window reset countdown',
    'bar.stale': 'Refresh failed, showing previous data',
    'empty.note': 'The usage service returned no window data.',
    'health.live': 'Live',
    'health.stale': 'Stale',
    'error.connecting': 'Connecting to the usage service…',
    'error.connecting.detail': 'If this persists, check that the dsh service runs the dsh-opencode-go-usage plugin.',
    'refresh.idle': 'Refresh now',
    'refresh.loading': 'Refreshing…',
};
/** Namespace this plugin registers into the locale service. */
export const USAGE_NS = 'opencode-usage';
/**
 * Build a pure translator over one dictionary (tests, fixtures): resolves a
 * key and interpolates `{name}` placeholders. Mirrors the interpolation the
 * locale service applies on top of its lookup chain.
 * @param dict - flat key → template dictionary.
 * @returns a `t`-shaped translate function.
 */
export function createTranslator(dict) {
    return (key, params) => {
        const template = dict[key] ?? key;
        if (!params)
            return template;
        return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
    };
}
