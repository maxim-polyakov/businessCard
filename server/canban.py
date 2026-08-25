import os
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv


APP_DIR = Path(__file__).resolve().parent
load_dotenv(APP_DIR / ".env")


class CanbanIntegrationError(RuntimeError):
    pass


logger = logging.getLogger(__name__)


def get_env(name: str) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else None


CANBAN_API_URL = (get_env("CANBAN_API_URL") or "https://canbanapi.baxic.ru/api").rstrip("/")
CANBAN_API_TOKEN = get_env("CANBAN_API_TOKEN")
CANBAN_EMAIL = get_env("CANBAN_EMAIL")
CANBAN_PASSWORD = get_env("CANBAN_PASSWORD")
CANBAN_COLUMN_ID = get_env("CANBAN_COLUMN_ID")
CANBAN_COLUMN_TITLE = get_env("CANBAN_COLUMN_TITLE") or "К выполнению"
CANBAN_BOARD_ID = get_env("CANBAN_BOARD_ID")
CANBAN_BOARD_NAME = get_env("CANBAN_BOARD_NAME")
CANBAN_ASSIGNEE_ID = get_env("CANBAN_ASSIGNEE_ID")
CANBAN_TEAM_ID = get_env("CANBAN_TEAM_ID")
CANBAN_TEAM_NAME = get_env("CANBAN_TEAM_NAME")
CANBAN_CATEGORY = int(get_env("CANBAN_CATEGORY") or "0")
CANBAN_XP_REWARD = int(get_env("CANBAN_XP_REWARD") or "0")
CANBAN_INVITE_REQUESTER = (get_env("CANBAN_INVITE_REQUESTER") or "false").lower() == "true"
CANBAN_AUTO_MEMBER_EMAIL = get_env("CANBAN_AUTO_MEMBER_EMAIL") or "maxim7012@gmail.com"


def parse_uuid_list(raw_value: str | None) -> list[str]:
    if not raw_value:
        return []
    return [value.strip() for value in raw_value.split(",") if value.strip()]


CANBAN_NOTIFICATION_USER_IDS = parse_uuid_list(get_env("CANBAN_NOTIFICATION_USER_IDS"))
_cached_access_token: str | None = None
_cached_access_token_expires_at: datetime | None = None


def ensure_canban_configured() -> None:
    if CANBAN_API_TOKEN:
        return

    if CANBAN_EMAIL and CANBAN_PASSWORD:
        return

    raise CanbanIntegrationError("Canban is not configured: CANBAN_EMAIL and CANBAN_PASSWORD are required")


async def get_access_token() -> str:
    global _cached_access_token, _cached_access_token_expires_at

    ensure_canban_configured()

    if CANBAN_API_TOKEN:
        return CANBAN_API_TOKEN

    now = datetime.now(timezone.utc)
    if _cached_access_token and _cached_access_token_expires_at and _cached_access_token_expires_at > now:
        return _cached_access_token

    logger.info("Canban login started: email=%s", CANBAN_EMAIL)
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{CANBAN_API_URL}/Auth/login",
            json={
                "email": CANBAN_EMAIL,
                "password": CANBAN_PASSWORD,
            },
        )

    if response.status_code >= 400:
        raise CanbanIntegrationError(
            f"Canban login failed {response.status_code}: {response.text[:500]}"
        )

    payload = response.json()
    access_token = payload.get("accessToken")
    expires_in_seconds = int(payload.get("expiresInSeconds") or 3600)

    if not access_token:
        raise CanbanIntegrationError("Canban login did not return access token")

    _cached_access_token = access_token
    _cached_access_token_expires_at = now + timedelta(seconds=max(expires_in_seconds - 60, 60))
    logger.info("Canban login completed: email=%s expires_in_seconds=%s", CANBAN_EMAIL, expires_in_seconds)

    return access_token


async def get_headers() -> dict[str, str]:
    access_token = await get_access_token()
    return {"Authorization": f"Bearer {access_token}"}


async def request_canban(
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
    files: dict[str, Any] | None = None,
) -> Any:
    logger.info("Canban API request started: method=%s path=%s", method, path)
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.request(
            method,
            f"{CANBAN_API_URL}{path}",
            headers=await get_headers(),
            json=json,
            files=files,
        )

    logger.info(
        "Canban API request completed: method=%s path=%s status_code=%s",
        method,
        path,
        response.status_code,
    )

    if response.status_code >= 400:
        raise CanbanIntegrationError(
            f"Canban API error {response.status_code}: {response.text[:500]}"
        )

    if not response.content:
        return None

    return response.json()


async def get_requester_user_id(email: str) -> str | None:
    if not CANBAN_TEAM_ID:
        return None

    members = await request_canban("GET", f"/Teams/{CANBAN_TEAM_ID}/members")
    normalized_email = email.lower()

    for member in members or []:
        if (member.get("email") or "").lower() == normalized_email:
            return member.get("userId")

    if CANBAN_INVITE_REQUESTER:
        await request_canban(
            "POST",
            f"/Teams/{CANBAN_TEAM_ID}/members/invite",
            json={"email": email},
        )

    return None


async def get_notification_recipient_ids(email: str) -> list[str]:
    recipient_ids = set(CANBAN_NOTIFICATION_USER_IDS)
    requester_user_id = await get_requester_user_id(email)

    if requester_user_id:
        recipient_ids.add(requester_user_id)

    return list(recipient_ids)


def build_customer_board_name(name: str, company: str | None) -> str:
    return (company or name).strip()


def build_customer_team_name(name: str, company: str | None) -> str:
    return (CANBAN_TEAM_NAME or company or name).strip()


async def get_my_teams() -> list[dict[str, Any]]:
    teams = await request_canban("GET", "/Teams/my")
    return teams or []


async def ensure_team_member_by_email(team_id: str, email: str) -> None:
    normalized_email = email.lower()
    members = await request_canban("GET", f"/Teams/{team_id}/members")

    if any((member.get("email") or "").lower() == normalized_email for member in members or []):
        logger.info("Canban team member already exists: team_id=%s email=%s", team_id, email)
        return

    users = await request_canban("GET", "/Users")
    user = next(
        (item for item in users or [] if (item.get("email") or "").lower() == normalized_email),
        None,
    )

    if user and user.get("id"):
        try:
            await request_canban("POST", f"/Teams/{team_id}/members/{user['id']}")
            logger.info("Canban team member added: team_id=%s email=%s user_id=%s", team_id, email, user["id"])
        except CanbanIntegrationError as error:
            if "400" not in str(error) and "409" not in str(error):
                raise
        return

    await request_canban(
        "POST",
        f"/Teams/{team_id}/members/invite",
        json={"email": email},
    )
    logger.info("Canban team member invited: team_id=%s email=%s", team_id, email)


async def try_ensure_team_member_by_email(team_id: str, email: str) -> None:
    try:
        await ensure_team_member_by_email(team_id, email)
    except CanbanIntegrationError:
        logger.exception("Failed to add or invite Canban team member: team_id=%s email=%s", team_id, email)


async def resolve_canban_team_id(name: str, company: str | None) -> str:
    if CANBAN_TEAM_ID:
        await try_ensure_team_member_by_email(CANBAN_TEAM_ID, CANBAN_AUTO_MEMBER_EMAIL)
        return CANBAN_TEAM_ID

    customer_team_name = build_customer_team_name(name, company)
    normalized_customer_team_name = customer_team_name.lower()
    teams = await get_my_teams()

    for item in teams:
        team = item.get("team") or {}
        if (team.get("name") or "").lower() == normalized_customer_team_name:
            await try_ensure_team_member_by_email(team["id"], CANBAN_AUTO_MEMBER_EMAIL)
            logger.info("Canban team found: team_id=%s", team["id"])
            return team["id"]

    team = await request_canban(
        "POST",
        "/Teams",
        json={
            "name": customer_team_name,
            "description": f"Команда для заявок с сайта baxic.ru от заказчика {customer_team_name}",
        },
    )
    team_id = team.get("id") if isinstance(team, dict) else None

    if not team_id:
        raise CanbanIntegrationError("Canban API did not return team id")

    await try_ensure_team_member_by_email(team_id, CANBAN_AUTO_MEMBER_EMAIL)
    logger.info("Canban team created: team_id=%s", team_id)
    return team_id


async def resolve_canban_board_id(name: str, company: str | None) -> str:
    if CANBAN_BOARD_ID:
        return CANBAN_BOARD_ID

    team_id = await resolve_canban_team_id(name, company)
    customer_board_name = build_customer_board_name(name, company)
    normalized_customer_board_name = customer_board_name.lower()
    teams = await get_my_teams()
    selected_team = next(
        (
            item
            for item in teams
            if ((item.get("team") or {}).get("id")) == team_id
        ),
        None,
    )
    boards = selected_team.get("boards") if selected_team else []

    if CANBAN_BOARD_NAME:
        normalized_board_name = CANBAN_BOARD_NAME.lower()
        for board in boards:
            if (board.get("name") or "").lower() == normalized_board_name:
                logger.info("Canban board found by override name: board_id=%s", board["id"])
                return board["id"]

    for board in boards:
        if (board.get("name") or "").lower() == normalized_customer_board_name:
            logger.info("Canban board found: board_id=%s", board["id"])
            return board["id"]

    board = await request_canban(
        "POST",
        "/Boards",
        json={
            "teamId": team_id,
            "name": customer_board_name,
            "description": f"Заявки с сайта baxic.ru от заказчика {customer_board_name}",
        },
    )
    board_id = board.get("id") if isinstance(board, dict) else None

    if not board_id:
        raise CanbanIntegrationError("Canban API did not return board id")

    logger.info("Canban board created: board_id=%s team_id=%s", board_id, team_id)
    return board_id


async def resolve_canban_column_id(name: str, company: str | None) -> str:
    if CANBAN_COLUMN_ID:
        return CANBAN_COLUMN_ID

    board_id = await resolve_canban_board_id(name, company)
    board = await request_canban("GET", f"/Boards/{board_id}")
    columns = board.get("columns") or []
    normalized_column_title = CANBAN_COLUMN_TITLE.lower()

    for column in columns:
        if (column.get("title") or "").lower() == normalized_column_title:
            logger.info("Canban column resolved: column_id=%s board_id=%s", column["id"], board_id)
            return column["id"]

    raise CanbanIntegrationError(f"Canban column was not found: {CANBAN_COLUMN_TITLE}")


def build_quest_description(
    *,
    name: str,
    company: str | None,
    email: str,
    phone: str | None,
    message: str,
    attachment_url: str | None,
) -> str:
    lines = [
        "Заявка с сайта baxic.ru",
        "",
        f"Имя: {name}",
        f"Компания: {company or '-'}",
        f"Email для уведомлений: {email}",
        f"Телефон: {phone or '-'}",
        "",
        "Сообщение:",
        message,
    ]

    if attachment_url:
        lines.extend(["", f"ТЗ / вложение: {attachment_url}"])

    return "\n".join(lines)


async def create_canban_quest(
    *,
    name: str,
    company: str | None,
    email: str,
    phone: str | None,
    message: str,
    attachment: dict[str, Any] | None,
) -> str:
    logger.info("Canban quest creation started: email=%s company=%s", email, company or "-")
    notification_recipient_ids = await get_notification_recipient_ids(email)
    column_id = await resolve_canban_column_id(name, company)
    title_name = company or name
    payload = {
        "title": f"Заявка с сайта: {title_name}",
        "description": build_quest_description(
            name=name,
            company=company,
            email=email,
            phone=phone,
            message=message,
            attachment_url=attachment["url"] if attachment else None,
        ),
        "columnId": column_id,
        "assigneeId": CANBAN_ASSIGNEE_ID,
        "dueDate": None,
        "category": CANBAN_CATEGORY,
        "xpReward": CANBAN_XP_REWARD,
        "isEpic": False,
        "parentEpicId": None,
        "notificationRecipientIds": notification_recipient_ids or None,
        "externalNotificationRecipients": [{"email": email, "displayName": name}],
        "assigneeIds": [CANBAN_ASSIGNEE_ID] if CANBAN_ASSIGNEE_ID else None,
    }
    quest = await request_canban("POST", "/Quests", json=payload)
    quest_id = quest.get("id") if isinstance(quest, dict) else None

    if not quest_id:
        raise CanbanIntegrationError("Canban API did not return quest id")

    if attachment:
        logger.info("Canban quest attachment upload started: quest_id=%s filename=%s", quest_id, attachment["original_name"])
        await request_canban(
            "POST",
            f"/Quests/{quest_id}/attachments",
            files={
                "file": (
                    attachment["original_name"],
                    attachment["content"],
                    attachment["content_type"],
                )
            },
        )
        logger.info("Canban quest attachment upload completed: quest_id=%s", quest_id)

    logger.info("Canban quest creation completed: quest_id=%s column_id=%s", quest_id, column_id)
    return quest_id
