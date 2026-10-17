# Portfolio de Ciberseguridad

Portfolio personal donde documento writeups de máquinas, comparto recursos, herramientas y cheatsheets, y muestro mis proyectos. Construido con [Astro](https://astro.build/) y desplegado en GitHub Pages.

🔗 **Sitio en vivo**: [javig633.github.io](https://javig633.github.io)

## Stack

- **[Astro](https://astro.build/)** — Framework estático con Content Collections
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Estilos utilitarios
- **[MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/)** — Markdown extendido
- **[Shiki](https://shiki.style/)** — Resaltado de sintaxis con tema `github-dark-dimmed`
- **[rehype-callouts](https://github.com/lin-stephanie/rehype-callouts)** — Callouts estilo Obsidian (`> [!NOTE]`)
- **[Fuse.js](https://www.fusejs.io/)** — Búsqueda difusa en cliente para writeups
- **[Simple Icons](https://simpleicons.org/)** — Iconos vía CDN

## Estructura

```
portfolio-cyber/
├── .github/workflows/      # CI/CD para GitHub Pages
├── public/                 # Assets estáticos (favicon, robots.txt, certs)
├── scripts/                # Utilidades (conversión de Obsidian, full-context)
├── src/
│   ├── components/         # Componentes reutilizables (TocTree, WriteupSearch, CertCarousel)
│   ├── content/            # Writeups y Vault (Content Collections)
│   ├── data/               # Datos estáticos (recursos, herramientas, proyectos, certs)
│   ├── layouts/            # Layout base
│   ├── pages/              # Rutas del sitio
│   └── styles/             # CSS global
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page (perfil, bio, certificaciones, formación) |
| `/writeups` | Index de writeups con buscador, filtros, stats y paginación |
| `/writeups/[slug]` | Detalle de writeup con TOC, rating, y code blocks terminal |
| `/vault` | Índice interno de notas y cheatsheets (no enlazado en nav) |
| `/vault/[slug]` | Detalle de nota con TOC y code blocks sin botones |
| `/proyectos` | Proyectos personales |
| `/recursos` | Colección de blogs, labs, cheatsheets y recursos |
| `/herramientas` | Herramientas de pentesting organizadas por categoría |

## Desarrollo

### Requisitos

- Node.js 20 o superior
- npm

### Instalación

```bash
git clone https://github.com/Javig633/javig633.github.io.git
cd javig633.github.io
npm install
```

### Servidor de desarrollo

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:4321`.

### Build de producción

```bash
npm run build
```

## Añadir contenido

### Writeups

Los writeups viven en `src/content/writeups/`. Estructura:

```
src/content/writeups/nombre-maquina/
├── index.md
└── Images/            ← DEBE llamarse "Images" con I mayúscula
    └── captura.png
```

**Frontmatter recomendado:**

```yaml
---
title: Nombre de la máquina
platform: HackTheBox       # HackTheBox / TryHackMe / VulnHub
difficulty: Easy           # Easy / Medium / Hard / Insane
os: Linux                  # Linux / Windows
releaseDate: 2021-06-05    # Fecha de salida de la máquina
date: 2024-03-17           # Fecha en que la completaste
publishedAt: 2026-10-16    # Fecha en que subes el writeup (para ordenar y badge NEW)
userRank: 890              # Tu rango/posición
rating: 4.5                # Puntuación (0-5) para las estrellas
tags: [idor, wireshark, linux, facil]
image: ./Images/cap.png
imageShape: round          # round (icono) | square (imagen a sangre)
---
```

> **Nota**: Si `publishedAt` tiene menos de 14 días, se mostrará un badge **NEW** en la tarjeta del index. El cálculo se hace en el cliente, por lo que caduca automáticamente sin necesidad de rebuild.

### Vault (Cheatsheets y Notas)

El vault es para contenido markdown accesible por enlace directo (sin índice público). Estructura:

```
src/content/vault/nombre-nota/
├── index.md
└── Images/
    └── captura.png
```

**Frontmatter:**

```yaml
---
title: Reverse Shells
description: Colección de reverse shells que uso habitualmente.
category: Cheatsheet     # Cheatsheet / Guía / Apunte
date: 2026-10-11
tags: [shell, bash, python]
---
```

> Los bloques de código en el vault muestran la cabecera terminal con el lenguaje, pero **no** tienen botones de copiar o expandir (se ven siempre completos).

Para enlazar una nota del vault desde la página de recursos, añade el enlace en `src/data/resources.ts`:

```ts
{ name: "Reverse Shells", url: "/vault/reverse-shells/", description: "mis cheatsheets de reverse shells" }
```

### Conversión desde Obsidian

Si escribes en Obsidian y usas `![[imagen.png]]`, ejecuta:

```bash
npm run convert
```

Este script:
1. Renombra el `.md` a `index.md`.
2. Reemplaza espacios por guiones en imágenes.
3. Convierte `![[...]]` a `![](./Images/...)`.

### Recursos y Herramientas

- **Recursos**: Edita `src/data/resources.ts`. Ahora usa un solo nivel de categorías (ej. Cheatsheets, Bug Bounty, Web Security) con sus items.
- **Herramientas**: Edita `src/data/tools.ts`.
- **Proyectos**: Edita `src/data/projects.ts`.
- **Certificaciones**: Edita `src/data/certifications.ts`. Para añadir un logo, guárdalo en `public/certs/nombre.png` y añade `logo: "/certs/nombre.png"`. El orden del array es el orden en el que aparecen en el carrusel de la home.

## Scripts

- `npm run dev` — Servidor de desarrollo.
- `npm run build` — Build de producción.
- `npm run convert` — Convierte writeups de Obsidian.

## Deploy

El sitio se despliega automáticamente en **GitHub Pages** al hacer push a `main` vía GitHub Actions.

### Configuración inicial (una sola vez)

1. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
2. El workflow `.github/workflows/deploy.yml` hace el resto.

## Licencia

El código de este proyecto está bajo la licencia MIT. Los writeups y el contenido textual son propiedad del autor.

---