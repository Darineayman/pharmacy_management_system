app.controller("DashboardCtrl", function ($scope, $q, dashboardApi, invoicesApi) {
  var vm = this;

  vm.loading = true;
  vm.error = "";

  vm.stats = [];
  vm.salesBars = [];
  vm.latestOrders = [];
  vm.topMedicines = [];

  vm.loadDashboard = function () {
    vm.loading = true;
    vm.error = "";

    return $q.all([
      dashboardApi.getDashboardStats(),
      dashboardApi.getSalesAnalytics(),
      dashboardApi.getLatestOrders(),
      dashboardApi.getTopSellingMedicines()
    ])
      .then(function (results) {
        var stats = results[0];
        var salesAnalytics = results[1];
        var latestOrders = results[2];
        var topMedicines = results[3];

        vm.stats = [
          {
            title: "Total Profit",
            value: "$" + Number(stats.totalProfit || 0).toLocaleString(),
            subtitle: "All recorded invoice totals",
            icon: "fa-solid fa-sack-dollar",
            bgIcon: "fa-solid fa-chart-line",
            cardClass: "stat-card-dark",
            trend: "Live"
          },
          {
            title: "Total Customers",
            value: Number(stats.totalCustomers || 0).toLocaleString(),
            subtitle: "Registered customers",
            icon: "fa-solid fa-users",
            bgIcon: "fa-solid fa-user-group",
            cardClass: "stat-card-light",
            trend: "Live"
          },
          {
            title: "Total Orders",
            value: Number(stats.totalOrders || 0).toLocaleString(),
            subtitle: "Total invoices created",
            icon: "fa-solid fa-cart-shopping",
            bgIcon: "fa-solid fa-cart-flatbed",
            cardClass: "stat-card-light",
            trend: "Live"
          }
        ];

        vm.salesBars = salesAnalytics || [];
        vm.latestOrders = latestOrders || [];

        var maxTotal = topMedicines.length
          ? Math.max.apply(
              null,
              topMedicines.map(function (m) {
                return m.total;
              })
            )
          : 1;

        var barClasses = ["bar-orange", "bar-black", "bar-lime"];

        vm.topMedicines = topMedicines.map(function (med, index) {
          var scaledHeight = Math.max(
            100,
            Math.round((med.total / maxTotal) * 220)
          );

          return {
            name: med.name,
            shortName:
              med.name.length > 14 ? med.name.slice(0, 14) + "…" : med.name,
            amount: "$" + Number(med.total || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }),
            height: scaledHeight,
            barClass: barClasses[index] || "bar-lime"
          };
        });
      })
      .catch(function (e) {
        vm.error =
          (e.data && e.data.message) ||
          e.message ||
          "Failed to load dashboard data.";
      })
      .finally(function () {
        vm.loading = false;
        $scope.$applyAsync();
      });
  };

  vm.getBarHeight = function (value) {
    if (!vm.salesBars || !vm.salesBars.length) return "40px";

    var max = Math.max.apply(null, vm.salesBars);
    if (max <= 0) return "40px";

    var minHeight = 40;
    var maxHeight = 250;

    return (
      Math.round((value / max) * (maxHeight - minHeight) + minHeight) + "px"
    );
  };

  vm.deleteInvoice = function (invoiceId) {
    var confirmed = window.confirm("Are you sure you want to delete this invoice?");
    if (!confirmed) return;

    invoicesApi
      .remove(invoiceId)
      .then(function () {
        vm.latestOrders = vm.latestOrders.filter(function (order) {
          return order.invoiceId !== invoiceId;
        });

        return vm.loadDashboard();
      })
      .catch(function (e) {
        vm.error =
          (e.data && e.data.message) ||
          e.message ||
          "Failed to delete invoice.";
      })
      .finally(function () {
        $scope.$applyAsync();
      });
  };

  vm.loadDashboard();
});