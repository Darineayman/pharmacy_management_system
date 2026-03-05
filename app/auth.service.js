app.service('AuthService', function () {
    // Later: replace with real Supabase session check
    this.isAuthenticated = async function () {
        // TODO: return !!supabase.auth.getSession()
        return false;
    };

    this.logout = async function () {
        // TODO: supabase.auth.signOut()
        return;
    };
});