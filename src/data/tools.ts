export interface Tool {
  name: string;
  url: string;
  description: string;
  tags?: string[];
  icon?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  tools: Tool[];
}

// Los iconos usan Simple Icons (https://simpleicons.org/)
// Formato: https://cdn.simpleicons.org/<slug>/<color-sin-#>
export const tools: ToolCategory[] = [
  {
    id: "recon",
    name: "Reconocimiento",
    tools: [
      { name: "Nmap", url: "https://nmap.org/", description: "El escáner de red y puertos de referencia. Punto de partida de casi cualquier enumeración.", tags: ["network", "recon"], icon: "https://cdn.simpleicons.org/nmap/9ab8ff" },
      { name: "RustScan", url: "https://github.com/RustScan/RustScan", description: "Escáner de puertos ultrarrápido escrito en Rust. Ideal para barridos iniciales.", tags: ["network", "rust"] },
      { name: "Masscan", url: "https://github.com/robertdavidgraham/masscan", description: "Escáner masivo capaz de barrer todo Internet en minutos.", tags: ["network"] },
      { name: "Amass", url: "https://github.com/owasp-amass/amass", description: "Enumeración de subdominios y mapeo de superficie de ataque.", tags: ["osint", "recon"] },
      { name: "Subfinder", url: "https://github.com/projectdiscovery/subfinder", description: "Enumeración pasiva de subdominios con múltiples fuentes.", tags: ["recon"] },
    ],
  },
  {
    id: "web",
    name: "Web",
    tools: [
      { name: "Burp Suite", url: "https://portswigger.net/burp", description: "El proxy de interceptación para analizar y manipular tráfico HTTP/HTTPS. Imprescindible.", tags: ["web", "proxy"], icon: "https://cdn.simpleicons.org/burpsuite/9ab8ff" },
      { name: "ffuf", url: "https://github.com/ffuf/ffuf", description: "Fuzzer ultrarrápido escrito en Go. Perfecto para directorios y parámetros.", tags: ["web", "fuzzing"] },
      { name: "Gobuster", url: "https://github.com/OJ/gobuster", description: "Fuzzing de directorios, subdominios, vhosts y más. Simple y efectivo.", tags: ["web", "fuzzing"] },
      { name: "Feroxbuster", url: "https://github.com/epi052/feroxbuster", description: "Fuzzer recursivo en Rust. Descubre contenido oculto sin esfuerzo.", tags: ["web", "fuzzing"] },
      { name: "sqlmap", url: "https://sqlmap.org/", description: "Automatiza la detección y explotación de inyecciones SQL.", tags: ["web", "sqli"] },
      { name: "Nikto", url: "https://github.com/sullo/nikto", description: "Escáner de vulnerabilidades web clásico, rápido y ruidoso.", tags: ["web"] },
      { name: "WPScan", url: "https://wpscan.com/", description: "Escáner de vulnerabilidades específico para WordPress.", tags: ["web", "wordpress"] },
    ],
  },
  {
    id: "exploit",
    name: "Explotación",
    tools: [
      { name: "Metasploit", url: "https://www.metasploit.com/", description: "Framework de explotación con miles de módulos y payloads listos para usar.", tags: ["exploit"], icon: "https://cdn.simpleicons.org/metasploit/9ab8ff" },
      { name: "Nuclei", url: "https://github.com/projectdiscovery/nuclei", description: "Escáner basado en plantillas YAML para miles de CVEs y misconfigs.", tags: ["scanning"] },
      { name: "searchsploit", url: "https://www.exploit-db.com/", description: "Versión local de Exploit-DB para buscar exploits desde la terminal.", tags: ["exploit"] },
    ],
  },
  {
    id: "passwords",
    name: "Contraseñas",
    tools: [
      { name: "Hashcat", url: "https://hashcat.net/hashcat/", description: "El cracker de hashes más rápido del mundo. Acelerado por GPU.", tags: ["passwords"], icon: "https://cdn.simpleicons.org/hashcat/9ab8ff" },
      { name: "John the Ripper", url: "https://www.openwall.com/john/", description: "Cracker de contraseñas clásico, soporta cientos de formatos.", tags: ["passwords"] },
      { name: "Hydra", url: "https://github.com/vanhauser-thc/thc-hydra", description: "Fuerza bruta online contra multitud de protocolos.", tags: ["passwords"] },
      { name: "Medusa", url: "https://github.com/jmk-foofus/medusa", description: "Fuerza bruta paralela con soporte para muchos servicios.", tags: ["passwords"] },
      { name: "CeWL", url: "https://github.com/digininja/CeWL", description: "Genera diccionarios a partir del contenido de una web.", tags: ["passwords", "web"] },
    ],
  },
  {
    id: "ad",
    name: "Active Directory",
    tools: [
      { name: "BloodHound", url: "https://github.com/BloodHoundAD/BloodHound", description: "Análisis visual de Active Directory. Encuentra rutas de ataque al Domain Admin.", tags: ["ad", "windows"] },
      { name: "Impacket", url: "https://github.com/fortra/impacket", description: "Colección de clases Python para trabajar con protocolos de red. Esencial en AD.", tags: ["ad", "python"] },
      { name: "NetExec", url: "https://github.com/Pennyw0rth/NetExec", description: "Sucesor de CrackMapExec. Navaja suiza para pentesting de AD.", tags: ["ad", "windows"] },
      { name: "Certipy", url: "https://github.com/ly4k/Certipy", description: "Ataques a Active Directory Certificate Services (ADCS).", tags: ["ad"] },
      { name: "Responder", url: "https://github.com/lgandx/Responder", description: "Envenenamiento LLMNR/NBT-NS/MDNS para capturar credenciales.", tags: ["ad", "network"] },
      { name: "Kerbrute", url: "https://github.com/ropnop/kerbrute", description: "Enumeración y password spraying contra Kerberos.", tags: ["ad"] },
    ],
  },
  {
    id: "privesc",
    name: "Escalada de privilegios",
    tools: [
      { name: "LinPEAS", url: "https://github.com/peass-ng/PEASS-ng", description: "Script de enumeración automática para encontrar vectores de escalada en Linux.", tags: ["linux", "privesc"] },
      { name: "WinPEAS", url: "https://github.com/peass-ng/PEASS-ng", description: "Equivalente de LinPEAS para Windows.", tags: ["windows", "privesc"] },
      { name: "pspy", url: "https://github.com/DominicBreuker/pspy", description: "Espía procesos en Linux sin privilegios. Detecta cron jobs y tareas programadas.", tags: ["linux", "privesc"] },
      { name: "linux-smart-enumeration", url: "https://github.com/diego-treitos/linux-smart-enumeration", description: "Script alternativo de enumeración de Linux con output amigable.", tags: ["linux"] },
    ],
  },
  {
    id: "pivoting",
    name: "Pivoting y Shells",
    tools: [
      { name: "Chisel", url: "https://github.com/jpillora/chisel", description: "Túneles TCP/UDP sobre HTTP. Perfecto para pivoting.", tags: ["pivoting"] },
      { name: "Ligolo-ng", url: "https://github.com/nicocha30/ligolo-ng", description: "Herramienta de tunneling moderna, más rápida y limpia que Chisel.", tags: ["pivoting"] },
      { name: "socat", url: "http://www.dest-unreach.org/socat/", description: "El multi-tool de red. Útil para port forwarding y shells.", tags: ["network", "pivoting"] },
      { name: "Penelope", url: "https://github.com/brightio/penelope", description: "Gestor avanzado de shells con soporte para TTY, logging y más.", tags: ["shell"] },
      { name: "rlwrap", url: "https://github.com/hanslub42/rlwrap", description: "Envuelve shells en readline. Añade historial y flechas a netcat.", tags: ["shell"] },
    ],
  },
  {
    id: "forensics",
    name: "Análisis y Forense",
    tools: [
      { name: "Wireshark", url: "https://www.wireshark.org/", description: "El analizador de tráfico de red por excelencia.", tags: ["forensics", "network"], icon: "https://cdn.simpleicons.org/wireshark/9ab8ff" },
      { name: "tcpdump", url: "https://www.tcpdump.org/", description: "Captura de tráfico en línea de comandos. Imprescindible en servidores.", tags: ["forensics", "network"] },
      { name: "CyberChef", url: "https://gchq.github.io/CyberChef/", description: "La navaja suiza del análisis de datos. Encoding, cifrado, parsing, todo.", tags: ["analysis"] },
      { name: "Ghidra", url: "https://ghidra-sre.org/", description: "Suite de reversing de la NSA. Alternativa gratuita a IDA Pro.", tags: ["reversing"], icon: "https://cdn.simpleicons.org/ghidra/9ab8ff" },
      { name: "binwalk", url: "https://github.com/ReFirmLabs/binwalk", description: "Analiza y extrae firmwares y archivos embebidos.", tags: ["forensics"] },
      { name: "strings", url: "https://en.wikipedia.org/wiki/Strings_(Unix)", description: "Extrae texto legible de binarios. Clásico imprescindible.", tags: ["analysis"] },
    ],
  },
  {
    id: "cli",
    name: "Utilidades",
    tools: [
      { name: "tmux", url: "https://github.com/tmux/tmux", description: "Multiplexor de terminal. Sesiones persistentes y ventanas divididas.", tags: ["cli"] },
      { name: "jq", url: "https://jqlang.github.io/jq/", description: "Procesador de JSON en línea de comandos. Indispensable al parsear APIs.", tags: ["cli"] },
      { name: "ripgrep", url: "https://github.com/BurntSushi/ripgrep", description: "grep, pero más rápido y con mejores defaults.", tags: ["cli"] },
      { name: "fzf", url: "https://github.com/junegunn/fzf", description: "Buscador difuso para la terminal. Mejora cualquier workflow.", tags: ["cli"] },
      { name: "bat", url: "https://github.com/sharkdp/bat", description: "cat con resaltado de sintaxis, números de línea y paginación.", tags: ["cli"] },
    ],
  },
];