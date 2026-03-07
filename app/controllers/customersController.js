app.controller("CustomersCtrl", function ($scope, $q, customersApi, invoicesApi) {
  var vm = this;

  vm.loading = true;
  vm.error = "";

  vm.stats = {
    totalCustomers: 0,
    loyalCustomers: 0,
    newCustomers: 0,
  };

  vm.allCustomers = [];
  vm.filteredCustomers = [];
  vm.pagedCustomers = [];

  vm.searchText = "";
  vm.showFilters = false;

  vm.filters = {
    loyaltyType: "",
    hasOrders: "",
    minSpend: "",
  };

  vm.pagination = {
    currentPage: 1,
    pageSize: 8,
    totalPages: 1,
  };

  vm.showAddModal = false;
  vm.showEditModal = false;

  vm.newCustomer = {
    full_name: "",
    phone_number: "",
    email: "",
    address: "",
    loyalty_points: 0,
  };

  vm.editCustomerData = null;

  vm.loadCustomers = function () {
    vm.loading = true;
    vm.error = "";

    return $q
      .all([customersApi.getAll(), invoicesApi.getAll()])
      .then(function (results) {
        var customers = results[0].data || [];
        var invoices = results[1].data || [];

        customers.forEach(function (c) {
          var customerInvoices = invoices.filter(function (inv) {
            return String(inv.customer_id) === String(c.customer_id);
          });

          c.orders_placed = customerInvoices.length;

          c.total_spend = customerInvoices.reduce(function (sum, inv) {
            return sum + Number(inv.total_amount || 0);
          }, 0);

          if (customerInvoices.length > 0) {
            var sorted = customerInvoices.slice().sort(function (a, b) {
              return new Date(b.created_at) - new Date(a.created_at);
            });
            c.last_order = sorted[0].created_at;
          } else {
            c.last_order = null;
          }
        });

        vm.allCustomers = customers;
        vm.computeStats();
        vm.applyFilters();
      })
      .catch(function (e) {
        vm.error =
          (e.data && e.data.message) ||
          e.message ||
          "Failed to load customers.";
      })
      .finally(function () {
        vm.loading = false;
        $scope.$applyAsync();
      });
  };

  vm.computeStats = function () {
    vm.stats.totalCustomers = vm.allCustomers.length;

    vm.stats.loyalCustomers = vm.allCustomers.filter(function (c) {
      return Number(c.loyalty_points || 0) > 100;
    }).length;

    var now = new Date();
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    vm.stats.newCustomers = vm.allCustomers.filter(function (c) {
      if (!c.created_at) return false;
      return new Date(c.created_at) >= thirtyDaysAgo;
    }).length;
  };

  vm.toggleFilters = function () {
    vm.showFilters = !vm.showFilters;
  };

  vm.resetFilters = function () {
    vm.searchText = "";
    vm.filters = {
      loyaltyType: "",
      hasOrders: "",
      minSpend: "",
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
          (c.full_name || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.phone_number || "").toLowerCase().includes(q) ||
          String(c.customer_id).includes(q);
      }

      if (vm.filters.loyaltyType === "loyal") {
        matchesLoyalty = Number(c.loyalty_points || 0) > 100;
      } else if (vm.filters.loyaltyType === "regular") {
        matchesLoyalty = Number(c.loyalty_points || 0) <= 100;
      }

      if (vm.filters.hasOrders === "yes") {
        matchesOrders = Number(c.orders_placed || 0) > 0;
      } else if (vm.filters.hasOrders === "no") {
        matchesOrders = Number(c.orders_placed || 0) === 0;
      }

      if (vm.filters.minSpend) {
        matchesSpend =
          Number(c.total_spend || 0) >= Number(vm.filters.minSpend);
      }

      return matchesSearch && matchesLoyalty && matchesOrders && matchesSpend;
    });

    vm.filteredCustomers = result;
    vm.pagination.totalPages = Math.max(
      1,
      Math.ceil(result.length / vm.pagination.pageSize),
    );

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
      full_name: "",
      phone_number: "",
      email: "",
      address: "",
      loyalty_points: 0,
    };
    vm.showAddModal = true;
  };

  vm.closeAddModal = function () {
    vm.showAddModal = false;
  };

  vm.addCustomer = function () {
    vm.error = "";

    var payload = {
      full_name: vm.newCustomer.full_name,
      phone_number: vm.newCustomer.phone_number || null,
      email: vm.newCustomer.email || null,
      address: vm.newCustomer.address || null,
      loyalty_points: Number(vm.newCustomer.loyalty_points || 0),
    };

    customersApi
      .create(payload)
      .then(function () {
        vm.showAddModal = false;
        return vm.loadCustomers();
      })
      .catch(function (e) {
        vm.error =
          (e.data && e.data.message) || e.message || "Failed to add customer.";
        $scope.$applyAsync();
      });
  };

  vm.openEditModal = function (customer) {
    vm.editCustomerData = angular.copy(customer);
    vm.showEditModal = true;
  };

  vm.closeEditModal = function () {
    vm.showEditModal = false;
    vm.editCustomerData = null;
  };

  vm.updateCustomer = function () {
    vm.error = "";

    var payload = {
      full_name: vm.editCustomerData.full_name,
      phone_number: vm.editCustomerData.phone_number || null,
      email: vm.editCustomerData.email || null,
      address: vm.editCustomerData.address || null,
      loyalty_points: Number(vm.editCustomerData.loyalty_points || 0),
    };

    customersApi
      .update(vm.editCustomerData.customer_id, payload)
      .then(function () {
        vm.showEditModal = false;
        vm.editCustomerData = null;
        return vm.loadCustomers();
      })
      .catch(function (e) {
        vm.error =
          (e.data && e.data.message) ||
          e.message ||
          "Failed to update customer.";
        $scope.$applyAsync();
      });
  };

  vm.deleteCustomer = function (customerId) {
    var confirmed = window.confirm("Delete this customer?");
    if (!confirmed) return;

    customersApi
      .remove(customerId)
      .then(function () {
        return vm.loadCustomers();
      })
      .catch(function (e) {
        vm.error =
          (e.data && e.data.message) ||
          e.message ||
          "Failed to delete customer.";
        $scope.$applyAsync();
      });
  };

  vm.formatCurrency = function (value) {
    return (
      "$" +
      Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  vm.formatDate = function (value) {
    if (!value) return "-";
    var d = new Date(value);
    return d.toLocaleDateString("en-GB");
  };

  vm.loadCustomers();
});
