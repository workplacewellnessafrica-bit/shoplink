ALTER TABLE `attendants` ADD `username` varchar(100);--> statement-breakpoint
ALTER TABLE `attendants` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `attendants` ADD `pin` varchar(10);--> statement-breakpoint
ALTER TABLE `attendants` ADD `credentialsStatus` enum('pending','generated','accepted') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `attendants` ADD CONSTRAINT `attendants_username_unique` UNIQUE(`username`);