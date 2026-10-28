# ReadNest Constitution

ReadNest is a full-stack bookstore capstone prototype: a React 18 + Vite storefront (`frontend/`) backed by a Java 21 / Spring Boot 3.5 REST API (`backend/`) with Spring Data JPA on a file-based H2 database. This constitution governs every spec, plan, task and implementation produced for the project.

## Core Principles

### I. Prototype Honesty (NON-NEGOTIABLE)
ReadNest is a demo. No payment provider is integrated, no money moves, and no real card, UPI or bank credentials are collected. Order tracking is simulated, reviews and author profiles are sample content, and the book buddy is a local rule-based assistant, not an external AI service. Any feature touching these areas MUST keep the UI and docs clearly labeled as demo/sample. A spec MUST NOT imply real payment, real fulfilment or real AI unless it explicitly adds that capability together with the security requirements below.

### II. Layered, Package-by-Feature Backend
The backend lives under `com.readnest` and is organized by feature (`book`, `order`, `config`), not by technical layer. Within a feature:
- Controllers (`@RestController`, base path `/api/<resource>`) handle HTTP only: parse, validate, delegate, map responses.
- Business rules go in a service class once logic goes beyond a single repository call; controllers MUST NOT contain business logic.
- Persistence uses Spring Data repositories (`BookRepository`) and JPA entities (`Book`, embeddable `BookReview`).
- Request/response shapes that are not entities are separate DTO classes (e.g. `OrderRequest`, `OrderItem`). JPA entities MUST NOT be accepted as request bodies.
- Startup seeding belongs in `config` (`DataLoader`, a `CommandLineRunner`) and MUST be idempotent.

### III. API Contract Stability
The public API is `GET /api/books`, `GET /api/books/{id}`, `POST /api/orders`, documented in `README.md`. Changes to paths, JSON field names or response shapes are breaking and MUST update the README and the frontend in the same change. Resources are plural nouns under `/api`; JSON is the only payload format; use correct HTTP status codes (200/201, 400, 404, 500) rather than returning success for failures.

### IV. Frontend Conventions
- React 18 function components and hooks only; no class components.
- The API base URL comes from `import.meta.env.VITE_API_BASE_URL`, defaulting to `/api` (Vite proxies `/api` to `http://localhost:8080`). Never hardcode host names or ports in components.
- Browser-local state (`readnest-books`, `readnest-saved`, `readnest-bag`, `readnest-orders` in `localStorage`) MUST be read through defensive parsing (try/catch, array check) and MUST NOT contain sensitive data (no payment details, no credentials).
- The storefront MUST degrade gracefully: if the backend is unreachable, the cached catalog is shown.
- Render user- or API-supplied text through React's default escaping. `dangerouslySetInnerHTML` is prohibited. Any text interpolated into generated SVG (e.g. `makeBookCover`) MUST go through `escapeXml`.
- Currency is shown in INR via `Intl.NumberFormat("en-IN")`; dates via `Intl.DateTimeFormat` in UTC. Keep the UI responsive and keyboard/screen-reader accessible (alt text, labels, focus management for dialogs).
- New dependencies for the frontend need a clear justification; prefer the platform and React before adding a library. `App.jsx` may be split into components/modules as it grows; new code SHOULD live in focused components rather than extending the monolith.

### V. Test-First for New Behavior
New or changed behavior MUST be covered by automated tests, written before or alongside the implementation.
- Backend: JUnit 5 via `spring-boot-starter-test` under `backend/src/test/java`, mirroring the main package structure. Use `@WebMvcTest` for controllers, `@DataJpaTest` for repositories, and `@SpringBootTest` sparingly for integration paths. Tests MUST NOT depend on the on-disk `backend/data` database; use an in-memory H2 test profile.
- Frontend: when adding frontend tests, use Vitest + React Testing Library (to be added with the first feature that needs them). Mock `fetch`; never call a live backend in unit tests.
- Every endpoint needs tests for success, validation failure and not-found paths.
- A change is not done until `mvn test` (backend) and `npm run build` (frontend) both pass.

### VI. Simplicity
Build the smallest thing that satisfies the spec. No speculative abstractions, no new infrastructure (message queues, caches, extra databases) without a spec that demands it. Prefer plain Spring Boot and React features. Remove dead code rather than commenting it out.

## Coding Standards

### Java / Spring
- Java 21, Spring Boot parent 3.5.x; keep the parent and dependencies on the latest stable, actively maintained releases.
- Constructor injection only (as in `BookController`); no field `@Autowired`.
- Classes `PascalCase`, methods/fields `camelCase`, packages lowercase, constants `UPPER_SNAKE_CASE`. 4-space indentation, one top-level class per file.
- Entities keep a no-arg constructor for JPA, private fields, and explicit accessors; expose only the setters that are needed. Money is currently `double`; new monetary logic SHOULD use `BigDecimal` and any migration MUST be specified explicitly.
- Do not use `Optional.orElseThrow()` without a mapped exception: missing resources MUST produce a 404 through a `ResponseStatusException` or a `@RestControllerAdvice` handler.
- Avoid `EAGER` fetch on new collections; justify any use in the plan.

### JavaScript / React
- ES modules, `const`/`let` only, double quotes and semicolons as in the existing source, 2-space indentation.
- Components `PascalCase`, hooks/functions `camelCase`, CSS in `src/style.css` (or co-located CSS if split) using descriptive class names.
- Handle `fetch` failures explicitly (`response.ok` check and `catch`); never leave unhandled promise rejections.

### General
- Small, focused commits and PRs; each references the spec/feature it implements.
- Comments explain *why*, not *what*. Docs (`README.md`) are updated in the same change as behavior.
- Generated and local artifacts (`backend/target/`, `frontend/dist/`, `frontend/node_modules/`, `backend/data/*.db`) are never committed.

## Security Requirements

These are mandatory and take priority over feature convenience.

1. **Input validation (server-side, always).** All request bodies MUST be validated with Jakarta Bean Validation (`spring-boot-starter-validation` is already a dependency): `@Valid` on `@RequestBody`, and constraints such as `@NotBlank`, `@Size`, `@NotEmpty`, `@Positive`/`@Min(1)` and a sane `@Max` on quantities. Order items MUST reference existing book ids. Never trust client-side validation or client-supplied prices/totals. Use allowlists (e.g. permitted payment methods) over denylists.
2. **No injection.** Use Spring Data derived queries or parameterized queries only; never build SQL/JPQL by string concatenation; never use `eval`/dynamic code execution.
3. **Error handling.** Never return stack traces, exception messages, SQL or system details to clients. Return generic JSON errors (e.g. `{"error":"Invalid request"}`) with the right status and log the detail server-side with a structured logger. Add a global `@RestControllerAdvice` for this.
4. **Secrets and configuration.** No secrets, passwords, tokens or connection strings with credentials in source or committed config. Read them from environment variables or a vault. `.env`/`.env.*` stay git-ignored (only `.env.example` may be committed). Anything environment-specific (DB URL, CORS origins, port) MUST be overridable via environment/Spring profiles.
5. **Network binding and transport.** Bind services to loopback or a specific internal address (set `server.address=127.0.0.1`); never rely on defaults that bind `0.0.0.0`. Any non-local deployment MUST use TLS 1.2+ (1.3 preferred) with valid certificates; certificate validation is never disabled. Outbound calls MUST use HTTPS with explicit timeouts.
6. **CORS.** Allowed origins are an explicit allowlist (currently `http://localhost:5173` and `http://127.0.0.1:5173`). Never use `*`. Prefer one central CORS configuration over per-controller `@CrossOrigin` repetition; origins MUST be configurable per environment.
7. **H2 console.** `spring.h2.console.enabled=true` is permitted for local development only. It MUST be disabled (or profile-gated to `dev`) in any shared or deployed environment.
8. **Authentication and authorization.** The current API is anonymous and read/demo only. Any feature that introduces accounts, real orders, admin functions or user data MUST add authentication (OpenID Connect/OAuth 2.0 or SAML via Spring Security), role-based access control checked server-side on every request, secure/httpOnly/sameSite session cookies, session timeouts, and MFA for sensitive operations.
9. **Sensitive data.** Do not collect, log or persist card numbers, CVV, UPI PINs or bank credentials. Do not log PII (names, addresses) or request bodies at INFO or above. Any real personal data stored at rest MUST be encrypted (AES-256 or equivalent) using vetted libraries; never custom cryptography, never MD5/SHA-1 for passwords, and use `SecureRandom`/`UUID` generators appropriately (order references must not be guessable if they ever grant access to data).
10. **Dependencies.** Use only actively maintained packages with compatible licenses (Apache-2.0, MIT, BSD preferred), at the latest stable version, never EOL. Commit lock files (`package-lock.json`; Maven versions pinned through the Spring Boot BOM). Scan dependencies and run SAST in CI; fix Critical (CVSS â‰¥ 9) within 24 hours and High (â‰¥ 7) within 30 days. Never ignore security warnings.
11. **Containers (if containerized).** Base images come from `registry.redhat.io` (UBI minimal), run as a non-root user, with a read-only root filesystem and dropped capabilities.
12. **Logging.** Use structured logging with proper levels (DEBUG/INFO/WARN/ERROR); log security-relevant events (validation floods, unauthorized access); never log secrets or sensitive data.

## Testing and Quality Gates

- Backend: `cd backend; mvn test` and `mvn package` MUST pass.
- Frontend: `cd frontend; npm run build` MUST pass; add a lint/test script when the first tests are introduced and then include it in the gate.
- New endpoints and validation rules require tests (see Principle V); security rules above require at least one negative test each (e.g. invalid order payload returns 400 with a generic body).
- Manual smoke check before merge: backend starts on `localhost:8080`, `npm run dev` loads the catalog, add-to-bag and the three-step checkout produce an order reference, and the app still works with the backend stopped (cached catalog).
- No change may reduce an existing quality gate.

## Development Workflow (Spec-Driven)

1. Features follow Spec Kit: `/speckit-specify` â†’ (`/speckit-clarify`) â†’ `/speckit-plan` â†’ `/speckit-tasks` â†’ (`/speckit-analyze`) â†’ `/speckit-implement`.
2. Every plan includes a **Constitution Check** against this document; violations must be listed with justification in the plan's complexity/deviation section.
3. Specs describe *what* and *why* (user value, acceptance scenarios); technology choices belong in the plan and MUST fit the stack above.
4. Pre-existing deviations from this constitution (as of ratification: no automated tests, no request validation on `POST /api/orders`, `orElseThrow()` without a 404 mapping, per-controller `@CrossOrigin`, H2 console enabled, no explicit `server.address`, `double` for money, order requests not checked against the catalog) are known technical debt. They SHOULD be remediated through specs, and new code MUST NOT add to them.
5. Branches and PRs are reviewed against this constitution; reviewers verify compliance.

## Governance

This constitution supersedes other practices and ad-hoc preferences. Amendments require a documented rationale, an updated version number, and a note on any migration needed for existing code or specs. Versioning follows semantic rules: MAJOR for removing or redefining a principle, MINOR for adding a principle or materially expanding guidance, PATCH for clarifications. Security requirements may be tightened but never relaxed without explicit security review. Runtime guidance for contributors lives in `README.md`.

**Version**: 1.0.0 | **Ratified**: 2026-10-28 | **Last Amended**: 2026-10-28
