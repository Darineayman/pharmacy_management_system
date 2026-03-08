app.directive("appTopbar", function (authService) {
  return {
    restrict: "E",
    scope: { title: "<" },
template: `
<header class="topbar">
  <h1 class="page-title">{{ title }}</h1>

  <div class="topbar-profile" ng-if="userName">
      <div class="topbar-profile-avatar">
        {{ userName.charAt(0).toUpperCase() }}
      </div>

      <div class="topbar-profile-name">
        {{ userName }}
      </div>
  </div>
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
        .catch(function () {});
    },
  };
});
