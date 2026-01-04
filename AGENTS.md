# Project Context for AI Agents

This file contains context about the **Argenpills Mobile Serverless** project to assist AI agents in understanding the architecture, environment, and development workflows.

## Project Overview
This project implements the serverless backend for the Argenpills mobile application. It relies on AWS Lambda, DynamoDB, API Gateway, and Cognito, with infrastructure managed as code using Pulumi.

## Tech Stack
- **Runtime**: Node.js (v20.x / v22.x) and Bun.
- **Infrastructure as Code**: Pulumi (TypeScript).
- **AWS SDK**: Version 3 (`@aws-sdk/client-*` and `@aws-sdk/lib-dynamodb`).
- **Testing**: Jest (running with Bun).
- **Package Manager**: Bun (used for installation and running scripts).

## Project Structure
The repository is structured as a monorepo with distinct functional areas:

- **`/argenpills-crud`**: Contains the source code for the CRUD Lambda functions (e.g., facts, items).
    - These functions are deployed to AWS Lambda.
    - **Note**: This directory does not have its own devDependencies for testing.
- **`/argenpills-auth`**: Contains Lambda functions related to Authentication (Cognito triggers).
- **`/infrastructure`**: Pulumi TypeScript project defining the AWS resources (API Gateway, DynamoDB tables, S3 Buckets, etc.).
- **`/tests`**: Centralized test suite for the project.
    - Contains integration/unit tests using Jest.
    - **Important**: Tests mock AWS services using `jest.mock` with `{ virtual: true }` because the source files in `argenpills-crud` rely on modules that are not resolvable in the `tests` directory's context without these mocks (or a strict workspace setup).

## Development Workflows

### 1. Running Tests
Tests are located in the `tests/` directory.

```bash
cd tests
bun install
bun run test
```

**Testing Strategy**:
- Unit tests verify Lambda handlers in isolation.
- AWS SDK clients (`DynamoDBClient`, `DynamoDBDocumentClient`) are mocked to prevent actual network calls and to handle module resolution issues between the test runner and source files.
- When creating new tests for handlers, ensure you apply the virtual mocks for `@aws-sdk` packages if the handler imports them directly.

### 2. Infrastructure Deployment
The infrastructure is managed via Pulumi in the `infrastructure/` directory.

- **Dev Stack**: `dev`
- **Prod Stack**: `prod`

**Common Commands**:
```bash
cd infrastructure
pulumi stack select dev
pulumi preview
pulumi up
```

### 3. CI/CD
State is managed via GitHub Actions (`.github/workflows/run-tests.yml`).
- The pipeline sets up Bun and Node.js.
- It installs dependencies in `argenpills-auth` and `argenpills-crud`.
- It executes `bun jest` in the `tests` directory.

## Key Configuration
- **DynamoDB**: Table names are typically passed via environment variables (e.g., `TABLE_NAME`, `AP_TABLE`).
- **S3**: Bucket names passed via env vars (e.g., `BUCKET_CACHE`).
- **Authentication**: Uses AWS Cognito.

## Known Patterns & Gotchas
- **Module Resolution in Tests**: Since `argenpills-crud` allows implicit dependency on the AWS Runtime environment (where `aws-sdk` is available), local tests must explicitly mock these if they are not installed in the root or `tests` `node_modules`.
- **Handler Signature**: standard AWS Lambda handlers (`async (event, context) => ...`). Some handlers export a `Testeablehandler` for easier unit testing where dependencies (like the db client) can be injected or assumed mocked globally.
