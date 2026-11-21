import { LocalDB } from './db.js';
import { TelegramService } from './telegram.js';

let db = LocalDB.obtener();

document.addEventListener("DOMContentLoaded", () => {
  renderizarTodo();
  TelegramService.configurarBotonPrincipal("GUARDAR Y ENVIAR REPORTE", ejecutarGuardado);
});

// Navegación por pestañas
window.cambiarTab = function(tabName, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(`view-${tabName}`).classList.add('active');
  btn.classList.add('active');

  if (tabName === 'reportar') {
    TelegramService.configurarBotonPrincipal("GUARDAR Y ENVIAR REPORTE", ejecutarGuardado);
  } else {
    TelegramService.ocultarBotonPrincipal();
  }
};

// Cálculo en tiempo real
window.calcularTotal = function() {
  const idx = document.getElementById('sel-concepto').value;
  const cantidad = parseFloat(document.getElementById('inp-cantidad').value) || 0;
  
  if (db.conceptos[idx]) {
    const concepto = db.conceptos[idx];
    document.getElementById('lbl-unidad').innerText = concepto.unidad;
    const total = cantidad * concepto.precio;
    document.getElementById('lbl-total').innerText = total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
  }
};

function ejecutarGuardado() {
  const cantidad = parseFloat(document.getElementById('inp-cantidad').value);
  if (!cantidad || cantidad <= 0) {
    TelegramService.notificar("⚠️ Ingresa una cantidad válida mayor a 0.");
    return;
  }

  const obra = document.getElementById('sel-obra').value;
  const albanil = document.getElementById('sel-albanil').value;
  const conceptoObj = db.conceptos[document.getElementById('sel-concepto').value];
  const subtotal = cantidad * conceptoObj.precio;

  const nuevoReporte = {
    id: Date.now(),
    fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    obra,
    albanil,
    concepto: conceptoObj.nombre,
    unidad: conceptoObj.unidad,
    cantidad,
    precioUnitario: conceptoObj.precio,
    subtotal
  };

  db = LocalDB.agregarReporte(nuevoReporte);
  document.getElementById('inp-cantidad').value = '';
  renderizarTodo();

  TelegramService.notificar("✅ ¡Reporte guardado con éxito!");
  TelegramService.enviarAlBot(nuevoReporte);
}

// Acciones de Catálogos
window.agregarObra = function() {
  const val = document.getElementById('new-obra').value.trim();
  if (!val) return;
  db = LocalDB.agregarItem('obras', val);
  document.getElementById('new-obra').value = '';
  renderizarTodo();
};

window.agregarAlbanil = function() {
  const val = document.getElementById('new-albanil').value.trim();
  if (!val) return;
  db = LocalDB.agregarItem('albaniles', val);
  document.getElementById('new-albanil').value = '';
  renderizarTodo();
};

window.agregarConcepto = function() {
  const nombre = document.getElementById('new-concepto-nombre').value.trim();
  const unidad = document.getElementById('new-concepto-unidad').value.trim() || 'm²';
  const precio = parseFloat(document.getElementById('new-concepto-precio').value);
  if (!nombre || isNaN(precio) || precio <= 0) return;

  db = LocalDB.agregarItem('conceptos', { id: Date.now(), nombre, unidad, precio });
  document.getElementById('new-concepto-nombre').value = '';
  document.getElementById('new-concepto-unidad').value = '';
  document.getElementById('new-concepto-precio').value = '';
  renderizarTodo();
};

window.eliminarItem = function(tipo, index) {
  if (confirm("¿Estás seguro de eliminar este elemento?")) {
    db = LocalDB.eliminarItem(tipo, index);
    renderizarTodo();
  }
};

window.limpiarHistorial = function() {
  if (confirm("¿Deseas vaciar todo el historial de reportes?")) {
    db = LocalDB.limpiarHistorial();
    renderizarTodo();
  }
};

function renderizarTodo() {
  // Selects del formulario
  document.getElementById('sel-obra').innerHTML = db.obras.map(o => `<option value="${o}">${o}</option>`).join('');
  document.getElementById('sel-albanil').innerHTML = db.albaniles.map(a => `<option value="${a}">${a}</option>`).join('');
  document.getElementById('sel-concepto').innerHTML = db.conceptos.map((c, i) => 
    `<option value="${i}">${c.nombre} ($${c.precio} / ${c.unidad})</option>`
  ).join('');

  // Listas de Catálogos en la pestaña configuración
  document.getElementById('list-obras').innerHTML = db.obras.map((o, i) => `
    <div class="list-item">
      <span>${o}</span>
      <button class="btn btn-danger" onclick="eliminarItem('obras', ${i})">X</button>
    </div>
  `).join('');

  document.getElementById('list-albaniles').innerHTML = db.albaniles.map((a, i) => `
    <div class="list-item">
      <span>${a}</span>
      <button class="btn btn-danger" onclick="eliminarItem('albaniles', ${i})">X</button>
    </div>
  `).join('');

  document.getElementById('list-conceptos').innerHTML = db.conceptos.map((c, i) => `
    <div class="list-item">
      <div>
        <strong>${c.nombre}</strong><br>
        <span class="badge">$${c.precio} / ${c.unidad}</span>
      </div>
      <button class="btn btn-danger" onclick="eliminarItem('conceptos', ${i})">X</button>
    </div>
  `).join('');

  // Historial y Gran Total
  document.getElementById('count-reportes').innerText = db.reportes.length;
  const granTotal = db.reportes.reduce((acc, r) => acc + r.subtotal, 0);
  document.getElementById('gran-total').innerText = granTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const contReportes = document.getElementById('lista-reportes');
  if (db.reportes.length === 0) {
    contReportes.innerHTML = `<p style="color: var(--hint); text-align: center; padding: 20px; font-size: 14px;">No hay avances registrados todavía.</p>`;
  } else {
    contReportes.innerHTML = db.reportes.map(r => `
      <div class="report-card">
        <div class="report-header">
          <span>👷 ${r.albanil}</span>
          <span class="report-money">$${r.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="report-meta">🏗 ${r.obra} • 🕒 ${r.fecha}</div>
        <div style="font-size: 13px; margin-top: 4px;">
          <strong>${r.concepto}:</strong> ${r.cantidad} ${r.unidad} × $${r.precioUnitario}
        </div>
      </div>
    `).join('');
  }

  calcularTotal();
}