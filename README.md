# Marcación Web DLW — Automatización

Automatiza el registro de marcaciones en el sistema [TimeSys DLW](https://timesysdlwlatam.sys.pe/MarcacionWeb/frmMarcacion.aspx) usando GitHub Actions. Se ejecuta de lunes a viernes en 4 horarios, detecta feriados peruanos y envía un correo de confirmación por cada marcación.

## Horarios automáticos

| Marcación | Ventana real (Lima) | Restricción |
|---|---|---|
| Ingreso mañana | 07:55 – 08:05 | — |
| Salida almuerzo | 13:00 – 13:05 | Nunca antes de la 1:00 pm |
| Reingreso almuerzo | 13:55 – 14:00 | Nunca después de las 2:00 pm |
| Salida tarde | 19:55 – 20:05 | — |

- Solo se ejecuta de **lunes a viernes**.
- Si el día es **feriado nacional peruano**, se omite automáticamente.
- Cada ejecución tiene un retraso aleatorio de ±5 minutos para simular comportamiento humano.

---

## Requisitos previos

- Cuenta en [GitHub](https://github.com)
- Cuenta de Gmail con [verificación en dos pasos activada](https://myaccount.google.com/security)
- DNI registrado en el sistema DLW de tu empresa

---

## Instalación paso a paso

### 1. Hacer fork del repositorio

1. Entra a `https://github.com/DanielPolux/MarcacionWeb`
2. Click en **Fork** (esquina superior derecha)
3. Selecciona tu cuenta y haz click en **Create fork**

> También puedes clonar el repo y subirlo a uno nuevo si prefieres un repositorio privado (recomendado).

---

### 2. Crear una contraseña de aplicación en Gmail

El workflow necesita una contraseña especial de Google para enviar correos vía SMTP. **No uses tu contraseña normal de Gmail.**

1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecciona **Correo** como aplicación y **Otro** como dispositivo → escribe `GitHub Actions`
3. Haz click en **Generar**
4. Copia la clave de 16 caracteres que aparece (solo se muestra una vez)

---

### 3. Configurar los secretos en GitHub

Ve a tu repositorio → **Settings → Secrets and variables → Actions → New repository secret** y agrega estos tres secretos:

| Nombre | Valor |
|--------|-------|
| `DNI` | Tu número de DNI (8 dígitos) |
| `GMAIL_USER` | Tu correo Gmail (ej: `tunombre@gmail.com`) |
| `GMAIL_APP_PASSWORD` | La clave de 16 caracteres del paso anterior |

---

### 4. Verificar que el workflow está activo

1. Ve a la pestaña **Actions** de tu repositorio
2. En el menú izquierdo selecciona **Registrar Ingreso DLW**
3. Si aparece el botón **Enable workflow**, haz click en él

---

### 5. Hacer una prueba manual

Antes de esperar el primer horario automático, verifica que todo funciona:

1. En la pestaña **Actions → Registrar Ingreso DLW**
2. Click en **Run workflow → Run workflow**
3. Espera 2-3 minutos
4. Revisa tu correo — debería llegar una confirmación ✅ o un error ❌

---

## Qué hacer si falla

1. Revisa el correo — incluye la respuesta exacta del sistema DLW y un enlace al log.
2. Desde el log en GitHub Actions puedes hacer click en **Re-run failed jobs** para reintentar.
3. Si falla dos veces seguidas, entra manualmente al sistema DLW.

---

## Personalizar los horarios

Los horarios están definidos en `.github/workflows/registrar_ingreso.yml`. Los cron usan UTC (Perú = UTC-5):

```yaml
- cron: '55 12 * * 1-5'   # 08:00 Lima
- cron: '0 18 * * 1-5'    # 13:00 Lima
- cron: '55 18 * * 1-5'   # 14:00 Lima
- cron: '55 0 * * 1-5'    # 20:00 Lima
```

Para convertir tu horario: **hora Lima + 5 = hora UTC**.

---

## Tecnologías utilizadas

- [Playwright](https://playwright.dev/) — automatización del navegador
- [GitHub Actions](https://docs.github.com/en/actions) — ejecución programada en la nube
- [Nager.Date API](https://date.nager.at/) — detección de feriados peruanos
- [dawidd6/action-send-mail](https://github.com/dawidd6/action-send-mail) — envío de correos SMTP
