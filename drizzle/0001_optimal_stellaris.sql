CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`streak` integer DEFAULT 0,
	`last_active_date` text
);
--> statement-breakpoint
ALTER TABLE `drops` ADD `phonetic` text;