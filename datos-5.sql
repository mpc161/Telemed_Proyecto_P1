-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 29-09-2026 a las 19:53:55
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `datos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `codigo` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `gestor` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`codigo`, `nombre`, `gestor`) VALUES
(0, 'Prueba', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Monitores'),
(2, 'Soporte Vital'),
(3, 'Movilidad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `id` int(11) NOT NULL,
  `estado` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id`, `estado`) VALUES
(0, 'Operativo'),
(1, 'De baja o Defectuoso'),
(2, 'En Mantenimiento');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestores`
--

CREATE TABLE `gestores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(75) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gestores`
--

INSERT INTO `gestores` (`id`, `nombre`, `apellidos`, `usuario`, `contraseña`) VALUES
(1, 'Laura', 'Sánchez Romero', 'lsanchez', 'lsanchez1'),
(2, 'Miguel Ángel', 'Torres', 'matorres', 'matorres1'),
(3, 'Marta', 'Patiño', 'mpatino', 'mpatino1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelos`
--

CREATE TABLE `modelos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(1000) NOT NULL,
  `categoria` int(11) NOT NULL,
  `horas_maximas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id`, `nombre`, `categoria`, `horas_maximas`) VALUES
(1, 'Monitor multiparamétrico Philips', 1, 48),
(2, 'Respirador Dräger Evita', 2, 72),
(3, 'Silla de ruedas estándar', 3, 24);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos`
--

CREATE TABLE `recursos` (
  `id` int(11) NOT NULL,
  `categoria` int(11) NOT NULL,
  `modelo` int(11) NOT NULL,
  `ubicacion` int(11) NOT NULL,
  `numero_serie` int(100) NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recursos`
--

INSERT INTO `recursos` (`id`, `categoria`, `modelo`, `ubicacion`, `numero_serie`, `estado`) VALUES
(1, 1, 1, 1, 100001, 0),
(2, 1, 1, 2, 100002, 2),
(3, 2, 2, 1, 100003, 0),
(4, 2, 2, 3, 100004, 1),
(5, 3, 3, 2, 100005, 0),
(6, 3, 3, 1, 100006, 2),
(7, 1, 1, 3, 100007, 0),
(8, 2, 2, 2, 100008, 0),
(9, 3, 3, 3, 100009, 1),
(10, 1, 1, 1, 100010, 0),
(11, 1, 1, 1, 100011, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenyas`
--

CREATE TABLE `resenyas` (
  `id` int(11) NOT NULL,
  `recurso` int(11) NOT NULL,
  `sanitario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `valor` int(11) NOT NULL,
  `descripcion` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resenyas`
--

INSERT INTO `resenyas` (`id`, `recurso`, `sanitario`, `fecha`, `valor`, `descripcion`) VALUES
(1, 1, 1, '2026-02-02', 5, 'Funcionó perfectamente durante toda la reserva.'),
(2, 3, 3, '2026-02-04', 4, 'Cómoda y en buen estado, aunque algo pesada.'),
(3, 11, 1, '2026-09-28', 1, 'OK');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `recurso` int(11) NOT NULL,
  `sanitario` int(11) NOT NULL,
  `horas_estimadas` int(100) NOT NULL,
  `fecha_peticion` date NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `recurso`, `sanitario`, `horas_estimadas`, `fecha_peticion`, `fecha_inicio`, `fecha_fin`) VALUES
(1, 1, 1, 24, '2026-02-01', '2026-02-01', '2026-02-02'),
(2, 7, 1, 12, '2026-03-10', '2026-03-10', NULL),
(3, 3, 2, 48, '2026-02-10', '2026-02-10', '2026-02-12'),
(4, 8, 2, 36, '2026-03-15', '2026-03-15', NULL),
(5, 5, 2, 10, '2026-03-20', NULL, NULL),
(6, 3, 3, 12, '2026-01-15', '2026-01-15', '2026-01-16'),
(8, 9, 3, 8, '2026-03-22', NULL, NULL),
(9, 11, 1, 2, '2026-09-28', '2026-09-28', NULL),
(11, 11, 1, 2, '2026-09-28', '2026-09-28', '2026-09-28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sanitarios`
--

CREATE TABLE `sanitarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(75) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(50) NOT NULL,
  `area` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sanitarios`
--

INSERT INTO `sanitarios` (`id`, `nombre`, `apellidos`, `usuario`, `contraseña`, `area`) VALUES
(1, 'Ana María', 'López', 'amlopez', 'amlopez1', 0),
(2, 'Carlos', 'Ruiz', 'cruiz', 'cruiz1', 0),
(3, 'Juan Pablo', 'Gómez', 'jpgomez', 'jpgomez1', 0),
(4, 'Aitana', 'Gil', 'agil', 'agil1', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `nombre`) VALUES
(1, 'Hospital General'),
(2, 'Almacén Central'),
(3, 'Laboratorio de Diagnóstico');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `gestor` (`gestor`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `gestores`
--
ALTER TABLE `gestores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria` (`categoria`);

--
-- Indices de la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria` (`categoria`),
  ADD KEY `modelo` (`modelo`),
  ADD KEY `ubicacion` (`ubicacion`),
  ADD KEY `estado` (`estado`);

--
-- Indices de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recurso` (`recurso`),
  ADD KEY `sanitario` (`sanitario`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recurso` (`recurso`),
  ADD KEY `sanitario` (`sanitario`);

--
-- Indices de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `area` (`area`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `gestores`
--
ALTER TABLE `gestores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `recursos`
--
ALTER TABLE `recursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`gestor`) REFERENCES `gestores` (`id`);

--
-- Filtros para la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD CONSTRAINT `modelos_ibfk_1` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD CONSTRAINT `recursos_ibfk_1` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `recursos_ibfk_2` FOREIGN KEY (`modelo`) REFERENCES `modelos` (`id`),
  ADD CONSTRAINT `recursos_ibfk_3` FOREIGN KEY (`ubicacion`) REFERENCES `ubicaciones` (`id`),
  ADD CONSTRAINT `recursos_ibfk_4` FOREIGN KEY (`estado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD CONSTRAINT `resenyas_ibfk_1` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`),
  ADD CONSTRAINT `resenyas_ibfk_2` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`),
  ADD CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);

--
-- Filtros para la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  ADD CONSTRAINT `sanitarios_ibfk_1` FOREIGN KEY (`area`) REFERENCES `areas` (`codigo`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
