-- Use this file to create your database using MySQL
CREATE SCHEMA IF NOT EXISTS `compasscar`;

USE `compasscar`;

-- 1. Veículos (Compatibilidade com a API/Front atual)
CREATE TABLE IF NOT EXISTS `cars` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `brand` VARCHAR(45) NULL,
  `model` VARCHAR(45) NULL,
  `year` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2. Itens dos Veículos (Compatibilidade com a API/Front atual)
CREATE TABLE IF NOT EXISTS `cars_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  `car_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_car_id` (`car_id` ASC),
  CONSTRAINT `fk_cars_items_car_id`
    FOREIGN KEY (`car_id`)
    REFERENCES `cars` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- 3. Clientes (Expansão do Modelo Físico)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `cnh` VARCHAR(20) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 4. Reservas (Expansão do Modelo Físico)
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `car_id` INT NOT NULL,
  `client_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('Pendente', 'Confirmada', 'Cancelada', 'Finalizada') DEFAULT 'Pendente',
  PRIMARY KEY (`id`),
  INDEX `idx_reservation_car` (`car_id` ASC),
  INDEX `idx_reservation_client` (`client_id` ASC),
  CONSTRAINT `fk_reservations_car`
    FOREIGN KEY (`car_id`)
    REFERENCES `cars` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_client`
    FOREIGN KEY (`client_id`)
    REFERENCES `clients` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;