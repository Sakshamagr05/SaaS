from fastapi import Depends, HTTPException
from sqlmodel import Session

from src.database import get_session
from src.models.account import Account


def get_account_or_404(
    account_id: int,
    session: Session = Depends(get_session),
) -> Account:
    account = session.get(Account, account_id)

    if account is None:
        raise HTTPException(
            status_code=404,
            detail="Account not found",
        )

    return account