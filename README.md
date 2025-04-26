# XBorg Tech Challenge

## Submission Requirements

- Unit Tests
- Integration Tests
- E2E Testing
- Testing Performance benchmarks
- Clearly document strategies via effective testing and in the Submission Documentation section of the ReadMe

Implementation should be submitted via a public GitHub repository, or a private repository with collaborator access granted to the provided emails.

## Architecture

- Language - Typescript
- Monorepo - Turborepo
- Client - NextJs
- Api - NestJs
- DB - SQLite

## Apps and Packages

- `client`: [Next.js](https://nextjs.org/) app
- `api`: [Nestjs](https://nestjs.com) app
- `tsconfig`: Typescript configuration used throughout the monorepo

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/) for Git hooks

## Steps to run app

```bash
# Start the infrastructure
$ yarn start:local:infra

# Migrate the DB
$ cd apps/api && yarn migrate:local

# Install dependencies
$ yarn install

# Create and migrate the DB
 $ cd apps/api
 $ yarn migrate:local

 # Build the app including the lib
$ yarn build

 # Run the application stack in dev (enter command from the project root)
 $ yarn dev
```

## Additional Commands

```bash
# Run tests in all apps
$ yarn test

# Run linter in all apps
$ yarn lint

# Format code in all apps
$ yarn format

```

## Submission Documentation...

Testing Strategies

Unit Tests
Purpose: Validate the logic of individual components (controllers, services) in isolation.
Approach:
Used Jest and NestJS testing utilities.
Mocked dependencies (e.g., services, repositories) to ensure tests are focused and deterministic.
Example: UserController.signup is tested to ensure it calls siweService.verifyMessage and userAPI.signUp with correct arguments.
Integration Tests
Purpose: Ensure that modules and their dependencies interact correctly.
Approach:
Used supertest to send HTTP requests to the API endpoints.
Verified that DTO validation works (e.g., invalid email returns 400).
Checked that the API returns expected responses and error codes.
End-to-End (E2E) Tests
Purpose: Validate the entire application stack, simulating real user flows.
Approach:
Spun up the full app (gateway + API).
Used unique test data (e.g., email: test\_${Date.now()}@example.com) to avoid DB constraint errors.
Tested flows like signup and get user, ensuring tokens and authentication work as expected.

Missing Tests:

Integration Tests You Could Add
Duplicate Signup:
Test that signing up with an already registered email or username returns a 409 Conflict or appropriate error.
Missing Required Fields:
Test that omitting required fields (e.g., userName, message, signature) returns a 400 Bad Request.
Invalid Signature:
Test that providing an invalid or tampered signature results in an Unauthorized (401) error.
User Login:
Test that a valid login returns a token, and invalid credentials return 401.
Profile Update:
Test updating user profile fields (if supported) and validate the changes.
E2E Tests You Could Add
Full Auth Flow:
Simulate signup, login, and then access a protected route with the returned token.
Token Expiry:
Test that an expired or invalid JWT is rejected when accessing protected endpoints.
Concurrent Signups:
Simulate multiple users signing up at the same time to check for race conditions or DB issues.
User Logout (if implemented):
Test that logout invalidates the token/session.
Error Handling:
Test that server errors (e.g., DB down) return a 500 and are handled gracefully.

Load Testing:
Load and performance benchmarks were not implemented. Recommended endpoints for benchmarking include /v1/user/signup and /v1/user/login using tools like k6 or Artillery to measure requests per second and response times under concurrent load.

UI End-to-End Testing:
Automated browser-based tests (Playwright with Synpress plugin for wallet interaction automation) were not included. Suggested flows: user signup, login, and profile access through the client UI.
