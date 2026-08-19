window.__ModuleLoader__.load({
	id: "@cyrilmarin/dsh-opencode-go-usage",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/client/usage-model.js
		/**
		* Pure display projections for the OpenCode Go usage status bar.
		*
		* No React, no DOM, no DSH service: every function here is trivially
		* unit-testable, mirroring the host-side purity split. Text lives in the
		* plugin's locale dictionary, so each projection takes a small translate
		* function `t(key, params)` (the namespace-bound translate synthesized by
		* the slot seat, or a fixture translator in tests). The bar renders the
		* three quota windows as a compact threshold-colored readout with a live
		* reset countdown; tones follow a soft threshold so the readout stays calm
		* until usage climbs.
		* @module dsh-opencode-go-usage/client/model
		*/
		/** English recognizability terms, shown under the zh labels. */
		const WINDOW_SUBLABEL = {
			rolling: "5h Rolling",
			weekly: "Weekly",
			monthly: "Monthly"
		};
		/** Window periods: rolling is a fixed 5h, weekly a fixed 7d; monthly uses a
		*  30-day approximation of the subscription cycle (the API only reports the
		*  next reset instant, so the exact cycle cannot be derived). */
		const WINDOW_PERIOD_MS = {
			rolling: 300 * 60 * 1e3,
			weekly: 10080 * 60 * 1e3,
			monthly: 720 * 60 * 60 * 1e3
		};
		/**
		* Project a usage sample into ordered window views (missing windows dropped).
		* Window names come from the locale dictionary via `t`.
		* @param usage - the last successful sample (or undefined).
		* @param t - translator for the window labels.
		*/
		function usageWindows(usage, t) {
			if (usage === void 0) return [];
			const views = [];
			for (const key of [
				"rolling",
				"weekly",
				"monthly"
			]) {
				const window = usage[key];
				if (window === void 0) continue;
				views.push({
					key,
					label: t(`window.${key}`),
					sublabel: WINDOW_SUBLABEL[key],
					percent: window.percent,
					resetsAt: Date.parse(window.resetsAt),
					periodMs: WINDOW_PERIOD_MS[key]
				});
			}
			return views;
		}
		/** Tone for a used percentage (invalid numbers clamp to `ok`). */
		function percentTone(percent) {
			if (!Number.isFinite(percent)) return "ok";
			if (percent >= 85) return "danger";
			if (percent >= 60) return "warn";
			return "ok";
		}
		/** Minimal countdown for tight surfaces (the dock badge): uses the shared
		*  Latin units `4d3h`/`3h25m`/`12m05s`/`9s`; only the expired state is
		*  localized. */
		function formatRemainingCompact(resetsAt, now, t) {
			const diff = resetsAt - now;
			if (!Number.isFinite(diff)) return "—";
			if (diff <= 0) return t("countdown.reset");
			const totalMinutes = Math.floor(diff / 6e4);
			const days = Math.floor(totalMinutes / 1440);
			const hours = Math.floor(totalMinutes % 1440 / 60);
			const minutes = totalMinutes % 60;
			const seconds = Math.max(0, Math.floor(diff % 6e4 / 1e3));
			if (days > 0) return hours > 0 ? `${days}d${hours}h` : `${days}d`;
			if (hours > 0) return `${hours}h${minutes}m`;
			if (minutes > 0) return `${minutes}m${String(seconds).padStart(2, "0")}s`;
			return `${seconds}s`;
		}
		/** Human-readable age of a sample, localized via `t`. */
		function formatRelative(fetchedAt, now, t) {
			const diff = Math.max(0, now - fetchedAt);
			const seconds = Math.floor(diff / 1e3);
			if (seconds < 10) return t("relative.justNow");
			if (seconds < 60) return t("relative.secondsAgo", { seconds });
			const minutes = Math.floor(seconds / 60);
			if (minutes < 60) return t("relative.minutesAgo", { minutes });
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return t("relative.hoursAgo", { hours });
			return t("relative.daysAgo", { days: Math.floor(hours / 24) });
		}
		/** Whether a state carries usable quota windows (kept across failed refreshes). */
		function stateHasUsage(state) {
			return state !== null && state.usage !== void 0;
		}
		/**
		* Provider route id of the “Official · OpenCode Go” channel: the
		* `llm-pi-ai` provider profile the user configures in Web Settings → Models
		* (default route `opencode-go`). The status bar renders only while the
		* session's active model comes from this provider.
		*/
		const OPENCODE_GO_PROVIDER = "opencode-go";
		/** Whether the session's active model comes from an OpenCode Go provider. */
		function isOpenCodeGoActive(state) {
			return state != null && state.current != null && state.current.provider === "opencode-go";
		}
		/** Fetch the current cached sample from the plugin route. */
		async function fetchState() {
			const response = await fetch("/plugins/dsh-opencode-go-usage/state", { cache: "no-store" });
			if (!response.ok) throw new Error(`state HTTP ${response.status}`);
			return await response.json();
		}
		/** Ask the host for an immediate refresh and return the new sample. */
		async function refreshState() {
			const response = await fetch("/plugins/dsh-opencode-go-usage/refresh", { method: "POST" });
			if (!response.ok) throw new Error(`refresh HTTP ${response.status}`);
			return await response.json();
		}
		//#endregion
		//#region \0dsh-css:/home/cyril/Workspace/Perso/dsh-opencode-go-usage/src/client/usage.module.css.mjs
		const css = ".OxHraW_bar{box-sizing:border-box;width:100%;max-width:var(--dsh-chat-content-width);padding:4px calc(var(--dsh-composer-side-clearance) + 16px) 0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;justify-content:center;align-items:center;gap:10px;margin:0 auto;font-size:12px;line-height:20px;display:flex;overflow:hidden}.OxHraW_windows{align-items:center;gap:10px;min-width:0;display:inline-flex}.OxHraW_window{align-items:center;gap:5px;min-width:0;display:inline-flex}.OxHraW_windowDot{border-radius:50%;flex:none;width:7px;height:7px}.OxHraW_windowDot[data-tone=ok]{background:var(--dsw-alias-state-success-primary)}.OxHraW_windowDot[data-tone=warn]{background:var(--dsw-alias-state-warn-primary)}.OxHraW_windowDot[data-tone=danger]{background:var(--dsw-alias-state-error-primary)}.OxHraW_windowLabel{color:var(--dsw-alias-label-secondary)}.OxHraW_windowPercent{font-variant-numeric:tabular-nums}.OxHraW_windowPercent[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}.OxHraW_windowPercent[data-tone=danger]{color:var(--dsw-alias-state-error-primary)}.OxHraW_windowCountdown{color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;align-items:baseline;gap:3px;display:inline-flex}.OxHraW_sep{color:var(--dsw-alias-separator-primary);flex:none}.OxHraW_meta{align-items:center;gap:7px;min-width:0;display:inline-flex}.OxHraW_updated{color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums}.OxHraW_staleNote{color:var(--dsw-alias-state-warn-primary);font-size:11px}.OxHraW_emptyNote{color:var(--dsw-alias-label-tertiary)}.OxHraW_refresh{width:20px;height:20px;color:var(--dsw-alias-label-caption);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:6px;justify-content:center;align-items:center;padding:0;font-size:13px;line-height:1;transition:background .12s,color .12s;display:inline-flex}.OxHraW_refresh:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.OxHraW_refresh:disabled{cursor:default;opacity:.55}";
		const tagId = "@cyrilmarin/dsh-opencode-go-usage/usage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@cyrilmarin/dsh-opencode-go-usage";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var usage_module_css_default = {
			"bar": "OxHraW_bar",
			"emptyNote": "OxHraW_emptyNote",
			"meta": "OxHraW_meta",
			"refresh": "OxHraW_refresh",
			"sep": "OxHraW_sep",
			"staleNote": "OxHraW_staleNote",
			"updated": "OxHraW_updated",
			"window": "OxHraW_window",
			"windowCountdown": "OxHraW_windowCountdown",
			"windowDot": "OxHraW_windowDot",
			"windowLabel": "OxHraW_windowLabel",
			"windowPercent": "OxHraW_windowPercent",
			"windows": "OxHraW_windows"
		};
		//#endregion
		//#region lib/client/StatusBar.js
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
		/** Poll cadence for the host quota cache (the bar is always collapsed). */
		const POLL_MS = 6e4;
		/** The status bar under the composer card, gated on an active OpenCode Go model. */
		function StatusBar({ directory, t }) {
			const active = isOpenCodeGoActive((0, react.useSyncExternalStore)((subscribe) => directory?.subscribe(subscribe) ?? (() => {}), () => directory?.getSnapshot() ?? null));
			const [state, setState] = (0, react.useState)(null);
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
				if (!active) return;
				let alive = true;
				const tick = async () => {
					try {
						const next = await fetchState();
						if (alive) setState(next);
					} catch {}
				};
				tick();
				const id = window.setInterval(() => {
					tick();
				}, POLL_MS);
				return () => {
					alive = false;
					window.clearInterval(id);
				};
			}, [active]);
			(0, react.useEffect)(() => {
				if (!active) return;
				const id = window.setInterval(() => setNow(Date.now()), 1e3);
				return () => window.clearInterval(id);
			}, [active]);
			const handleRefresh = async () => {
				if (refreshing) return;
				setRefreshing(true);
				try {
					setState(await refreshState());
					setNow(Date.now());
				} catch {} finally {
					setRefreshing(false);
				}
			};
			if (!active) return null;
			const windows = usageWindows(stateHasUsage(state) ? state.usage : void 0, t);
			const dotState = state === null ? "ongoing" : state.health.status === "ok" ? "done" : stateHasUsage(state) ? "warning" : "error";
			/** Resolve the user-visible failure detail from a structured health error. */
			const errorText = () => {
				if (state === null) return t("error.connecting.detail");
				const error = state.health.error;
				if (error === void 0) return "";
				return t(`error.${error.code}`, error.params ?? {});
			};
			const title = state === null ? t("error.connecting") : state.health.status === "ok" ? t("health.live") : stateHasUsage(state) ? `${errorText()} · ${t("health.stale")}` : errorText();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: usage_module_css_default.bar,
				title,
				"aria-label": t("bar.aria"),
				"data-provider": OPENCODE_GO_PROVIDER,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
						state: dotState,
						size: 8
					}),
					windows.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: usage_module_css_default.windows,
						children: windows.map((window, index) => (0, react_jsx_runtime.jsx)(WindowChip, {
							window,
							now,
							t,
							separator: index > 0,
							isRolling: window.key === "rolling"
						}, window.key))
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: usage_module_css_default.emptyNote,
						children: t("empty.note")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: usage_module_css_default.meta,
						children: [
							state !== null && (0, react_jsx_runtime.jsx)("span", {
								className: usage_module_css_default.updated,
								children: t("bar.updated", { relative: formatRelative(state.usageFetchedAt ?? state.health.fetchedAt, now, t) })
							}),
							state !== null && stateHasUsage(state) && state.health.status !== "ok" && (0, react_jsx_runtime.jsx)("span", {
								className: usage_module_css_default.staleNote,
								children: t("bar.stale")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: usage_module_css_default.refresh,
								onClick: () => {
									handleRefresh();
								},
								disabled: refreshing,
								"aria-label": refreshing ? t("refresh.loading") : t("refresh.idle"),
								title: refreshing ? t("refresh.loading") : t("refresh.idle"),
								children: refreshing ? "…" : "↻"
							})
						]
					})
				]
			});
		}
		/**
		* One quota window's compact readout: threshold-colored dot + localized label
		* + used percent + (for the 5h-rolling window) the live reset countdown.
		*/
		function WindowChip({ window, now, t, separator, isRolling }) {
			const tone = percentTone(window.percent);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [separator && (0, react_jsx_runtime.jsx)("span", {
				className: usage_module_css_default.sep,
				"aria-hidden": "true",
				children: "|"
			}), (0, react_jsx_runtime.jsxs)("span", {
				className: usage_module_css_default.window,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: usage_module_css_default.windowDot,
						"data-tone": tone,
						"aria-hidden": "true"
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: usage_module_css_default.windowLabel,
						children: window.label
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: usage_module_css_default.windowPercent,
						"data-tone": tone,
						children: [window.percent, "%"]
					}),
					isRolling && (0, react_jsx_runtime.jsxs)("span", {
						className: usage_module_css_default.windowCountdown,
						title: t("bar.rolling.title"),
						children: [(0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "↻"
						}), formatRemainingCompact(window.resetsAt, now, t)]
					})
				]
			})] });
		}
		//#endregion
		//#region lib/client/locales.js
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
		const zh = {
			"window.rolling": "5h 滚动",
			"window.weekly": "本周",
			"window.monthly": "本月",
			"countdown.reset": "已重置",
			"countdown.daysHours": "{days}天{hours}小时",
			"countdown.hoursMinutes": "{hours}小时{minutes}分",
			"countdown.minutesSeconds": "{minutes}分{seconds}秒",
			"countdown.seconds": "{seconds}秒",
			"relative.justNow": "刚刚",
			"relative.secondsAgo": "{seconds}秒前",
			"relative.minutesAgo": "{minutes}分钟前",
			"relative.hoursAgo": "{hours}小时前",
			"relative.daysAgo": "{days}天前",
			"error.idle": "尚未刷新",
			"error.unconfigured": "未找到 OpenCode Go API Key：请在 Web 设置 → 模型 中选择「官方渠道 · OpenCode Go」并填入 API Key",
			"error.connect": "无法连接 OpenCode 用量服务：{detail}",
			"error.timeout": "请求超时",
			"error.unauthorized": "API Key 无效或已过期（HTTP 401/403），请检查 OPENCODE_GO_API_KEY",
			"error.http": "OpenCode 用量服务返回 HTTP {status}",
			"error.parse": "OpenCode 用量服务返回了无法解析的响应",
			"error.no-data": "响应中没有可用的用量数据（usage.rolling/weekly/monthly 均缺失）",
			"bar.aria": "OpenCode Go 用量：5h 滚动/周/月配额与重置倒计时",
			"bar.updated": "更新于 {relative}",
			"bar.rolling.title": "5h 滚动窗口重置倒计时",
			"bar.stale": "刷新失败，显示上次数据",
			"empty.note": "用量服务未返回任何窗口数据。",
			"health.connecting": "连接中…",
			"health.live": "实时",
			"health.stale": "数据过期",
			"health.error": "异常",
			"error.connecting": "正在连接用量服务…",
			"error.fetchFailed": "用量获取失败",
			"error.connecting.detail": "如果长时间停留在该状态，请检查 dsh 服务是否运行了 dsh-opencode-go-usage 插件。",
			"error.unconfigured.hint": "配置方法：打开 Web 设置 → 模型，选择「官方渠道 · OpenCode Go」，填入 API Key 后稍候片刻即会自动生效。",
			"refresh.idle": "立即刷新",
			"refresh.loading": "刷新中…"
		};
		/** `opencode-usage` namespace dictionaries. */
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"window.rolling": "5h Rolling",
			"window.weekly": "This Week",
			"window.monthly": "This Month",
			"countdown.reset": "Reset",
			"countdown.daysHours": "{days}d {hours}h",
			"countdown.hoursMinutes": "{hours}h {minutes}m",
			"countdown.minutesSeconds": "{minutes}m {seconds}s",
			"countdown.seconds": "{seconds}s",
			"relative.justNow": "just now",
			"relative.secondsAgo": "{seconds}s ago",
			"relative.minutesAgo": "{minutes} min ago",
			"relative.hoursAgo": "{hours} h ago",
			"relative.daysAgo": "{days} d ago",
			"error.idle": "Not refreshed yet",
			"error.unconfigured": "No OpenCode Go API key found: open Web Settings → Models, choose “Official · OpenCode Go” and enter the API key",
			"error.connect": "Cannot reach the OpenCode usage service: {detail}",
			"error.timeout": "Request timed out",
			"error.unauthorized": "Invalid or expired API key (HTTP 401/403); check OPENCODE_GO_API_KEY",
			"error.http": "The OpenCode usage service returned HTTP {status}",
			"error.parse": "The OpenCode usage service returned an unparsable response",
			"error.no-data": "No usable usage data in the response (usage.rolling/weekly/monthly all missing)",
			"bar.aria": "OpenCode Go usage: 5h rolling / weekly / monthly quotas and reset countdown",
			"bar.updated": "Updated {relative}",
			"bar.rolling.title": "5h rolling window reset countdown",
			"bar.stale": "Refresh failed, showing previous data",
			"empty.note": "The usage service returned no window data.",
			"health.connecting": "Connecting…",
			"health.live": "Live",
			"health.stale": "Stale",
			"health.error": "Error",
			"error.connecting": "Connecting to the usage service…",
			"error.fetchFailed": "Usage fetch failed",
			"error.connecting.detail": "If this persists, check that the dsh service runs the dsh-opencode-go-usage plugin.",
			"error.unconfigured.hint": "To configure: open Web Settings → Models, choose “Official · OpenCode Go”, enter the API key — it takes effect shortly.",
			"refresh.idle": "Refresh now",
			"refresh.loading": "Refreshing…"
		};
		/** Namespace this plugin registers into the locale service. */
		const USAGE_NS = "opencode-usage";
		//#endregion
		//#region lib/client/index.js
		/** Browser plugin for the OpenCode Go usage status bar. */
		/**
		* The status bar needs the locale service (dictionaries) and the slot
		* registry (the `conversation.composer.dock` seat). The model directory is
		* reached through the optional `ctx.get('modelDirectories')` lookup, so a
		* profile without the model-selection plugin never shows the bar rather than
		* failing to mount.
		*/
		const inject = ["locale", "slots"];
		/**
		* Register a status-bar entry under the composer card (the band below the
		* chat input window), once ui-conversation declares the seat, and provide
		* the session's shared model-directory store through the inject face so the
		* bar can follow the active provider (visible only while an OpenCode Go
		* model is selected). Cleans up on plugin unload.
		*/
		function apply(ctx) {
			const locale = ctx.locale;
			ctx.effect(() => locale.register(USAGE_NS, {
				zh,
				en
			}), "opencode-go-usage: dictionaries");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "opencode-go-usage",
				order: 1,
				locale: USAGE_NS,
				inject: (sessionId) => {
					return { directory: ctx.get("modelDirectories")?.directoryFor(sessionId).store };
				}
			}, StatusBar));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map