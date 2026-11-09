import { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { getInitials } from '@/lib/format'
import type { Student, Teacher } from '../models/types'
import { useUsersViewModel } from '../viewmodels/useUsersViewModel'
import TeacherFormDialog from './TeacherFormDialog'
import StudentFormDialog from './StudentFormDialog'
import AccountManagementView from './AccountManagementView'

export default function UsersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const vm = useUsersViewModel()

  const [tab, setTab] = useState(0)
  const [teacherDialog, setTeacherDialog] = useState<{ open: boolean; item: Teacher | null }>({
    open: false,
    item: null,
  })
  const [studentDialog, setStudentDialog] = useState<{ open: boolean; item: Student | null }>({
    open: false,
    item: null,
  })
  const [confirm, setConfirm] = useState<{
    open: boolean
    kind: 'teacher' | 'student'
    id: string
    name: string
  }>({ open: false, kind: 'teacher', id: '', name: '' })

  const activeClasses = useMemo(
    () => vm.classes.filter((item) => item.status === 'active'),
    [vm.classes],
  )

  const handleDelete = async () => {
    if (confirm.kind === 'teacher') await vm.deleteTeacher(confirm.id)
    else await vm.deleteStudent(confirm.id)
    setConfirm((state) => ({ ...state, open: false }))
  }

  return (
    <Box>
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        gradient="violet"
        icon={<GroupsRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          tab === 2 ? null : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                tab === 0
                  ? setTeacherDialog({ open: true, item: null })
                  : setStudentDialog({ open: true, item: null })
              }
            >
              {tab === 0 ? t('users.addTeacher') : t('users.addStudent')}
            </Button>
          )
        }
      />

      {tab === 2 ? (
        <AccountManagementView />
      ) : (
      <>
      <Card sx={{ mb: 2.5 }}>
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`${t('users.tabTeachers')} (${vm.teachers.length})`} />
          <Tab label={`${t('users.tabStudents')} (${vm.students.length})`} />
          <Tab label={t('users.tabAccounts')} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              fullWidth
              value={tab === 0 ? vm.teacherSearch : vm.studentSearch}
              onChange={(event) =>
                tab === 0
                  ? vm.setTeacherSearch(event.target.value)
                  : vm.setStudentSearch(event.target.value)
              }
              placeholder={tab === 0 ? t('users.searchTeacher') : t('users.searchStudent')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {tab === 1 ? (
              <TextField
                size="small"
                select
                value={vm.studentClassFilter}
                onChange={(event) => vm.setStudentClassFilter(event.target.value)}
                sx={{ minWidth: { sm: 200 } }}
                label={t('common.class')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {vm.classes.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
          </Stack>
        </Box>
      </Card>

      {vm.loading ? (
        <LoadingSkeleton variant="table" count={6} />
      ) : tab === 0 ? (
        vm.teachers.length === 0 ? (
          <EmptyState title={t('users.noTeachers')} />
        ) : (
          <Card>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {t('users.employeeNumber')}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      {t('users.subjectsTaught')}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {t('users.homeroomOf')}
                    </TableCell>
                    <TableCell>{t('users.accountStatus')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vm.teachers.map((teacher) => (
                    <TableRow key={teacher.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{ bgcolor: teacher.avatarColor, width: 36, height: 36, fontSize: 14 }}
                          >
                            {getInitials(teacher.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {teacher.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {teacher.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {teacher.employeeNumber}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {vm.subjectNamesOf(teacher.subjectIds).map((name) => (
                            <Chip key={name} size="small" label={name} variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {teacher.homeroomClassId
                          ? vm.classNameOf(teacher.homeroomClassId)
                          : t('users.noHomeroom')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={teacher.accountStatus === 'active' ? 'success' : 'default'}
                          label={
                            teacher.accountStatus === 'active'
                              ? t('common.active')
                              : t('common.inactive')
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => setTeacherDialog({ open: true, item: teacher })}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                kind: 'teacher',
                                id: teacher.id,
                                name: teacher.name,
                              })
                            }
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )
      ) : vm.students.length === 0 ? (
        <EmptyState title={t('users.noStudents')} />
      ) : (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {t('users.nis')}
                  </TableCell>
                  <TableCell>{t('common.class')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {t('users.gender')}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {t('users.academicStatus')}
                  </TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vm.students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{ bgcolor: student.avatarColor, width: 36, height: 36, fontSize: 14 }}
                        >
                          {getInitials(student.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {t('users.nisn')}: {student.nisn}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {student.nis}
                    </TableCell>
                    <TableCell>{vm.classNameOf(student.classId)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      {student.gender === 'L' ? t('common.male') : t('common.female')}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Chip
                        size="small"
                        color={student.academicStatus === 'active' ? 'success' : 'default'}
                        label={
                          student.academicStatus === 'active'
                            ? t('common.active')
                            : student.academicStatus === 'graduated'
                              ? t('users.graduated')
                              : t('users.transferred')
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('common.viewDetail')}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/users/students/${student.id}`)}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => setStudentDialog({ open: true, item: student })}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirm({
                              open: true,
                              kind: 'student',
                              id: student.id,
                              name: student.name,
                            })
                          }
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      </>
      )}

      <TeacherFormDialog
        open={teacherDialog.open}
        teacher={teacherDialog.item}
        subjects={vm.subjects}
        classes={activeClasses}
        saving={vm.saving}
        onClose={() => setTeacherDialog({ open: false, item: null })}
        onSubmit={async (values) => {
          const ok = teacherDialog.item
            ? await vm.updateTeacher(teacherDialog.item.id, values)
            : await vm.createTeacher(values)
          if (ok) setTeacherDialog({ open: false, item: null })
        }}
      />

      <StudentFormDialog
        open={studentDialog.open}
        student={studentDialog.item}
        classes={activeClasses}
        saving={vm.saving}
        onClose={() => setStudentDialog({ open: false, item: null })}
        onSubmit={async (values) => {
          const ok = studentDialog.item
            ? await vm.updateStudent(studentDialog.item.id, values)
            : await vm.createStudent(values)
          if (ok) setStudentDialog({ open: false, item: null })
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        title={t('common.confirm')}
        message={
          confirm.kind === 'teacher'
            ? t('users.deleteTeacherConfirm', { name: confirm.name })
            : t('users.deleteStudentConfirm', { name: confirm.name })
        }
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={handleDelete}
        onCancel={() => setConfirm((state) => ({ ...state, open: false }))}
      />
    </Box>
  )
}
