# Instrucciones del proyecto

## Producción de vídeos para newsletters

Estas reglas son obligatorias siempre que se solicite crear, sustituir o integrar un
vídeo de cabecera para una newsletter. El objetivo es mantener una calidad editorial,
visual y técnica constante en todas las ediciones futuras.

### 1. Entender la newsletter antes de buscar imágenes

1. Leer la newsletter completa, no solo el título o el extracto.
2. Extraer entre 6 y 10 bloques visuales concretos: países, ciudades, mercados,
   materias primas, monedas, sectores, infraestructuras, empresas e instituciones.
3. Preparar un storyboard de 30 segundos que represente esos bloques en el mismo
   orden narrativo aproximado de la newsletter.
4. No usar imágenes financieras genéricas cuando exista una imagen más concreta y
   reconocible del asunto tratado.

Ejemplo: oro -> Banco de Japón -> yen -> consumo español -> petróleo -> centro de
datos. Cada plano debe tener una relación defendible con el contenido publicado.

### 2. Cada newsletter debe tener identidad propia

- Antes de montar, revisar el vídeo de Inicio y todos los vídeos existentes en
  `public/video/newsletters/`.
- No copiar la estructura, el orden, la apertura, el cierre ni la selección principal
  de otro vídeo.
- No reutilizar un montaje completo ni una sucesión de dos o más planos.
- La reutilización de metraje debe ser excepcional: como máximo un 10 % de la
  duración total (3 segundos en un vídeo de 30 segundos).
- Un plano reutilizado debe aparecer en otro punto del montaje y con una función
  narrativa distinta. Nunca se reutiliza como apertura o cierre.
- Si una newsletter coincide temáticamente con otra, buscar una representación
  visual diferente: otro lugar, encuadre, proceso, hora del día o escala.
- Crear una tabla de coincidencias antes de aprobar el montaje y sustituir cualquier
  repetición que resulte evidente a simple vista.

### 3. Dirección creativa

- Estética: documental financiera contemporánea, global, elegante, sobria y
  cinematográfica.
- Priorizar planos amplios, movimiento de cámara estable, composiciones limpias,
  luz natural o institucional y elementos reconocibles en menos de dos segundos.
- Combinar ciudades, actividad económica real, mercados, comercio, energía,
  industria, transporte, tecnología e infraestructura según el contenido.
- Las personas e instituciones que toman decisiones económicas pueden ocupar entre
  un 10 % y un 20 % como máximo. Sus apariciones deben durar normalmente entre 0,5
  y 1,5 segundos.
- Los planos institucionales deben funcionar como flashes entre escenas del mundo
  real: bancos centrales, ruedas de prensa, parlamentos, G7, G20, FMI, Banco Mundial
  o ministerios económicos.
- Mantener neutralidad política. Evitar mítines, propaganda, polémicas partidistas,
  memes, rótulos de televisión, logos de cadenas y discursos largos.
- No incluir texto, subtítulos, marcas de agua ni gráficos superpuestos dentro del
  vídeo. El texto de la web siempre tiene prioridad.
- No añadir audio salvo que el usuario lo pida expresamente. Los vídeos integrados
  en la web deben funcionar correctamente silenciados.

### 4. Selección y licencia del material

- Usar solo metraje con licencia compatible con su publicación en la web, procedente
  de fuentes fiables como Pexels, Pixabay, Mixkit o material institucional oficial.
- No descargar fragmentos de emisiones de televisión, redes sociales o vídeos con
  derechos inciertos.
- Priorizar originales en 4K o, como mínimo, Full HD real. Rechazar clips borrosos,
  muy comprimidos, entrelazados, reescalados o con artefactos visibles.
- Guardar para cada montaje un registro en `docs/video-sources/<slug>.md` con el
  título del plano, URL original, autor/fuente, licencia y segundos utilizados.
- Inspeccionar visualmente cada descarga mediante fotogramas o una hoja de contacto
  antes de incorporarla.

### 5. Montaje obligatorio

- Duración final exacta: **30,000 segundos**.
- Cadencia: **30 fps constantes**, exactamente **900 fotogramas**.
- Máster: **1920 x 1080**, H.264, perfil High, píxeles `yuv420p`, relación 16:9 y
  píxel cuadrado (`setsar=1`).
- Sin pista de audio por defecto.
- Utilizar normalmente entre 8 y 12 planos. Duración orientativa por plano: entre
  2 y 4 segundos, salvo los flashes institucionales.
- Mantener cortes limpios y un ritmo seguro. No abusar de transiciones, zooms,
  efectos o aceleraciones.
- Igualar contraste, saturación, temperatura y luminosidad para que material de
  distintas fuentes parezca un solo montaje.
- Construir un bucle real: el último plano debe enlazar con el primero sin salto
  evidente. La opción preferida es dividir un mismo plano continuo entre el final y
  el inicio; también se admite una composición visual equivalente.
- No repetir un plano dentro del propio vídeo, excepto cuando sea necesario dividir
  una toma continua para cerrar el bucle.

### 6. Entregables web

Por cada `slug`, generar siempre estos tres archivos:

```text
public/video/newsletters/<slug>.mp4
public/video/newsletters/<slug>-mobile.mp4
public/video/newsletters/<slug>-poster.jpg
```

Parámetros de exportación:

```text
Escritorio: 1280x720, H.264 High, 30 fps, yuv420p, CRF 20,
            preset slow, maxrate 4M, bufsize 8M, faststart.
Móvil:      960x540, H.264 High, 30 fps, yuv420p, CRF 22,
            preset slow, maxrate 2M, bufsize 4M, faststart.
Póster:     1600x900 JPEG de alta calidad, elegido de un fotograma limpio y
            representativo de la apertura.
```

No reducir estos estándares para ahorrar tiempo. Si el archivo resultante pesa
demasiado, optimizar primero la selección y el bitrate sin degradar la imagen de
forma visible.

### 7. Integración en el proyecto

- Registrar el `slug` y las tres rutas en
  `src/lib/newsletter-hero-videos.ts`.
- Incrementar el parámetro de versión de las rutas (`?v=N`) cada vez que se sustituya
  un archivo para invalidar la caché de navegador y CDN.
- Mantener `autoplay`, `muted`, `loop`, `playsInline`, póster y fuentes separadas
  para móvil/escritorio en la página de newsletter.
- Conservar las capas de legibilidad definidas en `src/app/globals.css`. El vídeo
  debe verse, pero título, fecha y extracto deben seguir leyéndose sin esfuerzo en
  escritorio y móvil.
- Respetar `prefers-reduced-motion`: en ese caso se debe mostrar el póster y no
  depender del movimiento para comunicar información.
- No modificar el panel `/admin`, su autenticación, sus API ni el modelo de contenido
  al realizar esta tarea, salvo que el usuario lo solicite expresamente.

### 8. Control de calidad antes de publicar

No considerar terminado un vídeo hasta completar todos estos controles:

1. Generar una hoja de contacto del montaje completo y revisarla visualmente.
2. Comparar esa hoja con las del Inicio y las newsletters anteriores.
3. Extraer el primer y el último fotograma juntos para comprobar el bucle.
4. Confirmar con `ffprobe`: 30,000 s, 30 fps, 900 fotogramas, resolución correcta,
   H.264, `yuv420p` y ausencia de audio cuando corresponda.
5. Decodificar el MP4 completo con `ffmpeg -v error -i <archivo> -f null -` para
   detectar corrupción.
6. Ejecutar `npm run build` y `git diff --check`.
7. Publicar solo los archivos de esta tarea; preservar cualquier cambio ajeno que
   ya exista en el repositorio.
8. Tras el despliegue, comprobar las tres rutas versionadas en el HTML público y
   verificar que los MP4 admiten peticiones parciales HTTP (`206`), necesarias para
   una reproducción eficiente.

### 9. Entrega para revisión

Si el usuario pide una copia en el Escritorio, entregar el máster Full HD de 30
segundos en H.264 y `yuv420p`. Usar un nombre humano y claro. No sustituir el vídeo
publicado en la web hasta que el usuario lo apruebe, salvo que haya pedido
explícitamente ambas acciones.
