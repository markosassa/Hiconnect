export type User = {
  user_id: number;
  email: string;
  // cspell:ignore codsoc
  codsoc: number;
  nome: string;
  role: Role;

  societa?: {
    codsoc: number;
    ragionesociale: string;
  };
};

export type Role = {
  codsoc: number;
  // cspell:ignore idrole
  idrole: number;
  slug: string;
  // cspell:ignore namerole
  namerole: string;
};

export type Funzione = {
  // cspell:ignore idfunzione
  idfunzione: number;
  slug: string;
};

export type Company = {
  codsoc: string;
  ragionesociale: string;
  piva: string;
  indirizzo: string;
};