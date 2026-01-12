# API Specification

## Base URL
`http://localhost:3001/api`

## Authentication

| Method | Endpoint | Description | Auth Required | Body Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user | No | `nickname`, `email`, `password` |
| `POST` | `/auth/login` | Login user | No | `email`, `password` |
| `GET` | `/auth/me` | Get current user info | Yes | - |

## Chapters & Tasks

| Method | Endpoint | Description | Auth Required | Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/chapters` | Get all chapters | No | - |
| `GET` | `/tasks` | Get all tasks | No | `chapterId` (query) |
| `GET` | `/tasks/:id` | Get specific task | No | - |

## Submissions (CRUD)

| Method | Endpoint | Description | Auth Required | Body / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/submissions` | **READ**: Get all submissions | No | - |
| `POST` | `/submissions` | **CREATE**: Upload Photo | Yes | `FormData`: `photos`, `taskId`, `ratings`, `reflection` |
| `PUT` | `/submissions/:id` | **UPDATE**: Edit Reflection | Yes | `reflection` (JSON) |
| `DELETE` | `/submissions/:id` | **DELETE**: Remove Spec | Yes | - |
| `POST` | `/submissions/:id/like` | **UPDATE**: Like | Yes | - |

## User Profile

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/user/profile` | Get stats (XP, Level) | Yes |
