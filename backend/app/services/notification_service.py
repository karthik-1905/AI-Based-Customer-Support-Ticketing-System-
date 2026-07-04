"""
Notification service - helpers to create notification records.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
) -> Notification:
    """
    Create and persist a notification record for a user.

    Args:
        db: Active async database session.
        user_id: Target user's ID.
        title: Short notification title.
        message: Full notification message body.
        notification_type: One of info / success / warning / error / application / interview.

    Returns:
        The created Notification ORM object.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(notification)
    # Note: caller is responsible for committing the session.
    # We flush so the ID is populated without committing.
    await db.flush()
    return notification


async def mark_notifications_read(
    db: AsyncSession,
    user_id: int,
    notification_ids: list[int] | None = None,
) -> int:
    """
    Mark notifications as read.

    Args:
        db: Active async database session.
        user_id: The user whose notifications to update.
        notification_ids: If provided, only mark those IDs; otherwise mark all.

    Returns:
        Number of notifications marked as read.
    """
    from sqlalchemy.future import select

    query = select(Notification).where(
        Notification.user_id == user_id,
        Notification.is_read == False,  # noqa: E712
    )
    if notification_ids:
        query = query.where(Notification.id.in_(notification_ids))

    result = await db.execute(query)
    notifications = result.scalars().all()

    for n in notifications:
        n.is_read = True

    await db.flush()
    return len(notifications)
