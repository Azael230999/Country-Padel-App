---
name: design-system
description: Sistema de diseño de Country Padel (app de gestión de alumnos) — colores, tipografía, espaciado, iconografía y componentes. Úsalo siempre que crees o modifiques cualquier pantalla, componente o estilo visual de esta app.
---

# Sistema de diseño — Country Padel

## Colores (definir como variables CSS globales)
```css
--bg-header: #1F1410;      /* header, nav superior */
--bg-app: #F5EDE1;         /* fondo general */
--bg-card: #FFFDF8;        /* tarjetas */
--accent-primary: #C1531E; /* botones primarios, tab activo */
--accent-gold: #D4A017;    /* badges, avatares, nivel */
--text-primary: #1F1410;
--text-muted: #8A7E6E;     /* labels secundarias, captions */
--danger: #B3261E;         /* acciones destructivas */
--success: #4C7A3D;        /* estado "Ganó" — NUNCA usar el dorado para esto */
```

## Tipografía
- **Display** (nombre de alumno): serif bold, 28px
- **H2** (títulos de tarjeta, ej. "ASISTENCIA — AGOSTO"): sans semibold, 18px
- **Body**: sans regular, 16px
- **Label** (ej. "DATOS DE CONTACTO", "FÍSICO / LESIONES"): sans semibold, uppercase, 12px, letter-spacing +0.5px
- **Caption** (metadatos, fechas, teléfonos): sans regular, 13px

## Espaciado
Grid de 8pt: usar solo múltiplos de 8px (8, 16, 24, 32, 48). No dejar bloques de contenido vacíos sin diseñar — si una pestaña queda con poco contenido, usar un estado vacío diseñado (ver abajo), nunca espacio en blanco sin resolver.

## Iconografía
Librería: **Lucide Icons** (lucide-react). Toda navegación (nav del coach, pestañas del perfil de alumno) SIEMPRE lleva ícono + texto, nunca solo texto.

Mapeo de referencia:
- Perfil → `user`
- Entreno → `target`
- Asistencia → `calendar-check`
- Partidos → `trophy`
- Notas → `sticky-note`
- Calendario → `calendar`
- Coaches → `users`
- Hoy → `home`

## Botones — 3 niveles de jerarquía
```css
.btn-primary   { background: var(--accent-primary); color: white; font-weight: 600; }
.btn-secondary { background: transparent; border: 1px solid var(--text-muted); color: var(--text-primary); }
.btn-danger    { background: transparent; border: 1px solid var(--danger); color: var(--danger); }
```
Una sola acción primaria por pantalla. Las demás son secundarias. Acciones destructivas (eliminar, cancelar) siempre en `.btn-danger`.

## Reglas obligatorias
1. **Nunca mostrar campos vacíos como "— · —" o guiones sueltos.** Si un dato (edad, posición, etc.) no existe, ocultar esa línea completa, no mostrar un placeholder roto.
2. **Formatear números correctamente.** Nunca mostrar decimales innecesarios (ej. "3.00" cuando debería ser "3" o "3.0"). Usar: `valor % 1 === 0 ? valor.toFixed(0) : valor.toFixed(1)`.
3. **Estados vacíos siempre diseñados**, nunca solo texto plano:
   - Ícono outline (24px, color `--text-muted`)
   - Texto cálido en una línea ("Aún no hay eventos agendados", no "No hay eventos por aquí.")
   - CTA si aplica
4. **Headers con título no deben superponerse con la nav de pestañas debajo** — siempre verificar padding/margin suficiente entre ambos elementos al crear una vista nueva.
5. La vista de "solo lectura" para el alumno debe mantener el mismo diseño que la vista del coach, solo agregando el badge "Solo lectura" — nunca crear un layout distinto para esta vista.
