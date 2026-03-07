app.controller(
  "InvoicesCtrl",
  function (
    $scope,
    $q,
    invoicesApi,
    invoiceItemsApi,
    customersApi,
    medicinesApi,
    usersApi,
    authService
  ) {
    console.log("InvoicesCtrl controller created");
    var vm = this;

    vm.loading = true;
    vm.q = "";
    vm.items = [];
    vm.filtered = [];
    vm.pagedItems = [];

    vm.showFilters = false;
    vm.filters = {
      status: "",
      payment_method: "",
    };

    vm.stats = {
      total: 0,
      paid: 0,
      draft: 0,
      revenue: 0,
    };

    vm.customers = [];
    vm.medicines = [];
    vm.showNewCustomerForm = false;

    vm.currentPage = 1;
    vm.pageSize = 4;
    vm.totalPages = 1;
    vm.pageSizeOptions = [4, 8, 12, 20];

    vm.invoiceView = {
      loading: false,
      error: "",
      invoice: null,
      items: [],
    };

    vm.invoiceModal = {
      saving: false,
      error: "",
      form: {
        customer_id: "",
        payment_method: "cash",
        status: "paid",
        items: [],
        total_amount: 0,
      },
      newCustomer: {
        full_name: "",
        phone_number: "",
        address: "",
      },
    };

    var invoiceModalInstance = null;
    var addInvoiceModalInstance = null;

    vm.toggleFilters = function () {
      vm.showFilters = !vm.showFilters;
    };

    vm.clearFilters = function () {
      vm.filters.status = "";
      vm.filters.payment_method = "";
      vm.applyFilters();
    };

    vm.applyFilters = function () {
      var q = (vm.q || "").toLowerCase().trim();

      vm.filtered = vm.items.filter(function (inv) {
        var matchesSearch =
          !q ||
          String(inv.invoice_number || "").toLowerCase().includes(q) ||
          String(inv.customer_name || "").toLowerCase().includes(q) ||
          String(inv.created_by_name || "").toLowerCase().includes(q);

        var matchesStatus =
          !vm.filters.status || inv.status === vm.filters.status;

        var matchesPayment =
          !vm.filters.payment_method ||
          inv.payment_method === vm.filters.payment_method;

        return matchesSearch && matchesStatus && matchesPayment;
      });

      vm.currentPage = 1;
      vm.updatePagedItems();
    };

    vm.computeStats = function () {
      vm.stats.total = vm.items.length;

      vm.stats.paid = vm.items.filter(function (i) {
        return i.status === "paid";
      }).length;

      vm.stats.draft = vm.items.filter(function (i) {
        return i.status === "draft";
      }).length;

      vm.stats.revenue = vm.items.reduce(function (sum, i) {
        return sum + Number(i.total_amount || 0);
      }, 0);
    };

    vm.updatePagedItems = function () {
      vm.totalPages = Math.max(1, Math.ceil(vm.filtered.length / vm.pageSize));
      var start = (vm.currentPage - 1) * vm.pageSize;
      var end = start + vm.pageSize;
      vm.pagedItems = vm.filtered.slice(start, end);
    };

    vm.goToPage = function (page) {
      if (page < 1 || page > vm.totalPages) return;
      vm.currentPage = page;
      vm.updatePagedItems();
    };

    vm.changePageSize = function () {
      vm.currentPage = 1;
      vm.updatePagedItems();
    };

    vm.getVisiblePages = function () {
      var total = vm.totalPages;
      var current = vm.currentPage;

      if (total <= 5) {
        var pages = [];
        for (var i = 1; i <= total; i++) pages.push(i);
        return pages;
      }

      if (current <= 3) return [1, 2, 3, "...", total];
      if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
      return [1, "...", current, "...", total];
    };

    vm.loadInvoices = function () {
      return $q
        .all([invoicesApi.getAll(), customersApi.getAll(), usersApi.getAll()])
        .then(function (results) {
          var invoices = results[0].data || [];
          var customers = results[1].data || [];
          var users = results[2].data || [];

          var customerMap = {};
          customers.forEach(function (c) {
            customerMap[String(c.customer_id)] = c.full_name;
          });

          var userMap = {};
          users.forEach(function (u) {
            userMap[String(u.user_id)] = u.username;
          });

          invoices.forEach(function (inv) {
            inv.customer_name = customerMap[String(inv.customer_id)] || "";
            inv.created_by_name = userMap[String(inv.created_by)] || "";
          });

          vm.items = invoices;
          vm.filtered = invoices.slice();

          vm.computeStats();
          vm.updatePagedItems();
          $scope.$applyAsync();
        })
        .catch(function (err) {
          console.error("loadInvoices error:", err);
        });
    };

    vm.loadCustomers = function () {
      return customersApi.getAll().then(function (res) {
        vm.customers = res.data || [];
      });
    };

    vm.loadMedicinesForInvoice = function () {
      return medicinesApi.getForInvoice().then(function (res) {
        vm.medicines = res.data || [];
      });
    };

    vm.showInvoiceModal = function () {
      var el = document.getElementById("invoiceDetailsModal");
      invoiceModalInstance = bootstrap.Modal.getOrCreateInstance(el);
      invoiceModalInstance.show();
    };

    vm.hideInvoiceModal = function () {
      if (invoiceModalInstance) {
        invoiceModalInstance.hide();
      }
    };

    vm.showAddInvoiceModal = function () {
      var el = document.getElementById("addInvoiceModal");
      addInvoiceModalInstance = bootstrap.Modal.getOrCreateInstance(el);
      addInvoiceModalInstance.show();
    };

    vm.hideAddInvoiceModal = function () {
      if (addInvoiceModalInstance) {
        addInvoiceModalInstance.hide();
      }
    };

    vm.resetInvoiceModal = function () {
      vm.invoiceModal.error = "";
      vm.invoiceModal.saving = false;
      vm.showNewCustomerForm = false;

      vm.invoiceModal.form = {
        customer_id: "",
        payment_method: "cash",
        status: "paid",
        items: [],
        total_amount: 0,
      };

      vm.invoiceModal.newCustomer = {
        full_name: "",
        phone_number: "",
        address: "",
      };
    };

    vm.toggleNewCustomerForm = function () {
      vm.showNewCustomerForm = !vm.showNewCustomerForm;

      if (vm.showNewCustomerForm) {
        vm.invoiceModal.form.customer_id = "";
      } else {
        vm.invoiceModal.newCustomer = {
          full_name: "",
          phone_number: "",
          address: "",
        };
      }
    };

    vm.addInvoiceItemRow = function () {
      vm.invoiceModal.form.items.push({
        medicine_id: "",
        quantity: 1,
        unit_price: 0,
        line_total: 0,
      });
    };

    vm.removeInvoiceItemRow = function (index) {
      vm.invoiceModal.form.items.splice(index, 1);
      vm.updateInvoiceTotal();
    };

    vm.onMedicineChange = function (item) {
      var selected = vm.medicines.find(function (m) {
        return String(m.medicine_id) === String(item.medicine_id);
      });

      item.unit_price = selected ? Number(selected.price || 0) : 0;
      vm.updateLineTotal(item);
    };

    vm.updateLineTotal = function (item) {
      item.quantity = Number(item.quantity || 0);
      item.unit_price = Number(item.unit_price || 0);
      item.line_total = item.quantity * item.unit_price;
      vm.updateInvoiceTotal();
    };

    vm.updateInvoiceTotal = function () {
      vm.invoiceModal.form.total_amount = vm.invoiceModal.form.items.reduce(
        function (sum, item) {
          return sum + Number(item.line_total || 0);
        },
        0
      );
    };

    vm.openCreateInvoice = function () {
      vm.resetInvoiceModal();

      $q.all([vm.loadCustomers(), vm.loadMedicinesForInvoice()])
        .then(function () {
          vm.addInvoiceItemRow();
          vm.showAddInvoiceModal();
        })
        .catch(function (err) {
          alert(err.message || "Failed to load invoice form data");
        });
    };

    vm.saveInvoice = function () {
      vm.invoiceModal.error = "";

      var validItems = vm.invoiceModal.form.items.filter(function (item) {
        return item.medicine_id && Number(item.quantity) > 0;
      });

      if (!validItems.length) {
        vm.invoiceModal.error = "Please select medicines and quantities.";
        return;
      }

      vm.invoiceModal.saving = true;

      function resolveCustomerId() {
        if (!vm.showNewCustomerForm) {
          return Promise.resolve(vm.invoiceModal.form.customer_id || null);
        }

        var c = vm.invoiceModal.newCustomer;

        if (!c.full_name || !c.full_name.trim()) {
          return Promise.reject(new Error("Customer name is required."));
        }

        return customersApi
          .create({
            full_name: c.full_name.trim(),
            phone_number: c.phone_number || null,
            address: c.address || null,
          })
          .then(function (res) {
            return res.data[0].customer_id;
          });
      }

      resolveCustomerId()
        .then(function (customerId) {
          return authService.getSession().then(function (session) {
            var userId = session.user.id;

            var invoicePayload = {
              created_by: userId,
              customer_id: customerId,
              invoice_number: "INV-" + Date.now(),
              total_amount: Number(vm.invoiceModal.form.total_amount || 0),
              payment_method: String(
                vm.invoiceModal.form.payment_method || "cash"
              ).toLowerCase(),
              status: String(
                vm.invoiceModal.form.status || "paid"
              ).toLowerCase(),
            };

            return invoicesApi.create(invoicePayload);
          });
        })
        .then(function (invoiceRes) {
          var invoice = invoiceRes.data[0];

          var itemPayloads = validItems.map(function (item) {
            return {
              invoice_id: invoice.invoice_id,
              medicine_id: Number(item.medicine_id),
              quantity: Number(item.quantity),
              line_total: Number(item.line_total),
            };
          });

          return invoiceItemsApi.createMany(itemPayloads);
        })
        .then(function () {
          return vm.loadInvoices();
        })
        .then(function () {
          vm.hideAddInvoiceModal();
          vm.resetInvoiceModal();
        })
        .catch(function (err) {
          console.error(err);
          vm.invoiceModal.error =
            (err.data && err.data.message) ||
            err.message ||
            "Failed to save invoice.";
        })
        .finally(function () {
          vm.invoiceModal.saving = false;
          $scope.$applyAsync();
        });
    };

    vm.openViewInvoiceModal = function (inv) {
      vm.invoiceView.loading = true;
      vm.invoiceView.error = "";
      vm.invoiceView.invoice = inv;
      vm.invoiceView.items = [];

      $q.all([
        invoiceItemsApi.getByInvoiceId(inv.invoice_id),
        medicinesApi.getForInvoice(),
      ])
        .then(function (results) {
          var items = results[0].data || [];
          var medicines = results[1].data || [];

          var medicineMap = {};
          medicines.forEach(function (m) {
            medicineMap[String(m.medicine_id)] = {
              name: m.name,
              price: Number(m.price || 0),
            };
          });

          items.forEach(function (item) {
            var med = medicineMap[String(item.medicine_id)] || {};
            item.medicine_name = med.name || "Unknown Medicine";
            item.unit_price = Number(med.price || 0);
          });

          vm.invoiceView.items = items;
          vm.showInvoiceModal();
        })
        .catch(function (err) {
          vm.invoiceView.error =
            (err.data && err.data.message) ||
            err.message ||
            "Failed to load invoice details.";
        })
        .finally(function () {
          vm.invoiceView.loading = false;
          $scope.$applyAsync();
        });
    };

    vm.confirmDelete = function (inv) {
      if (!confirm("Delete invoice " + (inv.invoice_number || inv.invoice_id) + "?")) {
        return;
      }

      invoicesApi
        .remove(inv.invoice_id)
        .then(function () {
          return vm.loadInvoices();
        })
        .catch(function (err) {
          alert(
            (err.data && err.data.message) || err.message || "Delete failed"
          );
        })
        .finally(function () {
          $scope.$applyAsync();
        });
    };

    vm.init = function () {
      vm.loading = true;
      vm.loadInvoices().finally(function () {
        vm.loading = false;
        $scope.$applyAsync();
      });
    };

    vm.init();
  }
);