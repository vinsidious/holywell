'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatSQL } from '@/lib/holywell';
import dynamic from 'next/dynamic';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import { holywellTheme } from './editor-theme';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] sm:h-[500px] animate-pulse bg-white/[0.02] rounded-b-xl" />
  ),
});

const SAMPLE_QUERIES = [
  // Style: one-liner — everything crammed on a single line
  `select c.id, c.name, c.email, o.total_orders, o.lifetime_value from customers c inner join (select customer_id, count(*) as total_orders, sum(amount) as lifetime_value from orders where status != 'cancelled' group by customer_id) o on c.id = o.customer_id where c.region = 'US' and o.lifetime_value > 1000 order by o.lifetime_value desc limit 50;`,

  // Style: ALL CAPS keywords, random line breaks mid-clause
  `SELECT department, employee_name, salary,
RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
salary - LAG(salary) OVER (PARTITION BY department
ORDER BY salary DESC) AS gap_to_next,
ROUND(salary::numeric / SUM(salary) OVER (PARTITION BY department) * 100, 2) AS pct_of_dept
FROM employees WHERE hire_date >= '2023-01-01'
ORDER BY department, dept_rank;`,

  // Style: leading commas, inconsistent indentation
  `with monthly_revenue as (
select date_trunc('month', created_at) as month
  , sum(total) as revenue
  , count(distinct customer_id) as unique_customers
from orders
where created_at >= now() - interval '12 months'
group by 1
), growth as (
select month
  , revenue
  , unique_customers
  , lag(revenue) over (order by month) as prev_revenue
from monthly_revenue
)
select month
  , revenue
  , unique_customers
  , round((revenue - prev_revenue) / prev_revenue * 100, 1) as growth_pct
from growth
order by month;`,

  // Style: over-indented, inconsistent alignment
  `insert into user_preferences
        (user_id, preferences, updated_at)
    values
        (42, '{"theme": "dark", "lang": "en", "notifications": true}'::jsonb,
            now())
    on conflict (user_id) do update
        set preferences = user_preferences.preferences || excluded.preferences,
            updated_at = now()
        where user_preferences.preferences is distinct from
            user_preferences.preferences || excluded.preferences
    returning user_id, preferences;`,

  // Style: everything uppercased including identifiers
  `SELECT PRODUCT_ID, PRODUCT_NAME, UNITS_SOLD, REVENUE, CASE WHEN REVENUE > 100000 THEN 'platinum' WHEN REVENUE > 50000 THEN 'gold' WHEN REVENUE > 10000 THEN 'silver' ELSE 'bronze' END AS TIER, CASE WHEN UNITS_SOLD > 0 THEN ROUND(REVENUE / UNITS_SOLD, 2) ELSE 0 END AS AVG_PRICE FROM PRODUCTS WHERE CATEGORY_ID IN (SELECT ID FROM CATEGORIES WHERE ACTIVE = TRUE) ORDER BY REVENUE DESC;`,

  // Style: compact with bad line breaks mid-expression
  `select u.id, u.name, u.tags,
u.metadata->>'role' as role, u.metadata
->'permissions' as perms, array_length(u.tags,
1) as tag_count from users u where
u.tags && array['admin', 'moderator'] and u.metadata
@> '{"active": true}'::jsonb and u.metadata ?
'email_verified' and not u.tags @> array['banned']
order by u.created_at desc;`,

  // Style: tab-indented but poorly structured
  `select\t'direct' as channel,
\tcount(*) as visits,
\tcount(distinct session_id) as unique_sessions,
\tavg(duration) as avg_duration
from\tweb_traffic
where\treferrer is null
\tand visit_date = current_date
union all
select\t'organic' as channel,
\tcount(*) as visits,
\tcount(distinct session_id) as unique_sessions,
\tavg(duration) as avg_duration
from\tweb_traffic
where\treferrer like '%google%' or referrer like '%bing%'
\tand visit_date = current_date
union all
select\t'social' as channel,
\tcount(*) as visits,
\tcount(distinct session_id) as unique_sessions,
\tavg(duration) as avg_duration
from\tweb_traffic
where\treferrer like '%twitter%' or referrer like '%facebook%'
\tand visit_date = current_date
order by\tvisits desc;`,

  // Style: right-aligned keywords
  `     select d.name as department
          , d.budget
          , (select count(*)
               from employees e
              where e.department_id = d.id) as headcount
       from departments d
      where exists (select 1
                      from employees e
                     inner join projects p on e.id = p.lead_id
                     where e.department_id = d.id
                       and p.status = 'active'
                       and p.deadline < current_date + interval '30 days')
        and not exists (select 1
                          from budget_freezes bf
                         where bf.department_id = d.id
                           and bf.active = true)
      order by d.budget desc;`,

  // Style: mixed case keywords (Title Case)
  `With Recursive org_tree As (
Select id, name, manager_id, title, 1 As depth, name::text As path
From employees Where manager_id Is Null
Union All
Select e.id, e.name, e.manager_id, e.title, ot.depth + 1, ot.path || ' > ' || e.name
From employees e Inner Join org_tree ot On e.manager_id = ot.id
Where ot.depth < 10
) Select id, name, title, depth, path From org_tree Order By path;`,

  // Style: dense one-liner
  `select date_trunc('week', o.created_at)::date as week, p.category, count(distinct o.id) as orders, count(distinct o.customer_id) as customers, sum(oi.quantity) as units, sum(oi.quantity * oi.unit_price)::numeric(12,2) as gross_revenue, sum(oi.quantity * oi.unit_price * coalesce(d.discount_pct, 0) / 100)::numeric(12,2) as total_discounts from orders o inner join order_items oi on o.id = oi.order_id inner join products p on oi.product_id = p.id left join discounts d on o.discount_code = d.code where o.created_at >= now() - interval '3 months' and o.status in ('completed', 'shipped') group by 1, 2 having sum(oi.quantity * oi.unit_price) > 500 order by week desc, gross_revenue desc;`,

  // Style: one-liner — DELETE with subquery
  `delete from sessions where user_id in (select id from users where last_login < now() - interval '1 year' and status = 'inactive') and created_at < now() - interval '6 months' returning session_id, user_id, created_at;`,

  // Style: ALL CAPS keywords, no line breaks — UPDATE with FROM
  `UPDATE inventory SET quantity = inventory.quantity - o.qty, last_updated = NOW() FROM (SELECT product_id, SUM(quantity) AS qty FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'confirmed' AND confirmed_at >= CURRENT_DATE) GROUP BY product_id) o WHERE inventory.product_id = o.product_id AND inventory.warehouse_id = 1 RETURNING inventory.product_id, inventory.quantity;`,

  // Style: leading commas, inconsistent spacing — CREATE TABLE
  `create table if not exists audit_log (
  id bigint generated always as identity primary key
  , table_name text not null
  , record_id bigint not null
  , action text not null check (action in ('insert', 'update', 'delete'))
  , old_values jsonb
  , new_values jsonb
  , changed_by integer references users(id)
  , changed_at timestamptz not null default now()
  , ip_address inet
);`,

  // Style: over-indented, inconsistent — window frames with ROWS BETWEEN
  `select          product_id,
          sale_date,
          amount,
          sum(amount) over (
              partition by product_id
              order by sale_date
              rows between 6 preceding and current row
          ) as rolling_7d_total,
          avg(amount) over (
              partition by product_id
              order by sale_date
              rows between 29 preceding and current row
          ) as rolling_30d_avg,
          amount - lag(amount, 1) over (
              partition by product_id
              order by sale_date
          ) as day_over_day_change
  from    daily_sales
  where   sale_date >= current_date - interval '90 days'
  order by    product_id, sale_date;`,

  // Style: everything uppercased — LATERAL join
  `SELECT D.ID, D.NAME, D.BUDGET, LATEST.TITLE AS LATEST_PROJECT, LATEST.STARTED_AT, LATEST.BUDGET AS PROJECT_BUDGET FROM DEPARTMENTS D LEFT JOIN LATERAL (SELECT P.TITLE, P.STARTED_AT, P.BUDGET FROM PROJECTS P WHERE P.DEPARTMENT_ID = D.ID ORDER BY P.STARTED_AT DESC FETCH FIRST 1 ROW ONLY) LATEST ON TRUE WHERE D.ACTIVE = TRUE ORDER BY D.NAME;`,

  // Style: compact, bad line breaks mid-clause — multiple CTEs
  `with active_users as (select id, name, email from users where
status = 'active' and last_login >= now() - interval '30 days'),
user_orders as (select u.id as user_id, count(*) as order_count,
sum(o.total) as total_spent from active_users u inner join orders o
on u.id = o.user_id where o.created_at >= now() - interval '90 days'
group by u.id), user_segments as (select user_id, order_count,
total_spent, ntile(4) over (order by total_spent desc) as
spending_quartile from user_orders) select au.name, au.email,
us.order_count, us.total_spent, us.spending_quartile from
active_users au inner join user_segments us on au.id = us.user_id
order by us.spending_quartile, us.total_spent desc;`,

  // Style: mixed case keywords (Title Case) — EXCEPT / INTERSECT
  `Select id, email, name From users Where role = 'premium' And created_at >= '2024-01-01'
Except
Select u.id, u.email, u.name From users u Inner Join refunds r On u.id = r.user_id Where r.amount > 50 And r.created_at >= '2024-01-01'
Intersect
Select u.id, u.email, u.name From users u Inner Join logins l On u.id = l.user_id Where l.logged_in_at >= Now() - Interval '7 days';`,

  // Style: tab-indented poorly — string aggregation
  `select\tt.name as team_name,
\tcount(e.id) as member_count,
\tround(avg(e.salary)::numeric, 2) as avg_salary,
\tstring_agg(e.name, ', ' order by e.name) as members,
\tarray_agg(distinct e.title) as titles,
\tmax(e.hire_date) as latest_hire
from\tteams t
left join\temployees e on t.id = e.team_id
where\tt.active = true
group by\tt.id, t.name
having\tcount(e.id) >= 3
order by\tavg_salary desc;`,

  // Style: random line breaks, inconsistent spacing — conditional aggregation with FILTER
  `select date_trunc('month',  created_at) as month,
count(*) filter (   where status = 'completed') as completed,
count(*) filter (where status = 'cancelled')  as cancelled,
count(*) filter (
where status = 'refunded') as refunded,
round(count(*) filter (where status = 'completed')::numeric / nullif(count(*), 0) * 100, 1) as completion_rate,
sum(total) filter (where status = 'completed') as revenue
from orders where created_at >= now()  - interval '12 months'
group by 1 order by 1;`,

  // Style: dense one-liner — correlated subqueries with COALESCE
  `select p.id, p.name, p.price, p.category_id, coalesce((select avg(r.rating) from reviews r where r.product_id = p.id and r.created_at >= now() - interval '6 months'), 0) as avg_recent_rating, coalesce((select count(*) from order_items oi inner join orders o on oi.order_id = o.id where oi.product_id = p.id and o.status = 'completed'), 0) as total_sales, p.price - coalesce((select min(c.price) from competitors c where c.product_name = p.name), p.price) as price_vs_cheapest from products p where p.active = true and p.stock > 0 order by avg_recent_rating desc, total_sales desc;`,
];

export function Playground() {
  const [input, setInput] = useState(SAMPLE_QUERIES[0]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formatTime, setFormatTime] = useState<number | null>(null);

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSampleRef = useRef(-1);

  const extensions = useMemo(
    () => [sql({ dialect: PostgreSQL }), ...holywellTheme],
    [],
  );

  const outputExtensions = useMemo(
    () => [
      sql({ dialect: PostgreSQL }),
      ...holywellTheme,
      EditorView.editable.of(false),
    ],
    [],
  );

  const handleCopy = useCallback(() => {
    if (!output || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(output)
      .then(() => {
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        setCopied(true);
        copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [output]);

  const handleSample = useCallback(() => {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * SAMPLE_QUERIES.length);
    } while (idx === lastSampleRef.current && SAMPLE_QUERIES.length > 1);
    lastSampleRef.current = idx;
    setInput(SAMPLE_QUERIES[idx]);
  }, []);

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
        <div className="group relative rounded-xl border border-white/[0.06] overflow-hidden transition-all duration-300 focus-within:border-brand/20">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

          <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2.5">
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
              Input
            </span>
            <button
              onClick={handleSample}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-zinc-300"
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
              Sample query
            </button>
          </div>

          <div className="h-[350px] sm:h-[500px] overflow-auto">
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
              theme="none"
              placeholder="Paste your SQL here..."
            />
          </div>
        </div>

        {/* Output pane */}
        <div className="relative rounded-xl border border-white/[0.06] overflow-hidden transition-all duration-300">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

          <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
                Output
              </span>
              {formatTime !== null && (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-mono text-brand/70">
                  {formatTime < 1
                    ? `${formatTime.toFixed(2)}ms`
                    : `${formatTime.toFixed(1)}ms`}
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                copied
                  ? 'text-brand'
                  : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-500'
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

          <div className="h-[350px] sm:h-[500px] overflow-auto">
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
              theme="none"
            />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] px-4 py-3 text-sm font-mono text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
