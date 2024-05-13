CREATE TABLE Admin (
  id INTEGER PRIMARY KEY,
  nume_admin VARCHAR(50),
  prenume_admin VARCHAR(50)
);

CREATE TABLE Medic (
  id INTEGER PRIMARY KEY,
  nume_medic VARCHAR(50),
  prenume_medic VARCHAR(50),
  telefon_medic VARCHAR(15)
);

CREATE TABLE Supraveghetor (
  id INTEGER PRIMARY KEY,
  nume_supraveghetor VARCHAR(50),
  prenume_supraveghetor VARCHAR(50)
);

CREATE TABLE Ingrijitor (
  id INTEGER PRIMARY KEY,
  nume_ingrijitor VARCHAR(50),
  prenume_ingrijitor VARCHAR(50)
);

CREATE TABLE Pacient (
  id INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) UNIQUE,
  nume_pacient VARCHAR(50),
  prenume_pacient VARCHAR(50),
  varsta_pacient INTEGER,
  adresa_pacient TEXT,
  telefon_pacient VARCHAR(15),
  email_pacient VARCHAR(100) UNIQUE,
  profesie_pacient VARCHAR(30),
  loc_munca_pacient TEXT
);

CREATE TABLE Alerta_pacient (
  ID_alerta_pacient INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) NOT NULL,
  parafa_medic INTEGER NOT NULL, -- Changed data type to INTEGER
  mesaj_alerta TEXT,
  data_alerta DATE,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient),
  FOREIGN KEY (parafa_medic) REFERENCES Interface_user(id)
);

CREATE TABLE Date_medicale (
  ID_date_medicale INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) NOT NULL,
  istoric_medical TEXT,
  alergii TEXT,
  consultatii_cardiologice TEXT,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient)
);

CREATE TABLE Alerta_automata (
  ID_alerta_automata INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) NOT NULL,
  tip_senzor VARCHAR(20),
  mesaj_automat TEXT,
  data_alerta_automata DATE,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient)
);

CREATE TABLE Senzor_ecg (
  ID_ecg INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13),
  valoare_ecg FLOAT,
  validitate_ecg INTEGER,
  timestamp DATE,
  CUI VARCHAR(10),
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient)
);

CREATE TABLE Senzor_temperatura (
  ID_temp INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) NOT NULL,
  valoare_temp FLOAT,
  validitate_temp INTEGER,
  timestamp DATE,
  CUI VARCHAR(10),
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient)
);

CREATE TABLE Senzor_puls (
  ID_puls INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) NOT NULL,
  valoare_puls FLOAT,
  validitate_puls INTEGER,
  timestamp DATE,
  CUI VARCHAR(10),
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient)
);

CREATE TABLE Interface_user (
  id INTEGER PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL
);
