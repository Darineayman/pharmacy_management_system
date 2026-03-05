app.controller('AppShellCtrl', function ($route) {
    var vm = this;

    vm.title = ($route.current && $route.current.data && $route.current.data.title) || '';
    vm.pageTemplate = ($route.current && $route.current.data && $route.current.data.pageTemplate) || '';
});