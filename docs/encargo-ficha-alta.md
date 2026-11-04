CONTEXTO
garba-advisor es la herramienta que Christian Garba, asesor Allianz, comparte EN VIVO por Google Meet en asesorías de PPR. Las asesorías se graban con Fathom, y la pantalla compartida queda en el video.
Trabajas en el repo, en la rama main (HEAD 7fa6908). La vista moderna es «Tu plan en vivo» (lienzo.js / lienzo.css), una capa que escribe en los inputs originales de index.html.
Problema real: con un cliente que ya había decidido («David»), no hubo forma de guardar los datos del alta mientras el portal de Allianz no estaba disponible, y se perdió información. Christian quiere capturar la ficha de alta en la llamada, guardarla en su Mac como PDF y después pasarla a la interfaz de Allianz.

OBJETIVO
Un módulo nuevo, «Ficha de alta»: ficha-alta.js y ficha-alta.css, cargados en index.html después de lienzo.js.

REGLAS DURAS
- No cambies fórmulas financieras (calcAccum, calcularPMTRequerido, updateSuggestion, pmtParaFondo65, calcRet, actualizarReporteBase) ni su código fuente: tests/projection-static.cjs exige fuente idéntica.
- No rompas la precaptura existente (gaPreopenView, preopenData, GaV2) ni `?flujo=clasico`. No borres archivos ni funciones.
- Misma identidad visual que lienzo.css: paleta --navy #001868, --blue #0830E8 y Montserrat. Nada flotante con posición fija encima de la vista, salvo la propia vista de la ficha, que ocupa la pantalla.
- Todos los textos visibles en español.
- Los estilos van siempre bajo #gaFicha (no repitas el error de reglas sin limitar). Los ids de SVG o elementos deben ser únicos y empezar con «fa».

ENTRADAS (botones)
1. En el menú «⋯» del lienzo (lienzo.js, arreglo `actions` cerca de `$('lMenuItems')`), agrega «Iniciar captura» como PRIMERA opción.
2. En el Acto 3 del lienzo, al elegir «Iniciar hoy»: conserva la lógica actual que registra la decisión (GaShell.postCalcChecks.decision='today'), pero en el flujo moderno abre la Ficha de alta en lugar de gaPreopenView. Deja debajo de la ficha un enlace discreto «Abrir precaptura anterior» que lleve a la vista vieja.
3. Expón window.GaFicha = { open, close }.

LA VISTA
- Pantalla completa dentro de la página: un <section id="gaFicha"> agregado a body, oculto por defecto.
  - Agrega `:not(#gaFicha)` al selector de lienzo.css que oculta los hijos de body: `body.ga-lienzo> :not(#gaLienzo)...{display:none!important}`.
  - Mientras la ficha está abierta, oculta #gaLienzo.
- Arriba: título «Ficha de alta — OptiMaxx Plus Allianz», nombre del cliente, avance general (%) y botón «← Volver a la asesoría».
- A la izquierda: lista de las 10 secciones con su avance (por ejemplo 4/6), para saltar a cualquiera.
- Al centro: UNA sección a la vez, con campos grandes y fáciles de llenar, y botones «Anterior» y «Siguiente». La tecla Enter pasa al siguiente campo.
- Siempre visible abajo: «Guardar en mi Mac (PDF)» como botón principal y «Copiar ficha».
- Debe caber sin desplazamiento de página en 1440×780. Si una sección no cabe, se desplaza solo esa columna.

SECCIONES Y CAMPOS (en este orden y con estos textos)
1. Información personal
   - Nombre completo (como aparece en INE)
   - Fecha de nacimiento (DD/MM/AAAA)
   - Nacionalidad (por defecto «Mexicana»)
   - Género (Femenino / Masculino / Otro)
   - RFC
   - CURP (si lo solicita el portal)
2. Información de contacto
   - Teléfono celular
   - Correo electrónico
3. Domicilio
   - Calle y número exterior
   - Número interior (si aplica)
   - Colonia
   - Código postal
   - Municipio / Alcaldía
   - Ciudad
   - Estado
   - País (por defecto «México»)
4. Información laboral
   - Giro o actividad económica
   - Ocupación / profesión
   - Principal fuente de ingresos
   - Nombre de empresa o negocio (si aplica)
5. Información del plan
   - Producto: OptiMaxx Plus (fijo)
   - Régimen fiscal (Artículo 93 / Artículo 151 / Ambos)
   - Aportación mensual (MXN)
   - Plazo de aportaciones (10 / 15 / 20 / 25 años)
6. Perfil de inversión
   - Nivel de estudios (Primaria / Secundaria / Preparatoria / Licenciatura / Posgrado / Otro)
   - Nota fija: «Las demás preguntas del perfilamiento se responden directamente en el portal de Allianz.»
7. Beneficiarios: 3 bloques, cada uno con Nombre completo, Parentesco, Fecha de nacimiento (si se solicita) y Porcentaje.
   - El tercero va como «(si aplica)».
   - Muestra la suma en vivo: «Suma: 80 % · falta 20 %», «100 % ✓» o «excede por 10 %».
   - Si la suma no da 100 %, aparece un aviso visible, pero sin bloquear.
8. Documentación (casillas)
   - Identificación oficial vigente
   - Comprobante de domicilio
   - RFC / constancia fiscal, si se requiere
   - Documentación complementaria solicitada por Allianz
   - Confirmación de que los datos coinciden con los documentos
9. Primer pago
   - Importe inicial (por defecto la aportación mensual)
   - ¿Desea realizar el primer pago en ese momento? (Sí / No)
   - Tipo de cargo (Tarjeta de crédito / Tarjeta de débito / Cuenta de cheques)
   - Si es tarjeta: Número de tarjeta y Vencimiento (MM/AA)
   - Si es cuenta de cheques: CLABE (18 dígitos)
   - Institución financiera
   - Fecha solicitada de aplicación del cobro
10. Validación final con el cliente (casillas)
   - Confirmó sus datos personales
   - Revisó aportación, periodicidad y plazo
   - Revisó condiciones, costos y restricciones
   - Confirmó beneficiarios y porcentajes
   - Revisó el perfil de inversión
   - Recibió o revisó la documentación correspondiente
   - Se aclararon sus dudas
   - Confirmó su decisión de continuar
   - Revisó y autorizó la solicitud mediante el procedimiento de Allianz
   - Se confirmó el estado del primer pago
   Más «Estado real del proceso» (una opción): Datos recopilados / Solicitud en captura / Solicitud autorizada / Pago pendiente / Pago confirmado / Pendiente de aclaración.

PRELLENADO (solo campos vacíos, nunca sobrescribas lo que ya se escribió)
- nombre ← gaName
- fecha de nacimiento ← gaBirth o preBirth
- teléfono ← gaPhone o prePhone
- correo ← gaEmail o preEmail
- ocupación ← gaProfession
- régimen ← regimenFiscal o gaTax (151 / 93)
- aportación ← pmt
- plazo ← years
- importe inicial ← pmt
Cuando la sesión viene de Punto de Partida: usa window.__gaKnown si trae datos equivalentes.

DATOS SENSIBLES (obligatorio)
- Número de tarjeta, vencimiento y CLABE:
  - inputs enmascarados (type="password", autocomplete="off"), con un botón de ojo para mostrar u ocultar; por defecto ocultos;
  - NUNCA se guardan en localStorage, sessionStorage, IndexedDB, la sesión (data() / gaAdvisorSession / gaRecentSessions) ni el panel del asesor: viven solo en memoria;
  - al recargar la página se pierden, y la sección 9 lo dice en texto chico: «Por seguridad, los datos de la tarjeta o CLABE no se guardan en el navegador: solo van en el PDF.»
- El resto de la ficha (borrador) se autoguarda en localStorage bajo la clave `gaFichaDraft:<gaSessionKey>`, donde gaSessionKey sale de sessionStorage y es la misma llave de sesión que usa index.html. Así no se pierde si se recarga.
- Al guardar el PDF con éxito: borra ese borrador y limpia la ficha. Antes, confirma: «PDF guardado. ¿Limpiar la ficha?», con Sí y No.
- La ficha NO entra en data() ni en las sesiones recientes.

GUARDAR EN MI MAC (PDF)
- Genera el PDF con la librería que ya trae index.html (html2pdf / jsPDF, ver generateExecutivePdfBlob y su uso). No agregues dependencias externas.
- Contenido: el formato de la plantilla de Christian, con encabezado «FICHA DE ALTA — OPTIMAXX PLUS ALLIANZ», «Asesor: Christian García», la fecha y las 10 secciones con sus valores.
  - Campos vacíos como «—».
  - Casillas como ☑ y ☐.
  - En el PDF, la tarjeta y la CLABE van COMPLETAS (decisión de Christian).
  - Al pie: «Documento confidencial con datos personales y bancarios. No compartir. Capturar en el portal de Allianz y eliminar cuando ya no se necesite.»
- Nombre del archivo: `Alta - <Nombre completo> - AAAA-MM-DD.pdf`.
- Guardado:
  - Si existe window.showDirectoryPicker (Chrome): la primera vez pide la carpeta («Elige la carpeta donde guardar las altas»; sugiere el escritorio con `startIn:'desktop'`) y guarda el handle en IndexedDB. Las siguientes veces escribe directo en esa carpeta, pidiendo permiso con requestPermission si hace falta.
  - Si algo falla o el navegador no lo permite: descarga normal.
  - Muestra la confirmación con la ruta o el nombre de la carpeta.
- Un enlace chico «Cambiar carpeta» permite elegir otra.

COPIAR FICHA
- Copia al portapapeles el mismo contenido en texto plano, con el formato de la plantilla (secciones con viñetas «- Campo: valor»).
- Incluye la tarjeta o la CLABE completas solo si están escritas. Antes de copiarlas, pregunta: «¿Incluir los datos de la tarjeta/CLABE en lo copiado?» (Sí / No).

PRUEBAS (el sandbox no corre Chromium; Claude las corre después)
- Agrega tests/ficha-checks.cjs y llámalo desde tests/presentation.cjs, después de lienzo-checks. Debe comprobar:
  - «Iniciar captura» en el menú abre la ficha;
  - el prellenado desde gaName, pmt y years;
  - la suma de beneficiarios;
  - tarjeta y CLABE nunca aparecen en ningún localStorage ni sessionStorage (buscar el número de prueba en todas las claves);
  - el borrador sobrevive a recargar la página y la tarjeta no;
  - el PDF se genera: usa el camino de descarga con page.waitForEvent('download') y fuerza ese camino haciendo `window.showDirectoryPicker=undefined` en la prueba; el nombre del archivo es correcto;
  - «Copiar ficha» produce el texto con «FICHA DE ALTA»;
  - sin desplazamiento de página en 1440×780;
  - «Volver a la asesoría» regresa al mismo acto;
  - `?flujo=clasico` intacto.
- `node --check` en los .js que toques.

ENTREGA
- Deja los cambios en el árbol de trabajo, sin commit.
- Escribe docs/ficha-alta-reporte.md: qué hiciste, cómo se conecta, qué se guarda y qué no, y cómo revertir. Termina con la línea «FIN».
