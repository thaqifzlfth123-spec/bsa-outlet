-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 03, 2026 at 01:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bsa`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CustomerID` varchar(10) NOT NULL,
  `CustomerName` varchar(100) NOT NULL,
  `CustomerAddress` varchar(200) DEFAULT NULL,
  `IsMember` int(11) DEFAULT 0,
  `MembershipLevel` varchar(50) DEFAULT 'Non-Member',
  `Points` int(11) DEFAULT 0,
  `JoinDate` timestamp NULL DEFAULT NULL,
  `CustomerEmail` varchar(100) DEFAULT NULL,
  `CustomerPassword` varchar(255) DEFAULT NULL,
  `CustomerPhone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CustomerID`, `CustomerName`, `CustomerAddress`, `IsMember`, `MembershipLevel`, `Points`, `JoinDate`, `CustomerEmail`, `CustomerPassword`, `CustomerPhone`) VALUES
('C001', 'muhammad thaqif', '', 0, 'Non-Member', 0, '2026-07-01 02:49:02', 'thaqifzlfth123@gmail.com', '4db53acaa19866a3e0288a2141048317', '');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `EmployeeID` varchar(10) NOT NULL,
  `EmployeeName` varchar(100) NOT NULL,
  `EmpDOB` date DEFAULT NULL,
  `EmpAddress` varchar(10) DEFAULT NULL,
  `EmpHiredDate` date DEFAULT NULL,
  `EmployeeEmail` varchar(100) DEFAULT NULL,
  `EmployeePassword` varchar(255) DEFAULT NULL,
  `EmployeePhone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `EmpDOB`, `EmpAddress`, `EmpHiredDate`, `EmployeeEmail`, `EmployeePassword`, `EmployeePhone`) VALUES
('E001', 'Admin Staff', '2000-01-01', '123 St', '2024-01-01', 'staff@bsa.com', 'de9bf5643eabf80f4a56fda3bbb84483', '0123456789');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `FeedbackID` varchar(10) NOT NULL,
  `FeedbackDate` date NOT NULL,
  `OrderID` varchar(10) NOT NULL,
  `CustomerID` varchar(10) NOT NULL,
  `Message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `OrderID` varchar(10) NOT NULL,
  `OrderDate` date NOT NULL,
  `OrderAmount` decimal(10,2) NOT NULL,
  `CustomerID` varchar(10) NOT NULL,
  `EmployeeID` varchar(10) NOT NULL,
  `StockID` varchar(10) NOT NULL,
  `Quantity` int(11) DEFAULT NULL,
  `Size` varchar(50) DEFAULT NULL,
  `Colour` varchar(50) DEFAULT NULL,
  `DeliveryType` varchar(50) DEFAULT NULL,
  `CustomerName` varchar(100) DEFAULT NULL,
  `EmployeeName` varchar(100) DEFAULT NULL,
  `EmployeeAddress` varchar(200) DEFAULT NULL,
  `OrderStatus` varchar(50) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `StockID` varchar(10) NOT NULL,
  `StockQuantity` int(11) NOT NULL,
  `StockCategory` varchar(10) NOT NULL,
  `StockName` varchar(100) DEFAULT NULL,
  `StockPrice` decimal(10,2) DEFAULT NULL,
  `ImageURL` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`StockID`, `StockQuantity`, `StockCategory`, `StockName`, `StockPrice`, `ImageURL`) VALUES
('S001', 50, 'Menswear', 'Basic T-Shirt', 45.99, 'images/basic_tshirt.jpg'),
('S002', 30, 'Menswear', 'Oversized Hoodie', 89.50, 'images/oversized_hoodie.jpg'),
('S003', 25, 'Womenswear', 'Floral Dress', 129.90, 'images/floral_dress.jpg'),
('S004', 40, 'Kids', 'Kids T-Shirt', 29.99, 'images/kids_tshirt.jpg'),
('S005', 20, 'Shoe', 'Running Shoes', 199.00, 'images/running_shoes.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CustomerID`),
  ADD UNIQUE KEY `CustomerEmail` (`CustomerEmail`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmployeeID`),
  ADD UNIQUE KEY `EmployeeEmail` (`EmployeeEmail`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`FeedbackID`),
  ADD UNIQUE KEY `OrderID` (`OrderID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `CustomerID` (`CustomerID`),
  ADD KEY `EmployeeID` (`EmployeeID`),
  ADD KEY `StockID` (`StockID`),
  ADD KEY `StockID_2` (`StockID`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`StockID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `order` (`OrderID`),
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`);

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`),
  ADD CONSTRAINT `order_ibfk_2` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`),
  ADD CONSTRAINT `order_ibfk_3` FOREIGN KEY (`StockID`) REFERENCES `stock` (`StockID`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
