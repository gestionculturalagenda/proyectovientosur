# Propuesta de Rediseño Visual para la Versión Móvil de VientoSur

## Objetivo
Crear una interfaz móvil limpia, atractiva y práctica para VientoSur, mejorando la experiencia de usuario sin afectar la versión de escritorio.

---

## Consideraciones Generales
- **Mobile First:** Priorizar el diseño móvil y luego adaptar a escritorio solo si es necesario.
- **Separación de estilos:** Utilizar breakpoints y clases específicas para móvil (`sm:`, `md:`, `lg:` en Tailwind) para mantener la independencia visual.
- **Navegación simplificada:** Menú inferior fijo (bottom navigation) para acceso rápido a las secciones principales.
- **Minimizar el contenido visible:** Mostrar solo lo esencial en pantalla, ocultando menús y notificaciones en paneles laterales o modales.
- **Botones grandes y accesibles:** Facilitar la interacción táctil.
- **Tipografía clara y legible:** Tamaños y pesos adecuados para pantallas pequeñas.
- **Colores y contraste:** Mantener coherencia con la identidad visual, pero asegurando buena legibilidad.
- **Animaciones suaves:** Transiciones sutiles para mejorar la percepción de fluidez.

---

## Propuesta de Interfaz Móvil

### 1. Barra de Navegación Inferior (Bottom Navigation)
- Íconos para: Inicio, Mensajes, Agenda, Perfil.
- Botón central destacado para "Crear" (publicación, evento, etc.).
- Oculta en scroll hacia abajo, visible en scroll hacia arriba.

### 2. Menú Lateral (Drawer)
- Acceso desde un ícono de menú hamburguesa en la esquina superior izquierda.
- Contiene enlaces secundarios: Blogs, Calendario, Favoritos, Configuración, Cerrar sesión.

### 3. Cabecera Compacta
- Logo pequeño o solo ícono.
- Notificaciones como ícono con badge.
- Avatar del usuario en la esquina superior derecha.

### 4. Páginas Principales
- **Inicio:** Feed de publicaciones con tarjetas compactas, scroll vertical.
- **Mensajes:** Lista de conversaciones, acceso rápido a chats recientes.
- **Agenda/Calendario:** Vista simplificada, eventos destacados.
- **Perfil:** Información básica, botón de editar, estadísticas.

### 5. Notificaciones y Modales
- Notificaciones push o banners temporales.
- Modales para acciones rápidas (crear, editar, eliminar).

---

## Plan Paso a Paso

1. **Auditoría de componentes actuales**
   - Identificar qué componentes requieren rediseño específico para móvil.

2. **Definir breakpoints y clases Tailwind**
   - Asegurar que los estilos móviles se apliquen solo en pantallas pequeñas (`sm:`).

3. **Diseñar la barra de navegación inferior**
   - Crear un nuevo componente `MobileBottomNav`.
   - Añadir lógica para mostrar/ocultar según scroll.

4. **Implementar menú lateral (Drawer)**
   - Crear componente `MobileDrawerMenu`.
   - Añadir animaciones de entrada/salida.

5. **Optimizar cabecera y notificaciones**
   - Rediseñar la cabecera para móvil.
   - Añadir badges y accesos rápidos.

6. **Ajustar páginas principales**
   - Rediseñar el feed, mensajes, agenda y perfil para móvil.
   - Usar tarjetas compactas y scroll eficiente.

7. **Agregar modales y banners**
   - Implementar notificaciones y acciones rápidas.

8. **Pruebas y feedback**
   - Probar en dispositivos reales y emuladores.
   - Recoger feedback de usuarios y ajustar detalles.

9. **Documentar y mantener**
   - Documentar los cambios y asegurar la mantenibilidad del código.

---

## Recursos Sugeridos
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Material UI Bottom Navigation](https://mui.com/material-ui/react-bottom-navigation/)
- [React Drawer Menu Examples](https://mui.com/material-ui/react-drawer/)

---

## Notas Finales
- Mantener la coherencia visual con la versión de escritorio, pero priorizar la usabilidad móvil.
- Evitar sobrecargar la pantalla y facilitar la navegación con el pulgar.
- Iterar el diseño según feedback real de usuarios móviles.
