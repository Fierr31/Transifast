import requests
from bs4 import BeautifulSoup

session = requests.Session()

url = "https://app.sct.gob.mx/sibuac_internet/ControllerUI"

headers = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/x-www-form-urlencoded"
}

# Paso 1: inicializar sesión (IMPORTANTE)
session.get(url + "?action=cmdEscogeRuta", headers=headers)


"""
ciudadDestino = "10010"
ciudadOrigen = "22060"
edoOrigen = "22"
edoDestino = "10"
vehiculos = "4"
"""

def parsear_ruta(rows):
    resultado = {
        "ruta": None,
        "tramos": [],
        "totales": {}
    }

    headers = None

    for row in rows:
        if not row:
            continue

        # Detectar título
        if "Ruta de" in row[0]:
            resultado["ruta"] = row[0]
            continue

        # Detectar encabezados
        if row[0] == "Nombre":
            headers = row
            continue

        # Detectar totales
        if row[0] == "Totales":
            resultado["totales"] = {
                "distancia_km": float(row[1].replace(",", "")),
                "tiempo": row[2],
                "costo": float(row[4].replace(",", "")) if row[4] else 0
            }
            continue

        # Filas normales (tramos)
        if headers and len(row) >= 7:
            tramo = {
                "nombre": row[0],
                "estado": row[1],
                "carretera": row[2],
                "distancia_km": float(row[3].replace(",", "")),
                "tiempo": row[4],
                "caseta": row[5] if row[5] else None,
                "costo": float(row[6].replace(",", "")) if row[6] else 0
            }
            resultado["tramos"].append(tramo)

    return resultado



def consulta(edoOrigen, edoDestino, ciudadOrigen, ciudadDestino, vehiculos):
    rows = []

    # Paso 2: calcular ruta directamente
    payload = {
        "action": "cmdSolRutas",
        "tipo": "1",
        "edoOrigen": {edoOrigen},
        "edoDestino": {edoDestino},
        "ciudadOrigen": {ciudadOrigen},
        "ciudadDestino": {ciudadDestino},
        "puntosIntermedios": "null",
        "vehiculos": {vehiculos},
        "red": "simplificada",
        "calculaRendimiento": "null"
    }


    response = session.post(url, data=payload, headers=headers)

    html = response.text

    soup = BeautifulSoup(html, "html.parser")

    # Buscar tablas (hay varias)
    tables = soup.find_all("table")

    for row in tables[3].find_all("tr"):
        cols = [td.get_text(strip=True).replace("\xa0", " ") for td in row.find_all(["td","th"])]
        rows.append(cols)

    data = parsear_ruta(rows)

    return data
#consulta(payload)