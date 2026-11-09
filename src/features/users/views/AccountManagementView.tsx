import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import type { UserRole } from '@/features/auth/models/types'

interface AccountRow {
  id: string
  username: string
  role: UserRole
  name: string
  email: string
}

interface ResetResult {
  username: string
  temporaryPassword: string
}

export default function AccountManagementView() {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [resetting, setResetting] = useState<AccountRow | null>(null)
  const [result, setResult] = useState<ResetResult | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAccounts(
        await api.get<AccountRow[]>(
          `/api/users/accounts${buildQuery({ search, role })}`,
        ),
      )
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify, role, search, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 200)
    return () => window.clearTimeout(timer)
  }, [load])

  const resetPassword = async () => {
    if (!resetting) return
    setSaving(true)
    try {
      const response = await api.post<ResetResult>(
        `/api/users/accounts/${resetting.id}/reset-password`,
      )
      setResult({ username: response.username, temporaryPassword: response.temporaryPassword })
      notify(t('users.resetPasswordSuccess'), 'success')
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('users.searchAccount')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              select
              label={t('users.role')}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              sx={{ minWidth: { sm: 180 } }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="admin">{t('roles.admin')}</MenuItem>
              <MenuItem value="teacher">{t('roles.teacher')}</MenuItem>
              <MenuItem value="student">{t('roles.student')}</MenuItem>
              <MenuItem value="parent">{t('roles.parent')}</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('common.name')}</TableCell>
                <TableCell>{t('users.username')}</TableCell>
                <TableCell>{t('users.role')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {t('common.email')}
                </TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.loading')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      {t('users.noAccounts')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={t(`roles.${account.role}`)} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {account.email}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<KeyRoundedIcon />}
                        onClick={() => {
                          setResetting(account)
                          setResult(null)
                        }}
                      >
                        {t('users.resetPassword')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={Boolean(resetting)}
        onClose={() => {
          setResetting(null)
          setResult(null)
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('users.resetPassword')}</DialogTitle>
        <DialogContent dividers>
          {result ? (
            <Stack spacing={1.5}>
              <Alert severity="success">{t('users.resetPasswordSuccess')}</Alert>
              <Typography variant="body2">
                {t('users.username')}: <strong>{result.username}</strong>
              </Typography>
              <Typography variant="body2">
                {t('users.temporaryPassword')}: <strong>{result.temporaryPassword}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('users.temporaryPasswordHint')}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="body2">
                {t('users.resetPasswordConfirm', { name: resetting?.name ?? '' })}
              </Typography>
              <Alert severity="info">{t('users.resetPasswordInfo')}</Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setResetting(null)
              setResult(null)
            }}
          >
            {t('common.close')}
          </Button>
          {!result ? (
            <Button variant="contained" disabled={saving} onClick={() => void resetPassword()}>
              {saving ? t('common.saving') : t('users.resetPassword')}
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
