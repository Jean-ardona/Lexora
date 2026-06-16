CREATE TABLE `practice_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`drop_id` integer NOT NULL,
	`sentence` text NOT NULL,
	`attempt_nb` integer NOT NULL,
	`practice_date` text NOT NULL,
	`ai_feedback` text,
	`created_at` text NOT NULL
);
