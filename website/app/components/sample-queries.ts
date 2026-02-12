import type { DialectName } from '@/lib/holywell';

export const DIALECT_SAMPLE_QUERIES: Readonly<Record<DialectName, readonly string[]>> = {
  postgres: [
    `select distinct on (o.customer_id) o.customer_id, o.order_id, o.created_at, o.total_amount from orders o where o.status in ('paid', 'shipped') order by o.customer_id, o.created_at desc nulls last;`,

    `select p.id, p.sku, p.metadata->>'brand' as brand, p.metadata->'dimensions'->>'width' as width_text, p.metadata ? 'warranty' as has_warranty from products p where p.metadata @> '{"active": true}'::jsonb and p.metadata ?| array['featured', 'clearance'] and p.tags && array['new', 'sale'] order by p.updated_at desc;`,

    `select u.user_id, g.bucket_start::date as bucket_date, coalesce(monthly.events_in_bucket, 0) as events_in_bucket from users u cross join lateral generate_series(u.created_at::date, current_date, '1 month'::interval) as g(bucket_start) left join lateral (select count(*) as events_in_bucket from audit_events e where e.user_id = u.user_id and date_trunc('month', e.occurred_at) = date_trunc('month', g.bucket_start)) as monthly on true where u.is_active = true;`,

    `insert into inventory_snapshots as s (warehouse_id, sku, quantity, updated_at) values (7, 'SKU-0042', 18, now()) on conflict (warehouse_id, sku) where warehouse_id > 0 do update set (quantity, updated_at) = (excluded.quantity, excluded.updated_at) where s.quantity is distinct from excluded.quantity returning s.warehouse_id, s.sku, s.quantity;`,

    `with recursive org(id, parent_id, name, depth) as (select id, parent_id, name, 1 from departments where parent_id is null union all select d.id, d.parent_id, d.name, o.depth + 1 from departments d join org o on d.parent_id = o.id) search depth first by id set dfs_order cycle id set has_cycle using visit_path select id, name, depth, dfs_order, has_cycle from org order by dfs_order;`,

    `select region, percentile_cont(0.9) within group (order by revenue) filter (where fiscal_quarter = '2025Q4') as p90_q4, avg(revenue)::numeric(12, 2) as avg_revenue from regional_sales group by region having count(*) > 6;`,

    `select department, employee_name, salary, rank() over dept_window as dept_rank, avg(salary) over dept_window as dept_avg from employees window dept_window as (partition by department order by salary desc rows between unbounded preceding and current row);`,

    `select id, payload, run_at from job_queue where run_at <= now() and locked_at is null order by priority desc, run_at for update skip locked limit 25;`,
  ],

  ansi: [
    `merge into account_balances as t using daily_ledger as s on t.account_id = s.account_id when matched and s.is_closed = true then delete when matched then update set balance = s.balance, updated_at = s.posted_at when not matched then insert (account_id, balance, updated_at) values (s.account_id, s.balance, s.posted_at);`,

    `with recursive hierarchy(id, parent_id, node_name, lvl) as (select id, parent_id, node_name, 1 from graph_nodes where parent_id is null union all select g.id, g.parent_id, g.node_name, h.lvl + 1 from graph_nodes g join hierarchy h on g.parent_id = h.id) search breadth first by id set bfs_ord cycle id set is_cycle using cycle_path select id, node_name, lvl, bfs_ord, is_cycle from hierarchy order by bfs_ord;`,

    `select region, product_line, channel, sum(amount) as gross_sales from sales_fact where fiscal_year = 2025 group by grouping sets ((region, product_line), (region, channel), (region), ()) order by region, product_line, channel;`,

    `select supplier_id, supplier_name, quality_score from suppliers where approved = true order by quality_score desc fetch first 10 rows with ties;`,

    `select account_id, txn_ts, amount, sum(amount) over running_w as running_total, avg(amount) over month_w as monthly_avg from account_transactions window running_w as (partition by account_id order by txn_ts rows between unbounded preceding and current row), month_w as (partition by account_id, extract(month from txn_ts));`,

    `select customer_id from wholesale_customers union distinct select customer_id from retail_customers intersect all select customer_id from currently_active_customers;`,

    `merge into genre_type (genre_id, name) values (1, 'Comedy');`,

    `select department_id, listagg(employee_name, ', ') within group (order by employee_name) as roster from employees group by department_id having count(*) >= 3;`,
  ],

  mysql: [
    `delimiter $$
create trigger tr_orders_bi before insert on orders for each row begin
  if new.created_at is null then set new.created_at = now(); end if;
  set new.order_key = concat('ORD-', lpad(new.customer_id, 6, '0'));
end$$
delimiter ;`,

    `select o.id, c.name, o.total from orders o straight_join customers c on o.customer_id = c.id where c.email rlike '^[^@]+@example\\\\.com$' and o.created_at >= current_date - interval 30 day order by o.total desc limit 20;`,

    `insert into inventory (sku, warehouse_id, quantity, updated_at) values ('ABC-1', 7, 10, now()) as incoming on duplicate key update quantity = inventory.quantity + incoming.quantity, updated_at = incoming.updated_at;`,

    `select jt.order_id, jt.line_total, jt.currency from order_events e, json_table(e.payload, '$.lines[*]' columns (order_id bigint path '$.order_id', line_total decimal(10,2) path '$.total', currency varchar(8) path '$.currency')) jt where jt.line_total > 100;`,

    `create table article_index (article_id bigint not null, title text, body mediumtext, published_at datetime not null, fulltext key ft_title_body (title, body)) engine=innodb default charset=utf8mb4;`,

    `alter table article_index add fulltext key ft_body (body), add key idx_published (published_at), modify published_at datetime not null;`,

    `select customer_id, order_id, total, row_number() over (partition by customer_id order by created_at desc) as rn, sum(total) over (partition by customer_id order by created_at rows between unbounded preceding and current row) as running_total from orders where status in ('paid', 'shipped');`,

    `create table customer_aliases (alias varchar(64) not null, alias_norm varchar(64) generated always as (lower(alias)) stored, check (alias rlike '^[a-z0-9_]+$'));`,
  ],

  tsql: [
    `select top 25 o.OrderID, o.CustomerID, o.TotalAmount from dbo.Orders o with (nolock) where o.CreatedAt >= dateadd(day, -30, sysdatetime()) order by o.TotalAmount desc;`,

    `select o.OrderID, items.TotalAmount from dbo.Orders o cross apply (select sum(oi.Amount) as TotalAmount from dbo.OrderItems oi where oi.OrderID = o.OrderID) items where items.TotalAmount > 1000;`,

    `select c.CustomerID, latest.OrderID, latest.CreatedAt from dbo.Customers c outer apply (select top 1 o.OrderID, o.CreatedAt from dbo.Orders o where o.CustomerID = c.CustomerID order by o.CreatedAt desc) latest;`,

    `select pvt.Region, pvt.[2024], pvt.[2025] from (select Region, FiscalYear, Revenue from dbo.RegionRevenue) source_data pivot (sum(Revenue) for FiscalYear in ([2024], [2025])) pvt;`,

    `merge into dbo.Inventory as target using dbo.InventoryDelta as src on target.Sku = src.Sku when matched and src.IsDeleted = 1 then delete when matched then update set target.Quantity = src.Quantity, target.UpdatedAt = sysdatetime() when not matched then insert (Sku, Quantity, UpdatedAt) values (src.Sku, src.Quantity, sysdatetime());`,

    `select InvoiceID, try_convert(decimal(12, 2), AmountText) as AmountValue from dbo.InvoiceStaging where try_convert(decimal(12, 2), AmountText) is not null order by InvoiceID offset 10 rows fetch next 15 rows only;`,

    `if object_id('dbo.StageOrders') is not null drop table dbo.StageOrders;
go
create table dbo.StageOrders (OrderID int primary key, Payload nvarchar(max));
go
select top 5 * from dbo.StageOrders;`,

    `merge into dbo.Stock as target using dbo.StockDelta as src on target.Sku = src.Sku when matched then update set target.Quantity += src.Delta;`,
  ],
};
