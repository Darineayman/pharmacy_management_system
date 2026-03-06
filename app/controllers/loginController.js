// app/controllers/login.controller.js
app.controller("LoginController", function ($location, authService) {
  var vm = this;

  vm.email = "";
  vm.password = "";
  vm.error = "";
  vm.loading = false;

  vm.login = function () {
    vm.error = "";

    if (!vm.email || !vm.password) {
      vm.error = "Please enter email and password.";
      return;
    }

    vm.loading = true;

    authService
      .login(vm.email, vm.password)
      .then(function (res) {
        // Optional: read profile (username) from public.users
        // (this row is created on SIGNUP via trigger)
        return authService.getProfile(res.user.id).catch(function () {
          // if profile not found, continue anyway
          return null;
        });
      })
      .then(function (profile) {
        // you can store profile in localStorage if you want
        if (profile) localStorage.setItem("pharmly_profile", JSON.stringify(profile));

        // go to dashboard
        $location.path("/app/dashboard");
      })
      .catch(function (err) {
        vm.error = err.message || "Login failed.";
      })
      .finally(function () {
        vm.loading = false;
      });
  };
});