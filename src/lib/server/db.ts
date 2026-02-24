import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

let sql: ReturnType<typeof neon> | null = null;

export function getDb() {
	if (!sql) {
		const dbUrl = env.DATABASE_URL;
		if (!dbUrl) {
			return null;
		}
		sql = neon(dbUrl);
	}
	return sql;
}

export async function initDb() {
	const db = getDb();
	if (!db) return;

	// Admin users
	await db`
		CREATE TABLE IF NOT EXISTS admin_users (
			id SERIAL PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	// Sessions
	await db`
		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id INT REFERENCES admin_users(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			expires_at TIMESTAMPTZ NOT NULL
		)
	`;

	// About page content
	await db`
		CREATE TABLE IF NOT EXISTS about_content (
			id TEXT PRIMARY KEY DEFAULT 'main',
			bio TEXT NOT NULL DEFAULT '',
			skills TEXT[] DEFAULT '{}',
			cv_url TEXT DEFAULT '',
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	// Landing page hero content
	await db`
		CREATE TABLE IF NOT EXISTS hero_content (
			id TEXT PRIMARY KEY DEFAULT 'main',
			full_name TEXT NOT NULL DEFAULT 'Muhammad Athoillah',
			role TEXT NOT NULL DEFAULT 'Database Administrator',
			company TEXT NOT NULL DEFAULT 'Telkomsigma',
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS work_experience (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			company TEXT NOT NULL,
			period TEXT NOT NULL,
			description TEXT DEFAULT '',
			sort_order INT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS education (
			id SERIAL PRIMARY KEY,
			degree TEXT NOT NULL,
			institution TEXT NOT NULL,
			period TEXT NOT NULL,
			sort_order INT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS projects (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			image TEXT DEFAULT '',
			icon TEXT DEFAULT '',
			image_text TEXT DEFAULT '',
			tags TEXT[] DEFAULT '{}',
			github_url TEXT DEFAULT '',
			medium_url TEXT DEFAULT '',
			status TEXT DEFAULT 'published',
			sort_order INT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS notes (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			content TEXT DEFAULT '',
			created_at BIGINT NOT NULL,
			updated_at BIGINT NOT NULL
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS clients (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			logo_url TEXT NOT NULL,
			sort_order INT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;

	await db`
		CREATE TABLE IF NOT EXISTS contact_messages (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			subject TEXT NOT NULL,
			message TEXT NOT NULL,
			read BOOLEAN DEFAULT false,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
}
