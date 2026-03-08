app.directive("appTopbar", function (authService) {
  return {
    restrict: "E",
    scope: { title: "<" }, // better than "=" here
    template: `
      <header class="topbar">
        <h1 class="page-title">{{ title }}</h1>
        <div class="topbar-user" ng-if="userName">Logged in as: {{ userName }}</div>
      </header>
    `,
    controller: function ($scope) {
      function setUserName(profile) {
        $scope.userName = (profile && profile.username) || "";
      }

      function readStoredProfile() {
        var raw = localStorage.getItem("pharmly_profile");
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch (e) {
          return null;
        }
      }

      setUserName(readStoredProfile());

      authService
        .getSession()
        .then(function (session) {
          if (!session || !session.user || !session.user.id) return null;
          return authService.getProfile(session.user.id);
        })
        .then(function (profile) {
          if (!profile) return;
          localStorage.setItem("pharmly_profile", JSON.stringify(profile));
          setUserName(profile);
        })
        .catch(function () {
          // ignore profile fetch errors in topbar
        });
    },
  };
});