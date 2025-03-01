# Template

A robust backend API built with TypeScript and Nest.js for managing [your domain, e.g., user data, inventory, etc.].

## Overview

This project is a TypeScript-based backend application designed with scalability, type safety, and maintainability in mind. It leverages modern development practices to ensure smooth collaboration and deployment.

## Key Features

- **Base Controller/Service**: A reusable base layer for all model-specific controllers and services, promoting DRY (Don’t Repeat Yourself) principles.
- **DTOs for Filtering**: Data Transfer Objects (DTOs) to handle input validation and filtering, ensuring clean and secure data handling.
- **Logging Middleware**: Custom middleware to log requests, including response times, for performance monitoring and debugging.
- **AllExceptionFilters**: Global exception filters to gracefully handle errors thrown by controllers, providing consistent error responses.
- **Type Safety**: Configured with `noImplicitAny` and `strictNullChecks` in TypeScript for stronger type security and fewer runtime errors.
- **Transactional Support**: Controllers needing multi-document updates (e.g., UserController) can create and manage Mongoose sessions for atomic operations, while BaseController remains session-agnostic.
- **Session-Ready Repository**: BaseRepository functions (create, findOne, update) include an optional session parameter (ClientSession | null) to support transactions when provided by controllers or services.
- **Redis Caching**: Integrated Redis for caching to enhance performance by reducing database load, with robust support in BaseService for caching entity lookups and updates, including advanced concurrency handling.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
2. Install dependencies: 
   ```bash
   npm install
3. Configure environment variables
   Copy .envexample file to .env and update the values as needed

4. Run the project
   npm start

## Project Structure
- `src/`
  - `controllers/` - Base and model-specific controllers
  - `services/` - Base and model-specific services
  - `dtos/` - Data Transfer Objects for filtering and validation
  - `middleware/` - Logging middleware and other utilities
  - `filters/` - AllExceptionFilters for error handling
  - (additional files/folders as needed)

## Development Notes
- TypeScript Config: The tsconfig.json enforces noImplicitAny and strictNullChecks for better type safety. Update types as needed when extending controllers or services.
- Logging: Response times are logged via middleware. Check logs in <log-location> for details.
- Error Handling: Use AllExceptionFilters to catch and format controller exceptions consistently.
- Transactional Operations:
   - BaseController: Provides a RESTful interface for standard CRUD operations without session management, keeping it reusable and lightweight.
   - Custom Controllers: For multi-document updates (e.g., creating a user and profile together), controllers like UserController can create a Mongoose ClientSession and pass it to service/repository methods. 
   - BaseRepository: All methods (create, findOne, update) accept an optional session: ClientSession | null parameter, defaulting to null for non-transactional use. This enables seamless integration with transactions when a session is provided by the controller.
- Redis Caching:
   - Integration: Implemented via CacheModule with cache-manager-redis-store for Redis support.
   - BaseService Caching: Includes caching logic for entity retrieval (findOne) and updates (update), using Redis to store frequently accessed data. Configure Redis settings in .env (REDIS_HOST, REDIS_PORT, REDIS_TTL). Adjust TTL or caching strategies in service methods as needed.
   - Robust Concurrency Handling: After identifying potential bugs like race conditions (cache stampedes), the caching mechanism in BaseService has been enhanced:
      - Locking Mechanism: For findOne, a distributed lock (using Redis SETNX) prevents multiple simultaneous requests from querying the database and setting the cache with inconsistent data. Only one request fetches from the DB and caches the result, while others wait and retry, ensuring Redis never caches outdated data.
      - Error Resilience: Cache operations (get, set, del) are wrapped in try/catch blocks to gracefully handle Redis failures, falling back to database queries if Redis is unavailable. Errors are logged for debugging without breaking the application flow.
      - Type Safety: Fixed TypeScript type errors for cachedResult, error.message, and acquiredLock to ensure compile-time safety, using explicit types and type guards (e.g., error instanceof Error).
      - Cache Invalidation: On update, the cache key is reliably nullified with error handling, ensuring stale data is cleared even if Redis operations fail temporarily.
   - Behavior:
      - FindOne: Checks Redis first. If cached, returns it. If not, uses a lock to fetch from the DB, caches the result (TTL configurable), and releases the lock. Concurrent requests wait briefly and retry, avoiding duplicate DB hits.
      - Update: Updates the entity in the DB and invalidates the cache key, ensuring the next findOne fetches fresh data.
      - Create: Caches the newly created entity, with the same entity-specific key format (e.g., user:123).
