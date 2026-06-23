
const { chromium } = require('playwright');
const path = require('path');

const URL = 'https://timesysdlwlatam.sys.pe/MarcacionWeb/frmMarcacion.aspx';
const TIMEOUT = 15000;
const SELECTORS = {
  dni:      '#txtnumdoc',
  boton:    '#btnRegIngreso',
  mensaje:  '#divmensaje',
};

async function registrarIngreso(dni) {
  if (!dni) throw new Error('DNI requerido. Uso: node registrar_ingreso.js <DNI>  o  DNI=12345678 node registrar_ingreso.js');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🌐 Navegando al sitio...');
    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    console.log('⌨️  Ingresando DNI...');
    await page.waitForSelector(SELECTORS.dni, { timeout: TIMEOUT });
    await page.fill(SELECTORS.dni, '');
    await page.type(SELECTORS.dni, dni, { delay: 120 });

    console.log('🔄 Disparando eventos ASP.NET...');
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      ['keyup', 'change', 'blur'].forEach((evt) =>
        el.dispatchEvent(new Event(evt, { bubbles: true }))
      );
    }, SELECTORS.dni);

    console.log('⏳ Esperando botón habilitado...');
    await page.waitForFunction(
      (sel) => { const btn = document.querySelector(sel); return btn && !btn.disabled; },
      SELECTORS.boton,
      { timeout: TIMEOUT }
    );

    console.log('🖱️  Registrando ingreso...');
    await page.click(SELECTORS.boton);

    console.log('⏳ Esperando respuesta del sistema...');
    await page.waitForFunction(
      (sel) => { const div = document.querySelector(sel); return div && div.innerText.trim().length > 0; },
      SELECTORS.mensaje,
      { timeout: TIMEOUT }
    );

    const texto = await page.$eval(SELECTORS.mensaje, (el) => el.innerText.trim());
    console.log('📢 Respuesta del sistema:\n' + texto);
    return texto;

  } catch (error) {
    const captura = path.join(__dirname, `error_${Date.now()}.png`);
    await page.screenshot({ path: captura }).catch(() => {});
    console.error(`❌ Error en automatización (captura guardada: ${captura}):`, error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

const dni = process.argv[2] || process.env.DNI;
registrarIngreso(dni).catch(() => process.exit(1));
