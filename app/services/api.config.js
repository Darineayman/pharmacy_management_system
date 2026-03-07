app.factory("apiConfig", function () {
  const SUPABASE_URL = "https://vvvlzxywfltgrnzimdru.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dmx6eHl3Zmx0Z3JuemltZHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzM0ODYsImV4cCI6MjA4ODIwOTQ4Nn0.5owikAmclMlN_oRn7T-bFGlH_yOCgPGd066dAvm1VUY";

  return {
    baseUrl: SUPABASE_URL + "/rest/v1",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }
  };
});