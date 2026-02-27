-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: aima_bike_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `structureSql` longtext NOT NULL,
  `dataSql` longtext NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cash`
--

DROP TABLE IF EXISTS `cash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerId` int NOT NULL,
  `copyOfNic` varchar(255) DEFAULT NULL,
  `photographOne` varchar(255) DEFAULT NULL,
  `photographTwo` varchar(255) DEFAULT NULL,
  `paymentReceipt` varchar(255) DEFAULT NULL,
  `mta2` varchar(255) DEFAULT NULL,
  `slip` varchar(255) DEFAULT NULL,
  `chequeNumber` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `cash_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `courier`
--

DROP TABLE IF EXISTS `courier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `customerId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `contactNumber` int DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `sentDate` date DEFAULT NULL,
  `receivedDate` date DEFAULT NULL,
  `receivername` varchar(255) DEFAULT NULL,
  `nic` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `courier_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `courier_ibfk_2` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `province` varchar(255) NOT NULL,
  `district` varchar(255) NOT NULL,
  `occupation` varchar(255) NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `religion` varchar(255) NOT NULL,
  `contactNumber` int DEFAULT NULL,
  `whatsappNumber` int DEFAULT NULL,
  `nic` varchar(255) NOT NULL,
  `modelId` int NOT NULL,
  `chassisNumber` varchar(255) NOT NULL,
  `motorNumber` varchar(255) NOT NULL,
  `colorOfVehicle` varchar(255) NOT NULL,
  `dateOfPurchase` date DEFAULT NULL,
  `loyalityCardNo` int DEFAULT NULL,
  `dateOfDelivery` date DEFAULT NULL,
  `sellingAmount` double DEFAULT NULL,
  `registrationFees` double DEFAULT NULL,
  `advancePaymentAmount` double DEFAULT NULL,
  `advancePaymentDate` date DEFAULT NULL,
  `balancePaymentAmount` double DEFAULT NULL,
  `balancePaymentDate` date DEFAULT NULL,
  `paymentId` int NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `status` varchar(255) DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `modelId` (`modelId`),
  KEY `paymentId` (`paymentId`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `customer_ibfk_2` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dealerconsignmentnote`
--

DROP TABLE IF EXISTS `dealerconsignmentnote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dealerconsignmentnote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dealerCode` varchar(255) NOT NULL,
  `dealerName` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `consignmentNoteNo` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `deliveryMode` varchar(255) DEFAULT NULL,
  `vehicleNo` varchar(255) DEFAULT NULL,
  `references` varchar(255) DEFAULT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_verification`
--

DROP TABLE IF EXISTS `email_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emailAddress` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expiresAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lease`
--

DROP TABLE IF EXISTS `lease`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lease` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerId` int NOT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `purchaseOrderNumber` int DEFAULT NULL,
  `copyOfNic` varchar(255) DEFAULT NULL,
  `photographOne` varchar(255) DEFAULT NULL,
  `photographTwo` varchar(255) DEFAULT NULL,
  `paymentReceipt` varchar(255) DEFAULT NULL,
  `mta2` varchar(255) DEFAULT NULL,
  `mta3` varchar(255) DEFAULT NULL,
  `chequeNumber` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `lease_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `model`
--

DROP TABLE IF EXISTS `model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `model_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passwordresettoken`
--

DROP TABLE IF EXISTS `passwordresettoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwordresettoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `userId` (`userId`),
  CONSTRAINT `passwordresettoken_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `isActiveAdmin` tinyint(1) DEFAULT '1',
  `isActiveManager` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shopdetails`
--

DROP TABLE IF EXISTS `shopdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `noteId` int NOT NULL,
  `modelId` int NOT NULL,
  `itemCode` varchar(255) DEFAULT NULL,
  `chassisNumber` varchar(255) DEFAULT NULL,
  `motorNumber` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `noteId` (`noteId`),
  KEY `modelId` (`modelId`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`noteId`) REFERENCES `dealerconsignmentnote` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_2` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transfer`
--

DROP TABLE IF EXISTS `transfer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `contactNumber` int DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `userId` int NOT NULL,
  `deliveryDetails` varchar(255) NOT NULL,
  `nic` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `transfer_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transferlist`
--

DROP TABLE IF EXISTS `transferlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transferId` int NOT NULL,
  `stockId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `transferId` (`transferId`),
  KEY `stockId` (`stockId`),
  CONSTRAINT `transferlist_ibfk_1` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transferlist_ibfk_2` FOREIGN KEY (`stockId`) REFERENCES `stock` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `emailAddress` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `modifiedDate` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `userRoleId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `emailAddress` (`emailAddress`),
  KEY `userRoleId` (`userRoleId`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`userRoleId`) REFERENCES `userrole` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userlogs`
--

DROP TABLE IF EXISTS `userlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `userlogs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userrole`
--

DROP TABLE IF EXISTS `userrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userrole` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userRole` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-27 10:50:50
