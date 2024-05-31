CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(100) NOT NULL
);

CREATE TABLE Admin (
  id INTEGER PRIMARY KEY,
  FOREIGN KEY (id) REFERENCES Users (id)
);

CREATE TABLE Medic (
  id INTEGER PRIMARY KEY,
  telefon VARCHAR(20) UNIQUE,
  FOREIGN KEY (id) REFERENCES Users (id)
);

CREATE TABLE Supraveghetor (
  id INTEGER PRIMARY KEY,
  FOREIGN KEY (id) REFERENCES Users (id)
);

CREATE TABLE Ingrijitor (
  id INTEGER PRIMARY KEY,
  FOREIGN KEY (id) REFERENCES Users (id)
);

CREATE TABLE Pacient (
  id INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) UNIQUE,
  id_medic INTEGER,
  varsta_pacient INTEGER,
  adresa_pacient TEXT,
  telefon_pacient VARCHAR(15),
  profesie_pacient VARCHAR(30),
  loc_munca_pacient TEXT,
  FOREIGN KEY (id) REFERENCES Users (id),
  FOREIGN KEY (id_medic) REFERENCES Medic (id)
);

CREATE TABLE Date_medicale (
  ID_date_medicale INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(13) NOT NULL,
  alergii TEXT,
  consultatii_cardiologice TEXT,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Consult (
  id_consult INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(13) NOT NULL,
  data_consult DATE,
  tensiune INTEGER,
  glicemie INTEGER,
  greutate INTEGER,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Diagnostic(
  id_diagnostic INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(13) NOT NULL,
  diagnostic VARCHAR(50) NOT NULL,
  data_emitere DATE,
  alte_detalii TEXT,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Tratamente(
  id_tratament INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(13) NOT NULL,
  tratament VARCHAR(50) NOT NULL,
  data_emitere DATE,
  alte_detalii TEXT,
  bifat_supraveghetor BOOLEAN,
  data_ora_bifare DATETIME,
  observatii_ingrijitor TEXT,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Schema_medicamentatie (
  id_medicament INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(13) NOT NULL,
  nume_medicament VARCHAR(50) NOT NULL,
  frecventa TEXT NOT NULL,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Recomadare_medic (
  id_recomandare INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(20) NOT NULL,
  tip_recomandare VARCHAR(50) NOT NULL,
  durata_zilnica INTEGER,
  alte_indicatii TEXT,
  tratamente TEXT,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Configurare_Alerta(
  id_configurare_alerta INTEGER PRIMARY KEY AUTO_INCREMENT,
  id_medic INTEGER NOT NULL,
  CNP_pacient VARCHAR(13) NOT NULL,
  umiditate_valoare_maxima FLOAT NOT NULL,
  temperatura_valoare_maxima FLOAT NOT NULL,
  puls_valoare_maxima FLOAT NOT NULL,
  puls_valoare_minima FLOAT NOT NULL,
  umiditate_valoare_minima FLOAT,
  temperatura_valoare_minima FLOAT,
  FOREIGN KEY (id_medic) REFERENCES Medic (id),
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Istoric_Alerte_automate(
  id_alerta_automata INTEGER PRIMARY KEY AUTO_INCREMENT,
  data_alerta_automata DATETIME NOT NULL,
  data_rezolvare_alerta DATETIME,
  CNP_pacient VARCHAR(13) NOT NULL,
  umiditate FLOAT,
  temperatura FLOAT,
  puls FLOAT,
  resolved BOOLEAN,
  resolved_by INTEGER,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient(CNP_pacient),
  FOREIGN KEY (resolved_by) REFERENCES Ingrijitor(id)
);

CREATE TABLE Alerta_Supraveghetor (
  id_alerta_supraveghetor INTEGER PRIMARY KEY,
  CNP_pacient VARCHAR(13) NOT NULL,
  data_si_ora_alertei DATETIME,
  bifat BOOLEAN,
  data_si_ora_bifata DATETIME,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

CREATE TABLE Senzor_data (
  ID_senzor INTEGER PRIMARY KEY AUTO_INCREMENT,
  CNP_pacient VARCHAR(13) NOT NULL,
  valoare_puls FLOAT,
  validitate_puls INTEGER,
  valoare_temp FLOAT,
  validitate_temp INTEGER,
  valoare_umiditate FLOAT,
  validitate_umiditate INTEGER,
  valoare_lumina FLOAT,
  validitate_lumina INTEGER,
  timestamp DATE,
  FOREIGN KEY (CNP_pacient) REFERENCES Pacient (CNP_pacient)
);

INSERT INTO Users (id, first_name, last_name, email, password_hash) VALUES
(1, 'Ana', 'Popescu', 'ana.popescu@yahoo.com', '$2b$10$R8JUgFL5PCOuANcaMN0J4eZ8/J/gNZfL9Wv35/ZGPII6JpB4swTg2'), -- Ana Popescu
(2, 'Mihai', 'Ionescu', 'mihai.ionescu@yahoo.com', '$2b$10$5uCYEl3fXVd4wzihM/jaMOaAlLx/t5yWZLZ24X2PleV5Gh98sKg8G'), -- Mihai Ionescu
(3, 'Elena', 'Dumitrescu', 'elena.dumitrescu@yahoo.com', '$2b$10$lF5c3Cg3d4uq7.SDURJbYOWzMPF7fYjHd0abtwiDnm.7ZQ4hWtwre'), -- Elena Dumitrescu
(4, 'Alexandru', 'Popa', 'alexandru.popa@yahoo.com', '$2b$10$ro13Wk0kQ2OP09J0c3yt8.GTBGj3hCn5i2m3XaEJ8FmMTbyMBE2Nu'), -- Alexandru Popa
(5, 'Maria', 'Muresan', 'maria.muresan@yahoo.com', '$2b$10$PB24x8I0yrT29wgy5mWac.PF3rXwXZChkSIZYk4H57ojrN6Jvn44C'), -- Maria Muresan
(6, 'Ioana', 'Pop', 'ioana.pop@yahoo.com', '$2b$10$ABcdEfghIJKLmnOPQrStuvWXYzabcdefgHIJKLmnoP'),
(7, 'Andrei', 'Ionescu', 'andrei.ionescu@yahoo.com', '$2b$10$BCdeFghiJKLMnoPQRsTuvwXYZabcdeFGHIJklMnop'),
(8, 'Gabriela', 'Dumitrescu', 'gabriela.dumitrescu@yahoo.com', '$2b$10$CDefGhijKLMnoPQRsTuVwxYZabCdefghIJKLmnopq'),
(9, 'Cristian', 'Popa', 'cristian.popa@yahoo.com', '$2b$10$DEfgHijkLMnopQRstUVwxYzAbcDEfGhIjKlmnOPqr'),
(10, 'Ana', 'Ionescu', 'ana.ionescu@yahoo.com', '$2b$10$EFghIjklMNoPqrSTuvWxyZaBCDEFghijKLMnoPqrsT'),
(11, 'Laura', 'Popescu', 'laura.popescu@yahoo.com', '$2b$10$FGHijkLMnopqRSTuvwXYzA'),
(12, 'Ciprian', 'Ionescu', 'ciprian.ionescu@yahoo.com', '$2b$10$GhIjklMNoPqrSTuvWxyZAb'),
(13, 'Andreea', 'Dumitrescu', 'andreea.dumitrescu@yahoo.com', '$2b$10$HIjklMNoPqrSTuvwXYZabC'),
(14, 'Marius', 'Popa', 'marius.popa@yahoo.com', '$2b$10$IjklMNoPqrSTuvwXYZabCd'),
(15, 'Simona', 'Ionescu', 'simona.ionescu@yahoo.com', '$2b$10$jklMNoPqrSTuvwXYZabCde'),
(16, 'Adrian', 'Georgescu', 'adrian.georgescu@yahoo.com', '$2b$10$FghijkLMnopQRSTuvwXYzA'),
(17, 'Raluca', 'Stoica', 'raluca.stoica@yahoo.com', '$2b$10$GhIjklMNoPqrSTuvWxyZAb'),
(18, 'Dan', 'Marinescu', 'dan.marinescu@yahoo.com', '$2b$10$HIjklMNoPqrSTuvwXYZabC'),
(19, 'Cristina', 'Tanase', 'cristina.tanase@yahoo.com', '$2b$10$IjklMNoPqrSTuvwXYZabCd'),
(20, 'Florin', 'Dobre', 'florin.dobre@yahoo.com', '$2b$10$jklMNoPqrSTuvwXYZabCde');

INSERT INTO Users (id, first_name, last_name, email, password_hash) VALUES
(29, 'test', 'test', 'test@test.com', '$2b$10$dfDF6kGjZpMf.Yqt43xE.emJobspEO3DO.4Py.WzVi403.I49jRy6'),
(39, 'admin', 'admin', 'admin@admin.com', '$2b$10$DzSfhadSWdAkGwZRkZfKbe0506E4/ZDvDGycmXsU5q2iYAyheg/Sm'),
(49, 'pacient', 'pacient', 'pacient@pacient.com', '$2b$10$oDXhIbSake70i1C9.1El6.klGOYeSDNvAEnw3Rvj2/Ae91dghL0mW'),
(59, 'medic', 'medic', 'medic@medic.com', '$2b$10$8SN80uTGLBGvAhUTLExr2.hSormi6pb6OIknqtxv7zXU82gphMIya'),
(69, 'Ingrijitor', 'Ingrijitor', 'ingrijitor@ingrijitor.com', '$2b$10$IJLioy1ZnZxY7khZ0i42UuiNc8v1tjSCeKw1lz2WJyhqMpADlpww6');

INSERT INTO Medic (id, telefon) VALUES
(6, '0712345678'), -- Linked to Elena Dumitrescu
(7, '0723456789'), -- Linked to Alexandru Popa
(8, '0734567890'), -- Linked to Maria Muresan
(9, '0745678901'), -- Dummy Medic
(10, '0756789012'); -- Dummy Medic

INSERT INTO Medic (id, telefon) VALUES
(59, '134567890');

INSERT INTO Supraveghetor (id) VALUES
(11),
(12),
(13),
(14),
(15);

INSERT INTO Ingrijitor (id) VALUES
(16),
(17),
(18),
(19),
(20);

INSERT INTO Pacient (id, CNP_pacient, id_medic, varsta_pacient, adresa_pacient, telefon_pacient, profesie_pacient, loc_munca_pacient) VALUES
(1, '1234567890123', 59, 30, 'Str. Mihai Viteazu 12', '0712345678', 'Programator', 'Orange Romania'), -- Linked to Alexandru Popa
(2, '2345678901234', 7, 40, 'Str. Avram Iancu 5', '0723456789', 'Avocat', 'Cabinet Ionescu'), -- Linked to Maria Muresan
(3, '3456789012345', 59, 25, 'Bd. Unirii 21', '0734567890', 'Inginer', 'Dacia Pitesti'), -- Linked to Elena Dumitrescu
(4, '4567890123456', 9, 35, 'Str. Horea 33', '0745678901', 'Medic', 'Spitalul Clinic Judetean de Urgenta Cluj'), -- Linked to Alexandru Popa
(5, '5678901234567', 10, 45, 'Str. Tudor Vladimirescu 17', '0756789012', 'Profesor', 'Universitatea Babes-Bolyai Cluj'), -- Linked to Maria Muresan
(49,'3456789012346', 59, 25, 'Str. Horea 33', '0722222222', 'Sofer', 'SC Drumuri SRL');


INSERT INTO Consult (id_consult, CNP_pacient, data_consult, tensiune, glicemie, greutate) VALUES
(1, '1234567890123', '2024-05-01', 120, 90, 70),
(2, '2345678901234', '2024-05-02', 130, 95, 72),
(3, '3456789012345', '2024-05-03', 125, 92, 69),
(4, '4567890123456', '2024-05-04', 135, 100, 75),
(5, '5678901234567', '2024-05-05', 140, 105, 80);

INSERT INTO Date_medicale (ID_date_medicale, CNP_pacient, alergii, consultatii_cardiologice) VALUES
(1, '1234567890123', 'Polen', 'Hipertensiune, Aritmie'),
(2, '2345678901234', 'Niciuna', 'Niciuna'),
(3, '3456789012345', 'Penicilină', 'Colesterol mare'),
(4, '4567890123456', 'Arahide', 'Niciuna'),
(5, '5678901234567', 'Scoici', 'Hipertensiune, Diabet');



INSERT INTO Diagnostic (id_diagnostic, CNP_pacient, diagnostic, data_emitere, alte_detalii) VALUES
(1, '1234567890123', 'Tensiune arteriala ridicata', '2024-05-01', 'Necesita ajustari ale stilului de viata si medicamente antihipertensive'),
(2, '2345678901234', 'Niveluri crescute de colesterol LDL', '2024-05-02', 'Recomandari dietetice și monitorizare regulata a colesterolului'),
(3, '3456789012345', 'Alergie severa la arahide', '2024-05-03', 'Evitați orice consum de arahide și purtati întotdeauna un EpiPen'),
(4, '4567890123456', 'Diabet zaharat tip 2', '2024-05-04', 'Gestionarea glicemiei prin dieta, exercitii și medicamente antidiabetice'),
(5, '5678901234567', 'Hipertensiune arteriala și diabet zaharat tip 2', '2024-05-05', 'Strategii complexe de tratament pentru gestionarea ambelor condiții');

-- INSERT INTO Recomadare_medic (id_recomandare, CNP_pacient, tip_recomandare, durata_zilnica, alte_indicatii, tratamente) VALUES
-- (1, '1234567890123', 'top', 2, 'sex', 'nu');

-- INSERT INTO Schema_medicamentatie (id_medicament, CNP_pacient, nume_medicament, frecventa) VALUES
-- (1, '1234567890123', 'xanax', '3');

-- INSERT INTO Senzor_data (ID_senzor,CNP_pacient, valoare_puls, validitate_puls, valoare_temp, validitate_temp, valoare_umiditate, validitate_umiditate, valoare_lumina, validitate_lumina, timestamp) VALUES
-- (1,'1234567890123', 123, 1, 23, 1, 13, 1, 0.2, 1, '2024-05-24');

-- INSERT INTO Tratamente (id_tratament, CNP_pacient, tratament, data_emitere, alte_detalii, bifat_supraveghetor, data_ora_bifare, observatii_ingrijitor) VALUES
-- (1, '1234567890123', '2', '2024-05-23', 'sadfg', 1, '2024-05-22 01:38:59', 'sdafgh');


INSERT INTO Date_medicale (ID_date_medicale, CNP_pacient, alergii, consultatii_cardiologice) VALUES
(6, '1234567890123', 'Polen', 'Hipertensiune, Aritmie'),
(7, '2345678901234', 'Niciuna', 'Niciuna'),
(8, '3456789012345', 'Penicilină', 'Colesterol mare'),
(9, '4567890123456', 'Arahide', 'Niciuna'),
(10, '5678901234567', 'Scoici', 'Hipertensiune, Diabet');

INSERT INTO Consult (id_consult, CNP_pacient, data_consult, tensiune, glicemie, greutate) VALUES
(10, '1234567890123', '2024-05-01', 120, 90, 70),
(20, '2345678901234', '2024-05-02', 130, 95, 72),
(30, '3456789012345', '2024-05-03', 125, 92, 69),
(40, '4567890123456', '2024-05-04', 135, 100, 75),
(50, '5678901234567', '2024-05-05', 140, 105, 80);

-- Corectarea valorilor id_diagnostic și inserarea datelor fără diacritice
INSERT INTO Diagnostic (id_diagnostic, CNP_pacient, diagnostic, data_emitere, alte_detalii) VALUES
(10, '1234567890123', 'Hipertensiune arteriala', '2024-05-01', 'Niciun detaliu suplimentar'),
(20, '2345678901234', 'Stare de sanatate buna', '2024-05-02', 'Recomandat un control de rutina peste 6 luni'),
(30, '3456789012345', 'Colesterol ridicat', '2024-05-03', 'Se recomanda o dieta sanatoasa si exercitii fizice regulate'),
(40, '4567890123456', 'Alergie la arahide', '2024-05-04', 'Evitati alimentele care contin arahide'),
(50, '5678901234567', 'Hipertensiune arteriala si diabet', '2024-05-05', 'Monitorizare atenta si respectarea tratamentului prescris');

-- Continuare cu alte diagnosticuri, asigurandu-ne ca id_diagnostic este unic și fără diacritice
INSERT INTO Diagnostic (id_diagnostic, CNP_pacient, diagnostic, data_emitere, alte_detalii) VALUES
(60, '1234567890123', 'Tensiune arteriala ridicata', '2024-05-01', 'Necesita ajustari ale stilului de viata si/sau medicamente antihipertensive'),
(70, '2345678901234', 'Niveluri crescute de colesterol LDL', '2024-05-02', 'Recomandari dietetice si monitorizare regulata a colesterolului'),
(80, '3456789012345', 'Alergie severa la arahide', '2024-05-03', 'Evitati orice consum de arahide si purtati intotdeauna un EpiPen'),
(90, '4567890123456', 'Diabet zaharat tip 2', '2024-05-04', 'Gestionarea glicemiei prin dieta, exercitii si/sau medicamente antidiabetice'),
(100, '5678901234567', 'Hipertensiune arteriala si diabet zaharat tip 2', '2024-05-05', 'Strategii complexe de tratament pentru gestionarea ambelor conditii');



-- Inserari in Recomandare_medic
INSERT INTO Recomadare_medic (id_recomandare, CNP_pacient, tip_recomandare, durata_zilnica, alte_indicatii, tratamente) VALUES
(1, '1234567890123', 'Recomandare pentru exercitii fizice', 30, 'Plimbari zilnice in parc', 'Exercitii de intindere usoare'),
(2, '2345678901234', 'Recomandare pentru dieta', 0, 'Reducerea consumului de sare si zahar', 'Dieta mediteraneana'),
(3, '3456789012345', 'Recomandare pentru controlul glicemiei', 0, 'Monitorizare glicemie de 3 ori pe zi', 'Evitarea alimentelor cu indice glicemic ridicat'),
(4, '4567890123456', 'Recomandare pentru hipertensiune', 0, 'Reducerea consumului de cafea si alcool', 'Masurarea tensiunii arteriale zilnic'),
(5, '5678901234567', 'Recomandare pentru reducerea stresului', 15, 'Tehnici de respiratie si meditatie', 'Activitati de relaxare si yoga');

-- Inserari in Tratamente
INSERT INTO Tratamente (id_tratament, CNP_pacient, tratament, data_emitere, alte_detalii, bifat_supraveghetor, data_ora_bifare, observatii_ingrijitor) VALUES
(1, '1234567890123', 'Medicament antihipertensiv', '2024-05-01', '1 comprimat pe zi, dimineata', false, NULL, 'Monitorizare tensiune arteriala'),
(2, '2345678901234', 'Statine pentru colesterol', '2024-05-02', '1 comprimat pe zi, seara', true, '2024-05-15 08:00:00', 'Recomandari dietetice insotitoare'),
(3, '3456789012345', 'EpiPen pentru alergii', '2024-05-03', 'Utilizare in caz de reactie alergica', false, NULL, 'Pacientul trebuie sa poarte EpiPen-ul in permanenta'),
(4, '4567890123456', 'Metformin pentru diabet', '2024-05-04', '500 mg, de doua ori pe zi', true, '2024-05-15 09:00:00', 'Monitorizare regulata a glicemiei'),
(5, '5678901234567', 'Medicament antihipertensiv si Metformin', '2024-05-05', 'Medicament antihipertensiv: 1 comprimat pe zi, dimineata; Metformin: 500 mg, de doua ori pe zi', false, NULL, 'Pacientul trebuie sa urmeze ambele tratamente si sa monitorizeze tensiunea arteriala si glicemia');

-- Adaugarea unui nou utilizator cu id 123
INSERT INTO Users (id, first_name, last_name, email, password_hash) VALUES
(123, 'Admin', 'User', 'admin.user@yahoo.com', '$2b$10$AdminUserHashValue');

-- Adaugarea utilizatorului in tabela Admin
INSERT INTO Admin (id) VALUES
(123);

-- Inserari in Schema_medicamentatie
INSERT INTO Schema_medicamentatie (id_medicament, CNP_pacient, nume_medicament, frecventa) VALUES
(1, '1234567890123', 'Paracetamol', '1 comprimat la 8 ore'),
(2, '2345678901234', 'Ibuprofen', '1 comprimat la 6 ore'),
(3, '3456789012345', 'Amoxicilina', '1 comprimat la 12 ore'),
(4, '4567890123456', 'Metformin', '1 comprimat dimineata si seara'),
(5, '5678901234567', 'Atorvastatin', '1 comprimat pe zi seara');

-- Inserari in Alerta_Supraveghetor
INSERT INTO Alerta_Supraveghetor (id_alerta_supraveghetor, CNP_pacient, data_si_ora_alertei, bifat, data_si_ora_bifata) VALUES
(1, '1234567890123', '2024-05-20 08:00:00', true, '2024-05-20 09:00:00'),
(2, '2345678901234', '2024-05-21 10:00:00', true, '2024-05-21 11:30:00'),
(3, '3456789012345', '2024-05-22 12:00:00', false, NULL),
(4, '4567890123456', '2024-05-23 14:00:00', false, NULL),
(5, '5678901234567', '2024-05-24 16:00:00', false, NULL);

-- Inserari in Configurare_Alerta
INSERT INTO Configurare_Alerta (id_configurare_alerta, id_medic, CNP_pacient, umiditate_valoare_maxima, temperatura_valoare_maxima, puls_valoare_maxima, puls_valoare_minima, umiditate_valoare_minima, temperatura_valoare_minima) VALUES
(1, 6, '1234567890123', 70.0, 37.5, 120, 60, 30.0, 36.0),
(2, 7, '2345678901234', 75.0, 38.0, 130, 65, 35.0, 36.5),
(3, 8, '3456789012345', 80.0, 38.5, 125, 70, 40.0, 37.0),
(4, 9, '4567890123456', 85.0, 39.0, 140, 75, 45.0, 37.5),
(5, 10, '5678901234567', 90.0, 39.5, 135, 80, 50.0, 38.0);

-- Inserari in Istoric_Alerte_automate
INSERT INTO Istoric_Alerte_automate (id_alerta_automata, data_alerta_automata, data_rezolvare_alerta, CNP_pacient, umiditate, temperatura, puls, resolved, resolved_by) VALUES
(1, '2024-01-01 08:30:00', '2024-01-01 09:00:00', '1234567890123', 75.0, 37.8, 125, true, 16),
(2, '2024-01-02 10:45:00', NULL, '2345678901234', 80.0, 38.2, 130, false, NULL),
(3, '2024-01-03 14:15:00', '2024-01-03 15:00:00', '3456789012345', 82.0, 38.5, 128, true, 17),
(4, '2024-01-04 16:20:00', '2024-01-04 17:10:00', '4567890123456', 78.0, 37.9, 132, true, 18),
(5, '2024-01-05 11:30:00', NULL, '5678901234567', 85.0, 39.0, 135, false, NULL);

-- Inserari in Senzor_data
INSERT INTO Senzor_data (ID_senzor, CNP_pacient, valoare_puls, validitate_puls, valoare_temp, validitate_temp, valoare_umiditate, validitate_umiditate, valoare_lumina, validitate_lumina, timestamp) VALUES
(1, '1234567890123', 72.5, 1, 36.7, 1, 50.0, 1, 300.0, 1, '2024-05-01'),
(2, '2345678901234', 78.0, 1, 37.1, 1, 55.0, 1, 250.0, 1, '2024-05-02'),
(3, '3456789012345', 65.5, 1, 36.5, 1, 45.0, 1, 275.0, 1, '2024-05-03');
