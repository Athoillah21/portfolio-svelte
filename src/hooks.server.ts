import { initDb, getDb } from '$lib/server/db';

let initialized = false;

export async function handle({ event, resolve }) {
    // Initialize database tables on first request
    if (!initialized) {
        try {
            await initDb();
            initialized = true;
            console.log('Database tables initialized successfully');
        } catch (e) {
            console.warn('Database init skipped:', e);
            initialized = true;
        }
    }

    // Session validation — check cookie and load user
    event.locals.user = null;
    const sessionId = event.cookies.get('session');
    if (sessionId) {
        const db = getDb();
        if (db) {
            try {
                const [session] = await db`
					SELECT s.user_id, u.username
					FROM sessions s
					JOIN admin_users u ON u.id = s.user_id
					WHERE s.id = ${sessionId} AND s.expires_at > NOW()
				`;
                if (session) {
                    event.locals.user = {
                        id: session.user_id as number,
                        username: session.username as string
                    };
                } else {
                    // Expired or invalid session — clear cookie
                    event.cookies.delete('session', { path: '/' });
                }
            } catch (e) {
                // ignore DB errors for session check
            }
        }
    }

    return resolve(event);
}
