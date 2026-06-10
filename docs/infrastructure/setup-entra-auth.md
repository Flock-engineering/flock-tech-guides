---
sidebar_label: Auth Gate (Entra ID)
---

# Auth Gate — Microsoft Entra ID

---

## Qué es y por qué existe

Este sitio (flock-tech-guides) corre como un sitio estático en Vercel. Sin protección, cualquier URL pública expone el contenido a personas fuera de Flock. La solución implementada es una **capa de autenticación aditiva**: un Edge Middleware que valida una cookie de sesión firmada en cada request, sin tocar el build de Docusaurus.

El flujo usa **OAuth 2.0 Authorization Code con PKCE** contra el tenant de Microsoft Entra ID de Flock (single-tenant). Solo cuentas `@flockit.com.ar` pueden autenticarse.

---

## Variables de entorno requeridas

Estas variables **solo se configuran en Vercel** — nunca se commitean al repositorio.

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `ENTRA_CLIENT_ID` | Application (client) ID del App Registration en Azure | Portal Azure → Entra ID → App Registrations |
| `ENTRA_TENANT_ID` | Directory (tenant) ID del tenant de Flock | Portal Azure → Entra ID → Overview |
| `ENTRA_CLIENT_SECRET` | Client secret generado en el App Registration | Azure → App Registration → Certificates & secrets |
| `SESSION_SECRET` | Clave secreta para firmar los JWTs de sesión (mínimo 32 bytes) | Generar localmente: `openssl rand -hex 32` |
| `AUTH_ENABLED` | Flag de activación del gate (`true` = activo) | Solo en el environment **Production** de Vercel |

### Notas de seguridad

- `SESSION_SECRET` debe tener **mínimo 32 bytes de entropía**. Usar `openssl rand -hex 32` o un generador de passwords con alta entropía.
- `ENTRA_CLIENT_SECRET` tiene fecha de expiración. Configurar un recordatorio para rotarlo antes de que venza.
- Rotar `SESSION_SECRET` invalida todas las sesiones activas de inmediato (comportamiento aceptable para este caso).
- `AUTH_ENABLED` **solo va en Production**. En Preview environments, esta variable debe estar ausente o vacía.

---

## Cómo activar el gate en producción

1. Crear el App Registration en Azure (ver sección de IT/infra más abajo).
2. En Vercel → Settings → Environment Variables, cargar las cuatro variables (`ENTRA_CLIENT_ID`, `ENTRA_TENANT_ID`, `ENTRA_CLIENT_SECRET`, `SESSION_SECRET`) en el environment **Production**.
3. Hacer un primer deploy **sin** `AUTH_ENABLED` — verificar que el build pase y el sitio sea accesible.
4. Configurar `AUTH_ENABLED=true` en Production en Vercel.
5. Hacer un nuevo deploy o triggear un redeploy.
6. Abrir una ventana incógnita y verificar que redirige a Microsoft login.

---

## Configuración del App Registration (IT / Infra)

El equipo de IT/infra debe crear un App Registration en el tenant de Flock con:

- **Redirect URI**: `https://<dominio-produccion>/api/auth/callback` (tipo Web)
- **Supported account types**: "Accounts in this organizational directory only" (single-tenant)
- **Client secret**: generar uno y entregarlo para cargar como `ENTRA_CLIENT_SECRET` en Vercel

:::warning Restricción importante
La redirect URI debe ser una URL fija y conocida de antemano. El dominio de producción de Vercel debe ser custom (no `vercel.app` con hashes que cambian) para que funcione el registro.
:::

---

## Limitación conocida: Preview deployments no están protegidos

:::warning Limitación v1 — Preview deployments sin gate
Los deployments de preview de Vercel (branches, PRs) **no están protegidos por el auth gate**. Esto es una limitación conocida y aceptada en v1.

**Por qué**: Vercel genera URLs dinámicas para previews (`https://<hash>.vercel.app`). Esas URLs no se pueden registrar como Redirect URIs válidas en Entra ID de antemano — no se conocen hasta después del deploy.

**Implicancia**: Cualquier persona con la URL de un preview deployment puede ver el contenido sin autenticarse.

**Mitigación aceptada**: Los previews solo son accesibles si alguien tiene la URL específica (no son indexados). El contenido sensible no debería discutirse abiertamente en PRs públicas. En v2 se puede evaluar usar Vercel Access Policy o autenticación básica a nivel Vercel para previews.

**Cómo funciona técnicamente**: `middleware.ts` verifica `AUTH_ENABLED === 'true'` como primera condición. En previews, esta variable está ausente, por lo que el middleware hace `next()` sin verificar sesión.
:::

---

## Rollback

Si hay problemas con el auth gate, hay dos opciones de rollback:

**Rápido (sin redeploy)**: Eliminar o poner en vacío `AUTH_ENABLED` en Vercel → Production. El siguiente request ya desactiva el gate (no requiere redeploy).

**Completo (reverting el branch)**: Revertir el branch `feat/entra-id-auth` y hacer un nuevo deploy. Los archivos `middleware.ts`, `api/auth/*`, `lib/*`, y `tsconfig.json` desaparecen. El sitio vuelve a ser completamente público. No hay migraciones ni estado a limpiar.

---

## Archivos relevantes

| Archivo | Runtime | Rol |
|---|---|---|
| `middleware.ts` | Vercel Edge | Gate principal — verifica sesión en cada request |
| `lib/session-edge.ts` | Edge-safe | Firma y verifica JWTs de sesión (jose, HS256) |
| `lib/oauth-node.ts` | Node only | PKCE, intercambio de código, validación de id_token |
| `api/auth/login.ts` | Node | Inicia flujo OAuth — genera PKCE + state, redirige a Microsoft |
| `api/auth/callback.ts` | Node | Maneja el callback — valida state, intercambia código, emite cookie |
| `api/auth/logout.ts` | Node | Limpia la cookie de sesión, redirige al endpoint de logout de Microsoft |
