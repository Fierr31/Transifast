from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional
import uvicorn
from backend.ciudades import ciudad
from backend.apiruta import consulta
from backend.cotizacion import calcular_cotizacion

app = FastAPI()

class CotizacionRequest(BaseModel):
    tipoTransporte: str
    tipoTarifa: str
    tarifaPropia: Optional[float] = None
    pais: str
    numCajas: int
    kgPorCaja: float
    largo: float
    ancho: float
    alto: float


app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/ciudades/{estado_id}")
async def get_ciudades(estado_id: str):
    lista_ciudades = ciudad(estado_id)
    return {"ciudades": lista_ciudades}

@app.get("/api/ruta")
async def get_ruta(edoOrigen: str, ciudadOrigen: str, edoDestino: str, ciudadDestino: str, vehiculo: str):
    # Llama a la funcion consulta importada desde backend/apiruta.py
    data = consulta(edoOrigen, edoDestino, ciudadOrigen, ciudadDestino, vehiculo)
    return data

@app.post("/api/cotizar")
async def cotizar(req: CotizacionRequest):
    return calcular_cotizacion(req.dict())


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
