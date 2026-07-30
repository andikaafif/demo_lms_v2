# demo_lms_v2

# LMS Lite Demo Requirement
> Version: Demo Presentation
> Product: Digital School Platform for SD/MI

## 1. Purpose

The LMS Lite Demo is designed to demonstrate the core value of the platform to school principals and administrators. The demo focuses on the daily workflow between the school, teachers, students, and parents without exposing advanced enterprise features.

---

# 2. Demo Scope

Included modules:

- Authentication
- School Profile
- User Management
- Class Management
- Subject Management
- Learning Materials
- Assignments
- Attendance
- Gradebook
- Parent Dashboard
- Announcements

Out of Scope:

- AI Assistant
- Payment
- Gamification
- Analytics
- Multi-school SaaS
- Kurikulum Merdeka (advanced)

---

# 3. Authentication

Supported Roles

| Role | Description |
|------|-------------|
| School Admin | School administrator |
| Teacher | Teacher |
| Student | Student |
| Parent | Parent |

Business Rules

- Every user has one role.
- Parents only access their own children.
- Teachers only access assigned classes.

---

# 4. School Profile

The **School Profile** menu contains only information about the school itself.

Fields include:

- School Name
- NPSN
- School Logo
- Address
- Phone Number
- Email Address
- Website
- Principal Name
- Accreditation
- School Description

Business Rules

- This menu does **not** manage teachers, students, classes, or subjects.
- Operational data is managed through its respective modules.

---

# 5. User Management

## Teachers

Manage:

- Teacher Profile
- Employee Number (optional)
- Subject Assignment
- Homeroom Assignment
- User Account Status

## Students

Manage:

- Student Profile
- NIS/NISN
- Class
- Academic Status

### Parent Information

Parent information is maintained **inside the Student Detail page** as additional information.

Parent fields include:

- Father Name
- Mother Name
- Guardian Name (optional)
- Phone Number
- Email
- Occupation
- Address

Business Rules

- Parent data is linked to the student.
- A parent account can be generated from the student record.
- Parent management does not require a separate menu in the Lite Demo.

---

# 6. Class Management

School administrators can:

- Create classes
- Assign homeroom teachers
- Enroll students
- Archive classes

---

# 7. Subject Management

Administrators assign:

- Subject
- Teacher
- Class

Teachers only see assigned subjects.

---

# 8. Learning Materials

Teachers can:

- Create materials
- Upload PDF
- Upload images
- Add YouTube links
- Add descriptions

Students can:

- View materials
- Download files

---

# 9. Assignment

Teachers can:

- Create assignments
- Set due dates
- Review submissions
- Grade assignments

Students can:

- Submit text
- Upload files

Parents can:

- View assignment status

---

# 10. Attendance

Attendance is recorded **by class** for each teaching session.

Teachers first select:

- Class
- Subject
- Date

The system then displays the list of students enrolled in the selected class for attendance recording.

Attendance Status:

- Present
- Sick
- Permission
- Absent

Business Rules

- Attendance is recorded once per class session.
- Only students enrolled in the selected class are displayed.
- Homeroom teachers and assigned subject teachers can record attendance for their classes.
- Parents can monitor their children's attendance from the Parent Dashboard.

---

# 11. Gradebook

Displays:

- Assignment Scores
- Quiz Scores (future)
- Teacher Notes

Parents and students have read-only access.

---

# 12. Announcements

School administrators and teachers can publish announcements.

Announcements appear on:

- Student Dashboard
- Parent Dashboard

---

# 13. Demo Presentation Flow

1. School Admin configures School Profile.
2. School Admin creates Teachers, Students, Classes, and Subjects.
3. Teacher uploads learning materials.
4. Teacher creates an assignment.
5. Student views materials and submits an assignment.
6. Teacher grades the submission.
7. Parent logs in and monitors attendance, assignments, and grades.

---

# 14. Key Selling Points

- Simple and intuitive interface.
- Parent monitoring in one dashboard.
- Teacher administration simplified.
- Mobile-first experience.
- Ready to scale into a complete Digital School Platform.
