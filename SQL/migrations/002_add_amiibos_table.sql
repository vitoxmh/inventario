-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 13-04-2026
-- Versión del servidor: 11.8.3-MariaDB
-- Versión de PHP: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Estructura de tabla para la tabla `amiibos`
--

CREATE TABLE `amiibos` (
  `id` int(11) NOT NULL,
  `id_imagen` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `anio` int(11) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `calificacion` varchar(50) DEFAULT NULL,
  `precio` int(11) DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `amiibos`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `amiibos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Agregar columna amiibo_id a la tabla imagenes
--

ALTER TABLE imagenes ADD COLUMN amiibo_id VARCHAR(255) DEFAULT NULL AFTER juego_id;

COMMIT;