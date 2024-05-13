CREATE TABLE `Admin` (
  `id` integer PRIMARY KEY
);

CREATE TABLE `Medic` (
  `id` integer PRIMARY KEY
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
  `varsta_pacient` integer,
  `adresa_pacient` text,
  `telefon_pacient` varchar(15),
  `profesie_pacient` varchar(30),
  `loc_munca_pacient` text
);

CREATE TABLE `Alerta_pacient` (
  `ID_alerta_pacient` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `parafa_medic` varchar(10) NOT NULL,
  `mesaj_alerta` text,
  `data_alerta` date
);

CREATE TABLE `Date_medicale` (
  `ID_date_medicale` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `istoric_medical` text,
  `alergii` text,
  `consultatii_cardiologice` text
);

CREATE TABLE `Alerta_automata` (
  `ID_alerta_automata` integer PRIMARY KEY,
  `CNP_pacient` varchar(13) NOT NULL,
  `tip_senzor` varchar(20),
  `mesaj_automat` text,
  `data_alerta_automata` date
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

ALTER TABLE `Alerta_pacient` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Date_medicale` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Alerta_automata` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Senzor_ecg` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Senzor_temperatura` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);

ALTER TABLE `Senzor_puls` ADD FOREIGN KEY (`CNP_pacient`) REFERENCES `Pacient` (`CNP_pacient`);
