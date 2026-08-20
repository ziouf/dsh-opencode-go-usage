# dsh-opencode-go-usage

DeepSeek Harness 的 **OpenCode Go 计划用量监控**插件：Web GUI 聊天输入框下方的
**状态栏**，实时显示 5h 滚动 / 本周 / 本月三个额度窗口的已用百分比与重置倒计时。
该状态栏**仅在当前会话激活了 OpenCode Go 模型时**显示。

数据来自 OpenCode 官方配额 API（`GET https://opencode.ai/zen/go/v1/usage`，
Bearer API Key 认证，无需 workspace id、无需 Cookie）。

## 安装

```sh
# 从 npm 安装（Web GUI 对应 web profile）：
dsh plugin --profile web add @cyrilmarin/dsh-opencode-go-usage
# 或本地路径：
dsh plugin --profile web add /path/to/dsh-opencode-go-usage
# 升级到最新版：
dsh plugin --profile web update @cyrilmarin/dsh-opencode-go-usage
```

安装后重启对应 profile（Web UI 即 `dsh web`）。

## 配置

**推荐途径**：在 Web 设置 → 模型 中选择「官方渠道 · OpenCode Go」并填入 API
Key，之后无需任何配置即可使用。

插件每次刷新通过 `ctx.credentials` 解析 `apiKeyEnv` 指定的凭据引用（默认
`OPENCODE_GO_API_KEY`），也可手动把 Key 存入 `~/.dsh/.credentials.yaml`
或环境变量：

```yaml
- insert:
    - id: opencode-go-usage
      name: '@cyrilmarin/dsh-opencode-go-usage'
      config:
        apiKeyEnv: OPENCODE_GO_API_KEY
        refreshMs: 60000
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `apiKeyEnv` | string | `OPENCODE_GO_API_KEY` | 凭据引用 |
| `apiKey` | string | — | 直接指定 Key（不推荐） |
| `endpoint` | string | `https://opencode.ai/zen/go/v1/usage` | 配额接口 |
| `refreshMs` | number | `60000` | 自动刷新间隔 |
| `timeoutMs` | number | `10000` | 单次请求超时 |

## 用量状态栏

一行紧凑的、跟随主题的状态栏，渲染在 `conversation.composer.dock` 插槽中——
即**聊天输入框正下方**、与输入框同列对齐（与会话统计行所在的插槽一致）。
状态栏读取当前会话的激活模型，**仅在激活渠道为 OpenCode Go 时显示**（默认路由
`opencode-go`，在 Web 设置 → 模型 中配置）；切换为其他渠道、或模型选择尚未加载
时，状态栏不占任何版面。

- 每个额度窗口一枚按阈值着色的芯片（5h 滚动 / 本周 / 本月）：彩色圆点 + 已用
  百分比（<60% 绿 / ≥60% 橙 / ≥85% 红），5h 滚动窗口旁附实时重置倒计时
  （`↻3h25m`）。
- 实时状态点、「更新于 X 前」、刷新失败时的一行「显示上次数据」淡提示，以及
  手动刷新按钮（↻）。
- 未配置/异常详情在悬停 `title` 中展示；抓取失败不会让状态栏空白。

## 显示稳定性

数据与健康状态分离：某次刷新失败（网络超时、API 异常）时，状态栏**继续
显示上次成功获取的额度**，仅状态点转为黄色、出现一行「刷新失败，
显示上次数据」的淡提示，不打断显示；只有从未成功获取过时才显示错误/未配置
提示。

状态点复用 DSH 共享原语 `dsh-client-ui-primitives` 的 `StateDot`，与全站视觉保持
一致。

## 国际化

用量状态栏支持中英双语（简体中文 / English），当前语言跟随 dsh 自身的
`locale.preference`（宿主设置中的 `$DSH_HOME/settings.yaml`，namespace `locale`）；
未显式设置时回退到浏览器语言，与 Web 界面其余部分完全一致。
在 Web 设置 → 通用 → 语言中切换语言后，状态栏会立即重新渲染——无需重载或刷新。

所有文案都位于插件自己的 locale namespace（`opencode-usage`，通过 `ctx.locale`
注册的 zh/en 双语词典）；窗口名称、倒计时、相对时间、无障碍标签以及宿主上报的
错误信息均已覆盖。宿主错误以稳定的机器码（`connect`、`timeout`、`unauthorized`、
`http`、`parse`、`no-data`、`unconfigured`）发送给浏览器，由客户端本地化——
单一翻译来源，宿主侧不感知语言。

## Model Experience

### Request surface and condition

本插件不暴露任何模型可见面：模型看不到用量数值，不新增任何系统提示文本
或工具 schema。

#### Token effect

无 —— 不发起模型请求，不注入任何 token。

#### KV Cache effect

无 —— 不新增或替换任何请求 token。

## Known Limitations and Deferred Work

- **轮询延迟** —— 状态栏每 60 秒轮询一次，用量变化最多延迟一个轮询周期
  （手动 ↻ 刷新即时生效）。
- **数据新鲜度** —— 刷新连续失败时继续显示上次成功数据，数据会随时间
  变旧，恢复后自动更新。
- **模型门控来源** —— 状态栏读取共享的按会话模型目录，当激活渠道为
  `opencode-go` 时显示；在模型选择首次加载前或切换到其他渠道时保持隐藏。
- **单账户** —— 每个 profile 只解析一个 API Key；多账户仪表盘不在范围内。
