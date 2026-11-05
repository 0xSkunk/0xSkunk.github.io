export interface LinkItem {
  name: string;
  url: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  items: LinkItem[];
}

export const resources: Category[] = [
  {
    id: "mis-recursos",
    name: "Mis Recursos",
    items: [
      { name: "Shell Generator", url: "https://0xskunk.github.io/Shell-Generator/", description: "Generador de Rev/Bind Shells." },],
  },
  {
    id: "plataformas-ctf",
    name: "Laboratorios CTFs",
    items: [
{ name: "HacktheBox", url: "https://www.hackthebox.com/", description: "Máquinas virtuales y laboratorios corporativos para pentesting avanzado." },
      { name: "TryHackMe", url: "https://tryhackme.com/", description: "Salas interactivas guiadas para aprender ciberseguridad desde cero." },
      { name: "Dockerlabs", url: "https://dockerlabs.es/", description: "Laboratorios ligeros y gratuitos de explotación en contenedores Docker." },
      { name: "VulnHub", url: "https://www.vulnhub.com/", description: "Máquinas vulnerables descargables para practicar pentesting en local." },
      { name: "CyberDefenders", url: "https://cyberdefenders.org/", description: "Retos defensivos de análisis forense, memoria y threat hunting." },
      { name: "Blue Team Labs", url: "https://blueteamlabs.online/", description: "Investigaciones prácticas de respuesta a incidentes y análisis SOC." },
      { name: "LetsDefend", url: "https://letsdefend.io/", description: "Simulador de analista SOC para gestión de alertas reales." },
        ],
  },
  {
    id: "bugbounty",
    name: "Bug Bounty",
    items: [
{ name: "HackerOne", url: "https://www.hackerone.com/", description: "Líder mundial en programas de recompensas corporativas." },
      { name: "YesWeHack", url: "https://www.yeswehack.com/", description: "Plataforma europea líder centrada en cumplimiento normativo." },
      { name: "Open Bug Bounty", url: "https://www.openbugbounty.org/", description: "Divulgación responsable abierta para mejorar perfil público." },
      { name: "Bug Crowd", url: "https://www.bugcrowd.com/", description: "Comunidad global de crowdsourced security y triaje." },
      { name: "Secur0", url: "https://secur0.com/es", description: "Plataforma hispana de hacking ético y pentesting." },
  ],
  },
  {
    id: "cheatsheet",
    name: "Cheatsheets",
    items: [
      { name: "Bash Cheatsheet", url: "/vault/bash-cheatsheet", description: "" },
      { name: "Python Cheatsheet", url: "/vault/python-cheatsheet", description: "" },
      { name: "Go Cheatsheet", url: "/vault/go-cheatsheet", description: "En proceso.." },
    ],
  },
  {
    id: "documentazion-aprendizaje",
    name: "Documentación / aprendizaje",
    items: [
{ name: "PayloadsAllTheThings", url: "https://github.com/swisskyrepo/payloadsallthethings", description: "Guías y payloads para explotación de vulnerabilidades." },
      { name: "HackTricks", url: "https://hacktricks.wiki/es/index.html", description: "Enciclopedia de técnicas de pentesting y hacking." },
      { name: "GTFOBins", url: "https://gtfobins.org/", description: "Binarios Unix para evadir restricciones y privilegios." },
      { name: "MITRE ATT&CK", url: "https://attack.mitre.org/", description: "Base de conocimientos sobre tácticas de adversarios." },
      { name: "OWASP", url: "https://owasp.org/", description: "Estándares y recursos globales de seguridad web." },
      { name: "LOLBAS", url: "https://lolbas-project.github.io/", description: "Binarios legítimos de Windows usados para ataques." },
    ],
  },
  {
    id: "content-creators",
    name: "Creadores de contenido / Writeups",
    items: [
      { name: "ippsec", url: "https://www.youtube.com/@ippsec", description: "" },
      { name: "El Pingüino de Mario", url: "https://www.youtube.com/@ElPinguinoDeMario", description: "" },
      { name: "S4vitar", url: "https://www.youtube.com/@s4vitar", description: "" },
      { name: "Hackavis", url: "https://www.youtube.com/@Hackavis", description: "" },
      { name: "0xFaluch0", url: "https://www.youtube.com/@0xFaluch0", description: "" },
      { name: "LiveOverflow", url: "https://www.youtube.com/@LiveOverflow", description: "" },
      { name: "The Cyber Mentors", url: "https://www.youtube.com/@TCMSecurityAcademy", description: "" },

    ],
  },
    {
    id: "formacion-certificacion",
    name: "Formación / Certificaciones",
    items: [
      { name: "CompTIA Security+", url: "https://www.comptia.org/en/certifications/security/", description: "" },
      { name: "Cisco Networking Academy", url: "https://www.netacad.com/es", description: "" },
      { name: "HTB Academy", url: "https://academy.hackthebox.com/", description: "" },
      { name: "TryHackMe", url: "https://tryhackme.com", description: "" },
      { name: "OffSec", url: "https://www.offsec.com/", description: "" },

    ],
  },
      {
    id: "otros",
    name: "Otros",
    items: [
      { name: "ExplainShell", url: "https://explainshell.com/", description: "Explica cualquier comando shell" },
      { name: "CyberChef", url: "https://gchq.github.io/CyberChef/", description: "Decode/Encode" },

    ],
  },
];