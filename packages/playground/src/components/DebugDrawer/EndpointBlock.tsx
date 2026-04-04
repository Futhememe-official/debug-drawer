// src/components/DebugDrawer/EndpointBlock.tsx
import { EndpointConfig, MockScenario } from '../../mocks/types'

// ─── helpers ──────────────────────────────────────────────────────────────

function methodClasses(method: string) {
  switch (method) {
    case 'POST':   return 'bg-blue-50 text-blue-600 border-blue-200'
    case 'DELETE': return 'bg-red-50 text-red-600 border-red-200'
    case 'PUT':
    case 'PATCH':  return 'bg-amber-50 text-amber-600 border-amber-200'
    default:       return 'bg-emerald-50 text-emerald-600 border-emerald-200'
  }
}

function scenarioHeaderClasses(scenario: MockScenario) {
  if (scenario === 'success') return 'bg-emerald-50 text-emerald-700'
  if (scenario === 'loading') return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

function radioClasses(scenario: MockScenario, selected: boolean) {
  if (!selected) return 'border-border2 bg-transparent'
  if (scenario === 'loading') return 'border-amber-500 bg-amber-50'
  const isError = ['error','not_found','forbidden','network_error'].includes(scenario)
  return isError ? 'border-red-500 bg-red-50' : 'border-emerald-500 bg-emerald-50'
}

function radioDotColor(scenario: MockScenario) {
  if (scenario === 'loading') return 'bg-amber-500'
  const isError = ['error','not_found','forbidden','network_error'].includes(scenario)
  return isError ? 'bg-red-500' : 'bg-emerald-500'
}

function statusBadgeClasses(statusCode: number | null, scenario: MockScenario) {
  if (scenario === 'loading') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (!statusCode) return 'bg-red-50 text-red-600 border-red-200'
  if (statusCode < 300) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (statusCode < 500) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-600 border-red-200'
}

function getStatusLabel(statusCode: number | null, scenario: MockScenario) {
  if (scenario === 'loading') return '…'
  if (!statusCode) return 'ERR'
  return String(statusCode)
}

function getPayloadPreview(option: EndpointConfig['options'][number]) {
  if (option.scenario === 'loading')       return '// pending... no response yet'
  if (option.scenario === 'network_error') return '// network error — no response'
  if (!option.payload) return '{}'
  return JSON.stringify(option.payload, null, 2)
}

// ─── EndpointBlock ────────────────────────────────────────────────────────

interface Props {
  endpoint: EndpointConfig
  expanded: boolean
  onToggle: () => void
  onSelectScenario: (scenario: MockScenario) => void
}

export function EndpointBlock({ endpoint, expanded, onToggle, onSelectScenario }: Props) {
  const selectedOption = endpoint.options.find(o => o.scenario === endpoint.selectedScenario) ?? endpoint.options[0]

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left hover:bg-surface2 transition-colors"
      >
        <span className={`font-mono text-[9px] font-bold px-1.5 py-1 rounded border tracking-wide ${methodClasses(endpoint.method)}`}>
          {endpoint.method}
        </span>
        <span className="flex-1 font-mono text-[11px] text-tx truncate">{endpoint.path}</span>
        <span className={`font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full ${scenarioHeaderClasses(endpoint.selectedScenario)}`}>
          {selectedOption?.statusCode ?? (endpoint.selectedScenario === 'loading' ? '…' : 'ERR')}
        </span>
        <span className={`text-muted text-sm transition-transform duration-200 ${expanded ? '-rotate-90' : 'rotate-90'}`}>›</span>
      </button>

      {/* Options */}
      {expanded && (
        <div className="border-t border-border">
          {endpoint.options.map((opt, i) => (
            <div key={opt.id}>
              {i > 0 && <div className="h-px bg-border" />}
              <button
                onClick={() => onSelectScenario(opt.scenario)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-surface2 ${endpoint.selectedScenario === opt.scenario ? 'bg-surface2' : ''}`}
              >
                {/* Radio */}
                <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${radioClasses(opt.scenario, endpoint.selectedScenario === opt.scenario)}`}>
                  {endpoint.selectedScenario === opt.scenario && (
                    <div className={`w-1.5 h-1.5 rounded-full ${radioDotColor(opt.scenario)}`} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-tx">{opt.label}</p>
                  <p className="font-mono text-[10px] text-muted truncate mt-0.5">{opt.description}</p>
                </div>

                {/* Status badge */}
                {opt.scenario === 'loading'
                  ? <span className="w-3.5 h-3.5 rounded-full border-2 border-border2 border-t-amber-500 animate-spin flex-shrink-0" />
                  : <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${statusBadgeClasses(opt.statusCode, opt.scenario)}`}>
                      {getStatusLabel(opt.statusCode, opt.scenario)}
                    </span>
                }
              </button>
            </div>
          ))}

          {/* Payload preview */}
          <div className="bg-surface2 border-t border-border px-3.5 py-3">
            <p className="font-mono text-[9px] text-muted tracking-widest uppercase mb-2">Response preview</p>
            <pre className="font-mono text-[10px] text-blue-600 leading-relaxed overflow-x-auto">
              {getPayloadPreview(selectedOption)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
