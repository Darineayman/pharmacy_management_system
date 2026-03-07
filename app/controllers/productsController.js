app.controller("ProductsCtrl", function ($scope, $q, medicinesApi, suppliersApi) {
  var vm = this;

  vm.loading = true;
  vm.q = "";
  vm.items = [];
  vm.filtered = [];
  vm.pagedItems = [];
  vm.suppliers = [];
  vm.categories = [];

  vm.lowStockThreshold = 10;
  vm.expiringDays = 30;

  vm.stats = {
    total: 0,
    lowStock: 0,
    expiringSoon: 0,
    categories: 0,
  };

  vm.modal = {
    mode: "add",
    form: {
      medicine_id: null,
      supplier_id: "",
      name: "",
      description: "",
      price: null,
      quantity: null,
      category: "",
      expiry_date: null,
      image_url: "",
    },
    saving: false,
    error: "",
  };

  vm.currentPage = 1;
  vm.pageSize = 4;
  vm.totalPages = 1;
  vm.pageSizeOptions = [4, 8, 12, 20];

  vm.showFilters = false;
  vm.filters = {
    category: "",
    supplier: "",
    lowStock: false,
  };

  var modalInstance = null;

  vm.toggleFilters = function () {
    vm.showFilters = !vm.showFilters;
  };

  vm.clearFilters = function () {
    vm.filters.category = "";
    vm.filters.supplier = "";
    vm.filters.lowStock = false;
    vm.applyFilters();
  };

  vm.loadSuppliers = function () {
    return suppliersApi.getAll().then(function (res) {
      vm.suppliers = res.data || [];
    });
  };

  vm.loadMedicines = function () {
    return medicinesApi.getAll().then(function (res) {
      var meds = res.data || [];

      var supplierMap = {};
      vm.suppliers.forEach(function (s) {
        supplierMap[String(s.supplier_id)] = s.name;
      });

      var distinctCategories = {};

      meds.forEach(function (m) {
        m.supplier_name = supplierMap[String(m.supplier_id)] || "";

        if (m.category && m.category.trim() !== "") {
          distinctCategories[m.category.trim()] = true;
        }
      });

      vm.categories = Object.keys(distinctCategories).sort();
      vm.items = meds;
      vm.filtered = meds.slice();
      vm.currentPage = 1;
      vm.updatePagedItems();
    });
  };

  vm.resetModalForm = function () {
    vm.modal.form = {
      medicine_id: null,
      supplier_id: "",
      name: "",
      description: "",
      price: null,
      quantity: null,
      category: "",
      expiry_date: null,
      image_url: "",
    };
  };

  vm.applyFilters = function () {
    var q = (vm.q || "").toLowerCase().trim();

    vm.filtered = vm.items.filter(function (m) {
      var matchesSearch =
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.category || "").toLowerCase().includes(q) ||
        (m.supplier_name || "").toLowerCase().includes(q);

      var matchesCategory =
        !vm.filters.category || m.category === vm.filters.category;

      var matchesSupplier =
        !vm.filters.supplier ||
        String(m.supplier_id) === String(vm.filters.supplier);

      var matchesLowStock =
        !vm.filters.lowStock || Number(m.quantity || 0) <= vm.lowStockThreshold;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSupplier &&
        matchesLowStock
      );
    });

    vm.currentPage = 1;
    vm.updatePagedItems();
  };

  vm.computeStats = function () {
    vm.stats.total = vm.items.length;

    vm.stats.lowStock = vm.items.filter(function (m) {
      return Number(m.quantity || 0) <= vm.lowStockThreshold;
    }).length;

    var now = new Date();
    var cutoff = new Date(
      now.getTime() + vm.expiringDays * 24 * 60 * 60 * 1000
    );

    vm.stats.expiringSoon = vm.items.filter(function (m) {
      if (!m.expiry_date) return false;
      return new Date(m.expiry_date) <= cutoff;
    }).length;

    var cats = {};
    vm.items.forEach(function (m) {
      if (m.category) cats[m.category] = true;
    });
    vm.stats.categories = Object.keys(cats).length;
  };

  vm.openAddModal = function () {
    vm.modal.mode = "add";
    vm.modal.error = "";
    vm.modal.saving = false;
    vm.resetModalForm();
    vm.showModal();
  };

  vm.openEditModal = function (m) {
    vm.modal.mode = "edit";
    vm.modal.error = "";
    vm.modal.saving = false;

    vm.modal.form = {
      medicine_id: m.medicine_id,
      supplier_id: m.supplier_id,
      name: m.name || "",
      description: m.description || "",
      price: m.price,
      quantity: m.quantity,
      category: m.category || "",
      expiry_date: m.expiry_date ? new Date(m.expiry_date) : null,
      image_url: m.image_url || "",
    };

    vm.showModal();
  };

  vm.showModal = function () {
    var el = document.getElementById("medicineModal");
    modalInstance = bootstrap.Modal.getOrCreateInstance(el);
    modalInstance.show();
  };

  vm.hideModal = function () {
    if (modalInstance) {
      modalInstance.hide();
    }
  };

  vm.saveMedicine = function () {
    vm.modal.error = "";
    vm.modal.saving = true;

    if (!vm.modal.form.name || !vm.modal.form.supplier_id) {
      vm.modal.error = "Please fill in the required fields.";
      vm.modal.saving = false;
      return;
    }

    var payload = {
      supplier_id: Number(vm.modal.form.supplier_id),
      name: vm.modal.form.name,
      description: vm.modal.form.description || null,
      price: Number(vm.modal.form.price || 0),
      quantity: Number(vm.modal.form.quantity || 0),
      category: vm.modal.form.category || null,
      expiry_date: vm.modal.form.expiry_date || null,
      image_url: vm.modal.form.image_url || null,
    };

    var request;

    if (vm.modal.mode === "add") {
      request = medicinesApi.create(payload);
    } else {
      request = medicinesApi.update(vm.modal.form.medicine_id, payload);
    }

    request
      .then(function () {
        return vm.loadSuppliers().then(function () {
          return vm.loadMedicines();
        });
      })
      .then(function () {
        vm.applyFilters();
        vm.computeStats();
        vm.hideModal();
      })
      .catch(function (err) {
        console.error("Save medicine error:", err);
        vm.modal.error =
          (err.data && err.data.message) ||
          err.message ||
          "Failed to save medicine.";
      })
      .finally(function () {
        vm.modal.saving = false;
        $scope.$applyAsync();
      });
  };

  vm.confirmDelete = function (m) {
    if (!confirm("Delete " + m.name + "?")) return;

    medicinesApi
      .remove(m.medicine_id)
      .then(function () {
        return vm.loadSuppliers().then(function () {
          return vm.loadMedicines();
        });
      })
      .then(function () {
        vm.applyFilters();
        vm.computeStats();
      })
      .catch(function (err) {
        alert(
          (err.data && err.data.message) ||
            err.message ||
            "Delete failed"
        );
      })
      .finally(function () {
        $scope.$applyAsync();
      });
  };

  vm.updatePagedItems = function () {
    var start = (vm.currentPage - 1) * vm.pageSize;
    var end = start + vm.pageSize;

    vm.totalPages = Math.max(1, Math.ceil(vm.filtered.length / vm.pageSize));
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
      for (var i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (current <= 3) {
      return [1, 2, 3, "...", total];
    }

    if (current >= total - 2) {
      return [1, "...", total - 2, total - 1, total];
    }

    return [1, "...", current, "...", total];
  };

  vm.init = function () {
    vm.loading = true;

    vm.loadSuppliers()
      .then(function () {
        return vm.loadMedicines();
      })
      .then(function () {
        vm.applyFilters();
        vm.computeStats();
      })
      .finally(function () {
        vm.loading = false;
        $scope.$applyAsync();
      });
  };

  vm.init();
});