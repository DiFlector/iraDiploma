import { useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, ToggleButton, ToggleButtonGroup, CircularProgress, MenuItem, TextField } from '@mui/material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'
import { useGetCompletionQuery, useGetStatusDistributionQuery, useGetProjectProgressQuery } from '../api/analyticsApi'
import { useGetProjectsQuery } from '../api/projectsApi'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../types'

function CompletionChart() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const { data, isLoading } = useGetCompletionQuery({ period })

  return (
    <Card sx={{ minWidth: 0 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 2 }}>
          <Typography variant="h6">Выполненные задачи</Typography>
          <ToggleButtonGroup size="small" value={period} exclusive onChange={(_, v) => v && setPeriod(v)}>
            <ToggleButton value="week">Неделя</ToggleButton>
            <ToggleButton value="month">Месяц</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {isLoading ? <CircularProgress size={24} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} name="Задач" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function StatusDistributionChart() {
  const { data = [], isLoading } = useGetStatusDistributionQuery({})
  const chartData = data.map((d) => ({ name: TASK_STATUS_LABELS[d.status], value: d.count, color: TASK_STATUS_COLORS[d.status] }))

  return (
    <Card sx={{ minWidth: 0 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>Распределение по статусам</Typography>
        {isLoading ? <CircularProgress size={24} /> : chartData.length === 0 ? (
          <Typography color="text.secondary">Нет данных</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function ProjectProgressChart() {
  const { data: projects = [] } = useGetProjectsQuery()
  const [selectedId, setSelectedId] = useState('')
  const { data: progress, isLoading } = useGetProjectProgressQuery(selectedId, { skip: !selectedId })

  return (
    <Card sx={{ minWidth: 0 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 2 }}>
          <Typography variant="h6">Прогресс проекта</Typography>
          <TextField select size="small" label="Проект" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
        </Box>
        {!selectedId ? (
          <Typography color="text.secondary">Выберите проект</Typography>
        ) : isLoading ? <CircularProgress size={24} /> : progress ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <Typography variant="body2">Выполнено {progress.done} из {progress.total}</Typography>
              <Typography variant="h5" color="primary" fontWeight={700}>{progress.percent}%</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={[{ name: 'В работе', value: progress.total - progress.done }, { name: 'Готово', value: progress.done }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="h5" mb={3}>Аналитика</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} sx={{ minWidth: 0 }}><CompletionChart /></Grid>
        <Grid item xs={12} md={4} sx={{ minWidth: 0 }}><StatusDistributionChart /></Grid>
        <Grid item xs={12} md={6} sx={{ minWidth: 0 }}><ProjectProgressChart /></Grid>
      </Grid>
    </Box>
  )
}
