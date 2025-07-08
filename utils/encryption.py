import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import os

def encrypt_file(file_content: bytes, password: str) -> tuple[bytes, str]:
    """Encrypt file content using password-based encryption."""
    salt = os.urandom(16)
    key = _derive_key(password, salt)
    f = Fernet(key)
    encrypted_data = f.encrypt(file_content)
    return encrypted_data, base64.b64encode(salt).decode('utf-8')

def decrypt_file(encrypted_data: bytes, password: str, salt: str) -> bytes:
    """Decrypt file content using password and salt."""
    try:
        salt_bytes = base64.b64decode(salt.encode('utf-8'))
        key = _derive_key(password, salt_bytes)
        f = Fernet(key)
        return f.decrypt(encrypted_data)
    except Exception as e:
        print(f"Decryption Error: {e}")
        return None

def _derive_key(password: str, salt: bytes) -> bytes:
    """Derive encryption key from password and salt."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))