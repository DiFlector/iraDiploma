import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..config import settings


async def send_email(to: str, subject: str, body_html: str) -> bool:
    if not settings.smtp_host or not settings.smtp_user:
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = to
        msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_pass)
            server.sendmail(settings.smtp_from, to, msg.as_string())
        return True
    except Exception:
        return False


async def send_password_reset_email(to: str, token: str) -> bool:
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    body = f"""
    <h2>Сброс пароля</h2>
    <p>Для сброса пароля перейдите по ссылке:</p>
    <a href="{reset_url}">{reset_url}</a>
    <p>Ссылка действительна 1 час.</p>
    """
    return await send_email(to, "Сброс пароля — TaskApp", body)


async def send_deadline_reminder(to: str, task_title: str, due_date: str) -> bool:
    body = f"""
    <h2>Напоминание о дедлайне</h2>
    <p>Задача <strong>{task_title}</strong> должна быть выполнена до {due_date}.</p>
    """
    return await send_email(to, f"Дедлайн задачи: {task_title}", body)
