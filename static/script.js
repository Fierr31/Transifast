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

  async function calcularCotizacion() {
    const btnCalc = document.getElementById("btnCalcular");
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

    if (btnCalc) {
      btnCalc.textContent = "Calculando...";
      btnCalc.disabled = true;
    }

    try {
      const response = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoTransporte,
          tipoTarifa,
          tarifaPropia,
          pais,
          numCajas,
          kgPorCaja,
          largo,
          ancho,
          alto
        })
      });

      if (!response.ok) throw new Error("Error en servidor API");
      
      const data = await response.json();

      document.getElementById("resultado").innerHTML = `
        <p>Cotización por peso real: <strong>${data.totalReal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</strong></p>
        <p>Cotización por peso volumétrico: <strong>${data.totalVol.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</strong></p>
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
              <td>${data.pesoTotal.toFixed(2)}</td>
              <td>${data.volumen_m3.toFixed(3)}</td>
              <td>${data.tarifaBase.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              <td>${data.costoContinente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              <td>${data.totalReal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              <td>${data.totalVol.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            </tr>
          </tbody>
        </table>
      `;

    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al calcular la cotización.");
    } finally {
      if (btnCalc) {
        btnCalc.textContent = "Calcular Cotización";
        btnCalc.disabled = false;
      }
    }
  }

  const btnToggleSidebar = document.getElementById("btnToggleSidebar");
  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });
  }

  const btnReiniciar = document.getElementById("btnReiniciar");
  if (btnReiniciar) {
    btnReiniciar.addEventListener("click", () => {
      document.getElementById("tipoTransporte").value = "";
      document.getElementById("tipoTarifa").value = "";
      document.getElementById("paisDestino").value = "";
      document.getElementById("numCajas").value = "1";
      document.getElementById("kgPorCaja").value = "1";
      document.getElementById("largo").value = "";
      document.getElementById("ancho").value = "";
      document.getElementById("alto").value = "";
      document.getElementById("tarifaPropia").value = "";

      document.getElementById("tarifaPropiaDiv").style.display = "none";
      document.getElementById("resultado").innerHTML = "";
      document.getElementById("tablaDesglose").innerHTML = "";

      document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
      document.getElementById("step1").classList.add("active");
    });
  }

  // --- Lógica de selectores dinámicos de Ciudades ---
  const edoOrigen = document.getElementById("edoOrigen");
  const ciudadOrigen = document.getElementById("ciudadOrigen");

  if (edoOrigen && ciudadOrigen) {
    edoOrigen.addEventListener("change", async (e) => {
      const estadoId = e.target.value;
      ciudadOrigen.innerHTML = '<option value="">-- Cargando... --</option>';
      if (!estadoId) {
        ciudadOrigen.innerHTML = '<option value="">-- Selecciona --</option>';
        return;
      }
      try {
        const response = await fetch(`/api/ciudades/${estadoId}`);
        const data = await response.json();

        ciudadOrigen.innerHTML = '<option value="">-- Selecciona --</option>';
        data.ciudades.forEach(ciudad => {
          const option = document.createElement("option");
          option.value = ciudad.id;
          option.textContent = ciudad.nombre;
          ciudadOrigen.appendChild(option);
        });
      } catch (err) {
        console.error("Error cargando ciudades de origen:", err);
        ciudadOrigen.innerHTML = '<option value="">-- Error al cargar --</option>';
      }
    });
  }

  const edoDestino = document.getElementById("edoDestino");
  const ciudadDestino = document.getElementById("ciudadDestino");

  if (edoDestino && ciudadDestino) {
    edoDestino.addEventListener("change", async (e) => {
      const estadoId = e.target.value;
      ciudadDestino.innerHTML = '<option value="">-- Cargando... --</option>';
      if (!estadoId) {
        ciudadDestino.innerHTML = '<option value="">-- Selecciona --</option>';
        return;
      }
      try {
        const response = await fetch(`/api/ciudades/${estadoId}`);
        const data = await response.json();

        ciudadDestino.innerHTML = '<option value="">-- Selecciona --</option>';
        data.ciudades.forEach(ciudad => {
          const option = document.createElement("option");
          option.value = ciudad.id;
          option.textContent = ciudad.nombre;
          ciudadDestino.appendChild(option);
        });
      } catch (err) {
        console.error("Error cargando ciudades de destino:", err);
        ciudadDestino.innerHTML = '<option value="">-- Error al cargar --</option>';
      }
    });
  }

  // --- Lógica de Consulta de Ruta ---
  const btnConsultarRuta = document.getElementById("btnConsultarRuta");
  if (btnConsultarRuta) {
    btnConsultarRuta.addEventListener("click", async () => {
      const edoOrigen = document.getElementById("edoOrigen").value;
      const ciudadOrigen = document.getElementById("ciudadOrigen").value;
      const edoDestino = document.getElementById("edoDestino").value;
      const ciudadDestino = document.getElementById("ciudadDestino").value;
      const vehiculos = document.getElementById("vehiculos").value;

      if (!edoOrigen || !ciudadOrigen || !edoDestino || !ciudadDestino || !vehiculos) {
        alert("Completa todos los campos para consultar la ruta.");
        return;
      }

      btnConsultarRuta.textContent = "Consultando...";
      btnConsultarRuta.disabled = true;

      try {
        const response = await fetch(`/api/ruta?edoOrigen=${edoOrigen}&ciudadOrigen=${ciudadOrigen}&edoDestino=${edoDestino}&ciudadDestino=${ciudadDestino}&vehiculo=${vehiculos}`);
        const data = await response.json();

        const resRuta = document.getElementById("resultadoRuta");
        const wrapRuta = document.getElementById("resultadoRutaWrapper");
        if (wrapRuta) wrapRuta.style.display = "block";

        let rutaHTML = `<p style="color: #94a3b8; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">${data.ruta || 'Ruta consultada'}</p>`;

        if (data.totales) {
          rutaHTML += `
            <div style="display: flex; justify-content: space-around; margin-top: 16px; flex-wrap: wrap; gap: 16px;">
              <div>
                <p style="margin:0; color:#94a3b8; font-size:14px;">Distancia Total</p>
                <strong style="font-size:24px; color:#fff;">${data.totales.distancia_km || 0} km</strong>
              </div>
              <div>
                <p style="margin:0; color:#94a3b8; font-size:14px;">Tiempo Estimado (Horas)</p>
                <strong style="font-size:24px; color:#fff;">${data.totales.tiempo || '00:00'}</strong>
              </div>
              <div>
                <p style="margin:0; color:#94a3b8; font-size:14px;">Costo Casetas</p>
                <strong style="font-size:24px; color:#fff;">${(data.totales.costo || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</strong>
              </div>
            </div>
          `;
        }
        resRuta.innerHTML = rutaHTML;

        let tramosHtml = `
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Carretera</th>
                <th>Distancia (km)</th>
                <th>Tiempo</th>
                <th>Caseta</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
        `;

        if (data.tramos && data.tramos.length > 0) {
          data.tramos.forEach(tramo => {
            tramosHtml += `
              <tr>
                <td>${tramo.nombre || '-'}</td>
                <td>${tramo.estado || '-'}</td>
                <td>${tramo.carretera || '-'}</td>
                <td>${tramo.distancia_km || 0}</td>
                <td>${tramo.tiempo || '-'}</td>
                <td>${tramo.caseta || '-'}</td>
                <td>${(tramo.costo || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              </tr>
            `;
          });
        } else {
          tramosHtml += `<tr><td colspan="7" style="text-align: center;">No se encontraron tramos</td></tr>`;
        }

        tramosHtml += `</tbody></table>`;
        document.getElementById("tablaRuta").innerHTML = tramosHtml;

      } catch (error) {
        console.error(error);
        alert("Ocurrió un error al consultar la ruta. Revisa la consola para más detalles.");
      } finally {
        btnConsultarRuta.textContent = "Consultar Ruta";
        btnConsultarRuta.disabled = false;
      }
    });
  }

  const btnReiniciarRuta = document.getElementById("btnReiniciarRuta");
  if (btnReiniciarRuta) {
    btnReiniciarRuta.addEventListener("click", () => {
      document.getElementById("edoOrigen").value = "";
      document.getElementById("ciudadOrigen").innerHTML = '<option value="">-- Selecciona --</option>';
      document.getElementById("edoDestino").value = "";
      document.getElementById("ciudadDestino").innerHTML = '<option value="">-- Selecciona --</option>';
      document.getElementById("vehiculos").value = "";

      const wrapRuta = document.getElementById("resultadoRutaWrapper");
      if (wrapRuta) wrapRuta.style.display = "none";
      
      document.getElementById("resultadoRuta").innerHTML = "";
      document.getElementById("tablaRuta").innerHTML = "";
    });
  }
});
