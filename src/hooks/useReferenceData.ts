import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Subject, SubjectAssignment } from '@/features/subjects/models/types'
import type { Student, Teacher } from '@/features/users/models/types'

interface ReferenceData {
  classes: SchoolClass[]
  subjects: Subject[]
  teachers: Teacher[]
  students: Student[]
  subjectAssignments: SubjectAssignment[]
  loading: boolean
  reload: () => Promise<void>
  classNameOf: (id: string | null | undefined) => string
  subjectNameOf: (id: string | null | undefined) => string
  subjectColorOf: (id: string | null | undefined) => string
  teacherNameOf: (id: string | null | undefined) => string
  studentNameOf: (id: string | null | undefined) => string
}

/** Shared lookup data used by nearly every module view. */
export function useReferenceData(): ReferenceData {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [classList, subjectList, teacherList, studentList, assignmentList] = await Promise.all([
        api.get<SchoolClass[]>('/api/classes'),
        api.get<Subject[]>('/api/subjects'),
        api.get<Teacher[]>('/api/users/teachers'),
        api.get<Student[]>('/api/users/students'),
        api.get<SubjectAssignment[]>('/api/subject-assignments'),
      ])
      setClasses(classList)
      setSubjects(subjectList)
      setTeachers(teacherList)
      setStudents(studentList)
      setSubjectAssignments(assignmentList)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    classes,
    subjects,
    teachers,
    students,
    subjectAssignments,
    loading,
    reload,
    classNameOf: (id) => classes.find((item) => item.id === id)?.name ?? '-',
    subjectNameOf: (id) => subjects.find((item) => item.id === id)?.name ?? '-',
    subjectColorOf: (id) => subjects.find((item) => item.id === id)?.color ?? '#3F51B5',
    teacherNameOf: (id) => teachers.find((item) => item.id === id)?.name ?? '-',
    studentNameOf: (id) => students.find((item) => item.id === id)?.name ?? '-',
  }
}
