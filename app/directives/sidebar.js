angular.module('pharmly')
    .directive('appSidebar', function () {
        return {
            restrict: 'E',
            template: `
                    <aside class="sidebar">
                        <div class="brand">
                        <div class="brand-badge"></div>
                        <span>Pharmly</span>
                        </div>

                        <nav class="nav">
                        <a href="#!/app/dashboard" ng-class="{active: isActive('/app/dashboard')}">
                            <span>Dashboard</span>
                        </a>
                        <a href="#!/app/products" ng-class="{active: isActive('/app/products')}">
                            <span>Products</span>
                        </a>
                        <a href="#!/app/invoices" ng-class="{active: isActive('/app/invoices')}">
                            <span>Invoices</span>
                        </a>
                        <a href="#!/app/customers" ng-class="{active: isActive('/app/customers')}">
                            <span>Customers</span>
                        </a>
                        <a href="#!/app/suppliers" ng-class="{active: isActive('/app/suppliers')}">
                            <span>Suppliers</span>
                        </a>
                        </nav>

                        <div class="sidebar-footer">
                        <button class="btn btn-primary" type="button" ng-click="logout()">Logout</button>
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