const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://rzsvcojsjjncfjsegayy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6c3Zjb2pzampuY2Zqc2VnYXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNjAxOTUsImV4cCI6MjA3NjgzNjE5NX0.U37DNs7JQFc0V7NIRSQLim8y8GXa_kksn6gd9f221dk';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
