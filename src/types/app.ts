export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  companyId: string | null;
};

export type Company = {
  id: string;
  nome: string;
  pIva: string;
  indirizzo: string;
};

export type Attribute = {
  id: string;
  nome: string;
  tipo: "text" | "number" | "boolean";
  companyId: string | null;
};

export type Recipient = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  attributi: Record<string, any>;
  companyId: string | null;
};

export type Communication = {
  id: string;
  data: string;
  destinatari: string[];
  tipoDestinatari: "tutti" | "singolo" | "attributo";
  filtroAttributo?: { attributoId: string; valore: any };
  oggetto: string;
  contenuto: string;
  links: string[];
  allegati: string[];
  canaliInvio: ("email" | "whatsapp")[];
};

export type AppState = {
  users: User[];
  companies: Company[];
  attributes: Attribute[];
  recipients: Recipient[];
  communications: Communication[];
};