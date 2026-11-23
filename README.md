# Origami Guide

> Fold paper, quiet the mind.

Origami Guide teaches origami with an **interactive 3D sheet of paper** instead of walls of text.
You can rotate the paper to see it from any angle, step forward and backward through each fold
with the keyboard, and get the ideal paper size for every model.

## Why?

Most origami instructions are static diagrams or long paragraphs. Folding is a calm, focused
activity — almost a meditation — and the instructions should not get in the way of that.
Seeing the fold happen in 3D makes it obvious *where* and *in which direction* to fold.

## Features (Phase 1)

- 3D paper model you can orbit, zoom and pan
- Step-by-step fold animations (`←` / `→`, `Space` to play, `R` to reset the camera)
- Recommended paper size and type per model
- Turkish and English interface

## Tech stack

| Layer    | Technology                                                    |
|----------|---------------------------------------------------------------|
| Backend  | Java 21, Spring Boot 3, Spring Data JPA, Flyway, PostgreSQL   |
| Frontend | React, TypeScript, Vite, Three.js (@react-three/fiber)        |
| Tooling  | Docker Compose, Testcontainers, Vitest, GitHub Actions        |

## Project layout

```
backend/    Spring Boot REST API (origami models, steps, paper recommendations)
frontend/   React app with the 3D paper viewer and the fold engine
docs/adr/   Architecture Decision Records
```

## Roadmap

- [ ] **Phase 1 – Guide**: 3D viewer, fold engine, models API, first beginner models
- [ ] **Phase 2 – Accounts**: sign up / login (Spring Security + JWT), saved progress
- [ ] **Phase 3 – Gamification**: XP, levels and a daily streak counter
- [ ] **Phase 4 – Photo check**: upload a photo of the finished model and earn XP if it is correct
- [ ] **Phase 5 – Advanced folds**: squash / petal folds for models like the crane, mobile app

## License

[MIT](LICENSE)
