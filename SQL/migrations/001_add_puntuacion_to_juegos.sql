-- Migration: Add puntuacion column to juegos table
-- Run this SQL in your database to add the puntuacion field

ALTER TABLE `juegos` ADD COLUMN `puntuacion` TINYINT NULL DEFAULT NULL AFTER `comentario`;
