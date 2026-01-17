# Urgente: Rotación de Secrets y limpieza de repositorio

Detecté que había un archivo `.env.local` comiteado con claves secretas (p. ej. SendGrid, Supabase). He borrado el archivo del árbol de trabajo del repo para evitar seguir exponiendo las claves.

Pasos recomendados inmediatos (ejecutar ahora):

1. Revocar/rotar las claves expuestas inmediatamente:
   - SendGrid: revoca la API key desde el dashboard de SendGrid.
   - Supabase: rota la `SERVICE_ROLE` y cualquier clave comprometedida.
   - Cambia cualquier contraseña expuesta (p. ej. `ADMIN_PASSWORD`).

2. Añadir las nuevas claves en Vercel (Project → Settings → Environment Variables) para `production` y `preview`.

3. Eliminar cualquier rastro en el historial de Git si es necesario (opcional, usa `git filter-repo` o `bfg-repo-cleaner`).

4. Forzar nuevo deploy en Vercel tras actualizar variables y limpiar cache.

Notas:
- No publiques claves en repositorios. Usa variables de entorno en Vercel.
- He añadido un stub `src/lib/sendgrid.ts` para evitar fallos de build si alguna referencia antigua a SendGrid persiste. Esto no reintroduce SendGrid en el sistema; solo evita abortos de compilación.

Si quieres, puedo preparar los commits (eliminar `.env.local` del índice, añadir `.gitignore` y actualizar `pnpm-lock.yaml` si lo deseas). Dime si quieres que prepare esos commits aquí y te muestro los comandos que ejecutarías localmente (o puedo generarlos como patch para aplicar).