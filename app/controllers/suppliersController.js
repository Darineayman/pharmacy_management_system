(function () {
    angular.module('pharmly')
        .controller('SuppliersCtrl', function ($scope, SuppliersService) {
            var vm = this;

            vm.loading = true;
            vm.error = '';

            vm.stats = {
                totalSuppliers: 0,
                activeSuppliers: 0,
                totalPurchaseValue: 0,
                atRiskSuppliers: 0
            };

            vm.allSuppliers = [];
            vm.filteredSuppliers = [];
            vm.pagedSuppliers = [];
            vm.categories = [];

            vm.searchText = '';
            vm.showFilters = false;

            vm.filters = {
                category: '',
                activity: '',
                stockRisk: '',
                purchaseValue: ''
            };

            vm.pagination = {
                currentPage: 1,
                pageSize: 8,
                totalPages: 1
            };

            vm.showAddModal = false;
            vm.showEditModal = false;

            vm.newSupplier = {
                name: '',
                contact: ''
            };

            vm.editSupplierData = null;

            vm.loadSuppliers = async function () {
                vm.loading = true;
                vm.error = '';

                try {
                    const result = await SuppliersService.getSuppliersPageData();
                    vm.stats = result.stats;
                    vm.allSuppliers = result.suppliers || [];
                    vm.categories = result.categories || [];
                    vm.applyFilters();
                } catch (e) {
                    vm.error = e.message || 'Failed to load suppliers.';
                } finally {
                    vm.loading = false;
                    $scope.$applyAsync();
                }
            };

            vm.toggleFilters = function () {
                vm.showFilters = !vm.showFilters;
            };

            vm.resetFilters = function () {
                vm.searchText = '';
                vm.filters = {
                    category: '',
                    activity: '',
                    stockRisk: '',
                    purchaseValue: ''
                };
                vm.pagination.currentPage = 1;
                vm.applyFilters();
            };

            vm.applyFilters = function () {
                var result = vm.allSuppliers.filter(function (s) {
                    var matchesSearch = true;
                    var matchesCategory = true;
                    var matchesActivity = true;
                    var matchesStockRisk = true;
                    var matchesPurchaseValue = true;

                    if (vm.searchText) {
                        var q = vm.searchText.toLowerCase();
                        matchesSearch =
                            (s.name || '').toLowerCase().includes(q) ||
                            (s.contact || '').toLowerCase().includes(q) ||
                            String(s.supplier_id).includes(q);
                    }

                    if (vm.filters.category) {
                        matchesCategory = s.categories.includes(vm.filters.category);
                    }

                    if (vm.filters.activity === '30days') {
                        matchesActivity = s.active_last_30_days === true;
                    } else if (vm.filters.activity === 'never') {
                        matchesActivity = s.total_purchased_qty === 0;
                    }

                    if (vm.filters.stockRisk === 'risk') {
                        matchesStockRisk = s.low_stock_items > 0;
                    } else if (vm.filters.stockRisk === 'safe') {
                        matchesStockRisk = s.low_stock_items === 0;
                    }

                    if (vm.filters.purchaseValue === 'low') {
                        matchesPurchaseValue = s.total_purchase_value < 500;
                    } else if (vm.filters.purchaseValue === 'mid') {
                        matchesPurchaseValue = s.total_purchase_value >= 500 && s.total_purchase_value <= 2000;
                    } else if (vm.filters.purchaseValue === 'high') {
                        matchesPurchaseValue = s.total_purchase_value > 2000;
                    }

                    return matchesSearch && matchesCategory && matchesActivity && matchesStockRisk && matchesPurchaseValue;
                });

                vm.filteredSuppliers = result;
                vm.pagination.totalPages = Math.max(1, Math.ceil(result.length / vm.pagination.pageSize));

                if (vm.pagination.currentPage > vm.pagination.totalPages) {
                    vm.pagination.currentPage = vm.pagination.totalPages;
                }

                vm.updatePagedSuppliers();
            };

            vm.updatePagedSuppliers = function () {
                var start = (vm.pagination.currentPage - 1) * vm.pagination.pageSize;
                var end = start + vm.pagination.pageSize;
                vm.pagedSuppliers = vm.filteredSuppliers.slice(start, end);
            };

            vm.changePage = function (page) {
                if (page < 1 || page > vm.pagination.totalPages) return;
                vm.pagination.currentPage = page;
                vm.updatePagedSuppliers();
            };

            vm.getPageNumbers = function () {
                var pages = [];
                for (var i = 1; i <= vm.pagination.totalPages; i++) {
                    pages.push(i);
                }
                return pages;
            };

            vm.openAddModal = function () {
                vm.newSupplier = {
                    name: '',
                    contact: ''
                };
                vm.showAddModal = true;
            };

            vm.closeAddModal = function () {
                vm.showAddModal = false;
            };

            vm.addSupplier = async function () {
                try {
                    await SuppliersService.createSupplier(vm.newSupplier);
                    vm.showAddModal = false;
                    await vm.loadSuppliers();
                } catch (e) {
                    vm.error = e.message || 'Failed to add supplier.';
                    $scope.$applyAsync();
                }
            };

            vm.openEditModal = function (supplier) {
                vm.editSupplierData = angular.copy(supplier);
                vm.showEditModal = true;
            };

            vm.closeEditModal = function () {
                vm.showEditModal = false;
                vm.editSupplierData = null;
            };

            vm.updateSupplier = async function () {
                try {
                    await SuppliersService.updateSupplier(vm.editSupplierData.supplier_id, {
                        name: vm.editSupplierData.name,
                        contact: vm.editSupplierData.contact
                    });

                    vm.showEditModal = false;
                    vm.editSupplierData = null;
                    await vm.loadSuppliers();
                } catch (e) {
                    vm.error = e.message || 'Failed to update supplier.';
                    $scope.$applyAsync();
                }
            };

            vm.deleteSupplier = async function (supplierId) {
                var confirmed = window.confirm('Delete this supplier?');
                if (!confirmed) return;

                try {
                    await SuppliersService.deleteSupplier(supplierId);
                    await vm.loadSuppliers();
                } catch (e) {
                    vm.error = e.message || 'Failed to delete supplier. It may still be referenced by purchases.';
                    $scope.$applyAsync();
                }
            };

            vm.formatCurrency = function (value) {
                return '$' + Number(value || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            };

            vm.formatDate = function (value) {
                if (!value) return '-';
                var d = new Date(value);
                return d.toLocaleDateString('en-GB');
            };

            vm.loadSuppliers();
        });
})();