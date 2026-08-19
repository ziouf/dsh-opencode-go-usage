# dsh-opencode-go-usage

OpenCode Go plan usage monitor for DeepSeek Harness: a status bar under the
chat input in the web GUI showing the 5h-rolling / weekly / monthly quota
windows with a live reset countdown. The bar appears **only while an
OpenCode Go model is active** on the current session.

Data comes from the official quota API
(`GET https://opencode.ai/zen/go/v1/usage`, Bearer API key; no workspace id,
no cookie).

## Install

```sh
# From npm (the Web GUI runs on the `web` profile):
dsh plugin --profile web add @cyrilmarin/dsh-opencode-go-usage
# Or from a local checkout:
dsh plugin --profile web add /path/to/dsh-opencode-go-usage
# Upgrade to the latest version:
dsh plugin --profile web update @cyrilmarin/dsh-opencode-go-usage
```

Restart the profile afterwards (`dsh web` for the browser UI).

## Configure

**Recommended**: pick the official-channel OpenCode Go provider in
Web Settings → Models and enter the API key there; nothing else is needed.

The API key is resolved per refresh through `ctx.credentials` under the
`apiKeyEnv` reference (default `OPENCODE_GO_API_KEY`) — it can also be stored
manually in `~/.dsh/.credentials.yaml` or an environment variable:

```yaml
- insert:
    - id: opencode-go-usage
      name: '@cyrilmarin/dsh-opencode-go-usage'
      config:
        apiKeyEnv: OPENCODE_GO_API_KEY
        refreshMs: 60000
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `apiKeyEnv` | string | `OPENCODE_GO_API_KEY` | credential reference |
| `apiKey` | string | — | direct key fallback (discouraged) |
| `endpoint` | string | `https://opencode.ai/zen/go/v1/usage` | quota endpoint |
| `refreshMs` | number | `60000` | auto-refresh interval |
| `timeoutMs` | number | `10000` | per-request timeout |

## Usage status bar

<img src="img/example.png" width="340" alt="Usage readout screenshot" />

A compact, theme-aware status bar rendered in the
`conversation.composer.dock` seat — the band **under the chat input window**,
aligned with the composer column (the same slot the conversation stats line
lives in). It reads the session's active model and renders **only while the
active provider is OpenCode Go** (default route `opencode-go`, configured in
Web Settings → Models); on any other provider — or before a model selection
is known — it contributes zero layout.

- One threshold-colored chip per quota window (5h Rolling / Weekly /
  Monthly): colored dot + used percent (green <60% / orange ≥60% / red
  ≥85%), with the 5h-rolling window's exact reset countdown (`↻3h25m`).
- A live health dot, the sample age ("Updated 2m ago"), a quiet
  "refresh failed, showing previous data" note, and a manual refresh
  affordance (↻).
- Unconfigured/error details render on hover (`title`); a failed fetch never
  blanks the bar.

## Display stability

Data and health are decoupled: when a refresh fails (timeout, API error), the
bar **keeps showing the last successful sample** — the status dot turns
yellow and a quiet "refresh failed, showing previous data" note appears. The
display is never blanked; error / unconfigured states appear only before the
first successful fetch.

The status dot reuses the shared `dsh-client-ui-primitives` `StateDot` so the
bar's affordances stay visually consistent with the rest of DSH.

## Internationalization

The status bar is fully bilingual (简体中文 / English). The active language
follows dsh's own `locale.preference` in the host settings
(`$DSH_HOME/settings.yaml`, namespace `locale`); when no explicit preference
is set, the browser's language is used as a fallback, exactly like the rest of
the Web UI. Switching the language in Web Settings → General → Language
re-renders the bar immediately — no reload, no refresh.

All copy lives in the plugin's locale namespace (`opencode-usage`, zh/en
dictionaries registered through `ctx.locale`); window names, countdowns,
relative timestamps, accessibility labels, and the host-reported failure
messages are covered. Host errors are sent to the browser as stable machine
codes (`connect`, `timeout`, `unauthorized`, `http`, `parse`, `no-data`,
`unconfigured`), and the client localizes them — one translation source, no
language logic on the host.

## Model Experience

### Request surface and condition

The plugin exposes no model-facing surface: the model never sees quota
values, no prompt text or tool schema is added.

#### Token effect

None — no model request, no injected tokens.

#### KV Cache effect

None — no request tokens added or replaced.

## Known Limitations and Deferred Work

- **Poll latency** — the status bar polls every 60s; quota changes appear
  within at most one poll cycle (the manual ↻ refresh is instant).
- **Data freshness** — after repeated failed refreshes the bar keeps showing
  the last successful sample, which grows stale until a refresh succeeds.
- **Model gating source** — the bar shows while the session's model selection
  (read from the shared per-session model directory) reports the
  `opencode-go` provider; before the first selection load or on any other
  provider it stays hidden.
- **Single account** — one API key per profile; multi-account dashboards are
  out of scope.
