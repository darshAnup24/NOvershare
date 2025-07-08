from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from utils.encryption import encrypt_file, decrypt_file

router = APIRouter()

@router.post("/encrypt")
async def encrypt_endpoint(file: UploadFile = File(...), password: str = Form(...)):
    try:
        file_content = await file.read()
        encrypted_data, salt = encrypt_file(file_content, password)

        def iter_file():
            yield encrypted_data

        return StreamingResponse(
            iter_file(),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={file.filename}.enc",
                "X-Salt": salt
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/decrypt")
async def decrypt_endpoint(
    file: UploadFile = File(...),
    password: str = Form(...),
    salt: str = Form(...)
):
    try:
        encrypted_data = await file.read()
        decrypted_data = decrypt_file(encrypted_data, password, salt)
        
        if decrypted_data is None:
            raise HTTPException(status_code=400, detail="Incorrect password or corrupted file")

        def iter_file():
            yield decrypted_data

        filename = file.filename[:-4] if file.filename.endswith(".enc") else file.filename
        return StreamingResponse(
            iter_file(),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))