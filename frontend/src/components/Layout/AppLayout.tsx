import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import FolderIcon from '@mui/icons-material/Folder'
import BarChartIcon from '@mui/icons-material/BarChart'
import LabelIcon from '@mui/icons-material/Label'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAppDispatch, useAppSelector } from '../../store'
import { logout } from '../../features/auth/authSlice'
import NotificationBell from '../notifications/NotificationBell'

const DRAWER_WIDTH = 220

const navItems = [
  { label: 'Задачи', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Kanban', path: '/kanban', icon: <ViewKanbanIcon /> },
  { label: 'Проекты', path: '/projects', icon: <FolderIcon /> },
  { label: 'Метки', path: '/tags', icon: <LabelIcon /> },
  { label: 'Аналитика', path: '/analytics', icon: <BarChartIcon /> },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: 1201, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: 'primary.main' }}>
            TaskApp
          </Typography>
          <NotificationBell />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar
              src={user?.avatar_url ?? undefined}
              sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}
            >
              {user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}` || '?' : '?'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.first_name} {user?.last_name}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile') }}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} /> Профиль
            </MenuItem>
            <MenuItem onClick={() => { dispatch(logout()); navigate('/login') }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Выйти
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', top: 64, borderRight: '1px solid', borderColor: 'divider' },
      }}>
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => navigate(item.path)}
                sx={{ borderRadius: 2, mx: 1, mb: 0.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flex: 1, mt: '64px', ml: `${DRAWER_WIDTH}px`, p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
        <Outlet />
      </Box>
    </Box>
  )
}
