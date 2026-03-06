(function () {
    angular.module('pharmly')
        .controller('DashboardCtrl', function ($scope, DashboardService) {
            var vm = this;

            vm.loading = true;
            vm.error = '';

            vm.stats = [];
            vm.salesBars = [];
            vm.latestOrders = [];
            vm.topMedicines = [];

            vm.loadDashboard = async function () {
                vm.loading = true;
                vm.error = '';

                try {
                    const [stats, salesAnalytics, latestOrders, topMedicines] = await Promise.all([
                        DashboardService.getDashboardStats(),
                        DashboardService.getSalesAnalytics(),
                        DashboardService.getLatestOrders(),
                        DashboardService.getTopSellingMedicines()
                    ]);

                    vm.stats = [
                        {
                            title: 'Total Profit',
                            value: '$' + stats.totalProfit.toLocaleString(),
                            subtitle: 'All recorded invoice totals',
                            icon: 'fa-solid fa-sack-dollar',
                            bgIcon: 'fa-solid fa-chart-line',
                            cardClass: 'stat-card-dark',
                            trend: 'Live'
                        },
                        {
                            title: 'Total Customers',
                            value: stats.totalCustomers.toLocaleString(),
                            subtitle: 'Registered customers',
                            icon: 'fa-solid fa-users',
                            bgIcon: 'fa-solid fa-user-group',
                            cardClass: 'stat-card-light',
                            trend: 'Live'
                        },
                        {
                            title: 'Total Orders',
                            value: stats.totalOrders.toLocaleString(),
                            subtitle: 'Total invoices created',
                            icon: 'fa-solid fa-cart-shopping',
                            bgIcon: 'fa-solid fa-cart-flatbed',
                            cardClass: 'stat-card-light',
                            trend: 'Live'
                        }
                    ];

                    vm.salesBars = salesAnalytics;

                    vm.latestOrders = latestOrders;

                    // convert top medicines into chart-friendly objects
                    var maxTotal = topMedicines.length
                        ? Math.max.apply(null, topMedicines.map(function (m) { return m.total; }))
                        : 1;

                    var barClasses = ['bar-orange', 'bar-black', 'bar-lime'];

                    vm.topMedicines = topMedicines.map(function (med, index) {
                        var scaledHeight = Math.max(100, Math.round((med.total / maxTotal) * 220));

                        return {
                            name: med.name,
                            shortName: med.name.length > 14 ? med.name.slice(0, 14) + '…' : med.name,
                            amount: '$' + med.total.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }),
                            height: scaledHeight,
                            barClass: barClasses[index] || 'bar-lime'
                        };
                    });

                } catch (e) {
                    vm.error = e.message || 'Failed to load dashboard data.';
                } finally {
                    vm.loading = false;
                    $scope.$applyAsync();
                }
            };

            vm.getBarHeight = function (value) {
                // value is monthly invoice total
                if (!vm.salesBars || !vm.salesBars.length) return '40px';

                var max = Math.max.apply(null, vm.salesBars);
                if (max <= 0) return '40px';

                var minHeight = 40;
                var maxHeight = 250;

                return Math.round((value / max) * (maxHeight - minHeight) + minHeight) + 'px';
            };

            vm.deleteInvoice = async function (invoiceId) {
                const confirmed = window.confirm('Are you sure you want to delete this invoice?');
                if (!confirmed) return;

                try {
                    await DashboardService.deleteInvoice(invoiceId);

                    // remove from latest orders table immediately
                    vm.latestOrders = vm.latestOrders.filter(function (order) {
                        return order.invoiceId !== invoiceId;
                    });

                    // reload dashboard stats/charts so totals update correctly
                    await vm.loadDashboard();

                } catch (e) {
                    vm.error = e.message || 'Failed to delete invoice.';
                } finally {
                    $scope.$applyAsync();
                }
            };

            vm.loadDashboard();
        });
})();