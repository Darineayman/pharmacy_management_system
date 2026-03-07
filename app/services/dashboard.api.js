app.service("dashboardApi", function ($http, $q, apiConfig, customersApi, invoicesApi, invoiceItemsApi, medicinesApi) {
  var headers = angular.copy(apiConfig.headers);

  this.getDashboardStats = function () {
    return $q.all([
      invoicesApi.getAll(),
      customersApi.getAll()
    ]).then(function (results) {
      var invoices = results[0].data || [];
      var customers = results[1].data || [];

      var totalProfit = invoices.reduce(function (sum, inv) {
        return sum + (parseFloat(inv.total_amount) || 0);
      }, 0);

      return {
        totalProfit: totalProfit,
        totalCustomers: customers.length,
        totalOrders: invoices.length
      };
    });
  };

  this.getSalesAnalytics = function () {
    return invoicesApi.getAll().then(function (res) {
      var invoices = res.data || [];
      var currentYear = new Date().getFullYear();
      var monthlyTotals = new Array(12).fill(0);

      invoices.forEach(function (invoice) {
        if (!invoice.created_at) return;

        var d = new Date(invoice.created_at);
        if (d.getFullYear() !== currentYear) return;

        var monthIndex = d.getMonth();
        monthlyTotals[monthIndex] += parseFloat(invoice.total_amount) || 0;
      });

      return monthlyTotals;
    });
  };

  this.getLatestOrders = function () {
    return $q.all([
      invoicesApi.getAll(),
      customersApi.getAll()
    ]).then(function (results) {
      var invoices = results[0].data || [];
      var customers = results[1].data || [];

      var customerMap = {};
      customers.forEach(function (c) {
        customerMap[String(c.customer_id)] = c.full_name;
      });

      return invoices
        .slice(0, 3)
        .map(function (row) {
          return {
            invoiceId: row.invoice_id,
            id: row.invoice_number || ("INV-" + row.invoice_id),
            customer: customerMap[String(row.customer_id)] || "Walk-in Customer",
            price: "$" + (parseFloat(row.total_amount) || 0).toFixed(2),
            status: row.status
          };
        });
    });
  };

  this.getTopSellingMedicines = function () {
    return $q.all([
      invoiceItemsApi.getAll(),
      medicinesApi.getAll()
    ]).then(function (results) {
      var items = results[0].data || [];
      var medicines = results[1].data || [];

      var medicineMap = {};
      medicines.forEach(function (m) {
        medicineMap[String(m.medicine_id)] = m.name || "Unknown Medicine";
      });

      var totalsMap = {};

      items.forEach(function (item) {
        var medId = String(item.medicine_id);
        var medName = medicineMap[medId] || "Unknown Medicine";
        var amount = parseFloat(item.line_total) || 0;

        if (!totalsMap[medId]) {
          totalsMap[medId] = {
            medicine_id: medId,
            name: medName,
            total: 0
          };
        }

        totalsMap[medId].total += amount;
      });

      return Object.values(totalsMap)
        .sort(function (a, b) {
          return b.total - a.total;
        })
        .slice(0, 3);
    });
  };
});