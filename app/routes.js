app
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      // ---------- Public ----------
      .when("/", {
        templateUrl: "app/views/public/landing.html",
      })
      .when("/login", {
        templateUrl: "app/views/public/login.html",
      })
      .when("/signup", {
        templateUrl: "app/views/public/signup.html",
      })

      // ---------- Protected (all use App Shell) ----------
      .when("/app/dashboard", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Dashboard",
          pageTemplate: "app/views/app/dashboard.html",
        },
      })
      .when("/app/products", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Products",
          pageTemplate: "app/views/app/products.html",
        },
      })
      .when("/app/products/:id", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Product Details",
          pageTemplate: "app/views/app/product-details.html",
        },
      })
      .when("/app/invoices", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Invoices",
          pageTemplate: "app/views/app/invoices.html",
        },
      })
      .when("/app/invoices/:id", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Invoice Details",
          pageTemplate: "app/views/app/invoice-details.html",
        },
      })
      .when("/app/customers", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Customers",
          pageTemplate: "app/views/app/customers.html",
        },
      })
      .when("/app/suppliers", {
        templateUrl: "app/views/app/shell.html",
        controller: "AppShellCtrl",
        controllerAs: "vm",
        data: {
          requiresAuth: true,
          title: "Suppliers",
          pageTemplate: "app/views/app/suppliers.html",
        },
      })

      .otherwise({ redirectTo: "/" });

    //     // optional: remove # from URLs if you configure server for SPA
    // $locationProvider.html5Mode(true);
  })

  //     // Route guard: block /app/* if not logged in
  // .run(function ($rootScope, $location, AuthService) {
  //   $rootScope.$on("$routeChangeStart", async function (event, next) {
  //     if (next && next.data && next.data.requiresAuth) {
  //       const ok = await AuthService.isAuthenticated();
  //       if (!ok) {
  //         event.preventDefault();
  //         $location.path("/login");
  //       }
  //     }
  //   });
  // });