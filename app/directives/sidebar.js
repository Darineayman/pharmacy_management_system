angular.module("pharmly").directive("appSidebar", function () {
    return {
        restrict: "E",
        template: `
                    <aside class="sidebar">
                        <div class="brand">
                        <div class="brand-badge"></div>
                        <span>Pharmly</span>
                        </div>

                        <nav class="nav">
                        <a href="#!/app/dashboard" ng-class="{active: isActive('/app/dashboard')}">
                          <i class="fa-solid fa-chart-line"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="#!/app/products" ng-class="{active: isActive('/app/products')}">
                          <i class="fa-solid fa-capsules"></i>
                            <span>Products</span>
                        </a>
                        <a href="#!/app/invoices" ng-class="{active: isActive('/app/invoices')}">
                          <i class="fa-solid fa-file-invoice"></i>
                            <span>Invoices</span>
                        </a>
                        <a href="#!/app/customers" ng-class="{active: isActive('/app/customers')}">
                          <i class="fa-solid fa-users"></i>
                            <span>Customers</span>
                        </a>
                        <a href="#!/app/suppliers" ng-class="{active: isActive('/app/suppliers')}">
                          <i class="fa-solid fa-building"></i>
                            <span>Suppliers</span>
                        </a>
                        </nav>

            <div class="sidebar-footer mt-auto">
              <button class="btn btn-primary d-flex align-items-center justify-content-center gap-2" type="button" ng-click="logout()">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
              </button>
            </div>
          </aside>
          `,
        controller: function ($scope, $location, authService) {
            $scope.isActive = function (path) {
                return $location.path() === path;
            };

            $scope.logout = async function () {
                await authService.logout();
                $location.path("/login");
                $scope.$applyAsync();
            };
        },
  };
});