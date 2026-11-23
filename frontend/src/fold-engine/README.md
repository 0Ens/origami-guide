# Fold engine

Framework-free TypeScript that turns a model's fold steps into geometry.
See [ADR-0002](../../../docs/adr/0002-fold-engine-on-client.md) for why it runs in the browser.

## Model

- The sheet is the **unit square** `[0,1]×[0,1]`, origin bottom-left, y up, front side towards the viewer (+z).
- Between steps the paper is **flat**. The state is a list of convex **faces**, each with
  - `uv`: its outline on the original sheet (never changes),
  - `xy`: its outline in the folded model,
  - `layer`: stacking order, higher is closer to the viewer.
- A face whose `xy` winds clockwise has been turned over, so its back side shows.

```
foldSequence(specs) ──► states[0..n]  (flat, one per step)
                    └─► plans[0..n-1] (how to animate each step)

poseFlat(states[i])      → 3D faces at rest
poseStep(plans[i], t)    → 3D faces part way through step i+1, t ∈ [0, 1]
```

## Writing steps

Steps are JSON, stored per step in the backend (`fold_steps.fold`). Coordinates are in
**current model coordinates**: draw the line on the model as it lies after the previous step.

| kind | fields | meaning |
| --- | --- | --- |
| `fold` | `line`, `direction`, `moving`, `layers?` | fold along the line and leave it folded |
| `crease` | same as `fold` | fold and unfold again, leaving a crease |
| `flip` | | turn the model over, left edge to right (x ↦ 2·cx − x) |
| `rotate` | `angle` | rotate counter-clockwise by `angle` degrees around the centre |

- `line`: two distinct points on the fold line, e.g. `[[0.5, 0], [0.5, 1]]`.
- `direction`: `valley` brings the moving part towards you, `mountain` folds it behind.
- `moving`: any point on the side that moves. It must not be on the line.
- `layers`: `all` (default) folds every layer on that side; `top` folds only the topmost layer
  under `moving`, plus whatever paper is attached to it on that side.

```json
{ "kind": "fold", "line": [[0, 0], [1, 1]], "direction": "valley", "moving": [1, 0] }
```

folds the bottom-right triangle up over the top-left one.

## Limits

Only simple folds: valley, mountain, fold-and-unfold, on all or top layers. Squash, petal and
reverse folds need more than one hinge per step and are not supported yet. `top` + `mountain`
puts the flap under the whole stack rather than tucking it between layers.
