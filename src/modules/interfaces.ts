
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
export interface Medicamentatie
{
  id_medicamentatie: number;
  CNP_pacient: string;
  medicament: string;
  frecventa: string;
}


export interface Tratamente {

  id_tratament: number;
  CNP_pacient: string;
  tratament: string;
  data_emitere?: Date;
  alte_detalii?: string;
  bifat_supraveghetor?: boolean;
  data_ora_bifare?: Date;
  observatii_ingrijitor?: string;
}

export interface Diagnostic {

  id_diagnostic: number;
  CNP_pacient: string;
  diagnostic: string;
  data_emitere?: Date;
  alte_detalii?: string;
}
export interface Consult {
  id_consult: number;
  CNP_pacient: string;
  data_consult: Date;
  tensiune: number;
  glicemie: number;
  greutate: number;
}



export interface Date_medicale {
    
    ID_date_medicale: number;
    CNP_pacient: string;
    alergii: string;
    consultatii_cardiologice: string;

}
  
export interface Senzor_data {
    ID_senzor: number;
    CNP_pacient: string;
    valoare_puls?: number;
    validitate_puls?: number;
    valoare_temp?: number;
    validitate_temp?: number;
    valoare_ecg?: number;
    validitate_ecg?: number;
    timestamp?: Date;
    CUI?: string;
}

