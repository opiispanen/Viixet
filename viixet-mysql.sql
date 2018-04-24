-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema viixet
-- -----------------------------------------------------
-- Viixet user and authentication database

-- -----------------------------------------------------
-- Schema viixet
--
-- Viixet user and authentication database
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `viixet` DEFAULT CHARACTER SET utf8 ;
USE `viixet` ;

-- -----------------------------------------------------
-- Table `viixet`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `viixet`.`user` (
  `viixetId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`viixetId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `viixet`.`authtoken`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `viixet`.`authtoken` (
  `token` VARCHAR(255) NOT NULL,
  `viixetId` INT UNSIGNED NOT NULL,
  `valid` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token`),
  INDEX `fk_AuthToken_User_idx` (`viixetId` ASC),
  CONSTRAINT `fk_AuthToken_User`
    FOREIGN KEY (`viixetId`)
    REFERENCES `viixet`.`user` (`viixetId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `viixet`.`group`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `viixet`.`group` (
  `groupId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` INT NULL DEFAULT 1 COMMENT '1 = private\n2 = pulic',
  PRIMARY KEY (`groupId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `viixet`.`group_user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `viixet`.`group_user` (
  `viixetId` INT UNSIGNED NOT NULL,
  `groupId` INT UNSIGNED NOT NULL,
  INDEX `fk_Group_User_User1_idx` (`viixetId` ASC),
  INDEX `fk_Group_User_Group1_idx` (`groupId` ASC),
  CONSTRAINT `fk_Group_User_User1`
    FOREIGN KEY (`viixetId`)
    REFERENCES `viixet`.`user` (`viixetId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Group_User_Group1`
    FOREIGN KEY (`groupId`)
    REFERENCES `viixet`.`group` (`groupId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
