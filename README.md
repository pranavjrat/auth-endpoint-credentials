# School Journal API

- User authentication with JWT tokens
- Role-based access control (teachers and students)
- Create, read, update, and delete journal entries
- Share journals with specific students
- Support for different media attachment types

### Prerequisites

- Docker and Docker Compose
- Node.js and npm

### Installation

#### Using Docker Compose

1. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```
2. The API will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
```

Request body:
```json
{
  "username": "username",
  "password": "password123",
  "role": "teacher" // or "student"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "username",
    "role": "teacher"
  }
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "username": "username",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful!! Token generated",
  "user": {
    "id": 1,
    "username": "username",
    "role": "teacher"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Journal Endpoints

All journal endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Create Journal (Teachers only)

```
POST /api/journals
```

Request body:
```json
{
  "description": "Journal content description",
  "publishedAt": "2025-05-16T14:00:00Z",
  "attachmentType": "image", 
  "attachmentUrl": "https://example.com/image.jpg",
  "studentUsernames": ["student1", "student2"]
}
```

Response:
```json
{
  "message": "Journal created successfully",
  "journal": {
    "id": 1,
    "teacher_id": 1,
    "description": "Journal content description",
    "published_at": "2025-05-16T14:00:00.000Z",
    "attachment_type": "image",
    "attachment_url": "https://example.com/image.jpg",
    "created_at": "2025-05-16T19:05:57.813Z",
    "updated_at": "2025-05-16T19:05:57.813Z",
    "student_usernames": ["student1", "student2"],
    "students": [
      {"id": 2, "username": "student1"},
      {"id": 3, "username": "student2"}
    ]
  }
}
```

#### Get All Journals

```
GET /api/journals
```

Response for teachers:
- All journals created by the teacher

Response for students:
- All journals shared with the student

#### Get Journal by ID

```
GET /api/journals/:id
```

Response:
```json
{
  "journal": {
    "id": 1,
    "teacher_id": 1,
    "description": "Journal content description",
    "published_at": "2025-05-16T19:07:00.000Z",
    "attachment_type": "image",
    "attachment_url": "https://example.com/image.jpg",
    "created_at": "2025-05-16T19:05:57.813Z",
    "updated_at": "2025-05-16T19:05:57.813Z",
    "student_usernames": ["student1"],
    "students": [{"id": 2, "username": "student1"}]
  }
}
```

#### Update Journal (Teachers only)

```
PUT /api/journals/:id
```

Request body:
```json
{
  "description": "Updated journal content",
  "publishedAt": "2025-05-16T10:00:00Z",
  "attachmentType": "image",
  "attachmentUrl": "https://example.com/updated-image.jpg",
  "studentUsernames": ["student1", "student2"]
}
```

Response:
```json
{
  "message": "Journal updated successfully",
  "journal": {
    "id": 1,
    "teacher_id": 1,
    "description": "Updated journal content",
    "published_at": "2025-05-16T10:00:00.000Z",
    "attachment_type": "image",
    "attachment_url": "https://example.com/updated-image.jpg",
    "created_at": "2025-05-16T19:05:57.813Z",
    "updated_at": "2025-05-16T19:16:36.265Z",
    "student_usernames": ["student1", "student2"],
    "students": [
      {"id": 2, "username": "student1"},
      {"id": 3, "username": "student2"}
    ]
  }
}
```

#### Delete Journal (Teachers only)

```
DELETE /api/journals/:id
```

Response:
```json
{
  "message": "Journal deleted successfully",
  "id": "1"
}
```

## Access Control

- **Teachers**:
  - Can create, read, update, and delete their own journals
  - Can specify which students can view each journal
  - Cannot access journals created by other teachers

- **Students**:
  - Can only read journals that have been shared with them
  - Cannot create, update, or delete any journals
  - Cannot access journals shared with other students

## Examples

### Creating a new teacher account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "password": "password123",
    "role": "teacher"
  }'
```

### Login as teacher

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "password": "password123"
  }'
```

### Creating a journal entry (as teacher)

```bash
curl -X POST http://localhost:3000/api/journals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "description": "Today we learned about photosynthesis and its importance in plant life cycles",
    "publishedAt": "2025-05-16T19:07:00Z",
    "attachmentType": "image",
    "attachmentUrl": "https://example.com/photosynthesis.jpg",
    "studentUsernames": ["student1", "student2"]
  }'
```

### Viewing journal entries (as student)

```bash
curl -X GET http://localhost:3000/api/journals \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```
