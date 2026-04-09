CREATE TABLE `lowStockAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`productId` int NOT NULL,
	`threshold` int NOT NULL DEFAULT 10,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lowStockAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`sku` varchar(50),
	`price` decimal(10,2) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`order` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productVariants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `businessIdIdx` ON `lowStockAlerts` (`businessId`);--> statement-breakpoint
CREATE INDEX `productIdIdx` ON `lowStockAlerts` (`productId`);--> statement-breakpoint
CREATE INDEX `productIdIdx` ON `productVariants` (`productId`);--> statement-breakpoint
CREATE INDEX `skuIdx` ON `productVariants` (`sku`);