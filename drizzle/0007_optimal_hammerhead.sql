CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessId` int,
	`type` enum('order_placed','order_confirmed','order_shipped','order_delivered','payment_received','low_stock','new_order','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedOrderId` int,
	`relatedProductId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notifUserIdIdx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifBusinessIdIdx` ON `notifications` (`businessId`);--> statement-breakpoint
CREATE INDEX `notifIsReadIdx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notifCreatedAtIdx` ON `notifications` (`createdAt`);