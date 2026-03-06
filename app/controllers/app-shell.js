app.controller("AppShellCtrl", function ($route, $rootScope) {
  var vm = this;

  vm.title = "";
  vm.pageTemplate = "";

  function updateFromRoute() {
    var current = $route.current;
    var routeData = current && current.$$route && current.$$route.data;

    vm.title = (routeData && routeData.title) || "";
    vm.pageTemplate = (routeData && routeData.pageTemplate) || "";
  }

  updateFromRoute();

  $rootScope.$on("$routeChangeSuccess", function () {
    updateFromRoute();
  });
});