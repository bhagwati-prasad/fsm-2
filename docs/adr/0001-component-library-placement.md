# ADR-0001: UIBridge boundary and component library ownership

- **Status**: accepted
- **Date**: 2026-03-01
- **Deciders**: FSM maintainers
- **Technical Story**: Repository structure and module boundary clarity

## Context

`ComponentLibrary` currently lives in `src/ui-bridge/build-mode/component-library.js` and is consumed by build-mode UI orchestration. It currently includes component definitions and instantiation behavior that are close to core domain logic.

UIBridge in this system is an adapter layer that exposes core functionality to UI technologies (for example D3, Canvas, Three.js). The `EventBus` from `src/core` is one of the primary mechanisms that enables this boundary.

Given this architecture, UIBridge must contain only code required to expose core behavior to UI/rendering systems (controllers, renderer adapters, interaction handlers, and event wiring). Domain component catalog/factory concerns belong to core.

## Decision

Enforced architectural rule:

**Code which does anything other than exposing system features to different UI renders should not exist in UIBridge.**

Normative policy:
- `src/ui-bridge/**` **MUST** contain only UI-adapter code that exposes core capabilities to renderers and UI controls.
- `src/ui-bridge/**` **MUST NOT** contain domain logic, business rules, catalog ownership, factory ownership, simulation ownership, or storage ownership.
- Any module that can run meaningfully without a renderer is **NOT** UIBridge code and belongs outside `src/ui-bridge/**`.

Component library ownership decision:
- `ComponentLibrary` (definitions, catalog, and instantiation/factory behavior) belongs to `src/core/**` and must not exist in `src/ui-bridge/**`.

Boundary decision:
- `src/core` owns component definitions, catalog, and instantiation/factory behavior.
- `src/ui-bridge/**` owns only UI-adapter concerns: presenting catalog data, handling UI interactions, and translating UI actions into core operations.
- UIBridge is strictly an exposure layer and must not become a container for domain logic.

Implementation direction:
- Move `ComponentLibrary` from `src/ui-bridge/build-mode` to a core module (for example `src/core/component-library.js` or `src/core/component-catalog.js`).
- Keep build-mode palette/controller code in UIBridge, but consume the core library via stable interfaces.
- Preserve event-driven integration via `EventBus` as the primary boundary between core and UI adapter logic.

Compliance note:
- Any future PR adding non-exposure logic to `src/ui-bridge/**` is architecturally non-compliant with this ADR.

## Consequences

### Positive

- Strong separation of concerns between domain core and UI adapters.
- Better reuse of component catalog/factory in headless, API, CLI, or test contexts.
- Cleaner renderer portability because UI technologies depend on adapters, not domain ownership.
- Reduced architectural drift by enforcing a strict UIBridge boundary.

### Negative

- Requires refactor effort to relocate module(s) and update imports.
- May require transition shims for compatibility during migration.
- Existing docs/tests that assume old path need updates.

## Alternatives Considered

1. **Keep `ComponentLibrary` in UIBridge/build-mode**: Rejected because it violates the intended UIBridge adapter-only boundary.
2. **Split responsibilities between UIBridge and core long-term**: Rejected because shared ownership blurs boundaries and increases coupling.
3. **Move catalog/factory fully to core**: Accepted because it matches the architecture and improves reuse.

## Notes

Target `src/ui-bridge/` structure (adapter-only):

```
src/ui-bridge/
├── adapters/               # Renderer adapter wiring (D3/Canvas/Three)
│   ├── renderers/
│   └── event-mappers/
├── controllers/            # Mode orchestration and UI flow control
│   ├── build-mode/
│   ├── simulation-mode/
│   └── composite/
├── interactions/           # Drag/drop, selection, snap, pointer interactions
├── animations/             # UI animation behavior only
└── ui-bridge.js            # Core-to-UI boundary interface
```

Migration sequence:
1. ✅ Introduce core `ComponentLibrary` module with API parity.
2. ✅ Update exports to resolve `ComponentLibrary` from core.
3. ✅ Remove UIBridge-owned `ComponentLibrary` implementation.
4. ✅ Introduce canonical adapter/controller paths and update public exports to those paths.
5. ✅ Move remaining non-adapter ownership modules (for example `CompositeLibrary`) out of UIBridge.
