angular.module('pharmly')
    .directive('appSidebar', function () {
        return {
            restrict: 'E',
            template: `
        <aside class="sidebar">
          <div class="brand">Pharmly</div>

          <nav class="nav">
            <a href="#!/app/dashboard" ng-class="{active: isActive('/app/dashboard')}">Dashboard</a>
            <a href="#!/app/products" ng-class="{active: isActive('/app/products')}">Products</a>
            <a href="#!/app/invoices" ng-class="{active: isActive('/app/invoices')}">Invoices</a>
            <a href="#!/app/customers" ng-class="{active: isActive('/app/customers')}">Customers</a>
            <a href="#!/app/suppliers" ng-class="{active: isActive('/app/suppliers')}">Suppliers</a>
          </nav>

          <div class="sidebar-footer">
            <button type="button" ng-click="logout()">Logout</button>
          </div>
        </aside>
      `,
            controller: function ($scope, $location, AuthService) {
                $scope.isActive = function (path) {
                    return $location.path() === path;
                };

                $scope.logout = async function () {
                    await AuthService.logout();
                    $location.path('/login');
                    $scope.$applyAsync();
                };
            }
        };
    });