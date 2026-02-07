'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatSQL } from '@/lib/sqlfmt';
import dynamic from 'next/dynamic';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] sm:h-[480px] animate-pulse bg-zinc-800/30 rounded-b-xl" />
  ),
});

const SAMPLE_QUERIES = [
  // 1. Complex JOIN with subquery and aggregation
  `select c.id, c.name, c.email, o.total_orders, o.lifetime_value from customers c inner join (select customer_id, count(*) as total_orders, sum(amount) as lifetime_value from orders where status != 'cancelled' group by customer_id) o on c.id = o.customer_id where c.region = 'US' and o.lifetime_value > 1000 order by o.lifetime_value desc limit 50;`,

  // 2. Window functions
  `select department, employee_name, salary, rank() over (partition by department order by salary desc) as dept_rank, salary - lag(salary) over (partition by department order by salary desc) as gap_to_next, round(salary::numeric / sum(salary) over (partition by department) * 100, 2) as pct_of_dept from employees where hire_date >= '2023-01-01' order by department, dept_rank;`,

  // 3. CTE with multiple stages
  `with monthly_revenue as (select date_trunc('month', created_at) as month, sum(total) as revenue, count(distinct customer_id) as unique_customers from orders where created_at >= now() - interval '12 months' group by 1), growth as (select month, revenue, unique_customers, lag(revenue) over (order by month) as prev_revenue from monthly_revenue) select month, revenue, unique_customers, round((revenue - prev_revenue) / prev_revenue * 100, 1) as growth_pct from growth order by month;`,

  // 4. PostgreSQL upsert with JSON
  `insert into user_preferences (user_id, preferences, updated_at) values (42, '{"theme": "dark", "lang": "en", "notifications": true}'::jsonb, now()) on conflict (user_id) do update set preferences = user_preferences.preferences || excluded.preferences, updated_at = now() where user_preferences.preferences is distinct from user_preferences.preferences || excluded.preferences returning user_id, preferences;`,

  // 5. CASE expressions with multiple conditions
  `select product_id, product_name, units_sold, revenue, case when revenue > 100000 then 'platinum' when revenue > 50000 then 'gold' when revenue > 10000 then 'silver' else 'bronze' end as tier, case when units_sold > 0 then round(revenue / units_sold, 2) else 0 end as avg_price from products where category_id in (select id from categories where active = true) order by revenue desc;`,

  // 6. PostgreSQL array and JSON operators
  `select u.id, u.name, u.tags, u.metadata->>'role' as role, u.metadata->'permissions' as perms, array_length(u.tags, 1) as tag_count from users u where u.tags && array['admin', 'moderator'] and u.metadata @> '{"active": true}'::jsonb and u.metadata ? 'email_verified' and not u.tags @> array['banned'] order by u.created_at desc;`,

  // 7. UNION with different data sources
  `select 'direct' as channel, count(*) as visits, count(distinct session_id) as unique_sessions, avg(duration) as avg_duration from web_traffic where referrer is null and visit_date = current_date union all select 'organic' as channel, count(*) as visits, count(distinct session_id) as unique_sessions, avg(duration) as avg_duration from web_traffic where referrer like '%google%' or referrer like '%bing%' and visit_date = current_date union all select 'social' as channel, count(*) as visits, count(distinct session_id) as unique_sessions, avg(duration) as avg_duration from web_traffic where referrer like '%twitter%' or referrer like '%facebook%' and visit_date = current_date order by visits desc;`,

  // 8. EXISTS with correlated subquery
  `select d.name as department, d.budget, (select count(*) from employees e where e.department_id = d.id) as headcount from departments d where exists (select 1 from employees e inner join projects p on e.id = p.lead_id where e.department_id = d.id and p.status = 'active' and p.deadline < current_date + interval '30 days') and not exists (select 1 from budget_freezes bf where bf.department_id = d.id and bf.active = true) order by d.budget desc;`,

  // 9. Recursive CTE (org chart traversal)
  `with recursive org_tree as (select id, name, manager_id, title, 1 as depth, name::text as path from employees where manager_id is null union all select e.id, e.name, e.manager_id, e.title, ot.depth + 1, ot.path || ' > ' || e.name from employees e inner join org_tree ot on e.manager_id = ot.id where ot.depth < 10) select id, name, title, depth, path from org_tree order by path;`,

  // 10. Complex analytics with multiple joins and type casts
  `select date_trunc('week', o.created_at)::date as week, p.category, count(distinct o.id) as orders, count(distinct o.customer_id) as customers, sum(oi.quantity) as units, sum(oi.quantity * oi.unit_price)::numeric(12,2) as gross_revenue, sum(oi.quantity * oi.unit_price * coalesce(d.discount_pct, 0) / 100)::numeric(12,2) as total_discounts from orders o inner join order_items oi on o.id = oi.order_id inner join products p on oi.product_id = p.id left join discounts d on o.discount_code = d.code where o.created_at >= now() - interval '3 months' and o.status in ('completed', 'shipped') group by 1, 2 having sum(oi.quantity * oi.unit_price) > 500 order by week desc, gross_revenue desc;`,
];

const transparentBg = EditorView.theme({
  '&': { backgroundColor: 'transparent' },
  '.cm-gutters': { backgroundColor: 'transparent', borderRight: 'none' },
});

const editorFont = EditorView.theme({
  '.cm-content, .cm-gutters': {
    fontFamily: 'var(--font-mono), "JetBrains Mono", "Fira Code", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
  },
});

export function Playground() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formatTime, setFormatTime] = useState<number | null>(null);

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSampleRef = useRef(-1);

  const extensions = useMemo(
    () => [sql({ dialect: PostgreSQL }), oneDark, transparentBg, editorFont],
    [],
  );

  const outputExtensions = useMemo(
    () => [
      sql({ dialect: PostgreSQL }),
      oneDark,
      transparentBg,
      editorFont,
      EditorView.editable.of(false),
    ],
    [],
  );

  const handleCopy = useCallback(() => {
    if (!output || !navigator.clipboard) return;
    navigator.clipboard.writeText(output).then(() => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      setCopied(true);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [output]);

  const handleSample = useCallback(() => {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * SAMPLE_QUERIES.length);
    } while (idx === lastSampleRef.current && SAMPLE_QUERIES.length > 1);
    lastSampleRef.current = idx;
    setInput(SAMPLE_QUERIES[idx]);
  }, []);

  // Format whenever input changes, debounced 300ms.
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setFormatTime(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const start = performance.now();
        const result = formatSQL(input);
        const elapsed = performance.now() - start;
        setOutput(result);
        setFormatTime(elapsed);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setOutput('');
        setFormatTime(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Input pane */}
        <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden transition-colors focus-within:border-zinc-700">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Input
            </span>
            <button
              onClick={handleSample}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
              </svg>
              Use sample query
            </button>
          </div>
          <div className="h-[350px] sm:h-[480px] overflow-auto">
            <CodeMirror
              value={input}
              onChange={handleInputChange}
              extensions={extensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
              }}
              theme="dark"
              placeholder="Paste your SQL here..."
            />
          </div>
        </div>

        {/* Output pane */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Output
              </span>
              {formatTime !== null && (
                <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono text-zinc-500">
                  {formatTime < 1
                    ? `${formatTime.toFixed(2)}ms`
                    : `${formatTime.toFixed(1)}ms`}
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                copied
                  ? 'text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400'
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="h-[350px] sm:h-[480px] overflow-auto">
            <CodeMirror
              value={output}
              extensions={outputExtensions}
              readOnly
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: false,
                highlightSelectionMatches: false,
              }}
              theme="dark"
            />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-mono text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
