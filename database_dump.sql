CREATE TABLE `Admin` (
  `id` integer PRIMARY KEY
);

CREATE TABLE `Medic` (
  `id` integer PRIMARY KEY,
  `telefon` varchar(20) UNIQUE
);

CREATE TABLE `Supraveghetor` (
  `id` integer PRIMARY KEY
);

CREATE TABLE `Ingrijitor` (
  `id` integer PRIMARY KEY
);

CREATE TABLE `Pacient` (
  `id` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) UNIQUE,
  `id_medic` integer,
  `varsta_pacient` integer,
  `adresa_pacient` text,
  `telefon_pacient` varchar(15),
  `profesie_pacient` varchar(30),
  `loc_munca_pacient` text
);
/*
CREATE TABLE `Alerta_pacient` (
  `ID_alerta_pacient` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `parafa_medic` varchar(10) NOT NULL,
  `mesaj_alerta` text,
  `data_alerta` date
);*/

CREATE TABLE `Date_medicale` (
  `ID_date_medicale` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  /*`istoric_medical` text,*/
  `alergii` text,
  `consultatii_cardiologice` text
);

CREATE TABLE `Consult` (
`id_consult` integer PRIMARY KEY,
`CNP_pacient` varchar(13) NOT NULL,
`data_consult` date,
`tensiune` integer,
`glicemie` integer,
`greutate` integer
);

/*
Date medicale (istoricul medical - diagnostice şi tratamente,  inclusiv scheme de medicaţie) 
*/
CREATE TABLE `Diagnostic`(
  `id_diagnostic` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `diagnostic` varchar(50) NOT NULL,
  `data_emitere` date,
  `alte_detalii` text
);

CREATE TABLE `Tratamente`(
  `id_tratament` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `tratament` varchar(50) NOT NULL,
  `data_emitere` date,
  `alte_detalii` text,
  `bifat_supraveghetor` boolean,
  `data_ora_bifare` datetime,
  `observatii_ingrijitor` text
);

CREATE TABLE `Schema_medicamentatie` (
  `id_medicament` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `nume_medicament` varchar(50) NOT NULL,
  `frecventa` text NOT NULL
);

/* !!!! */

CREATE TABLE `Recomadare_medic` (
  `id_recomandare` integer PRIMARY KEY,
  `CNP_pacient` varchar(20) NOT NULL,
  `tip_recomandare` varchar(50) NOT NULL,
  `durata_zilnica` integer,
  `alte_indicatii` text,
  `tratamente` text
);


CREATE TABLE `Alerta_automata` (
  `id_alerta_automata` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `tip_senzor` varchar(20),
  `mesaj_automat` text,
  `data_alerta_automata` date
);

CREATE TABLE `Alerta_Supraveghetor` (
  `id_alerta_upraveghetor` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `data_si_ora_alertei` datetime,
  `bifat` boolean,
  `data_si_ora_bifata` datetime
);

CREATE TABLE `Senzor_ecg` (
  `ID_ecg` integer PRIMARY KEY,
  `CNP_pacient` varchar(13),
  `valoare_ecg` float,
  `validitate_ecg` integer,
  `timestamp` date,
  `CUI` varchar(10)
);

CREATE TABLE `Senzor_temperatura` (
  `ID_temp` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `valoare_temp` float,
  `validitate_temp` integer,
  `timestamp` date,
  `CUI` varchar(10)
);

CREATE TABLE `Senzor_puls` (
  `ID_puls` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `valoare_puls` float,
  `validitate_puls` integer,
  `timestamp` date,
  `CUI` varchar(10)
);

CREATE TABLE `Users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) UNIQUE,
  `password_hash` varchar(100) NOT NULL
);

ALTER TABLE `Admin` ADD FOREIGN KEY (`id`) REFERENCES `Users` (`id`);

ALTER TABLE `Medic` ADD FOREIGN KEY (`id`) REFERENCES `Users` (`id`);

ALTER TABLE `Supraveghetor` ADD FOREIGN KEY (`id`) REFERENCES `Users` (`id`);

ALTER TABLE `Ingrijitor` ADD FOREIGN KEY (`id`) REFERENCES `Users` (`id`);

ALTER TABLE `Pacient` ADD FOREIGN KEY (`id`) REFERENCES `Users` (`id`);

ALTER TABLE `Pacient` ADD FOREIGN KEY (`id_medic`) REFERENCES `Medic` (`id`);

ALTER TABLE `Date_medicale` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Recomadare_medic` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Alerta_Supraveghetor` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Diagnostic` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Tratamente` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Schema_medicamentatie` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Consult` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Alerta_automata` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Senzor_ecg` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Senzor_temperatura` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Senzor_puls` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);



INSERT INTO `Users` (`id`, `first_name`, `last_name`, `email`, `password_hash`) VALUES
(2, 'test', 'test', 'test@test.com', '$2b$10$dfDF6kGjZpMf.Yqt43xE.emJobspEO3DO.4Py.WzVi403.I49jRy6'),
(3, 'admin', 'admin', 'admin@admin.com', '$2b$10$DzSfhadSWdAkGwZRkZfKbe0506E4/ZDvDGycmXsU5q2iYAyheg/Sm'),
(4, 'pacient', 'pacient', 'pacient@pacient.com', '$2b$10$oDXhIbSake70i1C9.1El6.klGOYeSDNvAEnw3Rvj2/Ae91dghL0mW'),
(5, 'medic', 'medic', 'medic@medic.com', '$2b$10$8SN80uTGLBGvAhUTLExr2.hSormi6pb6OIknqtxv7zXU82gphMIya'),
(6, 'Ingrijitor', 'Ingrijitor', 'ingrijitor@ingrijitor.com', '$2b$10$IJLioy1ZnZxY7khZ0i42UuiNc8v1tjSCeKw1lz2WJyhqMpADlpww6');


INSERT INTO `Medic` (`id`, `telefon`) VALUES
(5, '134567890');

INSERT INTO `Pacient` (`id`, `CNP_pacient`, `id_medic`, `varsta_pacient`, `adresa_pacient`, `telefon_pacient`, `profesie_pacient`, `loc_munca_pacient`) VALUES
(4, '1234567890123', 5, 50, '12334', '123456789', 'sofer pe tir', 'fsC');

INSERT INTO `Admin` (`id`) VALUES
(2),
(3);

INSERT INTO `Ingrijitor` (`id`) VALUES
(6);