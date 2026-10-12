# 🏫 AU Care — Campus Maintenance and Complaint Management System

A full-stack web application designed to simplify campus maintenance by allowing students to register complaints, track their status, and manage maintenance issues through a centralized platform.

## 📌 Overview

Maintaining a clean, safe, and functional campus requires an efficient way to report and resolve maintenance issues. Traditional complaint systems can make it difficult to track requests and monitor their progress.

**AU Care** provides a digital platform where students can submit maintenance complaints and administrators can manage their status. The application helps organize complaints, improves visibility, and makes the maintenance process easier to manage.

## 🎯 Objectives

- Digitize the campus maintenance complaint process.
- Provide a centralized platform for submitting and viewing complaints.
- Simplify complaint tracking through status updates.
- Support role-based access for students and administrators.
- Build a full-stack application using modern frontend and backend technologies.

## ✨ Features

### 👤 User Authentication
- Student registration and login.
- Password hashing using BCrypt.
- Session-based authentication.
- Authenticated access to protected application features.

### 📝 Complaint Management
- Submit campus maintenance complaints.
- View submitted complaints.
- Track complaint progress through status updates.
- Organize complaints using clearly defined statuses.

### 🛠️ Administration
- Access-controlled complaint management.
- Update complaint statuses.
- Manage complaint progress through the following stages:
  - **Pending** — Complaint has been submitted.
  - **In Progress** — Complaint is being addressed.
  - **Resolved** — Complaint has been resolved.

### 🔐 Security
- Spring Security integration.
- BCrypt password encoding.
- Protected complaint endpoints.
- Configurable database credentials using environment variables.

## 🧰 Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, HTML, CSS |
| Backend | Java 21, Spring Boot |
| Security | Spring Security, BCrypt |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Build Tool | Maven |
| API Testing | Postman |
| Version Control | Git and GitHub |

## 🏗️ System Architecture

AU Care follows a client-server architecture.

1. **Frontend:** The React application provides the user interface for registration, login, and complaint management.
2. **Backend:** The Spring Boot application processes API requests, applies business logic, and enforces access control.
3. **Database:** MySQL stores application data, including user and complaint information.
4. **Communication:** The frontend communicates with the backend through REST API endpoints over HTTP.

### Application Flow

```text
        Student / Administrator
                  |
                  v
         React Frontend
           (Vite Server)
                  |
                  v
       Spring Boot REST API
                  |
          Spring Security
                  |
                  v
        Spring Data JPA
                  |
                  v
           MySQL Database
```

## 📂 Project Structure

```text
campus-maintenance/
│
├── campus-maintenance/          # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/campus/campus_maintenance/
│   │       │       ├── config/
│   │       │       │   └── SecurityConfig.java
│   │       │       └── controller/
│   │       │           └── AuthController.java
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/                    # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

*Note: The structure above highlights the main folders and files. Additional controllers, models, repositories, services, and frontend components may be present in the actual project.*

## ⚙️ Prerequisites

Ensure the following tools are installed:

- Java Development Kit (JDK) 21 or compatible version.
- Node.js and npm.
- MySQL Server.
- Git.
- A code editor such as Visual Studio Code or IntelliJ IDEA.

## 🚀 Getting Started

Follow these steps to run AU Care locally.

### 1. Clone the Repository

```bash
git clone https://github.com/sravanimannempalli/AUCare-Campus-Maintenance.git
cd AUCare-Campus-Maintenance
```

### 2. Configure the Database

Start MySQL and create the database:

```sql
CREATE DATABASE campus_maintenance;
```

Configure the database connection in your local backend configuration.

Example environment-based configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campus_maintenance
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
```

Keep your actual database password private. Do not commit credentials or other secrets to the repository.

### 3. Start the Backend

Open a terminal in the backend directory:

```bash
cd campus-maintenance
```

Set the database credentials in PowerShell:

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```

Run the Spring Boot application:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### 4. Start the Frontend

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

The frontend and backend should both be running for the application to work correctly.

## 🔗 REST API Endpoints

The following endpoints are available in the application.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the current user's information |
| POST | `/api/auth/logout` | Log out the current user |

### Complaint Management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/complaints` | Submit a complaint |
| GET | `/api/complaints` | Retrieve complaints |
| PUT | `/api/complaints/{id}/status` | Update a complaint's status |

**Note:** Complaint endpoints are protected by authentication and authorization rules. Status updates require administrator access.

## 🧪 Testing

The application can be tested using the following approaches:

- **Postman:** Test registration, login, and complaint API requests.
- **Frontend testing:** Verify form submission, login, and complaint management through the user interface.
- **Database verification:** Check whether user and complaint records are stored correctly in MySQL.
- **Access control testing:** Verify that protected endpoints reject unauthorized requests.

## 🔮 Future Enhancements

Potential improvements for future versions include:

- Email or in-app notifications for complaint status changes.
- Complaint categories such as electrical, plumbing, sanitation, and infrastructure.
- Image uploads for reporting maintenance issues.
- Search, filtering, and priority-based complaint management.
- An analytics dashboard for monitoring complaint resolution.
- Deployment to a cloud hosting platform.

*These are proposed enhancements and are not necessarily part of the current implementation.*

## 🎓 Learning Outcomes

This project provides practical experience with:

- Full-stack web application development.
- React frontend development.
- REST API design using Spring Boot.
- Database integration using MySQL and JPA.
- Authentication and authorization using Spring Security.
- API testing with Postman.
- Version control and project collaboration using Git and GitHub.

## 👩‍💻 Project Information

**Project Name:** AU Care — Campus Maintenance and Complaint Management System

**Project Type:** Full-Stack Java Application

**Developed as part of:** Technical Training Project

**Repository:** [AUCare-Campus-Maintenance](https://github.com/sravanimannempalli/AUCare-Campus-Maintenance)

## 📄 License

This project was developed for educational and learning purposes.


