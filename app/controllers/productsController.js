app.controller("productsCtrl", function ($scope) {
  var md = this;

  md.loading = false;
  md.error = "";
  md.items = [];
  md.selected = {};

  md.q = "";
  md.category = "";
  md.stock = "";
  md.categories = [];

  var modal = null;
  function ensureModal() {
    if (!modal) {
      modal = new bootstrap.Modal(document.getElementById("medicineDetailsModal"));
    }
  }

  md.money = function (v) {
    if (v === null || v === undefined || v === "") return "—";
    var n = Number(v);
    if (Number.isNaN(n)) return v;
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  md.date = function (v) {
    if (!v) return "—";
    var d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString();
  };

  md.dateTime = function (v) {
    if (!v) return "—";
    var d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleString();
  };

  md.stockLabel = function (m) {
    var q = Number((m && m.quantity) ?? 0);
    if (q <= 0) return "Out of stock";
    if (q <= 10) return "Low stock";
    return "In stock";
  };

  md.badgeClass = function (m) {
    var q = Number((m && m.quantity) ?? 0);
    if (q <= 0) return "badge-out";
    if (q <= 10) return "badge-low";
    return "badge-ok";
  };

  // Filters
  md.search = function (m) {
    if (!md.q) return true;
    var q = md.q.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.category || "").toLowerCase().includes(q) ||
      (m.description || "").toLowerCase().includes(q)
    );
  };

  md.catFn = function (m) {
    if (!md.category) return true;
    return (m.category || "") === md.category;
  };

  md.stockFn = function (m) {
    if (!md.stock) return true;
    var qty = Number((m && m.quantity) ?? 0);
    if (md.stock === "out") return qty <= 0;
    if (md.stock === "low") return qty > 0 && qty <= 10;
    return true;
  };

  md.open = function (m) {
    md.selected = m;
    $scope.$applyAsync();
    ensureModal();
    modal.show();
  };

  md.load = async function () {
    md.loading = true;
    md.error = "";
    $scope.$applyAsync();

    try {
      // Requires `supabase` from supabaseClient.js loaded globally
      var res = await supabase
        .from("medicines")
        .select(`
          medicine_id,
          supplier_id,
          name,
          description,
          price,
          quantity,
          category,
          expiry_date,
          image_url,
          created_at,
          suppliers:supplier_id ( name, contact )
        `)
        .order("created_at", { ascending: false });

      if (res.error) throw res.error;

      md.items = res.data || [];

      // build categories
      var set = new Set();
      md.items.forEach(function (x) { if (x.category) set.add(x.category); });
      md.categories = Array.from(set).sort();

    } catch (e) {
      md.error = e.message || "Failed to load medicines.";
    } finally {
      md.loading = false;
      $scope.$applyAsync();
    }
  };

  md.load();
});