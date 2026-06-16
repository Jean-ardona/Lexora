CREATE TABLE `drops` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`term` text NOT NULL,
	`type` text NOT NULL,
	`definition` text NOT NULL,
	`examples` text,
	`is_learned` integer DEFAULT false,
	`drop_date` text
);
