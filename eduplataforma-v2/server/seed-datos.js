const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://slmbeartbgkihoznylly.supabase.co';
const SUPABASE_SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbWJlYXJ0YmdraWhvem55bGx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA2ODU0NCwiZXhwIjoyMDk0NjQ0NTQ0fQ.HWsuRGB7aMuMNZYnrbYXCvQRinSLzKU34eHkLyTfPp4';

const db = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ═══════════ UTILIDADES ═══════════
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
function daysFromNow(n) { return new Date(Date.now() + n * 86400000).toISOString(); }
function nota() { return (rand(30, 70) / 10).toFixed(1); } // 3.0 - 7.0

// ═══════════ MATERIALES REALISTAS ═══════════
const MATERIALES_POR_CURSO = {
  'Matemáticas': [
    { titulo: 'Guía: Ecuaciones de primer grado', desc: 'Resolver ecuaciones lineales con una incógnita. Incluye 15 ejercicios con solución.', tipo: 'guia', xp: 20 },
    { titulo: 'Guía: Geometría - Áreas y perímetros', desc: 'Fórmulas y problemas aplicados de figuras planas.', tipo: 'guia', xp: 20 },
    { titulo: 'Tarea 1: Operaciones con fracciones', desc: 'Resuelve las 10 operaciones combinadas de fracciones. Mostrar procedimiento.', tipo: 'tarea', xp: 50, plazo: 3 },
    { titulo: 'Tarea 2: Proporcionalidad directa e inversa', desc: 'Plantea y resuelve los 8 problemas de proporcionalidad.', tipo: 'tarea', xp: 50, plazo: 7 },
    { titulo: 'Tarea 3: Teorema de Pitágoras', desc: 'Aplica el teorema en los 6 triángulos propuestos y calcula longitudes.', tipo: 'tarea', xp: 60, plazo: 14 },
    { titulo: 'Evaluación Unidad 1: Álgebra básica', desc: 'Prueba sumativa. 20 preguntas, 60 min. Sin calculadora.', tipo: 'evaluacion', xp: 100, plazo: -5 },
    { titulo: 'Recurso: Formulario de geometría', desc: 'PDF descargable con todas las fórmulas del semestre.', tipo: 'recurso', xp: 5 },
    { titulo: 'Recurso: Video - Factorización paso a paso', desc: 'Tutorial de 15 min sobre factorización de polinomios.', tipo: 'recurso', xp: 5 },
  ],
  'Lenguaje': [
    { titulo: 'Guía: Comprensión lectora - textos narrativos', desc: 'Estrategias para identificar estructura, personajes y conflicto.', tipo: 'guia', xp: 20 },
    { titulo: 'Guía: Tipos de textos no literarios', desc: 'Reconoce noticias, columnas de opinión, reseñas y crónicas.', tipo: 'guia', xp: 20 },
    { titulo: 'Tarea 1: Análisis de cuento "El almohadón de plumas"', desc: 'Responde las 5 preguntas de comprensión y redacta un ensayo breve (200 palabras).', tipo: 'tarea', xp: 50, plazo: 5 },
    { titulo: 'Tarea 2: Redacción de columna de opinión', desc: 'Escribe una columna sobre un tema social actual. Mínimo 300 palabras.', tipo: 'tarea', xp: 60, plazo: 10 },
    { titulo: 'Tarea 3: Vocabulario contextual', desc: 'Define 20 palabras según su uso en los textos trabajados en clase.', tipo: 'tarea', xp: 40, plazo: 15 },
    { titulo: 'Evaluación: Comprensión lectora mixta', desc: 'Prueba con 3 textos y 25 preguntas. 80 min.', tipo: 'evaluacion', xp: 100, plazo: -3 },
    { titulo: 'Recurso: Libro digital "Cuentos de la selva"', desc: 'PDF completo de Horacio Quiroga para lectura complementaria.', tipo: 'recurso', xp: 5 },
  ],
  'Ciencias': [
    { titulo: 'Guía: Célula animal vs vegetal', desc: 'Comparación de orgánulos, funciones y diagramas rotulados.', tipo: 'guia', xp: 25 },
    { titulo: 'Guía: Leyes de Newton', desc: 'Explica las 3 leyes con ejemplos cotidianos y ejercicios.', tipo: 'guia', xp: 25 },
    { titulo: 'Tarea 1: Informe de laboratorio - Microscopía', desc: 'Dibuja y describe las 5 muestras observadas al microscopio.', tipo: 'tarea', xp: 60, plazo: 4 },
    { titulo: 'Tarea 2: Ecosistemas chilenos', desc: 'Investiga un ecosistema de Chile y presenta cadena trófica completa.', tipo: 'tarea', xp: 50, plazo: 12 },
    { titulo: 'Tarea 3: Ejercicios de cinemática', desc: 'Resuelve 8 problemas de MRU y MRUA con gráficos.', tipo: 'tarea', xp: 55, plazo: 18 },
    { titulo: 'Evaluación: Biología celular', desc: 'Prueba de 30 preguntas sobre célula y tejidos. 45 min.', tipo: 'evaluacion', xp: 100, plazo: -7 },
    { titulo: 'Recurso: Simulador de fuerzas PhET', desc: 'Link al simulador interactivo de la Universidad de Colorado.', tipo: 'recurso', xp: 5 },
  ],
  'Historia': [
    { titulo: 'Guía: Chile en el siglo XIX - Independencia', desc: 'Proceso independentista, Patria Vieja, Reconquista y Patria Nueva.', tipo: 'guia', xp: 20 },
    { titulo: 'Guía: Revolución Industrial y sus efectos', desc: 'Causas, consecuencias sociales y cambios tecnológicos.', tipo: 'guia', xp: 20 },
    { titulo: 'Tarea 1: Línea de tiempo 1810-1830', desc: 'Construye una línea de tiempo con 15 hitos mínimo. Puede ser digital.', tipo: 'tarea', xp: 50, plazo: 6 },
    { titulo: 'Tarea 2: Ensayo - Causas de la Guerra del Pacífico', desc: 'Redacta un ensayo argumentativo de 400 palabras con 3 fuentes.', tipo: 'tarea', xp: 70, plazo: 13 },
    { titulo: 'Evaluación: Chile republicano', desc: 'Prueba con documentos históricos y preguntas de desarrollo. 60 min.', tipo: 'evaluacion', xp: 100, plazo: -2 },
    { titulo: 'Recurso: Documental "Algo habrán hecho"', desc: 'Video sobre historia de Chile, cap. 1-3. Para revisión complementaria.', tipo: 'recurso', xp: 5 },
  ]
};

// ═══════════ COMENTARIOS REALISTAS DE DOCENTE ═══════════
const COMENTARIOS_BUENOS = [
  'Excelente trabajo, se nota dedicación. Sigue así 👏',
  'Muy bien argumentado, buena estructura y redacción.',
  'Buen manejo de conceptos. Revisaste fuentes adicionales, eso se valora.',
  'Trabajo completo y bien presentado. Felicitaciones.',
  'Se evidencia comprensión profunda del tema. ¡Destacado!',
];
const COMENTARIOS_REGULARES = [
  'Cumples con lo solicitado pero falta profundizar más en el análisis.',
  'Algunos errores de cálculo. Revisa el procedimiento del ejercicio 3.',
  'La idea central está, pero la argumentación necesita más desarrollo.',
  'Entrega correcta. Podrías mejorar la presentación y ortografía.',
  'Respuestas incompletas en los ítems 4 y 7. Revisar.',
];
const COMENTARIOS_MALOS = [
  'Entrega incompleta. Solo respondiste 3 de 10 preguntas.',
  'Muchos errores conceptuales. Te sugiero repasar la guía antes de la evaluación.',
  'Se nota que fue hecho a último momento. Dedícale más tiempo.',
  'Copiaste contenido de internet sin citar fuentes. Cuidado con el plagio.',
];

// ═══════════ FEEDBACK REALISTA ═══════════
const FEEDBACK_COMMENTS = [
  { rating: 5, cats: ['Contenido', 'Diseño'], com: 'Me encanta la plataforma, es muy fácil de usar y los materiales se descargan rápido.' },
  { rating: 4, cats: ['Navegación'], com: 'Todo bien, pero a veces tarda en cargar las tareas cuando no hay internet.' },
  { rating: 5, cats: ['Materiales', 'Contenido'], com: 'Los recursos descargables son geniales, puedo estudiar en el bus sin wifi.' },
  { rating: 3, cats: ['Velocidad'], com: 'A veces se pone lento cuando muchos compañeros están conectados a la vez.' },
  { rating: 4, cats: ['Diseño', 'Navegación'], com: 'El diseño es bonito. Me gustaría que el modo oscuro fuera más oscuro.' },
  { rating: 5, cats: ['Contenido'], com: 'Las guías son super claras, mejor que el libro del colegio.' },
  { rating: 2, cats: ['Velocidad', 'Navegación'], com: 'No puedo subir archivos grandes, se queda cargando eternamente.' },
  { rating: 4, cats: ['Materiales'], com: 'Muy útil para repasar antes de las pruebas. Ojalá hubiera más evaluaciones de práctica.' },
  { rating: 5, cats: ['Diseño', 'Contenido'], com: 'La mejor plataforma que hemos usado en el colegio. 10/10' },
  { rating: 3, cats: ['Navegación'], com: 'Me costó encontrar dónde entregar la tarea la primera vez, después ya caché.' },
  { rating: 4, cats: ['Contenido', 'Materiales'], com: 'Los videos explicativos ayudan mucho. ¿Podrían agregar más de matemáticas?' },
  { rating: 5, cats: ['Diseño'], com: 'Se ve profesional, me gusta mucho la interfaz. Los emojis le dan onda.' },
];

async function rellenarDatos() {
  console.log('🚀 Iniciando relleno de datos ficticios realistas...\n');

  // ═══ 1. Obtener datos existentes ═══
  const { data: cursos } = await db.from('cursos').select('*');
  const { data: alumnos } = await db.from('perfiles').select('*').eq('rol', 'alumno');
  const { data: docentes } = await db.from('perfiles').select('*').eq('rol', 'docente');
  const { data: logros } = await db.from('logros').select('*');
  const { data: premios } = await db.from('premios').select('*');

  if (!cursos?.length || !alumnos?.length || !docentes?.length) {
    console.error('❌ No hay cursos, alumnos o docentes. Ejecuta seed-lista.js primero.');
    return;
  }

  console.log(`📊 Base: ${cursos.length} cursos, ${alumnos.length} alumnos, ${docentes.length} docentes\n`);
  const docentePrincipal = docentes.find(d => d.nombre.includes('García')) || docentes[0];

  // ═══ 2. Borrar materiales y entregas anteriores para evitar duplicados ═══
  console.log('🧹 Limpiando datos anteriores...');
  await db.from('feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await db.from('canjes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await db.from('logros_alumno').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await db.from('entregas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await db.from('materiales').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // ═══ 3. Insertar materiales realistas ═══
  console.log('\n📚 Insertando materiales por curso...');
  const materialesInsertados = [];

  for (const curso of cursos) {
    const mats = MATERIALES_POR_CURSO[curso.nombre];
    if (!mats) continue;

    for (const mat of mats) {
      const fechaCreacion = daysAgo(rand(15, 45));
      const fechaEntrega = mat.plazo
        ? (mat.plazo < 0 ? daysAgo(Math.abs(mat.plazo)) : daysFromNow(mat.plazo))
        : null;

      const { data, error } = await db.from('materiales').insert({
        curso_id: curso.id,
        docente_id: docentePrincipal.id,
        titulo: mat.titulo,
        descripcion: mat.desc,
        tipo: mat.tipo,
        publicado: true,
        disponible_offline: true,
        xp_premio: mat.xp,
        fecha_entrega: fechaEntrega,
        creado_en: fechaCreacion
      }).select();

      if (data?.[0]) {
        materialesInsertados.push({ ...data[0], cursoNombre: curso.nombre });
      }
      if (error) console.error(`  ⚠️ Error: ${mat.titulo}`, error.message);
    }
    console.log(`  ✅ ${curso.icono} ${curso.nombre}: ${mats.length} materiales`);
  }

  // ═══ 4. Generar entregas de alumnos ═══
  console.log('\n📝 Generando entregas de alumnos...');
  const tareas = materialesInsertados.filter(m => m.tipo === 'tarea' || m.tipo === 'evaluacion');
  let entregasCount = 0;

  for (const alumno of alumnos) {
    // Cada alumno entrega entre 60% y 95% de las tareas
    const tasksToComplete = tareas.filter(() => Math.random() < (rand(60, 95) / 100));

    for (const tarea of tasksToComplete) {
      const calificacionNum = parseFloat(nota());
      const esTardio = Math.random() < 0.12; // 12% de probabilidad de atraso
      const esRevisado = Math.random() < 0.75; // 75% ya revisadas
      let comentario = null;

      if (esRevisado) {
        if (calificacionNum >= 5.5) comentario = pick(COMENTARIOS_BUENOS);
        else if (calificacionNum >= 4.0) comentario = pick(COMENTARIOS_REGULARES);
        else comentario = pick(COMENTARIOS_MALOS);
      }

      const estado = esTardio ? 'tardio' : esRevisado ? 'revisado' : 'entregado';
      const diasAtras = rand(1, 30);

      await db.from('entregas').insert({
        material_id: tarea.id,
        alumno_id: alumno.id,
        contenido: generarRespuesta(tarea),
        calificacion: esRevisado ? calificacionNum : null,
        comentario,
        estado,
        sincronizado: true,
        entregado_en: daysAgo(diasAtras),
        revisado_en: esRevisado ? daysAgo(diasAtras - rand(1, 3)) : null
      });
      entregasCount++;
    }
  }
  console.log(`  ✅ ${entregasCount} entregas generadas`);

  // ═══ 5. Actualizar progreso e XP de alumnos ═══
  console.log('\n🎮 Actualizando XP, monedas y progreso...');
  for (const alumno of alumnos) {
    const xp = rand(50, 800);
    const monedas = rand(5, 120);
    const nivel = xp < 100 ? 1 : xp < 250 ? 2 : xp < 500 ? 3 : xp < 800 ? 4 : 5;

    await db.from('perfiles').update({
      xp, monedas, nivel,
      actualizado: daysAgo(rand(0, 3))
    }).eq('id', alumno.id);

    // Actualizar progreso en inscripciones
    const { data: inscs } = await db.from('inscripciones').select('id').eq('alumno_id', alumno.id);
    for (const insc of (inscs || [])) {
      await db.from('inscripciones').update({
        progreso: rand(10, 95)
      }).eq('id', insc.id);
    }
  }
  console.log(`  ✅ ${alumnos.length} alumnos actualizados`);

  // ═══ 6. Desbloquear logros para algunos alumnos ═══
  console.log('\n🏆 Desbloqueando logros...');
  let logrosCount = 0;
  if (logros?.length) {
    for (const alumno of alumnos) {
      // Cada alumno desbloquea entre 1 y 4 logros al azar
      const numLogros = rand(1, Math.min(4, logros.length));
      const shuffled = [...logros].sort(() => Math.random() - 0.5).slice(0, numLogros);

      for (const logro of shuffled) {
        const { error } = await db.from('logros_alumno').insert({
          alumno_id: alumno.id,
          logro_id: logro.id,
          desbloqueado: daysAgo(rand(1, 30))
        });
        if (!error) logrosCount++;
      }
    }
  }
  console.log(`  ✅ ${logrosCount} logros desbloqueados`);

  // ═══ 7. Generar canjes de premios ═══
  console.log('\n🛍️ Generando canjes de premios...');
  let canjesCount = 0;
  if (premios?.length) {
    // ~40% de alumnos han canjeado algo
    const canjeadores = alumnos.filter(() => Math.random() < 0.4);
    for (const alumno of canjeadores) {
      const premio = pick(premios);
      const estados = ['pendiente', 'aprobado', 'aprobado', 'aprobado']; // 75% aprobados
      const { error } = await db.from('canjes').insert({
        alumno_id: alumno.id,
        premio_id: premio.id,
        monedas_gastadas: premio.precio_monedas,
        estado: pick(estados),
        canjeado_en: daysAgo(rand(1, 20))
      });
      if (!error) canjesCount++;
    }
  }
  console.log(`  ✅ ${canjesCount} canjes realizados`);

  // ═══ 8. Generar feedback ═══
  console.log('\n💬 Generando feedback de alumnos...');
  let feedbackCount = 0;
  // ~50% de alumnos dejan feedback
  const feedbackers = alumnos.filter(() => Math.random() < 0.5);
  for (const alumno of feedbackers) {
    const fb = pick(FEEDBACK_COMMENTS);
    const { error } = await db.from('feedback').insert({
      autor_id: alumno.id,
      rating: fb.rating,
      categorias: fb.cats,
      comentario: fb.com,
      resuelto: Math.random() < 0.3,
      creado_en: daysAgo(rand(1, 25))
    });
    if (!error) feedbackCount++;
  }
  console.log(`  ✅ ${feedbackCount} feedbacks creados`);

  // ═══ RESUMEN FINAL ═══
  console.log('\n═══════════════════════════════════');
  console.log('🏁 RELLENO COMPLETADO');
  console.log(`   📚 Materiales: ${materialesInsertados.length}`);
  console.log(`   📝 Entregas: ${entregasCount}`);
  console.log(`   🏆 Logros: ${logrosCount}`);
  console.log(`   🛍️ Canjes: ${canjesCount}`);
  console.log(`   💬 Feedbacks: ${feedbackCount}`);
  console.log('═══════════════════════════════════');
}

function generarRespuesta(tarea) {
  const respuestas = {
    'tarea': [
      'Ejercicio 1: x = 5\nEjercicio 2: x = -3\nEjercicio 3: x = 7/2\nProcedimiento adjunto en las hojas.',
      'Respuesta desarrollada según las instrucciones de la guía. Se adjunta documento con el procedimiento completo.',
      'Completé todos los ejercicios. En el punto 4 tuve dudas pero lo resolví con la fórmula de la guía.',
      'Adjunto mi trabajo. Revisé dos veces los cálculos. En el punto 6 usé un método alternativo.',
      'Trabajo terminado. Incluí los gráficos solicitados y las conclusiones al final del documento.',
    ],
    'evaluacion': [
      'Respuestas de la evaluación completadas dentro del tiempo.',
      'Prueba realizada. Algunas preguntas me costaron pero intenté responder todo.',
      'Evaluación enviada. Me faltó tiempo para revisar las últimas 3 preguntas.',
    ]
  };
  return pick(respuestas[tarea.tipo] || respuestas['tarea']);
}

rellenarDatos();
