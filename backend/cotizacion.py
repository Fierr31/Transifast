def calcular_cotizacion(datos: dict):
    tipoTransporte = datos.get("tipoTransporte", "terrestre")
    tipoTarifa = datos.get("tipoTarifa", "baseRegistrada")
    pais = datos.get("pais", "").strip().lower()
    
    numCajas = int(datos.get("numCajas", 1))
    kgPorCaja = float(datos.get("kgPorCaja", 1.0))
    largo = float(datos.get("largo", 0.0))
    ancho = float(datos.get("ancho", 0.0))
    alto = float(datos.get("alto", 0.0))
    
    tarifaPropia = datos.get("tarifaPropia")

    pesoTotal = numCajas * kgPorCaja
    tarifaBase = 0.0

    if tipoTarifa == "baseRegistrada":
        if tipoTransporte == "terrestre":
            if pesoTotal <= 75.99: tarifaBase = 35.0
            elif pesoTotal <= 100.99: tarifaBase = 32.5
            elif pesoTotal <= 150.99: tarifaBase = 30.0
            elif pesoTotal <= 200.99: tarifaBase = 28.0
            else: tarifaBase = 25.0
        else:
            if pesoTotal <= 75.99: tarifaBase = 8.0
            elif pesoTotal <= 100.99: tarifaBase = 7.5
            elif pesoTotal <= 150.99: tarifaBase = 6.6
            elif pesoTotal <= 200.99: tarifaBase = 6.4
            else: tarifaBase = 6.0
    else:
        # Tarifa propia
        tarifaBase = float(tarifaPropia) if tarifaPropia else 0.0

    costoContinente = 0.0
    if pais == "mexico":
        costoContinente = 0.0
    elif pais in ["canada", "usa", "colombia", "brasil", "argentina", "chile", "peru", "venezuela"]:
        costoContinente = 100.0 if tipoTransporte == "terrestre" else 130.0
    elif pais in ["francia", "alemania", "italia", "suiza", "españa", "espana"]:
        costoContinente = 135.0 if tipoTransporte == "terrestre" else 165.0
    elif pais in ["china", "japon", "india", "tailandia", "taiwan"]:
        costoContinente = 160.0 if tipoTransporte == "terrestre" else 190.0
    elif pais in ["sudafrica", "nigeria", "egipto"]:
        costoContinente = 180.0 if tipoTransporte == "terrestre" else 210.0
    elif pais != "":
        costoContinente = 200.0 if tipoTransporte == "terrestre" else 230.0

    factorVol = 250.0 if tipoTransporte == "terrestre" else 166.667
    pesoVol = largo * ancho * alto * numCajas * factorVol
    
    pesoRealTotal = pesoTotal * tarifaBase
    pesoVolTotal = pesoVol * tarifaBase
    
    totalReal = pesoRealTotal + costoContinente
    totalVol = pesoVolTotal + costoContinente
    
    return {
        "tarifaBase": tarifaBase,
        "costoContinente": costoContinente,
        "pesoTotal": pesoTotal,
        "volumen_m3": round(largo * ancho * alto * numCajas, 3),
        "totalReal": round(totalReal, 2),
        "totalVol": round(totalVol, 2)
    }
