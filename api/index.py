# federated-sagin-orchestrator/api/index.py

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx
import os

# === SỬA LỖI: SỬ DỤNG CỔNG 8888 VÀ BIẾN MÔI TRƯỜNG ĐÚNG ===
COMPUTE_SERVER_URL = os.getenv("COMPUTE_SERVER_URL_FL", "http://14.232.208.84:8888")

app = FastAPI(title="PoC#3 Vercel Proxy Gateway")

@app.get("/api/hello")
def get_hello():
    return JSONResponse(content={"message": f"PoC#3 Proxy is running and configured for: {COMPUTE_SERVER_URL}"})

@app.post("/api/start-training")
async def proxy_start_training(): # Không cần `request: Request` vì không có body
    """Proxy cho endpoint /start-training."""
    try:
        async with httpx.AsyncClient() as client:
            # Gửi request POST đến server tính toán
            response = await client.post(f"{COMPUTE_SERVER_URL}/start-training", timeout=15.0)
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"Compute server error: {exc.response.text}")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Could not connect to compute server: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal proxy error: {str(exc)}")

@app.get("/api/get-status")
async def proxy_get_status():
    """Proxy cho endpoint /get-status."""
    try:
        async with httpx.AsyncClient() as client:
            # Gửi request GET đến server tính toán
            response = await client.get(f"{COMPUTE_SERVER_URL}/get-status", timeout=10.0)
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"Compute server error: {exc.response.text}")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Could not connect to compute server: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal proxy error: {str(exc)}")
