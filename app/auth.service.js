app.service("authService", function ($q) {
  const SUPABASE_URL = "https://vvvlzxywfltgrnzimdru.supabase.co";
  const SUPABASE_KEY = "sb_publishable_5iONbaBdSVH8Lv7Tn98Xvw_iniQ52Wa";

  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  this.login = function (email, password) {
    return $q(function (resolve, reject) {
      sb.auth
        .signInWithPassword({ email: email, password: password })
        .then(({ data, error }) => {
          if (error) return reject(error);
          resolve(data); 
        });
    });
  };

  this.getSession = function () {
    return $q(function (resolve, reject) {
      sb.auth.getSession().then(({ data, error }) => {
        if (error) return reject(error);
        resolve(data.session);
      });
    });
  };

  this.getProfile = function (userId) {
    return $q(function (resolve, reject) {
      sb.from("users")
        .select("user_id, username, role")
        .eq("user_id", userId)
        .single()
        .then(({ data, error }) => {
          if (error) return reject(error);
          resolve(data);
        });
    });
  };

  this.logout = function () {
    return $q(function (resolve, reject) {
      sb.auth.signOut().then(({ error }) => {
        if (error) return reject(error);
        resolve(true);
      });
    });
  };
});