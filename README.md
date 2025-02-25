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
- **Redis Caching**: Integrated Redis for caching to enhance performance by reducing database load, with support in BaseService for caching entity lookups and updates.

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
   - Integrated via CacheModule with cache-manager-redis-store for Redis support.
   - BaseService includes caching logic for entity retrieval (findOne) and updates (update), using Redis to store frequently accessed data.
   - Configure Redis settings in .env (REDIS_HOST, REDIS_PORT, REDIS_TTL). Adjust TTL or caching strategies in service methods as needed.
