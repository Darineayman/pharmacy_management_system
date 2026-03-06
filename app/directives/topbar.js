app.directive("appTopbar", function () {
  return {
    restrict: "E",
    scope: { title: "<" }, // better than "=" here
    template: `
      <header class="topbar">
        <h1 class="page-title">{{ title }}</h1>
      </header>
    `,
  };
});