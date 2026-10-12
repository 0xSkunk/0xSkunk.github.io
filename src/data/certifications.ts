export interface Certification {
  name: string;
  issuer: string;
  year?: string;
  status: "completed" | "in-progress";
  url?: string;
  logo?: string;         // URL del logo (opcional). Si no, se usa gradiente.
  gradient?: string;     // color del gradiente (default: varios)
}

export const certifications: Certification[] = [
    {
    name: "Sec+",
    issuer: "Comptia",
    year: "2026",
    status: "in-progress",
    url: "#",
    logo: "/certs/comptia.png",
  },
  {
    name: "CJCA",
    issuer: "HackTheBox",
    year: "2026",
    status: "completed",
    url: "https://www.credly.com/badges/4bdbac6c-3c2b-49f8-a844-32b44a915169/public_url",
    logo: "/certs/CJCA.png",
  },
  {
    name: "Certificado Profesional de Ciberseguridad",
    issuer: "Google",
    year: "2026",
    status: "in-progress",
    url: "#",
    logo: "/certs/google.png",
  },

];