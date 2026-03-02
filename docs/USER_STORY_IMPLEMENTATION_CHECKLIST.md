# User Story Implementation Checklist

This checklist tracks gaps identified against the target UI user story and implementation status.

## Priority Legend

- **P0**: Core flow blockers
- **P1**: High-value UX and data completeness
- **P2**: Advanced workflow features

## P0 - Core Flow Blockers

- [x] Wire `ui:mode-switch-requested` to app mode transition
- [x] Wire `ui:simulation-start-requested` to simulation start logic
- [x] Fix timeline scrubber drag to drive engine frame jumps
- [x] Ensure stop returns pointer to frame `0` for manual stepping restart

## P1 - High-Value UX/Data Completeness

- [x] Add richer component details model (`description`, `capabilities`, `usage`)
- [x] Expose component details in renderer detail events
- [x] Support component-level unstructured metadata editing in config panel
- [x] Auto-create two default one-to-one databuses for each newly dropped component

## P2 - Advanced Story Features (Planned)

- [ ] Snap attach compatibility validator with explicit rejection reason cue
- [ ] Per-component info icon treatment parity across all renderers
- [ ] Delay priority policy (`user override > component default > global default`) with UI controls
- [ ] Loop section authoring UI and simulation loop execution with restart delay
- [ ] Analyze mode UI page: log upload, replay run, bottleneck/failure report view

## Notes

- Current implementation already supports JSON import/export and stochastic configuration primitives.
- Remaining P2 items are intentionally separated because they require additional UX and simulation orchestration work.