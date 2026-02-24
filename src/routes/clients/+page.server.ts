import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

const fallbackClients = [
    { id: 1, name: 'Pertamina', logoUrl: '/images/pertamina.svg' },
    { id: 2, name: 'Telkomsigma', logoUrl: '/images/telkomsigma.svg' },
    { id: 3, name: 'Telkomsel', logoUrl: '/images/telkomsel.svg' },
    { id: 4, name: 'Telkom Indonesia', logoUrl: '/images/telkom.svg' },
    { id: 5, name: 'Peruri', logoUrl: '/images/peruri.svg' },
    { id: 6, name: 'Bank BTN', logoUrl: '/images/btn.svg' },
    { id: 7, name: 'Jakarta Government', logoUrl: '/images/jakarta.svg' },
    { id: 8, name: 'BYU', logoUrl: '/images/byu.svg' },
    { id: 9, name: 'Indihome', logoUrl: '/images/indihome.svg' },
    { id: 10, name: 'BPJSTK', logoUrl: '/images/bpjstk.svg' }
];

export const load: PageServerLoad = async () => {
    const db = getDb();

    if (db) {
        try {
            const rows = await db`SELECT * FROM clients ORDER BY sort_order ASC`;
            if (rows.length > 0) {
                return {
                    clients: rows.map((r: Record<string, unknown>) => ({
                        id: r.id, name: r.name, logoUrl: r.logo_url
                    }))
                };
            }
        } catch (e) {
            console.warn('DB query failed for clients:', e);
        }
    }

    return { clients: fallbackClients };
};
