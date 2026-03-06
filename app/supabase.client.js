(function () {
    angular.module('pharmly')
        .constant('SUPABASE_CONFIG', {
            url: 'https://vvvlzxywfltgrnzimdru.supabase.co',
            anonKey: 'sb_publishable_5iONbaBdSVH8Lv7Tn98Xvw_iniQ52Wa'
        })
        .factory('SupabaseClient', function (SUPABASE_CONFIG) {
            return window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
        });
})();