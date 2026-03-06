(function () {
    angular.module('pharmly')
        .controller('CustomersCtrl', function ($scope, CustomersService) {
            var vm = this;

            vm.loading = true;
            vm.error = '';

            vm.stats = {
                totalCustomers: 0,
                loyalCustomers: 0,
                newCustomers: 0
            };

            vm.allCustomers = [];
            vm.filteredCustomers = [];
            vm.pagedCustomers = [];

            vm.searchText = '';
            vm.showFilters = false;

            vm.filters = {
                loyaltyType: '',
                hasOrders: '',
                minSpend: ''
            };

            vm.pagination = {
                currentPage: 1,
                pageSize: 8,
                totalPages: 1
            };

            vm.showAddModal = false;
            vm.showEditModal = false;

            vm.newCustomer = {
                full_name: '',
                phone_number: '',
                email: '',
                address: '',
                loyalty_points: 0
            };

            vm.editCustomerData = null;

            vm.loadCustomers = async function () {
                vm.loading = true;
                vm.error = '';

                try {
                    const result = await CustomersService.getCustomersPageData();
                    vm.stats = result.stats;
                    vm.allCustomers = result.customers || [];
                    vm.applyFilters();
                } catch (e) {
                    vm.error = e.message || 'Failed to load customers.';
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
                    loyaltyType: '',
                    hasOrders: '',
                    minSpend: ''
                };
                vm.pagination.currentPage = 1;
                vm.applyFilters();
            };

            vm.applyFilters = function () {
                var result = vm.allCustomers.filter(function (c) {
                    var matchesSearch = true;
                    var matchesLoyalty = true;
                    var matchesOrders = true;
                    var matchesSpend = true;

                    if (vm.searchText) {
                        var q = vm.searchText.toLowerCase();
                        matchesSearch =
                            (c.full_name || '').toLowerCase().includes(q) ||
                            (c.email || '').toLowerCase().includes(q) ||
                            (c.phone_number || '').toLowerCase().includes(q) ||
                            String(c.customer_id).includes(q);
                    }

                    if (vm.filters.loyaltyType === 'loyal') {
                        matchesLoyalty = (c.loyalty_points || 0) > 100;
                    } else if (vm.filters.loyaltyType === 'regular') {
                        matchesLoyalty = (c.loyalty_points || 0) <= 100;
                    }

                    if (vm.filters.hasOrders === 'yes') {
                        matchesOrders = c.orders_placed > 0;
                    } else if (vm.filters.hasOrders === 'no') {
                        matchesOrders = c.orders_placed === 0;
                    }

                    if (vm.filters.minSpend) {
                        matchesSpend = c.total_spend >= Number(vm.filters.minSpend);
                    }

                    return matchesSearch && matchesLoyalty && matchesOrders && matchesSpend;
                });

                vm.filteredCustomers = result;
                vm.pagination.totalPages = Math.max(1, Math.ceil(result.length / vm.pagination.pageSize));

                if (vm.pagination.currentPage > vm.pagination.totalPages) {
                    vm.pagination.currentPage = vm.pagination.totalPages;
                }

                vm.updatePagedCustomers();
            };

            vm.updatePagedCustomers = function () {
                var start = (vm.pagination.currentPage - 1) * vm.pagination.pageSize;
                var end = start + vm.pagination.pageSize;
                vm.pagedCustomers = vm.filteredCustomers.slice(start, end);
            };

            vm.changePage = function (page) {
                if (page < 1 || page > vm.pagination.totalPages) return;
                vm.pagination.currentPage = page;
                vm.updatePagedCustomers();
            };

            vm.getPageNumbers = function () {
                var pages = [];
                for (var i = 1; i <= vm.pagination.totalPages; i++) {
                    pages.push(i);
                }
                return pages;
            };

            vm.openAddModal = function () {
                vm.newCustomer = {
                    full_name: '',
                    phone_number: '',
                    email: '',
                    address: '',
                    loyalty_points: 0
                };
                vm.showAddModal = true;
            };

            vm.closeAddModal = function () {
                vm.showAddModal = false;
            };

            vm.addCustomer = async function () {
                try {
                    await CustomersService.createCustomer(vm.newCustomer);
                    vm.showAddModal = false;
                    await vm.loadCustomers();
                } catch (e) {
                    vm.error = e.message || 'Failed to add customer.';
                    $scope.$applyAsync();
                }
            };

            vm.openEditModal = function (customer) {
                vm.editCustomerData = angular.copy(customer);
                vm.showEditModal = true;
            };

            vm.closeEditModal = function () {
                vm.showEditModal = false;
                vm.editCustomerData = null;
            };

            vm.updateCustomer = async function () {
                try {
                    var payload = {
                        full_name: vm.editCustomerData.full_name,
                        phone_number: vm.editCustomerData.phone_number,
                        email: vm.editCustomerData.email,
                        address: vm.editCustomerData.address,
                        loyalty_points: vm.editCustomerData.loyalty_points
                    };

                    await CustomersService.updateCustomer(vm.editCustomerData.customer_id, payload);
                    vm.showEditModal = false;
                    vm.editCustomerData = null;
                    await vm.loadCustomers();
                } catch (e) {
                    vm.error = e.message || 'Failed to update customer.';
                    $scope.$applyAsync();
                }
            };

            vm.deleteCustomer = async function (customerId) {
                var confirmed = window.confirm('Delete this customer?');
                if (!confirmed) return;

                try {
                    await CustomersService.deleteCustomer(customerId);
                    await vm.loadCustomers();
                } catch (e) {
                    vm.error = e.message || 'Failed to delete customer.';
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

            vm.loadCustomers();
        });
})();