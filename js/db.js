const STORAGE_KEY = "destajos_local_db_v1";

const defaultData = {
  obras: ["Residencial Las Palmas", "Torre Médica Colima", "Bodega Industrial Sur"],
  albaniles: ["Juan Pérez", "Carlos Mendoza", "Roberto Gómez"],
  conceptos: [
    { id: 1, nombre: "Colado de losa", unidad: "m²", precio: 180 },
    { id: 2, nombre: "Aplanado de muros", unidad: "m²", precio: 95 },
    { id: 3, nombre: "Colocación de piso cerámico", unidad: "m²", precio: 120 },
    { id: 4, nombre: "Excavación de cepa", unidad: "ml", precio: 110 }
  ],
  reportes: []
};

export const LocalDB = {
  obtener() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.guardar(defaultData);
      return defaultData;
    }
    return JSON.parse(data);
  },

  guardar(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  agregarReporte(nuevoReporte) {
    const db = this.obtener();
    db.reportes.unshift(nuevoReporte);
    this.guardar(db);
    return db;
  },

  agregarItem(tipo, item) {
    const db = this.obtener();
    db[tipo].push(item);
    this.guardar(db);
    return db;
  },

  eliminarItem(tipo, index) {
    const db = this.obtener();
    db[tipo].splice(index, 1);
    this.guardar(db);
    return db;
  },

  limpiarHistorial() {
    const db = this.obtener();
    db.reportes = [];
    this.guardar(db);
    return db;
  }
};