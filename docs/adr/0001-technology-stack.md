# 0001 – Technology stack

- **Status:** Accepted
- **Date:** 2026-11-23

## Context

Origami Guide needs an interactive 3D viewer in the browser and an API that serves origami
models today and user accounts, XP, streaks and photo checks later. The main developer wants
to grow as a **backend engineer**, so the backend stack should match what the industry uses.

## Decision

- **Backend:** Java 21 + Spring Boot 4 (Spring MVC, Spring Data JPA, Bean Validation, Actuator).
- **Database:** PostgreSQL, schema managed by **Flyway** migrations. Hibernate only *validates*
  the schema (`ddl-auto: validate`), it never changes it.
- **Local infrastructure:** Docker Compose, started automatically by Spring Boot.
- **Tests:** JUnit 5, MockMvc, and **Testcontainers** so integration tests hit a real PostgreSQL.
- **Frontend:** React + TypeScript + Vite, Three.js through `@react-three/fiber`.
- **Repository:** a single monorepo (`backend/`, `frontend/`) so one pull request can change both.

## Consequences

- Testing against real PostgreSQL removes "works on H2, fails in production" bugs, but Docker
  must be running to execute the full test suite.
- Flyway gives us a versioned, reviewable history of the database schema.
- JSONB (PostgreSQL) can store fold definitions without a rigid table for every fold type.
