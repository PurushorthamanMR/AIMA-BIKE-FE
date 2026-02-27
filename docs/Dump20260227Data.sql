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
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES (1,'backup_2026-02-27-05-05-45','-- AIMA Bike DB Backup\n-- Generated: 2026-02-27T05:05:45.963Z\n\n\n-- Table: cash\nDROP TABLE IF EXISTS `cash`;\nCREATE TABLE `cash` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `customerId` int NOT NULL,\n  `copyOfNic` varchar(255) DEFAULT NULL,\n  `photographOne` varchar(255) DEFAULT NULL,\n  `photographTwo` varchar(255) DEFAULT NULL,\n  `paymentReceipt` varchar(255) DEFAULT NULL,\n  `mta2` varchar(255) DEFAULT NULL,\n  `slip` varchar(255) DEFAULT NULL,\n  `chequeNumber` int DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `customerId` (`customerId`),\n  CONSTRAINT `cash_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: category\nDROP TABLE IF EXISTS `category`;\nCREATE TABLE `category` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `name` varchar(255) NOT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: courier\nDROP TABLE IF EXISTS `courier`;\nCREATE TABLE `courier` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `categoryId` int NOT NULL,\n  `customerId` int NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `contactNumber` int DEFAULT NULL,\n  `address` varchar(255) NOT NULL,\n  `sentDate` date DEFAULT NULL,\n  `receivedDate` date DEFAULT NULL,\n  `receivername` varchar(255) DEFAULT NULL,\n  `nic` varchar(255) DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `categoryId` (`categoryId`),\n  KEY `customerId` (`customerId`),\n  CONSTRAINT `courier_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `courier_ibfk_2` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: customer\nDROP TABLE IF EXISTS `customer`;\nCREATE TABLE `customer` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `name` varchar(255) NOT NULL,\n  `address` varchar(255) NOT NULL,\n  `province` varchar(255) NOT NULL,\n  `district` varchar(255) NOT NULL,\n  `occupation` varchar(255) NOT NULL,\n  `dateOfBirth` date DEFAULT NULL,\n  `religion` varchar(255) NOT NULL,\n  `contactNumber` int DEFAULT NULL,\n  `whatsappNumber` int DEFAULT NULL,\n  `nic` varchar(255) NOT NULL,\n  `modelId` int NOT NULL,\n  `chassisNumber` varchar(255) NOT NULL,\n  `motorNumber` varchar(255) NOT NULL,\n  `colorOfVehicle` varchar(255) NOT NULL,\n  `dateOfPurchase` date DEFAULT NULL,\n  `loyalityCardNo` int DEFAULT NULL,\n  `dateOfDelivery` date DEFAULT NULL,\n  `sellingAmount` double DEFAULT NULL,\n  `registrationFees` double DEFAULT NULL,\n  `advancePaymentAmount` double DEFAULT NULL,\n  `advancePaymentDate` date DEFAULT NULL,\n  `balancePaymentAmount` double DEFAULT NULL,\n  `balancePaymentDate` date DEFAULT NULL,\n  `paymentId` int NOT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  `status` varchar(255) DEFAULT \'pending\',\n  PRIMARY KEY (`id`),\n  KEY `modelId` (`modelId`),\n  KEY `paymentId` (`paymentId`),\n  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `customer_ibfk_2` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: dealerconsignmentnote\nDROP TABLE IF EXISTS `dealerconsignmentnote`;\nCREATE TABLE `dealerconsignmentnote` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `dealerCode` varchar(255) NOT NULL,\n  `dealerName` varchar(255) NOT NULL,\n  `address` varchar(255) DEFAULT NULL,\n  `consignmentNoteNo` varchar(255) NOT NULL,\n  `date` date DEFAULT NULL,\n  `deliveryMode` varchar(255) DEFAULT NULL,\n  `vehicleNo` varchar(255) DEFAULT NULL,\n  `references` varchar(255) DEFAULT NULL,\n  `contactPerson` varchar(255) DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: email_verification\nDROP TABLE IF EXISTS `email_verification`;\nCREATE TABLE `email_verification` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `emailAddress` varchar(255) NOT NULL,\n  `otp` varchar(10) NOT NULL,\n  `expiresAt` datetime NOT NULL,\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: lease\nDROP TABLE IF EXISTS `lease`;\nCREATE TABLE `lease` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `customerId` int NOT NULL,\n  `companyName` varchar(255) DEFAULT NULL,\n  `purchaseOrderNumber` int DEFAULT NULL,\n  `copyOfNic` varchar(255) DEFAULT NULL,\n  `photographOne` varchar(255) DEFAULT NULL,\n  `photographTwo` varchar(255) DEFAULT NULL,\n  `paymentReceipt` varchar(255) DEFAULT NULL,\n  `mta2` varchar(255) DEFAULT NULL,\n  `mta3` varchar(255) DEFAULT NULL,\n  `chequeNumber` int DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `customerId` (`customerId`),\n  CONSTRAINT `lease_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: model\nDROP TABLE IF EXISTS `model`;\nCREATE TABLE `model` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `categoryId` int NOT NULL,\n  `name` varchar(255) NOT NULL,\n  `imageUrl` varchar(255) DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `categoryId` (`categoryId`),\n  CONSTRAINT `model_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: passwordresettoken\nDROP TABLE IF EXISTS `passwordresettoken`;\nCREATE TABLE `passwordresettoken` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `userId` int NOT NULL,\n  `token` varchar(255) NOT NULL,\n  `expiresAt` datetime NOT NULL,\n  `used` tinyint(1) DEFAULT \'0\',\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `token` (`token`),\n  KEY `userId` (`userId`),\n  CONSTRAINT `passwordresettoken_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: payment\nDROP TABLE IF EXISTS `payment`;\nCREATE TABLE `payment` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `name` varchar(255) DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: settings\nDROP TABLE IF EXISTS `settings`;\nCREATE TABLE `settings` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `name` varchar(255) NOT NULL,\n  `isActiveAdmin` tinyint(1) DEFAULT \'1\',\n  `isActiveManager` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: shopdetails\nDROP TABLE IF EXISTS `shopdetails`;\nCREATE TABLE `shopdetails` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `name` varchar(255) NOT NULL,\n  `logo` varchar(255) DEFAULT NULL,\n  `address` varchar(255) DEFAULT NULL,\n  `phoneNumber` varchar(255) DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: stock\nDROP TABLE IF EXISTS `stock`;\nCREATE TABLE `stock` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `noteId` int NOT NULL,\n  `modelId` int NOT NULL,\n  `itemCode` varchar(255) DEFAULT NULL,\n  `chassisNumber` varchar(255) DEFAULT NULL,\n  `motorNumber` varchar(255) DEFAULT NULL,\n  `color` varchar(255) DEFAULT NULL,\n  `quantity` int DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `noteId` (`noteId`),\n  KEY `modelId` (`modelId`),\n  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`noteId`) REFERENCES `dealerconsignmentnote` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `stock_ibfk_2` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: transfer\nDROP TABLE IF EXISTS `transfer`;\nCREATE TABLE `transfer` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `companyName` varchar(255) NOT NULL,\n  `contactNumber` int DEFAULT NULL,\n  `address` varchar(255) NOT NULL,\n  `userId` int NOT NULL,\n  `deliveryDetails` varchar(255) NOT NULL,\n  `nic` varchar(255) DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `userId` (`userId`),\n  CONSTRAINT `transfer_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: transferlist\nDROP TABLE IF EXISTS `transferlist`;\nCREATE TABLE `transferlist` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `transferId` int NOT NULL,\n  `stockId` int NOT NULL,\n  `quantity` int NOT NULL DEFAULT \'1\',\n  PRIMARY KEY (`id`),\n  KEY `transferId` (`transferId`),\n  KEY `stockId` (`stockId`),\n  CONSTRAINT `transferlist_ibfk_1` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,\n  CONSTRAINT `transferlist_ibfk_2` FOREIGN KEY (`stockId`) REFERENCES `stock` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: user\nDROP TABLE IF EXISTS `user`;\nCREATE TABLE `user` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `firstName` varchar(255) NOT NULL,\n  `lastName` varchar(255) NOT NULL,\n  `password` varchar(255) NOT NULL,\n  `address` varchar(255) DEFAULT NULL,\n  `emailAddress` varchar(255) NOT NULL,\n  `mobileNumber` varchar(255) DEFAULT NULL,\n  `createdDate` datetime DEFAULT NULL,\n  `modifiedDate` datetime DEFAULT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  `userRoleId` int NOT NULL,\n  PRIMARY KEY (`id`),\n  UNIQUE KEY `emailAddress` (`emailAddress`),\n  KEY `userRoleId` (`userRoleId`),\n  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`userRoleId`) REFERENCES `userrole` (`id`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: userlogs\nDROP TABLE IF EXISTS `userlogs`;\nCREATE TABLE `userlogs` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `action` varchar(255) DEFAULT NULL,\n  `timestamp` datetime DEFAULT NULL,\n  `userId` int NOT NULL,\n  PRIMARY KEY (`id`),\n  KEY `userId` (`userId`),\n  CONSTRAINT `userlogs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n\n-- Table: userrole\nDROP TABLE IF EXISTS `userrole`;\nCREATE TABLE `userrole` (\n  `id` int NOT NULL AUTO_INCREMENT,\n  `userRole` varchar(255) NOT NULL,\n  `isActive` tinyint(1) DEFAULT \'1\',\n  PRIMARY KEY (`id`)\n) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;\n','-- AIMA Bike DB Backup\n-- Generated: 2026-02-27T05:05:45.963Z\n\n\n-- Data: category\nLOCK TABLES `category` WRITE;\nINSERT INTO `category` (`id`, `name`, `isActive`) VALUES (1,\'Bikes\',1);\nINSERT INTO `category` (`id`, `name`, `isActive`) VALUES (2,\'Parts\',1);\nINSERT INTO `category` (`id`, `name`, `isActive`) VALUES (3,\'Services\',1);\nUNLOCK TABLES;\n\n-- Data: dealerconsignmentnote\nLOCK TABLES `dealerconsignmentnote` WRITE;\nINSERT INTO `dealerconsignmentnote` (`id`, `dealerCode`, `dealerName`, `address`, `consignmentNoteNo`, `date`, `deliveryMode`, `vehicleNo`, `references`, `contactPerson`, `isActive`) VALUES (1,\'DC001\',\'ABC Motors\',\'123 Main St\',\'CN-2025-001\',\'2025-02-23\',\'By Road\',\'MH-01-AB-1234\',\'PO-123\',\'0765786336\',1);\nINSERT INTO `dealerconsignmentnote` (`id`, `dealerCode`, `dealerName`, `address`, `consignmentNoteNo`, `date`, `deliveryMode`, `vehicleNo`, `references`, `contactPerson`, `isActive`) VALUES (2,\'DC002\',\'YT Motors\',\'123 Main St\',\'CN-2025-001\',\'2025-02-23\',\'By Road\',\'MH-01-AB-1234\',\'PO-123\',\'0756753974\',1);\nUNLOCK TABLES;\n\n-- Data: model\nLOCK TABLES `model` WRITE;\nINSERT INTO `model` (`id`, `categoryId`, `name`, `imageUrl`, `isActive`) VALUES (1,1,\'Aria\',\'upload/bike-models/1772167559018_image\',1);\nINSERT INTO `model` (`id`, `categoryId`, `name`, `imageUrl`, `isActive`) VALUES (2,1,\'Breezy\',\'upload/bike-models/1772167571680_image\',1);\nINSERT INTO `model` (`id`, `categoryId`, `name`, `imageUrl`, `isActive`) VALUES (3,1,\'JoyBean\',\'upload/bike-models/1772167582959_image\',1);\nINSERT INTO `model` (`id`, `categoryId`, `name`, `imageUrl`, `isActive`) VALUES (4,1,\'Liberty\',\'upload/bike-models/1772167594204_image\',1);\nINSERT INTO `model` (`id`, `categoryId`, `name`, `imageUrl`, `isActive`) VALUES (5,1,\'Mana\',\'upload/bike-models/1772167607229_image\',1);\nINSERT INTO `model` (`id`, `categoryId`, `name`, `imageUrl`, `isActive`) VALUES (6,1,\'Maverich\',\'upload/bike-models/1772167627095_image\',1);\nUNLOCK TABLES;\n\n-- Data: payment\nLOCK TABLES `payment` WRITE;\nINSERT INTO `payment` (`id`, `name`, `isActive`) VALUES (1,\'Cash\',1);\nUNLOCK TABLES;\n\n-- Data: settings\nLOCK TABLES `settings` WRITE;\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (1,\'Dashboard\',1,0);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (2,\'POS\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (3,\'Payment\',1,0);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (4,\'Reports\',1,0);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (5,\'Stock\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (6,\'Models\',1,0);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (7,\'Category\',0,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (8,\'Transfer\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (9,\'Customers\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (10,\'Dealer\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (11,\'Courier\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (12,\'Profile\',1,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (13,\'User\',1,0);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (14,\'Shop Detail\',0,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (15,\'Settings\',0,1);\nINSERT INTO `settings` (`id`, `name`, `isActiveAdmin`, `isActiveManager`) VALUES (16,\'Database\',0,1);\nUNLOCK TABLES;\n\n-- Data: stock\nLOCK TABLES `stock` WRITE;\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (31,1,6,\'BIKE-GREY\',\'CH605\',\'MN605\',\'GREY\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (32,1,6,\'BIKE-GREY\',\'CH604\',\'MN604\',\'GREY\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (33,1,6,\'BIKE-GREY\',\'CH603\',\'MN603\',\'GREY\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (34,1,6,\'BIKE-GREY\',\'CH602\',\'MN602\',\'GREY\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (35,1,6,\'BIKE-GREY\',\'CH601\',\'MN601\',\'GREY\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (36,1,5,\'BIKE-SILVE\',\'CH505\',\'MN505\',\'SILVER\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (37,1,5,\'BIKE-SILVE\',\'CH504\',\'MN504\',\'SILVER\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (38,1,5,\'BIKE-SILVE\',\'CH503\',\'MN503\',\'SILVER\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (39,1,5,\'BIKE-SILVE\',\'CH502\',\'MN502\',\'SILVER\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (40,1,5,\'BIKE-SILVE\',\'CH501\',\'MN501\',\'SILVER\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (41,1,4,\'BIKE-WHITE\',\'CH405\',\'MN405\',\'WHITE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (42,1,4,\'BIKE-WHITE\',\'CH404\',\'MN404\',\'WHITE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (43,1,4,\'BIKE-WHITE\',\'CH403\',\'MN403\',\'WHITE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (44,1,4,\'BIKE-WHITE\',\'CH402\',\'MN402\',\'WHITE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (45,1,4,\'BIKE-WHITE\',\'CH401\',\'MN401\',\'WHITE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (46,1,3,\'BIKE-BLUE\',\'CH305\',\'MN305\',\'BLUE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (47,1,3,\'BIKE-BLUE\',\'CH304\',\'MN304\',\'BLUE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (48,1,3,\'BIKE-BLUE\',\'CH303\',\'MN303\',\'BLUE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (49,1,3,\'BIKE-BLUE\',\'CH302\',\'MN302\',\'BLUE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (50,1,3,\'BIKE-BLUE\',\'CH301\',\'MN301\',\'BLUE\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (51,1,2,\'BIKE-RED\',\'CH205\',\'MN205\',\'RED\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (52,1,2,\'BIKE-RED\',\'CH204\',\'MN204\',\'RED\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (53,1,2,\'BIKE-RED\',\'CH203\',\'MN203\',\'RED\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (54,1,2,\'BIKE-RED\',\'CH202\',\'MN202\',\'RED\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (55,1,2,\'BIKE-RED\',\'CH201\',\'MN201\',\'RED\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (56,1,1,\'BIKE-BLACK\',\'CH105\',\'MN105\',\'BLACK\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (57,1,1,\'BIKE-BLACK\',\'CH104\',\'MN104\',\'BLACK\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (58,1,1,\'BIKE-BLACK\',\'CH103\',\'MN103\',\'BLACK\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (59,1,1,\'BIKE-BLACK\',\'CH102\',\'MN102\',\'BLACK\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (60,1,1,\'BIKE-BLACK\',\'CH101\',\'MN101\',\'BLACK\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (61,2,1,\'BIKE-001\',\'CH101\',\'MN101\',\'Black\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (62,2,1,\'BIKE-001\',\'CH102\',\'MN102\',\'Red\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (63,2,1,\'BIKE-001\',\'CH103\',\'MN103\',\'Blue\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (64,2,1,\'BIKE-001\',\'CH104\',\'MN104\',\'White\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (65,2,1,\'BIKE-001\',\'CH105\',\'MN105\',\'Silver\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (66,2,2,\'BIKE-002\',\'CH201\',\'MN201\',\'Grey\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (67,2,2,\'BIKE-002\',\'CH202\',\'MN202\',\'Navy Blue\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (68,2,2,\'BIKE-002\',\'CH203\',\'MN203\',\'Green\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (69,2,2,\'BIKE-002\',\'CH204\',\'MN204\',\'Yellow\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (70,2,2,\'BIKE-002\',\'CH205\',\'MN205\',\'Orange\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (71,2,3,\'BIKE-003\',\'CH301\',\'MN301\',\'Maroon\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (72,2,3,\'BIKE-003\',\'CH302\',\'MN302\',\'Pearl White\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (73,2,3,\'BIKE-003\',\'CH303\',\'MN303\',\'Matte Black\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (74,2,3,\'BIKE-003\',\'CH304\',\'MN304\',\'Burgundy\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (75,2,3,\'BIKE-003\',\'CH305\',\'MN305\',\'Teal\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (76,2,4,\'BIKE-004\',\'CH401\',\'MN401\',\'Brown\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (77,2,4,\'BIKE-004\',\'CH402\',\'MN402\',\'Gold\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (78,2,4,\'BIKE-004\',\'CH403\',\'MN403\',\'Bronze\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (79,2,4,\'BIKE-004\',\'CH404\',\'MN404\',\'Graphite\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (80,2,4,\'BIKE-004\',\'CH405\',\'MN405\',\'Crimson\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (81,2,5,\'BIKE-005\',\'CH501\',\'MN501\',\'Ivory\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (82,2,5,\'BIKE-005\',\'CH502\',\'MN502\',\'Charcoal\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (83,2,5,\'BIKE-005\',\'CH503\',\'MN503\',\'Sky Blue\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (84,2,5,\'BIKE-005\',\'CH504\',\'MN504\',\'Lime Green\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (85,2,5,\'BIKE-005\',\'CH505\',\'MN505\',\'Purple\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (86,2,6,\'BIKE-006\',\'CH601\',\'MN601\',\'Metallic Red\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (87,2,6,\'BIKE-006\',\'CH602\',\'MN602\',\'Metallic Blue\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (88,2,6,\'BIKE-006\',\'CH603\',\'MN603\',\'Metallic Grey\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (89,2,6,\'BIKE-006\',\'CH604\',\'MN604\',\'Beige\',1);\nINSERT INTO `stock` (`id`, `noteId`, `modelId`, `itemCode`, `chassisNumber`, `motorNumber`, `color`, `quantity`) VALUES (90,2,6,\'BIKE-006\',\'CH605\',\'MN605\',\'Copper\',1);\nUNLOCK TABLES;\n\n-- Data: user\nLOCK TABLES `user` WRITE;\nINSERT INTO `user` (`id`, `firstName`, `lastName`, `password`, `address`, `emailAddress`, `mobileNumber`, `createdDate`, `modifiedDate`, `isActive`, `userRoleId`) VALUES (1,\'Prusothaman\',\'MR\',\'$2a$10$fT0hHwGvPEmuSZVGjc40burckiIBbrkzuBF9lFmbRCFLduwZSK7A2\',\'Jaffna\',\'mrprusothaman@gmail.com\',\'0765947337\',\'2026-02-27 04:27:52\',\'2026-02-27 04:31:07\',1,1);\nINSERT INTO `user` (`id`, `firstName`, `lastName`, `password`, `address`, `emailAddress`, `mobileNumber`, `createdDate`, `modifiedDate`, `isActive`, `userRoleId`) VALUES (2,\'Muhila\',\'Vijayakumar\',\'$2a$10$rNENdXBwTDJ4PVnAJDWdQ.UC.I0b6lwcJZV.r8Xl1RqWfas0oPDam\',\'Pollikandy\',\'muhilavijayakumar26@gmail.com\',\'0755364135\',\'2026-02-27 04:37:09\',NULL,1,2);\nINSERT INTO `user` (`id`, `firstName`, `lastName`, `password`, `address`, `emailAddress`, `mobileNumber`, `createdDate`, `modifiedDate`, `isActive`, `userRoleId`) VALUES (3,\'Nizmi\',\'Nivin\',\'$2a$10$t0r.BOJeFIQ7z2hr/NCXyOjme5eL.TLBNGEgwidj/vJbl20SDsY2O\',\'Neliadi\',\'nivinnizmi@gmail.com\',\'0755465765\',\'2026-02-27 04:44:44\',NULL,1,3);\nUNLOCK TABLES;\n\n-- Data: userrole\nLOCK TABLES `userrole` WRITE;\nINSERT INTO `userrole` (`id`, `userRole`, `isActive`) VALUES (1,\'Admin\',1);\nINSERT INTO `userrole` (`id`, `userRole`, `isActive`) VALUES (2,\'Manager\',1);\nINSERT INTO `userrole` (`id`, `userRole`, `isActive`) VALUES (3,\'Staff\',1);\nUNLOCK TABLES;\n','2026-02-27 05:05:45');
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cash`
--

LOCK TABLES `cash` WRITE;
/*!40000 ALTER TABLE `cash` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Bikes',1),(2,'Parts',1),(3,'Services',1);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `courier`
--

LOCK TABLES `courier` WRITE;
/*!40000 ALTER TABLE `courier` DISABLE KEYS */;
/*!40000 ALTER TABLE `courier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `dealerconsignmentnote`
--

LOCK TABLES `dealerconsignmentnote` WRITE;
/*!40000 ALTER TABLE `dealerconsignmentnote` DISABLE KEYS */;
INSERT INTO `dealerconsignmentnote` VALUES (1,'DC001','ABC Motors','123 Main St','CN-2025-001','2025-02-23','By Road','MH-01-AB-1234','PO-123','0765786336',1),(2,'DC002','YT Motors','123 Main St','CN-2025-001','2025-02-23','By Road','MH-01-AB-1234','PO-123','0756753974',1);
/*!40000 ALTER TABLE `dealerconsignmentnote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `email_verification`
--

LOCK TABLES `email_verification` WRITE;
/*!40000 ALTER TABLE `email_verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lease`
--

LOCK TABLES `lease` WRITE;
/*!40000 ALTER TABLE `lease` DISABLE KEYS */;
/*!40000 ALTER TABLE `lease` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `model`
--

LOCK TABLES `model` WRITE;
/*!40000 ALTER TABLE `model` DISABLE KEYS */;
INSERT INTO `model` VALUES (1,1,'Aria','upload/bike-models/1772167559018_image',1),(2,1,'Breezy','upload/bike-models/1772167571680_image',1),(3,1,'JoyBean','upload/bike-models/1772167582959_image',1),(4,1,'Liberty','upload/bike-models/1772167594204_image',1),(5,1,'Mana','upload/bike-models/1772167607229_image',1),(6,1,'Maverich','upload/bike-models/1772167627095_image',1);
/*!40000 ALTER TABLE `model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `passwordresettoken`
--

LOCK TABLES `passwordresettoken` WRITE;
/*!40000 ALTER TABLE `passwordresettoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `passwordresettoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,'Cash',1);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'Dashboard',1,0),(2,'POS',1,1),(3,'Payment',1,0),(4,'Reports',1,0),(5,'Stock',1,1),(6,'Models',1,0),(7,'Category',0,1),(8,'Transfer',1,1),(9,'Customers',1,1),(10,'Dealer',1,1),(11,'Courier',1,1),(12,'Profile',1,1),(13,'User',1,0),(14,'Shop Detail',0,1),(15,'Settings',0,1),(16,'Database',0,1);
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `shopdetails`
--

LOCK TABLES `shopdetails` WRITE;
/*!40000 ALTER TABLE `shopdetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `shopdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (31,1,6,'BIKE-GREY','CH605','MN605','GREY',1),(32,1,6,'BIKE-GREY','CH604','MN604','GREY',1),(33,1,6,'BIKE-GREY','CH603','MN603','GREY',1),(34,1,6,'BIKE-GREY','CH602','MN602','GREY',1),(35,1,6,'BIKE-GREY','CH601','MN601','GREY',1),(36,1,5,'BIKE-SILVE','CH505','MN505','SILVER',1),(37,1,5,'BIKE-SILVE','CH504','MN504','SILVER',1),(38,1,5,'BIKE-SILVE','CH503','MN503','SILVER',1),(39,1,5,'BIKE-SILVE','CH502','MN502','SILVER',1),(40,1,5,'BIKE-SILVE','CH501','MN501','SILVER',1),(41,1,4,'BIKE-WHITE','CH405','MN405','WHITE',1),(42,1,4,'BIKE-WHITE','CH404','MN404','WHITE',1),(43,1,4,'BIKE-WHITE','CH403','MN403','WHITE',1),(44,1,4,'BIKE-WHITE','CH402','MN402','WHITE',1),(45,1,4,'BIKE-WHITE','CH401','MN401','WHITE',1),(46,1,3,'BIKE-BLUE','CH305','MN305','BLUE',1),(47,1,3,'BIKE-BLUE','CH304','MN304','BLUE',1),(48,1,3,'BIKE-BLUE','CH303','MN303','BLUE',1),(49,1,3,'BIKE-BLUE','CH302','MN302','BLUE',1),(50,1,3,'BIKE-BLUE','CH301','MN301','BLUE',1),(51,1,2,'BIKE-RED','CH205','MN205','RED',1),(52,1,2,'BIKE-RED','CH204','MN204','RED',1),(53,1,2,'BIKE-RED','CH203','MN203','RED',1),(54,1,2,'BIKE-RED','CH202','MN202','RED',1),(55,1,2,'BIKE-RED','CH201','MN201','RED',1),(56,1,1,'BIKE-BLACK','CH105','MN105','BLACK',1),(57,1,1,'BIKE-BLACK','CH104','MN104','BLACK',1),(58,1,1,'BIKE-BLACK','CH103','MN103','BLACK',1),(59,1,1,'BIKE-BLACK','CH102','MN102','BLACK',1),(60,1,1,'BIKE-BLACK','CH101','MN101','BLACK',1),(61,2,1,'BIKE-001','CH101','MN101','Black',1),(62,2,1,'BIKE-001','CH102','MN102','Red',1),(63,2,1,'BIKE-001','CH103','MN103','Blue',1),(64,2,1,'BIKE-001','CH104','MN104','White',1),(65,2,1,'BIKE-001','CH105','MN105','Silver',1),(66,2,2,'BIKE-002','CH201','MN201','Grey',1),(67,2,2,'BIKE-002','CH202','MN202','Navy Blue',1),(68,2,2,'BIKE-002','CH203','MN203','Green',1),(69,2,2,'BIKE-002','CH204','MN204','Yellow',1),(70,2,2,'BIKE-002','CH205','MN205','Orange',1),(71,2,3,'BIKE-003','CH301','MN301','Maroon',1),(72,2,3,'BIKE-003','CH302','MN302','Pearl White',1),(73,2,3,'BIKE-003','CH303','MN303','Matte Black',1),(74,2,3,'BIKE-003','CH304','MN304','Burgundy',1),(75,2,3,'BIKE-003','CH305','MN305','Teal',1),(76,2,4,'BIKE-004','CH401','MN401','Brown',1),(77,2,4,'BIKE-004','CH402','MN402','Gold',1),(78,2,4,'BIKE-004','CH403','MN403','Bronze',1),(79,2,4,'BIKE-004','CH404','MN404','Graphite',1),(80,2,4,'BIKE-004','CH405','MN405','Crimson',1),(81,2,5,'BIKE-005','CH501','MN501','Ivory',1),(82,2,5,'BIKE-005','CH502','MN502','Charcoal',1),(83,2,5,'BIKE-005','CH503','MN503','Sky Blue',1),(84,2,5,'BIKE-005','CH504','MN504','Lime Green',1),(85,2,5,'BIKE-005','CH505','MN505','Purple',1),(86,2,6,'BIKE-006','CH601','MN601','Metallic Red',1),(87,2,6,'BIKE-006','CH602','MN602','Metallic Blue',1),(88,2,6,'BIKE-006','CH603','MN603','Metallic Grey',1),(89,2,6,'BIKE-006','CH604','MN604','Beige',1),(90,2,6,'BIKE-006','CH605','MN605','Copper',1);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `transfer`
--

LOCK TABLES `transfer` WRITE;
/*!40000 ALTER TABLE `transfer` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `transferlist`
--

LOCK TABLES `transferlist` WRITE;
/*!40000 ALTER TABLE `transferlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `transferlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Prusothaman','MR','$2a$10$fT0hHwGvPEmuSZVGjc40burckiIBbrkzuBF9lFmbRCFLduwZSK7A2','Jaffna','mrprusothaman@gmail.com','0765947337','2026-02-27 04:27:52','2026-02-27 04:31:07',1,1),(2,'Muhila','Vijayakumar','$2a$10$rNENdXBwTDJ4PVnAJDWdQ.UC.I0b6lwcJZV.r8Xl1RqWfas0oPDam','Pollikandy','muhilavijayakumar26@gmail.com','0755364135','2026-02-27 04:37:09',NULL,1,2),(3,'Nizmi','Nivin','$2a$10$t0r.BOJeFIQ7z2hr/NCXyOjme5eL.TLBNGEgwidj/vJbl20SDsY2O','Neliadi','nivinnizmi@gmail.com','0755465765','2026-02-27 04:44:44',NULL,1,3);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `userlogs`
--

LOCK TABLES `userlogs` WRITE;
/*!40000 ALTER TABLE `userlogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `userlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `userrole`
--

LOCK TABLES `userrole` WRITE;
/*!40000 ALTER TABLE `userrole` DISABLE KEYS */;
INSERT INTO `userrole` VALUES (1,'Admin',1),(2,'Manager',1),(3,'Staff',1);
/*!40000 ALTER TABLE `userrole` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-27 10:51:30
