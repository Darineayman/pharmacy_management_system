(function () {
    angular.module('pharmly')
        .service('CustomersService', function (SupabaseClient) {

            this.getCustomersPageData = async function () {
                const [customersRes, invoicesRes] = await Promise.all([
                    SupabaseClient
                        .from('customers')
                        .select('*')
                        .order('customer_id', { ascending: true }),

                    SupabaseClient
                        .from('invoices')
                        .select('invoice_id, customer_id, total_amount, created_at, status')
                        .order('created_at', { ascending: false })
                ]);

                if (customersRes.error) throw customersRes.error;
                if (invoicesRes.error) throw invoicesRes.error;

                const customers = customersRes.data || [];
                const invoices = invoicesRes.data || [];

                // group invoices by customer_id
                const invoiceMap = {};
                invoices.forEach(function (inv) {
                    if (!inv.customer_id) return;
                    if (!invoiceMap[inv.customer_id]) {
                        invoiceMap[inv.customer_id] = [];
                    }
                    invoiceMap[inv.customer_id].push(inv);
                });

                const enrichedCustomers = customers.map(function (cust) {
                    const customerInvoices = invoiceMap[cust.customer_id] || [];

                    const paidInvoices = customerInvoices.filter(function (inv) {
                        return inv.status !== 'cancelled';
                    });

                    const ordersPlaced = paidInvoices.length;

                    const totalSpend = paidInvoices.reduce(function (sum, inv) {
                        return sum + (parseFloat(inv.total_amount) || 0);
                    }, 0);

                    const lastOrder = paidInvoices.length
                        ? paidInvoices
                            .map(function (inv) { return inv.created_at; })
                            .sort()
                            .reverse()[0]
                        : null;

                    return {
                        customer_id: cust.customer_id,
                        full_name: cust.full_name,
                        phone_number: cust.phone_number,
                        email: cust.email,
                        address: cust.address,
                        loyalty_points: cust.loyalty_points,
                        created_at: cust.created_at,
                        orders_placed: ordersPlaced,
                        total_spend: totalSpend,
                        last_order: lastOrder
                    };
                });

                const totalCustomers = enrichedCustomers.length;
                const loyalCustomers = enrichedCustomers.filter(function (c) {
                    return (c.loyalty_points || 0) > 100;
                }).length;

                // "new customers" = created in last 30 days
                const now = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);

                const newCustomers = enrichedCustomers.filter(function (c) {
                    return c.created_at && new Date(c.created_at) >= thirtyDaysAgo;
                }).length;

                return {
                    stats: {
                        totalCustomers: totalCustomers,
                        loyalCustomers: loyalCustomers,
                        newCustomers: newCustomers
                    },
                    customers: enrichedCustomers
                };
            };

            this.createCustomer = async function (payload) {
                const { data, error } = await SupabaseClient
                    .from('customers')
                    .insert([payload])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            };

            this.updateCustomer = async function (customerId, payload) {
                const { data, error } = await SupabaseClient
                    .from('customers')
                    .update(payload)
                    .eq('customer_id', customerId)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            };

            this.deleteCustomer = async function (customerId) {
                const { error } = await SupabaseClient
                    .from('customers')
                    .delete()
                    .eq('customer_id', customerId);

                if (error) throw error;
                return true;
            };
        });
})();