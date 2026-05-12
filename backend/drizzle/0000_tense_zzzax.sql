CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (uuid()),
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `facilities` (
	`id` varchar(36) NOT NULL DEFAULT (uuid()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`capacity` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`image_url` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` varchar(36) NOT NULL DEFAULT (uuid()),
	`user_id` varchar(36) NOT NULL,
	`facility_id` varchar(36) NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NOT NULL,
	`purpose` text NOT NULL,
	`status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`notes` text,
	`recurrence_group_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revoked_tokens` (
	`id` varchar(36) NOT NULL DEFAULT (uuid()),
	`jti` varchar(255) NOT NULL,
	`expires_at` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revoked_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `revoked_tokens_jti_unique` UNIQUE(`jti`)
);
--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `facilities_active_idx` ON `facilities` (`is_active`);--> statement-breakpoint
CREATE INDEX `bookings_facility_idx` ON `bookings` (`facility_id`);--> statement-breakpoint
CREATE INDEX `bookings_user_idx` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `bookings_time_idx` ON `bookings` (`start_time`,`end_time`);--> statement-breakpoint
CREATE INDEX `bookings_recurrence_idx` ON `bookings` (`recurrence_group_id`);--> statement-breakpoint
CREATE INDEX `revoked_tokens_jti_idx` ON `revoked_tokens` (`jti`);--> statement-breakpoint
CREATE INDEX `revoked_tokens_expires_at_idx` ON `revoked_tokens` (`expires_at`);