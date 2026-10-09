# Family Tree MVP - API Documentation

## Overview
This document describes all API endpoints available in the Family Tree MVP application.

## Authentication
All endpoints require authentication via Supabase Auth. The user must be logged in and have access to a tree.

## Base URL
```
/api
```

## Endpoints

### People Management

#### List People
- **GET** `/people`
- **Query Parameters:**
  - `search`: (optional) Search by name
  - `gender`: (optional) Filter by gender (Male, Female, Other, Prefer not to say)
  - `isAlive`: (optional) Filter by alive status (true/false)
  - `city`: (optional) Filter by city
  - `country`: (optional) Filter by country
- **Response:** Array of Person objects
- **Status Codes:** 200 OK, 401 Unauthorized, 404 No tree found, 500 Server error

#### Get Person
- **GET** `/people/[id]`
- **Response:** Person object
- **Status Codes:** 200 OK, 401 Unauthorized, 404 Person not found, 500 Server error

#### Create Person
- **POST** `/people`
- **Body:**
  ```json
  {
    "fullName": "string (required)",
    "gender": "string (optional)",
    "birthDate": "string (optional, ISO date)",
    "deathDate": "string (optional, ISO date)",
    "isAlive": "boolean (optional, default: true)",
    "city": "string (optional)",
    "country": "string (optional)",
    "notes": "string (optional)",
    "parents": [
      {
        "personId": "string",
        "relationshipType": "biological|adopted|step"
      }
    ],
    "checkDuplicates": "boolean (optional, default: true)"
  }
  ```
- **Response:** Created Person object
- **Status Codes:** 201 Created, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 409 Duplicate name, 500 Server error

#### Update Person
- **PATCH** `/people/[id]`
- **Body:** Same as Create Person (all fields optional)
- **Response:** Updated Person object
- **Status Codes:** 200 OK, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 404 Person not found, 500 Server error

#### Delete Person
- **DELETE** `/people/[id]`
- **Response:** `{ "message": "Person deleted successfully" }`
- **Status Codes:** 200 OK, 401 Unauthorized, 403 Insufficient permissions, 404 Person not found, 409 Person has relationships, 500 Server error

### Relationships

#### Get Parents
- **GET** `/people/[id]/parents`
- **Response:** Array of Parent Person objects
- **Status Codes:** 200 OK, 401 Unauthorized, 404 Person not found, 500 Server error

#### Get Children
- **GET** `/people/[id]/children`
- **Response:** Array of Child Person objects
- **Status Codes:** 200 OK, 401 Unauthorized, 404 Person not found, 500 Server error

#### Get Partners
- **GET** `/people/[id]/partners`
- **Response:** Array of Partner Person objects
- **Status Codes:** 200 OK, 401 Unauthorized, 404 Person not found, 500 Server error

#### Add Parent
- **POST** `/people/[id]/parents/add`
- **Body:**
  ```json
  {
    "parentId": "string (required)",
    "relationshipType": "biological|adopted|step (optional, default: biological)"
  }
  ```
- **Response:** Created Parent-Child relationship
- **Status Codes:** 201 Created, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 404 Person not found, 409 Relationship exists, 500 Server error

#### Remove Parent
- **POST** `/people/[id]/parents/remove`
- **Body:**
  ```json
  {
    "parentId": "string (required)"
  }
  ```
- **Response:** `{ "message": "Parent relationship removed" }`
- **Status Codes:** 200 OK, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 500 Server error

#### Add Partner
- **POST** `/people/[id]/partners/add`
- **Body:**
  ```json
  {
    "partnerId": "string (required)",
    "startDate": "string (optional, ISO date)",
    "endDate": "string (optional, ISO date)"
  }
  ```
- **Response:** Created Partnership
- **Status Codes:** 201 Created, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 404 Person not found, 409 Partnership exists, 500 Server error

#### Remove Partner
- **POST** `/people/[id]/partners/remove`
- **Body:**
  ```json
  {
    "partnerId": "string (required)"
  }
  ```
- **Response:** `{ "message": "Partnership removed" }`
- **Status Codes:** 200 OK, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 500 Server error

### Analysis & Export

#### Analyze Relationship
- **POST** `/relationship-analysis`
- **Body:**
  ```json
  {
    "person1Id": "string (required)",
    "person2Id": "string (required)"
  }
  ```
- **Response:**
  ```json
  {
    "relationship": "string",
    "person1": { "id": "string", "name": "string" },
    "person2": { "id": "string", "name": "string" }
  }
  ```
- **Status Codes:** 200 OK, 400 Validation error, 401 Unauthorized, 404 Person not found, 500 Server error

#### Export Tree Data
- **GET** `/export/tree`
- **Response:** JSON file download with all tree data
- **Status Codes:** 200 OK, 401 Unauthorized, 404 Tree not found, 500 Server error

### Tree Management

#### Get Tree Info
- **GET** `/tree-info`
- **Response:**
  ```json
  {
    "tree": { "id": "string", "name": "string", "created_at": "string", "updated_at": "string" },
    "treeMember": { "tree_id": "string", "user_id": "string", "role": "owner|editor|viewer" }
  }
  ```
- **Status Codes:** 200 OK, 401 Unauthorized, 404 Tree not found, 500 Server error

#### Update Tree Info
- **PATCH** `/tree-info`
- **Body:**
  ```json
  {
    "name": "string (required)"
  }
  ```
- **Response:** Updated tree info (owner only)
- **Status Codes:** 200 OK, 400 Validation error, 401 Unauthorized, 403 Insufficient permissions, 404 Tree not found, 500 Server error

## Error Response Format

All errors follow this format:
```json
{
  "error": "string describing the error"
}
```

## Rate Limiting
Currently no rate limiting is implemented. This should be added before production deployment.

## Data Constraints

- **People per tree:** No limit
- **Parents per person:** Maximum 2
- **Duplicate names:** Detection with override option
- **Relationships:** Circular relationships are allowed but not recommended

## Security

- All endpoints require authentication
- Multi-tenancy is enforced via RLS policies
- Role-based access control on write operations
- All inputs are validated before database operations
- SQL injection is prevented by using parameterized queries
