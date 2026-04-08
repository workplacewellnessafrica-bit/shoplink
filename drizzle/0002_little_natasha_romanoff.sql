CREATE TABLE `attendants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`role` enum('attendant','accountant','manager') NOT NULL DEFAULT 'attendant',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendants_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendants_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `businessFeatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`featureName` varchar(50) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `businessFeatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dayEndReconciliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`openingBalance` decimal(10,2) NOT NULL DEFAULT 0,
	`daysSales` decimal(10,2) NOT NULL DEFAULT 0,
	`expenditures` decimal(10,2) NOT NULL DEFAULT 0,
	`closingBalance` decimal(10,2) NOT NULL DEFAULT 0,
	`cashAtHand` decimal(10,2),
	`mpesaTotal` decimal(10,2) NOT NULL DEFAULT 0,
	`cardTotal` decimal(10,2) NOT NULL DEFAULT 0,
	`credits` decimal(10,2) NOT NULL DEFAULT 0,
	`status` enum('pending','verified','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dayEndReconciliations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deviceSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deviceSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otpVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(30) NOT NULL,
	`otpCode` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`attendantId` int,
	`items` text NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('cash','mpesa','card','credit') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `posTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productBarcodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`barcodeValue` varchar(255) NOT NULL,
	`barcodeImage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productBarcodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `productBarcodes_barcodeValue_unique` UNIQUE(`barcodeValue`)
);
--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `isPasswordSet` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `orderType` enum('web','pos') DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `productCode` varchar(50);--> statement-breakpoint
ALTER TABLE `products` ADD `emoji` varchar(10);--> statement-breakpoint
CREATE INDEX `attendantBusinessIdIdx` ON `attendants` (`businessId`);--> statement-breakpoint
CREATE INDEX `featureBusinessIdIdx` ON `businessFeatures` (`businessId`);--> statement-breakpoint
CREATE INDEX `reconcileBusinessIdIdx` ON `dayEndReconciliations` (`businessId`);--> statement-breakpoint
CREATE INDEX `reconcileDateIdx` ON `dayEndReconciliations` (`date`);--> statement-breakpoint
CREATE INDEX `deviceCustomerIdIdx` ON `deviceSessions` (`customerId`);--> statement-breakpoint
CREATE INDEX `deviceIdIdx` ON `deviceSessions` (`deviceId`);--> statement-breakpoint
CREATE INDEX `otpPhoneIdx` ON `otpVerifications` (`phone`);--> statement-breakpoint
CREATE INDEX `posBusinessIdIdx` ON `posTransactions` (`businessId`);--> statement-breakpoint
CREATE INDEX `posCreatedAtIdx` ON `posTransactions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `barcodeProductIdIdx` ON `productBarcodes` (`productId`);--> statement-breakpoint
CREATE INDEX `barcodeValueIdx` ON `productBarcodes` (`barcodeValue`);--> statement-breakpoint
CREATE INDEX `phoneIdx` ON `customers` (`phone`);--> statement-breakpoint
CREATE INDEX `orderIdIdx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `ordersBusinessIdIdx` ON `orders` (`businessId`);--> statement-breakpoint
CREATE INDEX `ordersCustomerIdIdx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `businessIdIdx` ON `products` (`businessId`);--> statement-breakpoint
CREATE INDEX `productCodeIdx` ON `products` (`productCode`);