(function () {
    angular.module('pharmly')
        .service('DashboardService', function (SupabaseClient) {

            // ---------- Stats ----------
            this.getDashboardStats = async function () {
                const [invoicesRes, customersRes] = await Promise.all([
                    SupabaseClient
                        .from('invoices')
                        .select('invoice_id, total_amount, created_at'),

                    SupabaseClient
                        .from('customers')
                        .select('customer_id', { count: 'exact' })
                ]);

                if (invoicesRes.error) throw invoicesRes.error;
                if (customersRes.error) throw customersRes.error;

                const invoices = invoicesRes.data || [];
                const customerCount = customersRes.count || 0;

                const totalProfit = invoices.reduce(function (sum, inv) {
                    return sum + (parseFloat(inv.total_amount) || 0);
                }, 0);

                return {
                    totalProfit: totalProfit,
                    totalCustomers: customerCount,
                    totalOrders: invoices.length
                };
            };

            // ---------- Sales Analytics ----------
            // Sum invoices by month for the current year
            this.getSalesAnalytics = async function () {
                const currentYear = new Date().getFullYear();
                const start = currentYear + '-01-01';
                const end = (currentYear + 1) + '-01-01';

                const { data, error } = await SupabaseClient
                    .from('invoices')
                    .select('invoice_id, total_amount, created_at')
                    .gte('created_at', start)
                    .lt('created_at', end)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                const monthlyTotals = new Array(12).fill(0);

                (data || []).forEach(function (invoice) {
                    const d = new Date(invoice.created_at);
                    const monthIndex = d.getMonth();
                    monthlyTotals[monthIndex] += parseFloat(invoice.total_amount) || 0;
                });

                return monthlyTotals;
            };

            // ---------- Latest Orders ----------
            this.getLatestOrders = async function () {
                const { data, error } = await SupabaseClient
                    .from('invoices')
                    .select(`
            invoice_id,
            invoice_number,
            total_amount,
            status,
            created_at,
            customers (
              full_name
            )
          `)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;

                return (data || []).map(function (row) {
                    return {
                        invoiceId: row.invoice_id,
                        id: row.invoice_number,
                        customer: row.customers ? row.customers.full_name : 'Walk-in Customer',
                        price: '$' + (parseFloat(row.total_amount) || 0).toFixed(2),
                        status: row.status
                    };
                });
            };

            // ---------- Top Selling Medicines ----------
            // Client-side aggregation for small/medium project data size
            this.getTopSellingMedicines = async function () {
                const { data, error } = await SupabaseClient
                    .from('invoice_items')
                    .select(`
            invoiceItem_id,
            medicine_id,
            line_total,
            medicines (
              name
            )
          `);

                if (error) throw error;

                const map = {};

                (data || []).forEach(function (item) {
                    const medId = item.medicine_id;
                    const medName = item.medicines ? item.medicines.name : 'Unknown Medicine';
                    const amount = parseFloat(item.line_total) || 0;

                    if (!map[medId]) {
                        map[medId] = {
                            medicine_id: medId,
                            name: medName,
                            total: 0
                        };
                    }

                    map[medId].total += amount;
                });

                const result = Object.values(map)
                    .sort(function (a, b) { return b.total - a.total; })
                    .slice(0, 3);

                return result;
            };

            this.deleteInvoice = async function (invoiceId) {
                const { error } = await SupabaseClient
                    .from('invoices')
                    .delete()
                    .eq('invoice_id', invoiceId);

                if (error) throw error;

                return true;
            }
        });
})();