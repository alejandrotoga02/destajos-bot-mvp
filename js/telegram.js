export const TelegramService = {
  init() {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      return tg;
    }
    return null;
  },

  configurarBotonPrincipal(texto, callback) {
    const tg = this.init();
    if (tg && tg.MainButton) {
      tg.MainButton.text = texto;
      tg.MainButton.show();
      // Limpiar listeners previos y asignar el nuevo
      tg.MainButton.offClick();
      tg.MainButton.onClick(callback);
    }
  },

  ocultarBotonPrincipal() {
    const tg = this.init();
    if (tg && tg.MainButton) tg.MainButton.hide();
  },

  notificar(mensaje) {
    const tg = this.init();
    tg ? tg.showAlert(mensaje) : alert(mensaje);
  },

  enviarAlBot(payload) {
    const tg = this.init();
    if (tg && tg.initData) {
      tg.sendData(JSON.stringify(payload));
    }
  }
};
