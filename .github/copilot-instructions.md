# GitHub Copilot instructions for this repository

## Quick orientation ✅
- This repository contains a small web platform split into two main pieces:
  - **Frontend**: Node/Express static server in `project-frontend/` (serves `public/` files). Start with `cd project-frontend && npm install && npm start` (server listens on port 3000 by default).
  - **Backend**: Spring Boot application in `project-backend/` (REST API, MongoDB persistence, JWT authentication). Build/run with Maven: `mvn spring-boot:run` or `mvn package && java -jar target/*.jar` (uses Java 17).
- Local dev assumptions: MongoDB on `mongodb://localhost:27017/coffeeshop` (see `project-backend/src/main/resources/application.properties`).

## Key concepts & files (what to read first) 🔎
- Authentication flow: `project-backend/src/main/java/com/example/coffeeshop/controller/AuthController.java` — endpoints: `POST /api/auth/register`, `POST /api/auth/login` (returns JSON: `{ token: "..." }` — see `AuthResponse`).
- JWT handling: `JwtAuthenticationFilter.java` and `SecurityConfig.java` — tokens provided in `Authorization: Bearer <token>` header. Backend places authenticated `User` as the request principal.
- Core models: `model/` (e.g., `Cafe.java`, `User.java`, `Review.java`, `Tag.java`) and DTOs in `dto/` (e.g., `CafeRequest.java`, `ReviewRequest.java`). Validation uses `jakarta.validation` annotations (e.g., `@NotBlank`, `@NotNull`).
- Controllers expose the API surface (look in `controller/`): `CafeController`, `ReviewController`, `TagController` show canonical patterns for request handling and error mapping.
- Repositories: `repository/` interfaces use Spring Data MongoDB patterns (no custom implementations yet).
- Frontend: `project-frontend/public/*` contains client pages (`login.html`, `register.html`, `cafes.html`, `cafe.html`) that call `http://localhost:8080/api/...`. Token is stored in `localStorage` under key `token` (see `login.html` and `cafes.html`).

## How to run locally (developer workflow) ▶️
1. Ensure Java 17 and MongoDB are available locally.
2. Start MongoDB (default port 27017).
3. Backend: `cd project-backend && mvn spring-boot:run`. Override properties if needed:
   - Command line: `java -jar target/*.jar --jwt.secret=YourSecret --spring.data.mongodb.uri=mongodb://host:port/db`
   - Or set env vars (`JWT_SECRET`, `SPRING_DATA_MONGODB_URI`) before running.
4. Frontend: `cd project-frontend && npm install && npm start` (or `node server.js`).
5. Open `http://localhost:3000` (frontend) — pages call backend at `http://localhost:8080` by default.

## Endpoints and behaviors to reference quickly 📌
- GET /api/cafes — list cafes (`CafeController.list()`)
- GET /api/cafes/{id} — get cafe
- POST /api/cafes — create cafe (expects `CafeRequest` body)
- PUT /api/cafes/{id} — update cafe
- DELETE /api/cafes/{id}
- POST /api/auth/register, POST /api/auth/login — registration/login
- GET /api/tags, POST /api/cafes/{cafeId}/tags — tag operations
- GET/POST /api/cafes/{cafeId}/reviews — review operations (POST requires authenticated user)

## Project-specific conventions & patterns ⚙️
- No Lombok: models and DTOs use explicit getters/setters.
- Validation: use `@Valid` and annotations in DTOs; controllers rely on exceptions like `IllegalArgumentException` for simple error cases.
- Security: endpoints under `/api/auth/**` are open; everything else is authenticated and uses JWT tokens placed as `User` in SecurityContext.
- Frontend uses a simple static single-page flow and stores the JWT in `localStorage` (search `localStorage.getItem('token')`). Be mindful of XSS concerns when changing this behavior.

## Debugging tips & common gotchas 🐞
- If requests return 401/403: confirm the `Authorization: Bearer <token>` header is present and token not expired. The token is returned from `/api/auth/login`.
- If backend cannot connect to DB: check MongoDB is running on `localhost:27017` or update `spring.data.mongodb.uri`.
- CORS: backend `SecurityConfig` and frontend `server.js` are permissive for development; if deploying restrict origins accordingly.
- Tests: no automated tests present; `mvn test` will run test suite if/when added.

## How to add a new REST resource (example pattern) ✍️
- Add DTO under `dto/` with validation annotations (e.g., `NewThingRequest`).
- Add domain model under `model/` and repository under `repository/` (extend Spring Data interface).
- Implement business logic in `service/` (unitable functions) and expose via a new controller in `controller/` using `@RestController` and `@RequestMapping`.
- Use `@Valid` on request parameters in controllers; handle `IllegalArgumentException`/missing resources as in existing controllers.

## Notes for AI agents / what to prioritize when changing code 🤖
- Preserve existing request/response shapes: frontend pages expect specific JSON fields (e.g., `id`, `name`, `description` for cafes); changing schema requires updating frontend pages in `project-frontend/public`.
- Keep auth contract stable: `POST /api/auth/login` returns `{ token }` and `JwtAuthenticationFilter` expects `sub` (subject) to be user id and `role` claim.
- Be conservative about changing CORS/security defaults; note comments explain these are permissive for dev.

---
If something is unclear or you'd like me to add quick-start shell scripts or examples (docker-compose for MongoDB, `Makefile` targets, or automated tests), tell me which part to expand and I’ll update this file. 🙌
