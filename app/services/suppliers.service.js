(function () {
    angular.module('pharmly')
        .service('SuppliersService', function (SupabaseClient) {

            this.getSuppliersPageData = async function () {
                const [suppliersRes, medicinesRes, purchasesRes] = await Promise.all([
                    SupabaseClient
                        .from('suppliers')
                        .select('*')
                        .order('supplier_id', { ascending: true }),

                    SupabaseClient
                        .from('medicines')
                        .select('medicine_id, supplier_id, name, quantity, category'),

                    SupabaseClient
                        .from('purchases')
                        .select('purchase_id, supplier_id, medicine_id, quantity, price, purchase_date')
                        .order('purchase_date', { ascending: false })
                ]);

                if (suppliersRes.error) throw suppliersRes.error;
                if (medicinesRes.error) throw medicinesRes.error;
                if (purchasesRes.error) throw purchasesRes.error;

                const suppliers = suppliersRes.data || [];
                const medicines = medicinesRes.data || [];
                const purchases = purchasesRes.data || [];

                const medicinesBySupplier = {};
                medicines.forEach(function (med) {
                    if (!med.supplier_id) return;
                    if (!medicinesBySupplier[med.supplier_id]) medicinesBySupplier[med.supplier_id] = [];
                    medicinesBySupplier[med.supplier_id].push(med);
                });

                const purchasesBySupplier = {};
                purchases.forEach(function (p) {
                    if (!p.supplier_id) return;
                    if (!purchasesBySupplier[p.supplier_id]) purchasesBySupplier[p.supplier_id] = [];
                    purchasesBySupplier[p.supplier_id].push(p);
                });

                const lowStockThreshold = 10;
                const now = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);

                const enrichedSuppliers = suppliers.map(function (supplier) {
                    const supplierMedicines = medicinesBySupplier[supplier.supplier_id] || [];
                    const supplierPurchases = purchasesBySupplier[supplier.supplier_id] || [];

                    const medicinesSupplied = supplierMedicines.length;

                    const totalStock = supplierMedicines.reduce(function (sum, med) {
                        return sum + (parseInt(med.quantity, 10) || 0);
                    }, 0);

                    const lowStockItems = supplierMedicines.filter(function (med) {
                        return (parseInt(med.quantity, 10) || 0) < lowStockThreshold;
                    }).length;

                    const totalPurchasedQty = supplierPurchases.reduce(function (sum, p) {
                        return sum + (parseInt(p.quantity, 10) || 0);
                    }, 0);

                    const totalPurchaseValue = supplierPurchases.reduce(function (sum, p) {
                        const qty = parseFloat(p.quantity) || 0;
                        const price = parseFloat(p.price) || 0;
                        return sum + (qty * price);
                    }, 0);

                    const lastPurchaseDate = supplierPurchases.length
                        ? supplierPurchases
                            .map(function (p) { return p.purchase_date; })
                            .sort()
                            .reverse()[0]
                        : null;

                    const hasPurchaseLast30Days = supplierPurchases.some(function (p) {
                        return p.purchase_date && new Date(p.purchase_date) >= thirtyDaysAgo;
                    });

                    const categories = Array.from(
                        new Set(
                            supplierMedicines
                                .map(function (m) { return m.category; })
                                .filter(Boolean)
                        )
                    );

                    return {
                        supplier_id: supplier.supplier_id,
                        name: supplier.name,
                        contact: supplier.contact,
                        created_at: supplier.created_at,

                        medicines_supplied: medicinesSupplied,
                        total_stock: totalStock,
                        low_stock_items: lowStockItems,

                        total_purchased_qty: totalPurchasedQty,
                        total_purchase_value: totalPurchaseValue,
                        last_purchase_date: lastPurchaseDate,

                        active_last_30_days: hasPurchaseLast30Days,
                        categories: categories
                    };
                });

                const totalSuppliers = enrichedSuppliers.length;

                const activeSuppliers = enrichedSuppliers.filter(function (s) {
                    return s.active_last_30_days;
                }).length;

                const totalPurchaseValue = enrichedSuppliers.reduce(function (sum, s) {
                    return sum + (s.total_purchase_value || 0);
                }, 0);

                const atRiskSuppliers = enrichedSuppliers.filter(function (s) {
                    return s.low_stock_items > 0;
                }).length;

                const allCategories = Array.from(
                    new Set(
                        medicines
                            .map(function (m) { return m.category; })
                            .filter(Boolean)
                    )
                ).sort();

                return {
                    stats: {
                        totalSuppliers: totalSuppliers,
                        activeSuppliers: activeSuppliers,
                        totalPurchaseValue: totalPurchaseValue,
                        atRiskSuppliers: atRiskSuppliers
                    },
                    suppliers: enrichedSuppliers,
                    categories: allCategories
                };
            };

            this.createSupplier = async function (payload) {
                const { data, error } = await SupabaseClient
                    .from('suppliers')
                    .insert([payload])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            };

            this.updateSupplier = async function (supplierId, payload) {
                const { data, error } = await SupabaseClient
                    .from('suppliers')
                    .update(payload)
                    .eq('supplier_id', supplierId)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            };

            this.deleteSupplier = async function (supplierId) {
                const { error } = await SupabaseClient
                    .from('suppliers')
                    .delete()
                    .eq('supplier_id', supplierId);

                if (error) throw error;
                return true;
            };
        });
})();