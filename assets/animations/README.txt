Carpeta de animaciones ligeras
==============================

Esta carpeta está reservada para GIFs o animaciones ligeras (Lottie/JSON, GIF < 500 KB)
que refuercen visualmente secciones específicas, por ejemplo:

- Un check animado al aprobar la evaluación demo.
- Un ícono de firma trazándose en la sección de constancia.
- Un loop sutil de "escudo protegiendo" en la sección de Salud y Seguridad.

Actualmente el proyecto NO incluye GIFs de terceros para evitar cualquier
contenido con licencia privada no verificada. Las animaciones visuales del
sitio se generan con CSS puro (hover, scroll reveal vía AOS, transiciones)
para mantener el proyecto ligero y 100% editable.

Para agregar una animación propia:
1. Coloca el archivo .gif, .webp o .json (Lottie) en esta carpeta.
2. Referencia el archivo desde index.html (por ejemplo, dentro de una sección
   con <img src="assets/animations/tu-animacion.gif" alt="..."> o usando la
   librería lottie-web vía CDN si usas .json).
3. Verifica que el peso del archivo sea menor a 500 KB para no afectar el
   rendimiento del sitio.
