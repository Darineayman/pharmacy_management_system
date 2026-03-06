app.controller("ProductsCtrl", function ($scope, $q) {
  var vm = this;

  const SUPABASE_URL = "https://vvvlzxywfltgrnzimdru.supabase.co";
  const SUPABASE_KEY = "sb_publishable_5iONbaBdSVH8Lv7Tn98Xvw_iniQ52Wa";

  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  vm.loading = true;
  vm.q = "";
  vm.items = [];
  vm.filtered = [];
  vm.suppliers = [];

  vm.lowStockThreshold = 10;
  vm.expiringDays = 30;

  vm.stats = { total: 0, lowStock: 0, expiringSoon: 0, categories: 0 };

  vm.modal = {
    mode: "add",
    form: {},
    saving: false,
    error: "",
  };

  var modalInstance = null;

  vm.init = function () {
    vm.loading = true;

    $q.all([vm.loadSuppliers(), vm.loadMedicines()])
      .then(function () {
        vm.applyFilter();
        vm.computeStats();
      })
      .finally(function () {
        vm.loading = false;
      });
  };
  vm.showFilters = false;

  vm.filters = {
    category: "",
    supplier: "",
    lowStock: false,
  };

  vm.toggleFilters = function () {
    vm.showFilters = !vm.showFilters;
  };

  vm.clearFilters = function () {
    vm.filters.category = "";
    vm.filters.supplier = "";
    vm.filters.lowStock = false;
    vm.applyFilter();
  };

  vm.loadSuppliers = function () {
    return $q(function (resolve, reject) {
      sb.from("suppliers")
        .select("supplier_id,name")
        .order("name", { ascending: true })
        .then(function (res) {
          if (res.error) return reject(res.error);
          vm.suppliers = res.data || [];
          resolve(true);
          $scope.$applyAsync();
        });
    });
  };

  vm.loadMedicines = function () {
    return $q(function (resolve, reject) {
      sb.from("medicines")
        .select("*")
        .then(function (res) {
          console.log("MEDICINES RES:", res); // <-- IMPORTANT
          if (res.error) return reject(res.error);
          vm.items = res.data || [];
          resolve(true);
          $scope.$applyAsync();
        });
    });
  };

  vm.applyFilter = function () {
    var q = (vm.q || "").toLowerCase().trim();

    if (!q) {
      vm.filtered = vm.items.slice();
      return;
    }

    vm.filtered = vm.items.filter(function (m) {
      return (
        (m.name || "").toLowerCase().includes(q) ||
        (m.category || "").toLowerCase().includes(q) ||
        (m.supplier_name || "").toLowerCase().includes(q)
      );
    });
  };

  vm.computeStats = function () {
    vm.stats.total = vm.items.length;

    vm.stats.lowStock = vm.items.filter(function (m) {
      return (m.quantity || 0) <= vm.lowStockThreshold;
    }).length;

    var now = new Date();
    var cutoff = new Date(
      now.getTime() + vm.expiringDays * 24 * 60 * 60 * 1000,
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
    vm.modal.form = {
      supplier_id: "",
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      category: "",
      expiry_date: null,
      image_url: "",
    };
    vm.showModal();
  };

  vm.openEditModal = function (m) {
    vm.modal.mode = "edit";
    vm.modal.error = "";
    vm.modal.form = {
      medicine_id: m.medicine_id,
      supplier_id: m.supplier_id,
      name: m.name,
      description: m.description,
      price: m.price,
      quantity: m.quantity,
      category: m.category,
      expiry_date: m.expiry_date,
      image_url: m.image_url,
    };
    vm.showModal();
  };

  vm.showModal = function () {
    var el = document.getElementById("medicineModal");
    modalInstance = bootstrap.Modal.getOrCreateInstance(el);
    modalInstance.show();
  };

  vm.hideModal = function () {
    if (modalInstance) modalInstance.hide();
  };

  vm.saveMedicine = function () {
    vm.modal.error = "";
    vm.modal.saving = true;

    var payload = {
      supplier_id: vm.modal.form.supplier_id,
      name: vm.modal.form.name,
      description: vm.modal.form.description || null,
      price: Number(vm.modal.form.price),
      quantity: Number(vm.modal.form.quantity),
      category: vm.modal.form.category || null,
      expiry_date: vm.modal.form.expiry_date || null,
      image_url: vm.modal.form.image_url || null,
    };

    console.log("Saving medicine...", payload);

    var req;
    if (vm.modal.mode === "add") {
      req = sb.from("medicines").insert([payload]);
    } else {
      req = sb
        .from("medicines")
        .update(payload)
        .eq("medicine_id", vm.modal.form.medicine_id);
    }

    req
      .then(function (res) {
        if (res.error) throw res.error;
        return vm.loadSuppliers().then(vm.loadMedicines);
      })
      .then(function () {
        vm.applyFilter();
        vm.computeStats();
        vm.hideModal();
      })
      .catch(function (err) {
        console.error("Save error:", err);
        vm.modal.error = err.message || "Failed to save medicine";
      })
      .finally(function () {
        vm.modal.saving = false;
        $scope.$applyAsync();
      });
  };

  vm.confirmDelete = function (m) {
    if (!confirm("Delete " + m.name + "?")) return;

    sb.from("medicines")
      .delete()
      .eq("medicine_id", m.medicine_id)
      .then(function (res) {
        if (res.error) throw res.error;
        return vm.loadSuppliers().then(vm.loadMedicines);
      })
      .then(function () {
        vm.applyFilter();
        vm.computeStats();
      })
      .catch(function (err) {
        alert(err.message || "Delete failed");
      })
      .finally(function () {
        $scope.$applyAsync();
      });
  };

  vm.init();
});
