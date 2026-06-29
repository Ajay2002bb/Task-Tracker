# Task Tracker Mini App

A full-stack Task Tracker application built with React, Java (Spring Boot), and MySQL. 

## Features
- **REST API**: Full CRUD operations for Tasks.
- **Relational Database**: Uses MySQL with `projects` and `tasks` tables (One-to-Many relationship).
- **Filtering & Sorting**: Server-side pagination, sorting (by due date, creation date), and filtering (by status, priority).
- **Validation**: Server-side validation with `422 Unprocessable Entity` for bad input.
- **Frontend**: A sleek, dark-themed responsive UI built with React.
- **Testing**: Includes a basic integration test for the API using H2 in-memory DB.

## Prerequisites
- Java 17+
- Node.js 18+
- MySQL Server (Running locally)
- Maven (or use the provided wrapper)

## Setup & Running Locally

### 1. Database Setup
1. Open your MySQL client (e.g. MySQL Workbench or CLI).
2. Create the database:
```sql
CREATE DATABASE task_tracker;
```
3. Update your database credentials in `backend/src/main/resources/application.properties` if they differ from the default (`root` / `root`).
4. The schema (tables and initial data) will be automatically created on application startup thanks to `spring.sql.init.mode=always` and `schema.sql`.

### 2. Running the Backend
Navigate into the `backend` directory:
```bash
cd backend
mvn spring-boot:run 
or 
.\mvnw spring-boot:run
```
The API will run on `http://localhost:8080`.

### 3. Running the Frontend
Navigate into the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks (Supports query params: `status`, `priority`, `page`, `size`, `sort`)
- `GET /api/tasks/{id}` - Get a single task
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### Projects
- `GET /api/projects` - List all projects (for dropdown selection)

## Design Notes
- **Architecture**: A standard layered architecture (Controller -> Repository -> Database) was chosen for the backend to keep it simple and avoid over-engineering.
- **Styling**: Vanilla CSS with CSS Variables was used to implement a modern glassmorphism aesthetic without heavy CSS frameworks, ensuring quick load times and high customizability.
- **Trade-offs**: 
  - Didn't implement soft deletes (which is usually better for production) to keep the scope small.
  - Omitted DTOs (Data Transfer Objects) and mapped entities directly in controllers to keep the codebase simple for this assignment.

## AI Assistant Usage
This project was developed with the help of ChatGPT and Gemini for reference purposes.
- **What it was used for**: Used as a quick reference for Spring Boot JPA annotations, verifying foreign key constraints, checking best practices for React project structure, and troubleshooting CSS variable syntax for the dark theme.
