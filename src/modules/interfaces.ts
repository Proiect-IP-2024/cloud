
export interface UserToken {
  id: number;
  email: string;
}

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  newPassword?: string;
}

export interface Medic extends User {
  telefon: string;
}

export interface Pacient {
  id?: string;
  id_medic?: string;
  CNP_pacient: string;
  varsta_pacient: number;
  adresa_pacient: string;
  telefon_pacient: string;
  profesie_pacient: string;
  loc_munca_pacient: string;
}

export interface Recomandare
{
 
  id_recomandare: number;
  CNP_pacient: string;
  tip_recomandare: string;
  durata_zilnica?: number;
  alte_indicatii?: string;
  tratamente?: string;
}


