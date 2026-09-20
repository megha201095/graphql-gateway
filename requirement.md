# Requirements

## 1. Data Ingestion

Your service must:

### Parse XML from the following endpoints

- **Get all makes:**
  - https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML

- **Get vehicle types for a specific make (example):**
  - https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/440?format=xml

### Transformation Requirements

- Convert all XML to JSON.
- Combine the XML results into a single unified JSON structure.
- The final JSON must match the shape shown here:
  - https://gist.github.com/mbaigbimm/d340e7800d17737482e71c9ad1856f68

### Persist the Result

Save the fully transformed data to a persistent datastore of your choosing:

- PostgreSQL
- MongoDB
- DynamoDB
- SQLite
- etc.

---

## 2. API Layer

Your service must:

- Expose a single GraphQL endpoint.
- This endpoint should retrieve the transformed and stored data.
- Queries should be:
  - Typed
  - Performant
  - Documented

---

## 3. Testing

Your project must include:

### Unit Tests

- Cover all data transformation logic.
- Mock external XML API calls.

### Integration Tests

**Recommended but optional:**

- Cover the end-to-end flow:
  - Data ingestion
  - Persistence
  - GraphQL serving

---

## 4. Project Engineering Requirements

### TypeScript

TypeScript is required.

### Docker

Docker is required.

- Provide a `Dockerfile`.
- Provide instructions to run the service.
- The service should run locally with minimal setup.

### Project Structure & Best Practices

- Follow Node.js and TypeScript industry best practices.
- Use environment-based configuration.
- Maintain separation between:
  - Domain logic
  - Infrastructure
  - Presentation

---

# A. API & Developer Documentation

## Developer README

Your submission must include documentation covering:

- How to set up and run the service locally.
- Environment variable descriptions.
- Build instructions.
- Data model documentation.
- GraphQL schema documentation.
- Example GraphQL queries.

## API Documentation

Document:

- The internal ingestion pipeline.
- Error handling strategy.
- Logging strategy.
- Configuration approach.

### Optional Documentation

You may optionally include:

- OpenAPI-style documentation for internal service-to-service communication, if applicable.
- Mermaid diagrams.
- Sequence diagrams.

---

# B. Error Handling & Logging

Your service must include:

## Robust Error Handling

Handle failures gracefully for:

- Network issues.
- XML parsing errors.
- Transformation failures.
- Datastore insertion errors.

## Logging

Use structured logging. **JSON logs are preferred.**

The following events should be clearly logged:

- API request failures.
- Transformation errors.
- Unexpected exceptions.
- Startup events.
- Shutdown events.

You may use any logging library, such as:

- Pino
- Winston
- etc.

---

# C. Configuration

Your service must:

- Use environment variables for configuration.
- Provide reasonable defaults via a config module.
- Support multiple environments:
  - Development
  - Test
  - Production
- Validate configuration on startup.
- Use a validation library such as:
  - Zod
  - Joi
  - Similar alternatives

### Configuration Items

Configuration should include, but is not limited to:

- External API URIs.
- Database connection details.
- Logging level.
- Port number.
- Feature flags *(optional)*.

---

# Nice to Have

The following are optional enhancements:

- Build the service using **NestJS**.
- Provide a **GitHub CI pipeline** that:
  - Builds the Docker image.
  - Runs linting.
  - Runs tests.
  - Produces build artifacts or reports.