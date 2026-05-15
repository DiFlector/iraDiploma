import type { Task } from '../types'

/** Форматирует дату в формат ICS/Google Calendar: 20240115T100000Z */
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

/**
 * Генерирует URL для добавления задачи в Google Calendar (без OAuth).
 * Открывается в новой вкладке.
 */
export function googleCalendarUrl(task: Task): string {
  if (!task.due_date) return ''
  const start = new Date(task.due_date)
  const end = new Date(start.getTime() + 60 * 60 * 1000) // +1 час

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
  })
  if (task.description) {
    params.set('details', task.description)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Генерирует содержимое .ics файла из массива задач с датами.
 */
export function generateICS(tasks: Task[]): string {
  const withDates = tasks.filter((t) => t.due_date && !t.deleted_at)

  const events = withDates.map((task) => {
    const start = new Date(task.due_date!)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const lines = [
      'BEGIN:VEVENT',
      `UID:task-${task.id}@taskapp`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${task.title.replace(/[\r\n]/g, ' ')}`,
    ]
    if (task.description) {
      lines.push(`DESCRIPTION:${task.description.replace(/[\r\n]/g, '\\n')}`)
    }
    lines.push('STATUS:CONFIRMED', 'END:VEVENT')
    return lines.join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TaskApp//TaskApp//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

/**
 * Скачивает .ics файл на устройство пользователя.
 */
export function downloadICS(tasks: Task[], filename = 'tasks.ics'): void {
  const ics = generateICS(tasks)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Скачивает .ics и одновременно открывает файл через blob: URL,
 * чтобы ОС/браузер предложили открыть в приложении-календаре.
 * Возвращает количество экспортированных задач.
 */
export function exportToCalendar(tasks: Task[]): number {
  const withDates = tasks.filter((t) => t.due_date && !t.deleted_at)
  if (withDates.length === 0) return 0
  downloadICS(withDates)
  return withDates.length
}
