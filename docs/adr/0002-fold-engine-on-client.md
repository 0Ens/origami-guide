# 0002 – Fold geometry runs on the client

- **Status:** Accepted
- **Date:** 2026-11-23

## Context

Each step of a model is a fold: a crease line, a direction (valley / mountain) and the part of
the paper that moves. Turning those into 3D positions and animating them must happen at 60 fps
while the user drags the camera or scrubs through steps.

## Decision

- The backend stores and serves fold **definitions** (data), not geometry.
- A framework-free TypeScript module (`frontend/src/fold-engine`) computes the geometry:
  split faces along the crease, rotate the moving faces around the crease axis, update layer order.
- Phase 1 supports **simple folds** (valley, mountain, fold-and-unfold) on all or top layers.
  Models are chosen so that they only need these folds.

## Consequences

- Animations are smooth and work offline once a model is loaded.
- The fold engine is pure functions, so it is easy to unit test.
- Complex folds (squash, petal, reverse folds) are out of scope for now. A later ADR can add
  keyframe-based steps for models like the crane.
