ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `openingBalance` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `daysSales` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `expenditures` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `closingBalance` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `mpesaTotal` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `cardTotal` decimal(10,2) NOT NULL DEFAULT '0';--> statement-breakpoint
ALTER TABLE `dayEndReconciliations` MODIFY COLUMN `credits` decimal(10,2) NOT NULL DEFAULT '0';