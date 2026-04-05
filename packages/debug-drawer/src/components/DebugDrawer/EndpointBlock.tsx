// src/components/DebugDrawer/EndpointBlock.tsx
import { EndpointConfig, MockScenario } from "../../mocks/types";

function getPayload(option: EndpointConfig["options"][number]) {
  if (option.scenario === "loading") return "// pending...";
  if (option.scenario === "network_error") return "// network error";
  if (!option.payload) return "{}";
  return JSON.stringify(option.payload, null, 2);
}

function scBadgeClass(code: number | null) {
  if (!code) return "mswd-sc-badge mswd-sc-badge--err";
  if (code < 300) return "mswd-sc-badge mswd-sc-badge--2xx";
  if (code < 500) return "mswd-sc-badge mswd-sc-badge--4xx";
  return "mswd-sc-badge mswd-sc-badge--5xx";
}

function radioClass(scenario: MockScenario, selected: boolean) {
  if (!selected) return "mswd-radio";
  if (scenario === "loading") return "mswd-radio mswd-radio--loading";
  const isErr = ["error", "not_found", "forbidden", "network_error"].includes(
    scenario,
  );
  return `mswd-radio ${isErr ? "mswd-radio--error" : "mswd-radio--success"}`;
}
function dotClass(scenario: MockScenario) {
  if (scenario === "loading") return "mswd-radio-dot mswd-radio-dot--loading";
  const isErr = ["error", "not_found", "forbidden", "network_error"].includes(
    scenario,
  );
  return `mswd-radio-dot ${isErr ? "mswd-radio-dot--error" : "mswd-radio-dot--success"}`;
}
function statusClass(scenario: MockScenario) {
  if (scenario === "success") return "mswd-ep-status mswd-ep-status--success";
  if (scenario === "loading") return "mswd-ep-status mswd-ep-status--loading";
  return "mswd-ep-status mswd-ep-status--error";
}

interface Props {
  endpoint: EndpointConfig;
  expanded: boolean;
  onToggle: () => void;
  onSelectScenario: (s: MockScenario) => void;
}

export function EndpointBlock({
  endpoint,
  expanded,
  onToggle,
  onSelectScenario,
}: Props) {
  const sel =
    endpoint.options.find((o) => o.scenario === endpoint.selectedScenario) ??
    endpoint.options[0];
  return (
    <div className="mswd-ep-block">
      <button className="mswd-ep-header" onClick={onToggle}>
        <span className={`mswd-method mswd-method--${endpoint.method}`}>
          {endpoint.method}
        </span>
        <span className="mswd-ep-path">{endpoint.path}</span>
        <span className={statusClass(endpoint.selectedScenario)}>
          {sel?.statusCode ??
            (endpoint.selectedScenario === "loading" ? "…" : "ERR")}
        </span>
        <span
          className={`mswd-chevron ${expanded ? "mswd-chevron--open" : "mswd-chevron--closed"}`}
        >
          ›
        </span>
      </button>

      {expanded && (
        <div className="mswd-options">
          {endpoint.options.map((opt, i) => {
            const selected = endpoint.selectedScenario === opt.scenario;
            return (
              <div className="mswd-option-wrapper" key={opt.id}>
                {i > 0 && <div className="mswd-option-divider" />}
                <button
                  className={`mswd-option ${selected ? "mswd-option--selected" : ""}`}
                  onClick={() => onSelectScenario(opt.scenario)}
                >
                  <div className={radioClass(opt.scenario, selected)}>
                    {selected && <div className={dotClass(opt.scenario)} />}
                  </div>
                  <div className="mswd-opt-info">
                    <p className="mswd-opt-label">{opt.label}</p>
                    <p className="mswd-opt-desc">{opt.description}</p>
                  </div>
                  {opt.scenario === "loading" ? (
                    <span className="mswd-sc-spinner" />
                  ) : (
                    <span className={scBadgeClass(opt.statusCode)}>
                      {opt.statusCode ?? "ERR"}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
          <div className="mswd-payload">
            <p className="mswd-payload-label">Response preview</p>
            <pre className="mswd-payload-code">{getPayload(sel)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
