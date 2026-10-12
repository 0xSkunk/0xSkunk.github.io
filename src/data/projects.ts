export interface Project {
  name: string;
  tagline: string;
  description: string;
  github: string;
  demo?: string;
  image?: string;
  stack?: string[];
  status?: "active" | "wip" | "archived";
}

export const projects: Project[] = [
  {
    name: "PyRecon",
    tagline: "Reconocimiento automatizado",
    description:
      "Script en Python que orquesta nmap, httpx y subfinder para hacer un barrido inicial completo. Genera un informe estructurado y guarda todos los outputs ordenados por target.",
    github: "https://github.com/tuusuario/pyrecon",
    demo: "https://pyrecon.tudominio.com",
    image: "/certs/1.png",
    stack: ["python", "asyncio", "nmap"],
    status: "active",
  },
  {
    name: "Chisel GUI",
    tagline: "Interfaz web para túneles Chisel",
    description:
      "Frontend en React que envuelve el binario de Chisel para gestionar túneles y pivotes sin pelearse con la línea de comandos. Backend en Go con WebSockets para estado en vivo.",
    github: "https://github.com/tuusuario/chisel-gui",
    stack: ["react", "go", "websockets"],
    status: "wip",
  },
  {
    name: "CTF Tools",
    tagline: "Colección de utilidades para CTFs",
    description:
      "Set de scripts y one-liners que uso en competiciones: decodificadores, wrappers de herramientas comunes, helpers de criptografía y plantillas de exploits.",
    github: "https://github.com/tuusuario/ctf-tools",
    stack: ["bash", "python"],
    status: "active",
  },
  {
    name: "LogAnalyzer",
    tagline: "Análisis forense de logs",
    description:
      "Herramienta para parsear logs de Apache, Nginx y syslog buscando patrones sospechosos. Detecta escaneos, intentos de inyección y user-agents raros con reglas customizables.",
    github: "https://github.com/tuusuario/loganalyzer",
    stack: ["python", "pandas"],
    status: "active",
  },
  {
    name: "HTB Writeups Bot",
    tagline: "Automatización de writeups",
    description:
      "Bot de Telegram que recibe comandos durante una máquina y los formatea automáticamente como bloques de código para pegar en el writeup. Ahorra mucho tiempo al documentar.",
    github: "https://github.com/tuusuario/htb-bot",
    stack: ["python", "telegram-api"],
    status: "archived",
  },
  {
    name: "VulnFeed",
    tagline: "Agregador de CVEs",
    description:
      "RSS propio que agrega CVEs relevantes de NVD, GitHub Advisory y Exploit-DB, filtra por stack y envía notificaciones a Discord cuando aparece algo interesante.",
    github: "https://github.com/tuusuario/vulnfeed",
    stack: ["python", "fastapi", "discord"],
    status: "wip",
  },
];