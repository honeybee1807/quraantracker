// config.js — use var (not const) so script.js can coexist without SyntaxError
var SUPABASE_URL = 'https://urvddwtcdycqurrczrnl.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydmRkd3RjZHljcXVycmN6cm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxOTAsImV4cCI6MjA5MjYzNDE5MH0.Ho0deahuUXtyKlw3DtfTJFVXDKUSW72p4SShEJW7u1Q';
var APP_DOMAIN   = 'https://myquraantracker.netlify.app';

window.SUPABASE_CONFIG = {
  url:       SUPABASE_URL,
  key:       SUPABASE_KEY,
  appDomain: APP_DOMAIN
};

console.log('✅ Supabase config loaded successfully');