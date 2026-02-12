import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CTE data-modifying bodies', () => {
  it('parses and formats UPDATE/INSERT CTE bodies with RETURNING clauses', () => {
    const sql = `WITH expired_orders AS (UPDATE orders SET status = 'cancelled' WHERE status = 'pending' AND placed_at < now() - INTERVAL '48 hours' RETURNING id, user_id, total), notifications AS (INSERT INTO order_events (order_id, event_type, payload) SELECT eo.id, 'auto_cancelled', jsonb_build_object('reason', 'expired', 'original_total', eo.total) FROM expired_orders eo RETURNING order_id, event_type) SELECT COUNT(*) AS cancelled_count, SUM(eo.total) AS cancelled_total FROM expired_orders eo;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('WITH expired_orders AS (');
    expect(out).toContain('UPDATE orders');
    expect(out).toContain('RETURNING id, user_id, total');
    expect(out).toContain('INSERT INTO order_events (order_id, event_type, payload)');
    expect(out).toContain('RETURNING order_id, event_type');
    expect(out).toContain('SELECT COUNT(*) AS cancelled_count');
    expect(out.trimEnd()).not.toBe(sql);
  });
});
