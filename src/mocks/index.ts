import { announcementsHandlers } from './handlers/announcements'
import { assignmentsHandlers } from './handlers/assignments'
import { attendanceHandlers } from './handlers/attendance'
import { authHandlers } from './handlers/auth'
import { classesHandlers } from './handlers/classes'
import { gradesHandlers } from './handlers/grades'
import { materialsHandlers } from './handlers/materials'
import { schoolHandlers } from './handlers/school'
import { subjectsHandlers } from './handlers/subjects'
import { usersHandlers } from './handlers/users'

export const handlers = [
  ...authHandlers,
  ...schoolHandlers,
  ...usersHandlers,
  ...classesHandlers,
  ...subjectsHandlers,
  ...materialsHandlers,
  ...assignmentsHandlers,
  ...attendanceHandlers,
  ...gradesHandlers,
  ...announcementsHandlers,
]
