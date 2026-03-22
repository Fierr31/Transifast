from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from backend.ciudades import ciudad
from backend.apiruta import consulta

app = FastAPI()

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

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
