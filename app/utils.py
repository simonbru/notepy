from passlib.context import CryptContext

import config as conf


def verify_password(password: str) -> bool:
    pwd_context = CryptContext(schemes=["bcrypt"])
    return pwd_context.verify(password, conf.PASSWORD_HASH)
