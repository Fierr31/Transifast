// Configura los eventos apenas carga la página
document.addEventListener("DOMContentLoaded", function () {
  const btn1 = document.getElementById("btnStep1");
  const btn2 = document.getElementById("btnStep2");
  const btnCalc = document.getElementById("btnCalcular");

  btn1.addEventListener("click", () => nextStep("step1", "step2"));
  btn2.addEventListener("click", () => nextStep("step2", "step3"));
  btnCalc.addEventListener("click", calcularCotizacion);

  function autoEncadre(current) {
    const step = document.getElementById(current);
    const stepHeight = step.offsetHeight;
    const viewport = window.innerHeight;

    if (stepHeight > viewport) {
      step.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      step.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function nextStep(current, next) {
    const tipoTransporte = document.getElementById("tipoTransporte").value;
    const tipoTarifa = document.getElementById("tipoTarifa").value;

    if (current === "step1" && tipoTransporte === "") {
      alert("Selecciona el tipo de transporte");
      return;
    }

    if (current === "step2" && tipoTarifa === "") {
      alert("Selecciona el tipo de tarifa");
      return;
    }

    if (tipoTarifa === "propia") {
      document.getElementById("tarifaPropiaDiv").style.display = "block";
    } else {
      document.getElementById("tarifaPropiaDiv").style.display = "none";
    }

    document.getElementById(current).classList.remove("active");
    document.getElementById(next).classList.add("active");
  }

  function calcularCotizacion() {
    const tipoTransporte = document.getElementById("tipoTransporte").value;
    const tipoTarifa = document.getElementById("tipoTarifa").value;
    const pais = document.getElementById("paisDestino").value.trim();
    const numCajas = Number(document.getElementById("numCajas").value);
    const kgPorCaja = Number(document.getElementById("kgPorCaja").value);
    const largo = Number(document.getElementById("largo").value) / 100;
    const ancho = Number(document.getElementById("ancho").value) / 100;
    const alto = Number(document.getElementById("alto").value) / 100;
    const tarifaPropia =
      tipoTarifa === "propia"
        ? Number(document.getElementById("tarifaPropia").value)
        : null;

    if (!pais || !numCajas || !kgPorCaja || !largo || !ancho || !alto) {
      alert("Completa todos los campos");
      return;
    }

    let tarifaBase;
    const pesoTotal = numCajas * kgPorCaja;

    if (tipoTarifa === "baseRegistrada") {
      if (tipoTransporte === "terrestre") {
        if (pesoTotal <= 75.99) tarifaBase = 35;
        else if (pesoTotal <= 100.99) tarifaBase = 32.5;
        else if (pesoTotal <= 150.99) tarifaBase = 30;
        else if (pesoTotal <= 200.99) tarifaBase = 28;
        else tarifaBase = 25;
      } else {
        if (pesoTotal <= 75.99) tarifaBase = 8;
        else if (pesoTotal <= 100.99) tarifaBase = 7.5;
        else if (pesoTotal <= 150.99) tarifaBase = 6.6;
        else if (pesoTotal <= 200.99) tarifaBase = 6.4;
        else tarifaBase = 6;
      }
    } else {
      tarifaBase = tarifaPropia;
    }

    let costoContinente = 0;
    const paisLower = pais.toLowerCase();

    if (paisLower === "mexico") costoContinente = 0;
    else if (
      [
        "canada",
        "usa",
        "colombia",
        "brasil",
        "argentina",
        "chile",
        "peru",
        "venezuela",
      ].includes(paisLower)
    )
      costoContinente = tipoTransporte === "terrestre" ? 100 : 130;
    else if (
      ["francia", "alemania", "italia", "suiza", "españa"].includes(paisLower)
    )
      costoContinente = tipoTransporte === "terrestre" ? 135 : 165;
    else if (["china", "japon", "india", "tailandia"].includes(paisLower))
      costoContinente = tipoTransporte === "terrestre" ? 160 : 190;
    else if (["sudafrica", "nigeria", "egipto"].includes(paisLower))
      costoContinente = tipoTransporte === "terrestre" ? 180 : 210;
    else costoContinente = tipoTransporte === "terrestre" ? 200 : 230;

    const factorVol = tipoTransporte === "terrestre" ? 250 : 166.667;
    const pesoVol = largo * ancho * alto * numCajas * factorVol;
    const pesoRealTotal = pesoTotal * tarifaBase;
    const pesoVolTotal = pesoVol * tarifaBase;
    const totalReal = pesoRealTotal + costoContinente;
    const totalVol = pesoVolTotal + costoContinente;

    document.getElementById("resultado").innerHTML = `
      <p>Cotización por peso real: <strong>$${totalReal.toFixed(2)}</strong></p>
      <p>Cotización por peso volumétrico: <strong>$${totalVol.toFixed(
        2
      )}</strong></p>
    `;

    document.getElementById("tablaDesglose").innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Tipo transporte</th>
            <th>País</th>
            <th>Cajas</th>
            <th>Peso total (kg)</th>
            <th>Volumen (m³)</th>
            <th>Tarifa (MXN/kg)</th>
            <th>Adicional continente</th>
            <th>Total peso real</th>
            <th>Total peso volumétrico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${tipoTransporte.toUpperCase()}</td>
            <td>${pais}</td>
            <td>${numCajas}</td>
            <td>${pesoTotal.toFixed(2)}</td>
            <td>${(largo * ancho * alto * numCajas).toFixed(3)}</td>
            <td>$${tarifaBase.toFixed(2)}</td>
            <td>$${costoContinente.toFixed(2)}</td>
            <td>$${totalReal.toFixed(2)}</td>
            <td>$${totalVol.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }
});
