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

const GLAMOUR_SPARKS = [
  ['4%', '-48%', '✦', '-18px', '-24px', '0s', 13],
  ['12%', '18%', '✧', '-28px', '8px', '0.18s', 10],
  ['22%', '-28%', '✦', '-4px', '-34px', '0.35s', 12],
  ['31%', '8%', '✧', '10px', '-28px', '0.52s', 9],
  ['43%', '-46%', '✦', '18px', '-22px', '0.7s', 14],
  ['54%', '16%', '✧', '-8px', '24px', '0.86s', 10],
  ['66%', '-32%', '✦', '24px', '-30px', '1.05s', 12],
  ['76%', '8%', '✧', '26px', '18px', '1.22s', 9],
  ['88%', '-42%', '✦', '34px', '-18px', '1.4s', 13],
  ['96%', '18%', '✧', '28px', '22px', '1.56s', 10],
] as const

const OVERLAY_GLITTERS = [
  3, 7, 10, 14, 18, 22, 26, 30, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93, 97,
] as const

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [glamourUnlocked, setGlamourUnlocked] = useState(false)
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
        '@keyframes constantGlamourTwinkle': {
          '0%, 100%': { opacity: 0.35, color: '#ff4fc3', filter: 'drop-shadow(0 0 4px rgba(255,79,195,0.9))' },
          '33%': { opacity: 1, color: '#ffffff', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.95))' },
          '66%': { opacity: 0.82, color: '#ff1f4f', filter: 'drop-shadow(0 0 8px rgba(255,31,79,0.9))' },
        },
        '@keyframes glitterTileShift': {
          '0%': { backgroundPosition: '0 0, 12px 20px, 4px 8px, 20px 4px', filter: 'brightness(1.1) saturate(1.2)' },
          '35%': { backgroundPosition: '34px 18px, -10px 44px, 28px -8px, 48px 26px', filter: 'brightness(1.65) saturate(1.8)' },
          '70%': { backgroundPosition: '-18px 46px, 40px -12px, -22px 36px, 12px 54px', filter: 'brightness(1.3) saturate(1.5)' },
          '100%': { backgroundPosition: '0 0, 12px 20px, 4px 8px, 20px 4px', filter: 'brightness(1.1) saturate(1.2)' },
        },
        '@keyframes glitterTwinkleLayer': {
          '0%, 100%': { opacity: 0.78, transform: 'scale(1)' },
          '45%': { opacity: 1, transform: 'scale(1.04)' },
          '70%': { opacity: 0.88, transform: 'scale(0.99)' },
        },
        '@keyframes slaySweep': {
          '0%': { transform: 'translateX(-120%) rotate(-8deg)', opacity: 0 },
          '20%': { opacity: 0.95 },
          '55%': { opacity: 1 },
          '100%': { transform: 'translateX(120%) rotate(-8deg)', opacity: 0 },
        },
        '@keyframes glitterShockwave': {
          '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.08)' },
          '12%': { opacity: 1 },
          '65%': { opacity: 0.72 },
          '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(3.2)' },
        },
        '@keyframes slayTextGlitter': {
          '0%, 100%': {
            color: '#ff1493',
            textShadow: '0 0 5px rgba(255,255,255,0.8), 0 0 14px rgba(255,79,195,0.9), 0 0 28px rgba(255,31,79,0.5)',
            filter: 'brightness(1)',
          },
          '35%': {
            color: '#ffffff',
            textShadow: '0 0 8px rgba(255,255,255,1), 0 0 20px rgba(255,79,195,0.95), 0 0 34px rgba(255,20,147,0.7)',
            filter: 'brightness(1.45)',
          },
          '70%': {
            color: '#ff1f4f',
            textShadow: '0 0 6px rgba(255,255,255,0.85), 0 0 18px rgba(255,31,79,0.9), 0 0 34px rgba(229,0,126,0.62)',
            filter: 'brightness(1.18)',
          },
        },
        ...(glamourActive ? {
          '& .MuiAppBar-root': { bgcolor: '#fff0fa', boxShadow: '0 0 22px rgba(255, 79, 195, 0.28)' },
          '& .MuiDrawer-paper': { bgcolor: '#fff0fa' },
          '& main': { bgcolor: '#fff5fb' },
          '& .MuiCard-root, & .MuiPaper-root': { boxShadow: '0 0 18px rgba(255, 79, 195, 0.2)' },
          '& .MuiTypography-root, & .MuiButton-root, & .MuiListItemText-primary, & .MuiListItemText-secondary, & .MuiChip-label, & .MuiInputBase-input, & .MuiInputLabel-root': {
            animation: 'slayTextGlitter 1.05s ease-in-out infinite',
            background: 'linear-gradient(90deg, #ff1493, #ffffff, #ff1f4f, #ff8bd8, #ffffff)',
            backgroundSize: '260% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          },
        } : {}),
      }}
    >
      <AppBar position="fixed" elevation={0} sx={{ zIndex: 1201, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
            <Typography
              component="button"
              type="button"
              variant="h6"
              onClick={() => setGlamourUnlocked(true)}
              sx={{
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                fontWeight: 700,
                color: 'primary.main',
                flexShrink: 0,
                cursor: 'pointer',
                letterSpacing: 0,
                fontFamily: 'inherit',
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 4, borderRadius: 1 },
              }}
            >
              TaskApp
            </Typography>
            {glamourUnlocked && (
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
                    animation: 'glamourSpark 1.8s ease-out infinite, constantGlamourTwinkle 2.4s ease-in-out infinite',
                    pointerEvents: 'none',
                  },
                }}
              >
                GLAMOUR
                {GLAMOUR_SPARKS.map(([left, top, mark, sparkX, sparkY, delay, size]) => (
                  <Box
                    key={`${left}-${top}`}
                    component="span"
                    className="glamour-star"
                    sx={{
                      left,
                      top,
                      '--spark-x': sparkX,
                      '--spark-y': sparkY,
                      animationDelay: delay,
                      fontSize: size,
                    }}
                  >
                    {mark}
                  </Box>
                ))}
              </Box>
            )}
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
            boxShadow: 'inset 0 0 180px rgba(229, 0, 126, 0.42), inset 0 0 80px rgba(255, 255, 255, 0.34)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#030003',
              backgroundImage: `
                radial-gradient(circle, rgba(255,255,255,0.98) 0 1px, transparent 2px),
                radial-gradient(circle, rgba(255,20,147,0.95) 0 1.5px, transparent 3px),
                radial-gradient(circle, rgba(0,255,255,0.86) 0 1px, transparent 2.5px),
                radial-gradient(circle, rgba(255,255,0,0.9) 0 1.2px, transparent 2.8px),
                radial-gradient(circle, rgba(140,0,255,0.88) 0 1px, transparent 2.4px)
              `,
              backgroundSize: '16px 16px, 22px 22px, 28px 28px, 34px 34px, 42px 42px',
              backgroundPosition: '0 0, 8px 12px, 18px 2px, 2px 24px, 28px 18px',
              animation: 'glitterTileShift 1.6s linear infinite, glitterTwinkleLayer 0.9s ease-in-out infinite, slayFlash 0.9s ease-out both',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                repeating-conic-gradient(from 45deg, rgba(255,255,255,0.72) 0deg 8deg, transparent 8deg 18deg),
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.95), transparent 7%),
                radial-gradient(circle at 74% 18%, rgba(255,20,147,0.8), transparent 9%),
                radial-gradient(circle at 62% 78%, rgba(0,255,255,0.74), transparent 8%)
              `,
              backgroundSize: '24px 24px, 100% 100%, 100% 100%, 100% 100%',
              mixBlendMode: 'screen',
              opacity: 0.68,
              animation: 'glitterTileShift 1.1s linear infinite reverse',
            }}
          />
          {[0, 1, 2].map((ring) => (
            <Box
              key={ring}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: { xs: 180 + ring * 60, sm: 260 + ring * 90 },
                height: { xs: 180 + ring * 60, sm: 260 + ring * 90 },
                borderRadius: '50%',
                border: '4px solid rgba(255,255,255,0.92)',
                boxShadow: '0 0 28px rgba(255,255,255,0.95), 0 0 70px rgba(255,79,195,0.9), inset 0 0 34px rgba(255,31,79,0.7)',
                animation: `glitterShockwave ${0.9 + ring * 0.16}s ease-out infinite`,
                animationDelay: `${ring * 0.12}s`,
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              inset: '-20%',
              background: 'linear-gradient(105deg, transparent 14%, rgba(255,255,255,0.82) 30%, rgba(255,79,195,0.72) 42%, rgba(255,31,79,0.58) 48%, transparent 62%)',
              mixBlendMode: 'screen',
              animation: 'slaySweep 0.72s ease-in-out infinite',
            }}
          />
          {OVERLAY_GLITTERS.map((left, index) => (
            <Box
              key={left}
              component="span"
              sx={{
                position: 'absolute',
                left: `${left}%`,
                top: `${index % 5 === 0 ? 8 : index % 5 === 1 ? 18 : index % 5 === 2 ? 30 : index % 5 === 3 ? 46 : 62}%`,
                color: index % 3 === 0 ? '#ff4fc3' : index % 3 === 1 ? '#ffffff' : '#ff1f4f',
                fontSize: { xs: 16 + (index % 4) * 2, sm: 22 + (index % 5) * 3 },
                textShadow: '0 0 10px rgba(255, 255, 255, 0.9), 0 0 18px rgba(255, 79, 195, 0.95)',
                animation: `glitterFall ${1.15 + index * 0.035}s ease-out infinite, constantGlamourTwinkle ${1.8 + index * 0.04}s ease-in-out infinite`,
                animationDelay: `${index * 0.07}s`,
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
                background: 'linear-gradient(90deg, #ff1493, #ffffff, #ff1f4f, #ff8bd8, #ffffff, #e5007e)',
                backgroundSize: '260% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow: '0 0 18px rgba(255, 255, 255, 0.95), 0 0 38px rgba(255, 79, 195, 0.95), 0 0 80px rgba(229, 0, 126, 0.85), 0 0 150px rgba(255, 20, 147, 0.62)',
                filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.85)) drop-shadow(0 0 34px rgba(255,20,147,0.8))',
                animation: swagaFinal ? 'swagaFinal 1.95s ease-in-out forwards, slayTextGlitter 0.42s ease-in-out infinite' : 'swagaLetter 0.62s ease-out forwards, slayTextGlitter 0.42s ease-in-out infinite',
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
