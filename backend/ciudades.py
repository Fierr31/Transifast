import requests
from bs4 import BeautifulSoup
import re
import json

def limpiar_texto(texto):
    texto = texto.replace("\xa0", " ")
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto

session = requests.Session()

url = "https://app.sct.gob.mx/sibuac_internet/ControllerUI"

headers = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/x-www-form-urlencoded"
}

# Paso 1: inicializar sesión (IMPORTANTE)
session.get(url + "?action=cmdEscogeRuta", headers=headers)

#edoOrigen = "2"

def ciudad(edoOrigen):

    payload = {
        "action": "cmdEscogeRuta",
        "tipo": "1",
        "edoOrigen": {edoOrigen},
        "edoDestino": "0",
        "ciudadOrigen": "0",
        "ciudadDestino": "0",
        "puntosIntermedios": "null",
        "vehiculos": "4",
        "red": "simplificada",
        "calculaRendimiento": "null"
    }

    response = session.post(url, data=payload, headers=headers)

    html = response.text

    soup = BeautifulSoup(html, "html.parser")


    select = soup.find("select", {"name": "ciudadOrigen"})


    def get_texto_directo(tag):
        return "".join([
            t.strip() for t in tag.contents 
            if isinstance(t, str)
        ])

    ciudades = []

    for option in select.find_all("option"):
        valor = option.get("value")

        if valor == "0":
            continue

        texto = get_texto_directo(option)

        if texto:
            ciudades.append({
                "id": valor,
                "nombre": texto
            })

    # Guardar JSON
    #with open("ciudades.json", "w", encoding="utf-8") as f:
    #    json.dump(ciudades, f, ensure_ascii=False, indent=2)

    return ciudades