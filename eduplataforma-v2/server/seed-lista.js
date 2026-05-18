const { createClient } = require('@supabase/supabase-js');

// 1. Configuración de tus credenciales automatizadas
const SUPABASE_URL = 'https://slmbeartbgkihoznylly.supabase.co';
// RECUERDA: Aquí debes usar la Service Role Key (Secret Key) que empieza con sb_secret_...
const SUPABASE_SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbWJlYXJ0YmdraWhvem55bGx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2ODU0NCwiZXhwIjoyMDk0NjQ0NTQ0fQ.HWsuRGB7aMuMNZYnrbYXCvQRinSLzKU34eHkLyTfPp4';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PASSWORD_POR_DEFECTO = '1234';

// 2. Lista completa procesada y formateada
const usuariosEscuela = [
  { nombre: 'Sebastián Ignacio Acuña Valderrama', email: 'sebastian.acuna@escuela.cl', rol: 'alumno' },
  { nombre: 'Ashley Aracely Adaros Guzmán', email: 'ashley.adaros@escuela.cl', rol: 'alumno' },
  { nombre: 'Caleb José Aguilar Chávez', email: 'caleb.aguilar@escuela.cl', rol: 'alumno' },
  { nombre: 'Benjamín Ricardo Araya Flores', email: 'benjamin.araya@escuela.cl', rol: 'alumno' },
  { nombre: 'Yordan Alex Basáez Barrera', email: 'yordan.basaez@escuela.cl', rol: 'alumno' },
  { nombre: 'Dairk Xarel Camblor Durán', email: 'dairk.camblor@escuela.cl', rol: 'alumno' },
  { nombre: 'Mauricio Ignacio Caro Cáceres', email: 'mauricio.caro@escuela.cl', rol: 'alumno' },
  { nombre: 'Juan David Camilo Churata Mamani', email: 'juan.churata@escuela.cl', rol: 'alumno' },
  { nombre: 'Issel Mariel Cruz Paredes', email: 'issel.cruz@escuela.cl', rol: 'alumno' },
  { nombre: 'Leandro Farid Flores Gallardo', email: 'leandro.flores@escuela.cl', rol: 'alumno' },
  { nombre: 'Axel Alfonso Flores Pizarro', email: 'axel.flores@escuela.cl', rol: 'alumno' },
  { nombre: 'Jorell Antonio Inostroza Arias', email: 'jorell.inostroza@escuela.cl', rol: 'alumno' },
  { nombre: 'Sebastian Sebastian Lagos Maureira', email: 'sebastian.lagos@escuela.cl', rol: 'alumno' },
  { nombre: 'Yerko David Miranda Torres', email: 'yerko.miranda@escuela.cl', rol: 'docente' },
  { nombre: 'Patricio Alexander Muñoz Aracena', email: 'patricio.munoz@escuela.cl', rol: 'alumno' },
  { nombre: 'Brayan Alberto Onofre Calle', email: 'brayan.onofre@escuela.cl', rol: 'alumno' },
  { nombre: 'Miguel Antonio Ortiz Silva', email: 'miguel.ortiz@escuela.cl', rol: 'alumno' },
  { nombre: 'Brandon Alberto Osco Silvestre', email: 'brandon.osco@escuela.cl', rol: 'alumno' },
  { nombre: 'Nicolás Benjamín Ponce Hernández', email: 'nicolas.ponce@escuela.cl', rol: 'alumno' },
  { nombre: 'Tamara Alexandra Quispe Muñoz', email: 'tamara.quispe@escuela.cl', rol: 'alumno' },
  { nombre: 'Camilo Alejandro Soto Fierro', email: 'camilo.soto@escuela.cl', rol: 'alumno' },
  { nombre: 'Claudio Benjamín Trigo Zapata', email: 'claudio.trigo@escuela.cl', rol: 'alumno' },
  { nombre: 'Diego Ignacio Troncoso Uribe', email: 'diego.troncoso@escuela.cl', rol: 'alumno' },
  { nombre: 'Leonardo Alberto Enrique Vargas Arqueros', email: 'leonardo.vargas@escuela.cl', rol: 'alumno' },
  { nombre: 'Roberto Ignacio Vargas Vargas', email: 'roberto.vargas@escuela.cl', rol: 'alumno' },
  { nombre: 'Felipe Sebastián Andrés Vásquez Cruz', email: 'felipe.vasquez@escuela.cl', rol: 'alumno' }
];

async function ejecutarCargaMasiva() {
  console.log(`🚀 Iniciando importación de ${usuariosEscuela.length} usuarios a la plataforma...`);
  console.log('');

  let exitosos = 0;
  let errores = 0;

  for (const usuario of usuariosEscuela) {
    try {
      // Step 1: Registrar credenciales de acceso en la sección Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: usuario.email,
        password: PASSWORD_POR_DEFECTO,
        email_confirm: true,
        user_metadata: { nombre_completo: usuario.nombre }
      });

      if (authError) {
        console.error(`❌ Error auth [${usuario.email}]:`, authError.message);
        errores++;
        continue;
      }

      const uidGenerado = authData.user.id;
      console.log(`✅ Auth: ${usuario.email} → ${uidGenerado}`);

      // Step 2: Vincular el UID en la tabla relacional 'perfiles'
      const { error: perfilError } = await supabaseAdmin
        .from('perfiles')
        .insert({
          id: uidGenerado,
          nombre: usuario.nombre,
          rol: usuario.rol,
          xp: 0,
          monedas: 0,
          nivel: 1
        });

      if (perfilError) {
        console.error(`⚠️ Error perfil [${usuario.nombre}]:`, perfilError.message);
        errores++;
      } else {
        console.log(`🎉 Perfil: ${usuario.nombre} → [${usuario.rol}]`);
        exitosos++;

        // Step 3: Si es alumno, inscribir en todos los cursos
        if (usuario.rol === 'alumno') {
          const { data: cursos } = await supabaseAdmin.from('cursos').select('id');
          if (cursos && cursos.length > 0) {
            const inscripciones = cursos.map(c => ({
              alumno_id: uidGenerado,
              curso_id: c.id,
              progreso: Math.floor(Math.random() * 30) // Progreso aleatorio 0-30%
            }));
            const { error: inscError } = await supabaseAdmin
              .from('inscripciones')
              .insert(inscripciones);
            if (inscError) {
              console.error(`⚠️ Error inscripciones [${usuario.nombre}]:`, inscError.message);
            } else {
              console.log(`📚 Inscrito en ${cursos.length} cursos`);
            }
          }
        }
      }

      console.log('');
    } catch (unexpectedError) {
      console.error(`💥 Excepción [${usuario.email}]:`, unexpectedError);
      errores++;
    }
  }

  console.log('═══════════════════════════════════');
  console.log(`🏁 Migración finalizada`);
  console.log(`   ✅ Exitosos: ${exitosos}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📊 Total: ${usuariosEscuela.length}`);
}

ejecutarCargaMasiva();
