import { useEffect, useRef, useState } from 'react'
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
  const [glamourActive, setGlamourActive] = useState(false)
  const [swagaText, setSwagaText] = useState('')
  const [swagaStep, setSwagaStep] = useState(0)
  const [swagaFinal, setSwagaFinal] = useState(false)
  const glamourTimers = useRef<number[]>([])

  useEffect(() => () => {
    glamourTimers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const triggerGlamour = () => {
    if (glamourActive) return

    glamourTimers.current.forEach((timer) => window.clearTimeout(timer))
    glamourTimers.current = []
    setGlamourActive(true)
    setSwagaText('')
    setSwagaStep(0)
    setSwagaFinal(false)

    const sequence = ['S', 'W', 'A', 'G', 'A', 'SWAGA']
    sequence.forEach((item, index) => {
      glamourTimers.current.push(window.setTimeout(() => {
        setSwagaText(item)
        setSwagaStep(index)
        setSwagaFinal(item === 'SWAGA')
      }, 180 + index * 640))
    })

    glamourTimers.current.push(window.setTimeout(() => {
      setSwagaText('')
      setSwagaStep(0)
      setSwagaFinal(false)
    }, 5200))

    glamourTimers.current.push(window.setTimeout(() => {
      setGlamourActive(false)
    }, 5800))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        '@keyframes glamourSpark': {
          '0%': { opacity: 0, transform: 'translate3d(0, 0, 0) scale(0.4) rotate(0deg)' },
          '18%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate3d(var(--spark-x), var(--spark-y), 0) scale(1.15) rotate(180deg)' },
        },
        '@keyframes swagaLetter': {
          '0%': { opacity: 0, transform: 'scale(0.35) rotate(-10deg)' },
          '22%': { opacity: 1, transform: 'scale(1.08) rotate(4deg)' },
          '82%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
          '100%': { opacity: 0, transform: 'scale(0.9) rotate(8deg)' },
        },
        '@keyframes swagaFinal': {
          '0%': { opacity: 0, transform: 'scale(0.8)', filter: 'brightness(1)' },
          '20%': { opacity: 1, transform: 'scale(1)', filter: 'brightness(1.6)' },
          '36%': { opacity: 0.55, transform: 'scale(1.12) rotate(-1deg)', filter: 'brightness(2.2)' },
          '52%': { opacity: 1, transform: 'scale(1.2) rotate(1deg)', filter: 'brightness(1.4)' },
          '68%': { opacity: 0.68, transform: 'scale(1.28) rotate(-1deg)', filter: 'brightness(2)' },
          '82%': { opacity: 1, transform: 'scale(1.22)', filter: 'brightness(1.7)' },
          '100%': { opacity: 0, transform: 'scale(1.3)', filter: 'brightness(2.2)' },
        },
        '@keyframes slayFlash': {
          '0%': { opacity: 0 },
          '18%': { opacity: 0.75 },
          '100%': { opacity: 0 },
        },
        '@keyframes slayBurst': {
          '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)' },
          '24%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y))) scale(1.35) rotate(280deg)' },
        },
        '@keyframes glitterFall': {
          '0%': { opacity: 0, transform: 'translateY(-12px) scale(0.5) rotate(0deg)' },
          '15%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translateY(72px) scale(1.1) rotate(220deg)' },
        },
        ...(glamourActive ? {
          '& .MuiAppBar-root': { bgcolor: '#fff0fa', boxShadow: '0 0 22px rgba(255, 79, 195, 0.28)' },
          '& .MuiDrawer-paper': { bgcolor: '#fff0fa' },
          '& main': { bgcolor: '#fff5fb' },
          '& .MuiCard-root, & .MuiPaper-root': { boxShadow: '0 0 18px rgba(255, 79, 195, 0.2)' },
        } : {}),
      }}
    >
      <AppBar position="fixed" elevation={0} sx={{ zIndex: 1201, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
              TaskApp
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={triggerGlamour}
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                color: '#e5007e',
                fontWeight: 900,
                fontSize: { xs: 18, sm: 24 },
                lineHeight: 1,
                letterSpacing: 0,
                textTransform: 'uppercase',
                userSelect: 'none',
                transform: 'skew(-5deg)',
                cursor: 'pointer',
                '&:focus-visible': { outline: '2px solid #ff4fc3', outlineOffset: 3, borderRadius: 1 },
                '& .glamour-star': {
                  position: 'absolute',
                  color: '#ff4fc3',
                  fontSize: 13,
                  lineHeight: 1,
                  textShadow: '0 0 6px rgba(255, 79, 195, 0.95), 0 0 14px rgba(229, 0, 126, 0.65)',
                  animation: 'glamourSpark 1.8s ease-out infinite',
                  pointerEvents: 'none',
                },
              }}
            >
              GLAMOUR
              <Box component="span" className="glamour-star" sx={{ left: '8%', top: '-35%', '--spark-x': '-18px', '--spark-y': '-24px', animationDelay: '0s' }}>✦</Box>
              <Box component="span" className="glamour-star" sx={{ left: '28%', top: '5%', '--spark-x': '4px', '--spark-y': '-30px', animationDelay: '0.35s' }}>✧</Box>
              <Box component="span" className="glamour-star" sx={{ left: '52%', top: '-30%', '--spark-x': '18px', '--spark-y': '-22px', animationDelay: '0.7s' }}>✦</Box>
              <Box component="span" className="glamour-star" sx={{ right: '10%', top: '8%', '--spark-x': '26px', '--spark-y': '-18px', animationDelay: '1.05s' }}>✧</Box>
            </Box>
          </Box>
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

      <Box component="main" sx={{ flex: 1, minWidth: 0, mt: '64px', p: { xs: 2, sm: 3 }, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', overflow: 'hidden' }}>
        <Outlet />
      </Box>

      {glamourActive && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            pointerEvents: 'none',
            overflow: 'hidden',
            bgcolor: 'rgba(255, 79, 195, 0.16)',
            boxShadow: 'inset 0 0 120px rgba(229, 0, 126, 0.26)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'radial-gradient(circle at center, rgba(255,255,255,0.9), rgba(255,79,195,0.34) 32%, transparent 68%)',
              animation: 'slayFlash 0.9s ease-out both',
            }}
          />
          {[6, 14, 23, 31, 42, 55, 64, 73, 84, 92].map((left, index) => (
            <Box
              key={left}
              component="span"
              sx={{
                position: 'absolute',
                left: `${left}%`,
                top: `${index % 3 === 0 ? 12 : index % 3 === 1 ? 24 : 5}%`,
                color: index % 2 === 0 ? '#ff4fc3' : '#ff8bd8',
                fontSize: { xs: 18, sm: 26 },
                textShadow: '0 0 12px rgba(255, 79, 195, 0.95)',
                animation: `glitterFall ${1.3 + index * 0.08}s ease-out infinite`,
                animationDelay: `${index * 0.12}s`,
              }}
            >
              {index % 2 === 0 ? '✦' : '✧'}
            </Box>
          ))}
          {[
            ['10%', '72%', '✦', '-70px', '-42px'],
            ['18%', '52%', '♡', '-46px', '34px'],
            ['28%', '80%', '✧', '24px', '-64px'],
            ['38%', '58%', '♥', '-22px', '58px'],
            ['50%', '76%', '✦', '0px', '-78px'],
            ['62%', '55%', '♡', '46px', '40px'],
            ['72%', '78%', '✧', '-28px', '-58px'],
            ['82%', '50%', '♥', '62px', '28px'],
            ['90%', '70%', '✦', '76px', '-34px'],
          ].map(([left, top, mark, burstX, burstY], index) => (
            <Box
              key={`${left}-${top}`}
              component="span"
              sx={{
                position: 'absolute',
                left,
                top,
                color: index % 3 === 0 ? '#ff1493' : '#ff8bd8',
                fontSize: { xs: 20, sm: 34 },
                fontWeight: 900,
                textShadow: '0 0 16px rgba(255, 79, 195, 0.95), 0 0 28px rgba(255, 20, 147, 0.6)',
                '--burst-x': burstX,
                '--burst-y': burstY,
                animation: `slayBurst ${1.35 + index * 0.05}s ease-out infinite`,
                animationDelay: `${index * 0.16}s`,
              }}
            >
              {mark}
            </Box>
          ))}

          {swagaText && (
            <Typography
              key={`${swagaText}-${swagaStep}`}
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e5007e',
                fontWeight: 900,
                fontSize: swagaFinal ? 'clamp(72px, 23vw, 430px)' : 'clamp(96px, 22vw, 260px)',
                lineHeight: 0.85,
                letterSpacing: 0,
                textTransform: 'uppercase',
                textShadow: '0 0 18px rgba(255, 79, 195, 0.95), 0 0 60px rgba(229, 0, 126, 0.72), 0 0 120px rgba(255, 20, 147, 0.42)',
                animation: swagaFinal ? 'swagaFinal 1.95s ease-in-out forwards' : 'swagaLetter 0.62s ease-out forwards',
                whiteSpace: 'nowrap',
              }}
            >
              {swagaText}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}
