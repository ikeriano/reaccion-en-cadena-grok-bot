// Contenido ORIGINAL de las pruebas de «Reacción en cadena» (juego de fans de Iker).
// Todas las cadenas se comprueban al arrancar (comprobarDatos) y con tools/test_datos.mjs.

// 1 · PALABRAS ENCADENADAS: 6 palabras de un tema; la última letra de cada una es la primera de la siguiente.
export const ENCADENADAS = [
  { tema: 'Animales', p: [['PERRO', 'El mejor amigo del hombre'], ['OSO', 'Hiberna en invierno y le encanta la miel'], ['OVEJA', 'Nos da la lana'], ['ARDILLA', 'Roedor de cola peluda que guarda bellotas'], ['ANTÍLOPE', 'Rumiante africano muy veloz con cuernos'], ['ELEFANTE', 'El animal terrestre más grande, con trompa']] },
  { tema: 'Comida', p: [['MELÓN', 'Fruta grande de verano, de piel verde o amarilla'], ['NATA', 'Crema que se monta para los postres'], ['ACEITUNA', 'Fruto del olivo'], ['ARROZ', 'Ingrediente principal de la paella'], ['ZANAHORIA', 'Hortaliza naranja que comen los conejos'], ['ATÚN', 'Pescado azul que se vende mucho en lata']] },
  { tema: 'Países', p: [['PERÚ', 'País de Machu Picchu'], ['URUGUAY', 'País cuya capital es Montevideo'], ['YEMEN', 'País del sur de la península arábiga'], ['NORUEGA', 'País nórdico famoso por sus fiordos'], ['ARGENTINA', 'País del tango y de Buenos Aires'], ['ALEMANIA', 'País cuya capital es Berlín']] },
  { tema: 'El cuerpo humano', p: [['BRAZO', 'Va del hombro al codo… y hasta la mano'], ['OREJA', 'Parte externa del oído'], ['ANTEBRAZO', 'Parte del brazo entre el codo y la muñeca'], ['OJO', 'Órgano de la vista'], ['OMBLIGO', 'Cicatriz en el centro de la barriga'], ['OÍDO', 'Sentido con el que escuchamos']] },
  { tema: 'En casa', p: [['MESA', 'Mueble donde comemos'], ['ALFOMBRA', 'Se pone en el suelo para pisar blandito'], ['ARMARIO', 'Mueble donde se guarda la ropa'], ['OLLA', 'Recipiente para guisar'], ['ALMOHADA', 'Donde apoyamos la cabeza para dormir'], ['ASPIRADORA', 'Aparato que limpia el polvo del suelo']] },
  { tema: 'Profesiones', p: [['PANADERO', 'Hace el pan cada mañana'], ['OCULISTA', 'Médico de los ojos'], ['ALBAÑIL', 'Levanta paredes con ladrillos'], ['LOCUTOR', 'Habla por la radio'], ['RELOJERO', 'Arregla relojes'], ['ODONTÓLOGO', 'Otra forma de llamar al dentista']] },
];

// 2 · LA MINICADENA: una línea de 7 palabras de una canción; se dan 2 seguidas y se adivinan las otras 5.
export const CANCIONES = [
  { t: 'Me gustas tú', a: 'Manu Chao', l: 'ME GUSTA LA MOTO ME GUSTAS TÚ', dar: 2, alias: ['me gustas tu'] },
  { t: 'Bailando', a: 'Enrique Iglesias', l: 'YO TE MIRO Y SE ME CORTA', dar: 1 },
  { t: 'Color esperanza', a: 'Diego Torres', l: 'SABER QUE SE PUEDE QUERER QUE SE', dar: 0 },
  { t: 'Vivir mi vida', a: 'Marc Anthony', l: 'VOY A REÍR VOY A BAILAR VIVIR', dar: 2 },
  { t: 'Mediterráneo', a: 'Joan Manuel Serrat', l: 'QUIZÁ PORQUE MI NIÑEZ SIGUE JUGANDO EN', dar: 3 },
  { t: 'Libre', a: 'Nino Bravo', l: 'LIBRE COMO EL SOL CUANDO AMANECE YO', dar: 1 },
  { t: 'Corazón partío', a: 'Alejandro Sanz', l: 'QUIÉN ME VA A ENTREGAR SUS EMOCIONES', dar: 3, alias: ['corazon partido'] },
  { t: 'Eres tú', a: 'Mocedades', l: 'COMO UNA PROMESA ERES TÚ ERES TÚ', dar: 1 },
  { t: 'Gracias a la vida', a: 'Violeta Parra', l: 'GRACIAS A LA VIDA QUE ME HA', dar: 4 },
  { t: 'Macarena', a: 'Los del Río', l: 'DALE A TU CUERPO ALEGRÍA MACARENA QUE', dar: 2 },
  { t: 'Despacito', a: 'Luis Fonsi', l: 'SABES QUE YA LLEVO UN RATO MIRÁNDOTE', dar: 4 },
  { t: 'Un beso y una flor', a: 'Nino Bravo', l: 'UN BESO Y UNA FLOR UN TE', dar: 3 },
];

// 3 y 5 · CADENAS DE 7: cada palabra se relaciona con la anterior y con la siguiente.
export const CADENAS7 = [
  ['LUNA', 'MIEL', 'ABEJA', 'REINA', 'MADRE', 'TIERRA', 'FIRME'],
  ['AGUA', 'FRÍA', 'SANGRE', 'AZUL', 'CIELO', 'ABIERTO', 'MAR'],
  ['PAN', 'DURO', 'GOLPE', 'SUERTE', 'BUENA', 'VIDA', 'ETERNA'],
  ['TOMAR', 'SOL', 'GAFAS', 'PASTA', 'DIENTES', 'LECHE', 'CONDENSADA'],
  ['CAMPO', 'FÚTBOL', 'SALA', 'ESTAR', 'BIEN', 'HECHO', 'CONSUMADO'],
  ['TARJETA', 'ROJA', 'CRUZ', 'CARA', 'DURA', 'PIEDRA', 'PÓMEZ'],
  ['CABEZA', 'TURCO', 'BAÑO', 'MARÍA', 'SANTA', 'SEMANA', 'LABORAL'],
  ['MESA', 'REDONDA', 'CUENTA', 'CORRIENTE', 'ELÉCTRICA', 'GUITARRA', 'ESPAÑOLA'],
  ['PALOMITAS', 'MAÍZ', 'PAN', 'RALLADO', 'QUESO', 'CABRA', 'MONTÉS'],
  ['VIDA', 'SOCIAL', 'RED', 'PESCA', 'CAÑA', 'AZÚCAR', 'MORENO'],
  ['LLAVE', 'MAESTRA', 'OBRA', 'ARTE', 'MARCIAL', 'LEY', 'SECA'],
  ['MEDIA', 'NARANJA', 'ZUMO', 'LIMÓN', 'VERDE', 'SEMÁFORO', 'ROJO'],
  ['DÍA', 'LIBRE', 'ESTILO', 'VIDA', 'SALVAJE', 'OESTE', 'PELÍCULA'],
  ['BARCO', 'VELA', 'CUMPLEAÑOS', 'TARTA', 'QUESO', 'RATÓN', 'ORDENADOR'],
  ['FLOR', 'PIEL', 'GALLINA', 'HUEVO', 'FRITO', 'TOMATE', 'ENSALADA'],
  ['TIEMPO', 'MUERTO', 'MAR', 'NEGRO', 'AGUJERO', 'OZONO', 'CAPA'],
];

// 4 · EL EMBUDO: hasta 5 pistas, de la más difícil a la más fácil.
export const EMBUDO = [
  { r: 'TORRE EIFFEL', alias: ['torre eiffel', 'la torre eiffel', 'eiffel'], tipo: 'Lugar', p: ['Muchos artistas la criticaron cuando se construyó', 'Mide unos 330 metros', 'Se inauguró en 1889', 'Es de hierro', 'Está en París'] },
  { r: 'CERVANTES', alias: ['miguel de cervantes', 'cervantes'], tipo: 'Personaje', p: ['Fue soldado y estuvo cautivo en Argel', 'Murió en 1616', 'Le llamaban el Manco de Lepanto', 'Es el escritor más famoso de la lengua española', 'Escribió el Quijote'] },
  { r: 'PARAGUAS', alias: ['paraguas', 'sombrilla'], tipo: 'Objeto', p: ['Tiene varillas', 'Puede ser plegable', 'Se abre y se cierra', 'Dicen que abrirlo dentro de casa da mala suerte', 'Se usa cuando llueve'] },
  { r: 'CANARIAS', alias: ['islas canarias', 'canarias'], tipo: 'Lugar', p: ['Tiene dos provincias', 'Allí está el pico más alto de España', 'Su capitalidad se reparte entre dos ciudades', 'Son siete islas principales', 'Tenerife y Gran Canaria forman parte de ellas'] },
  { r: 'PICASSO', alias: ['pablo picasso', 'picasso'], tipo: 'Personaje', p: ['Nació en Málaga en 1881', 'Fundó el cubismo junto a Braque', 'Tuvo un periodo azul y otro rosa', 'Pintó Las señoritas de Avignon', 'Pintó el Guernica'] },
  { r: 'PAELLA', alias: ['paella', 'la paella'], tipo: 'Objeto', p: ['Lleva azafrán', 'Lo mejor es el socarrat', 'Su nombre viene del recipiente', 'Se hace con arroz', 'Es el plato típico de Valencia'] },
  { r: 'LUNA', alias: ['la luna', 'luna'], tipo: 'Lugar', p: ['Tiene mares sin agua', 'Influye en las mareas', 'Tiene fases', 'Neil Armstrong la pisó en 1969', 'Es el satélite de la Tierra'] },
  { r: 'GUITARRA', alias: ['guitarra', 'la guitarra'], tipo: 'Objeto', p: ['Tiene clavijas', 'Puede ser acústica o eléctrica', 'Paco de Lucía era un maestro con ella', 'Suele tener seis cuerdas', 'Es el instrumento típico del flamenco'] },
  { r: 'ALHAMBRA', alias: ['la alhambra', 'alhambra'], tipo: 'Lugar', p: ['Tiene el Patio de los Leones', 'La construyeron los nazaríes', 'Su nombre significa «la roja»', 'Es un palacio y una fortaleza', 'Está en Granada'] },
  { r: 'PINOCHO', alias: ['pinocho'], tipo: 'Personaje', p: ['Lo creó el italiano Collodi', 'Su padre es carpintero', 'Tiene un amigo grillo', 'Es un muñeco de madera', 'Le crece la nariz cuando miente'] },
];

// 6 · COMPLICIDAD GANADORA: tus compañeros forman la pregunta palabra a palabra.
export const COMPLICIDAD = [
  ['¿Cuál es la capital de Francia?', ['paris']], ['¿Qué animal es el rey de la selva?', ['leon']], ['¿De qué color es el cielo despejado?', ['azul']],
  ['¿Cuántas patas tiene una araña?', ['ocho', '8']], ['¿Qué fruta es amarilla y alargada?', ['platano', 'banana', 'banano']], ['¿Qué planeta llaman el planeta rojo?', ['marte']],
  ['¿Con qué cortamos el papel?', ['tijeras', 'tijera']], ['¿En qué estación caen las hojas?', ['otono']], ['¿Qué instrumento tiene teclas blancas y negras?', ['piano']],
  ['¿Qué bebida blanca nos da la vaca?', ['leche']], ['¿Cuál es la capital de Italia?', ['roma']], ['¿Qué animal dice quiquiriquí?', ['gallo']],
  ['¿Qué llevamos en la muñeca para ver la hora?', ['reloj']], ['¿Qué día va después del lunes?', ['martes']], ['¿Cuál es el océano más grande?', ['pacifico', 'oceano pacifico']],
  ['¿Con qué escribe el profesor en la pizarra?', ['tiza']], ['¿Qué número va después del nueve?', ['diez', '10']], ['¿Qué animal tiene trompa?', ['elefante']],
  ['¿De qué color es la nieve?', ['blanco', 'blanca']], ['¿Qué mes tiene veintiocho días?', ['febrero']], ['¿Qué metal precioso es amarillo?', ['oro']],
  ['¿Qué celebramos el veinticinco de diciembre?', ['navidad', 'la navidad']], ['¿Cuántos días tiene una semana?', ['siete', '7']], ['¿Qué animal nos da la lana?', ['oveja']],
  ['¿Con qué abrimos una puerta cerrada?', ['llave', 'una llave']], ['¿Cuál es el satélite de la Tierra?', ['luna', 'la luna']], ['¿En qué deporte se marcan goles con el pie?', ['futbol']],
  ['¿Qué color sale al mezclar azul y amarillo?', ['verde']], ['¿Qué insecto fabrica la miel?', ['abeja']], ['¿Cuál es la capital de Portugal?', ['lisboa']],
  ['¿Con qué parte del cuerpo olemos?', ['nariz']], ['¿Qué se pone arriba del árbol de Navidad?', ['estrella', 'una estrella']], ['¿Qué animal lento lleva su casa a cuestas?', ['caracol', 'tortuga']],
  ['¿Con qué aparato nos secamos el pelo?', ['secador']], ['¿Cuál es la estación más calurosa?', ['verano']], ['¿Qué caballero de La Mancha luchaba contra molinos?', ['quijote', 'don quijote']],
  ['¿Cuántas ruedas tiene una bicicleta?', ['dos', '2']], ['¿Qué ave nocturna ulula?', ['buho', 'lechuza']], ['¿De qué color es una fresa?', ['rojo', 'roja']],
  ['¿Qué usamos para remar?', ['remo', 'remos']],
];
export const DESEMPATE = [['¿Qué animal hace miau?', ['gato']], ['¿Cuál es el color del carbón?', ['negro']], ['¿Qué se bebe y no tiene color?', ['agua']], ['¿Qué estrella nos da luz de día?', ['sol', 'el sol']]];

// 7 · LA ÚLTIMA CADENA: 15 eslabones; los pares (2.º, 4.º…) van tapados en naranja.
export const ULTIMAS = [
  ['LUZ', 'ROJA', 'ALFOMBRA', 'MÁGICA', 'FLAUTA', 'DULCE', 'AGUA', 'OXIGENADA', 'RUBIA', 'CERVEZA', 'JARRA', 'VINO', 'TINTO', 'VERANO', 'NOCHE'],
  ['TARJETA', 'CRÉDITO', 'BANCO', 'PECES', 'COLORES', 'LÁPIZ', 'OJOS', 'GATO', 'BOTAS', 'FÚTBOL', 'SALA', 'ESPERA', 'LISTA', 'COMPRA', 'CARRO'],
  ['RELOJ', 'ARENA', 'PLAYA', 'TOALLA', 'BAÑO', 'TRAJE', 'CHAQUETA', 'PUNTO', 'FINAL', 'COPA', 'VINO', 'BLANCO', 'NIEVE', 'BOLA', 'CRISTAL'],
  ['CEPILLO', 'DIENTES', 'AJO', 'SOPA', 'LETRAS', 'CIFRAS', 'RÉCORD', 'MUNDIAL', 'GUERRA', 'FRÍA', 'SANGRE', 'AZUL', 'PRÍNCIPE', 'RANA', 'HOMBRE'],
];

// 8 · LA ÚLTIMA PALABRA: eslabón naranja con las 2 primeras letras y la última; arriba y abajo, sus pistas.
export const ULTIMA_PALABRA = [
  { arriba: 'PASTEL', abajo: 'VELAS', r: 'CUMPLEAÑOS', misterio: 'FELIZ' }, { arriba: 'TELA', abajo: 'PATAS', r: 'ARAÑA', misterio: 'TELARAÑA' },
  { arriba: 'TORERO', abajo: 'ROJO', r: 'CAPOTE', misterio: 'TOREAR' }, { arriba: 'HIELO', abajo: 'ATERRIZAJE', r: 'PISTA', misterio: 'PATINAR' },
  { arriba: 'LIBROS', abajo: 'SILENCIO', r: 'BIBLIOTECA', misterio: 'ESTANTERÍA' }, { arriba: 'CARTA', abajo: 'SELLO', r: 'SOBRE', misterio: 'CORREOS' },
  { arriba: 'LLAVE', abajo: 'TIMBRE', r: 'PUERTA', misterio: 'CERRADURA' }, { arriba: 'FUEGO', abajo: 'HACHA', r: 'LEÑA', misterio: 'CHIMENEA' },
  { arriba: 'OLAS', abajo: 'SURF', r: 'TABLA', misterio: 'MULTIPLICAR' }, { arriba: 'RELOJ', abajo: 'PUNTA', r: 'HORA', misterio: 'MINUTOS' },
  { arriba: 'NIEVE', abajo: 'ZANAHORIA', r: 'MUÑECO', misterio: 'BUFANDA' }, { arriba: 'CUENTO', abajo: 'MÁGICA', r: 'VARITA', misterio: 'HADA' },
];

// palabras falsas que dicen los rivales cuando fallan
export const SEÑUELOS = ['CASA', 'PERRO', 'COCHE', 'NUBE', 'LIBRO', 'PLATO', 'CALLE', 'PIANO', 'RUEDA', 'MANO', 'FLOR', 'PUENTE', 'FARO', 'BOTE', 'SILLA', 'CAMINO'];

const sinTilde = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** Comprueba la regla de Palabras encadenadas y la longitud de las cadenas. Devuelve la lista de errores. */
export function comprobarDatos() {
  const e = [];
  ENCADENADAS.forEach(s => { if (s.p.length !== 6) e.push(s.tema + ': no son 6'); for (let i = 0; i < s.p.length - 1; i++) { const a = sinTilde(s.p[i][0]), b = sinTilde(s.p[i + 1][0]); if (a.at(-1) !== b[0]) e.push(`${s.tema}: ${a} → ${b}`); } });
  CANCIONES.forEach(c => { const n = c.l.split(' ').length; if (n !== 7) e.push(c.t + ': ' + n + ' palabras'); if (c.dar > 5) e.push(c.t + ': dar'); });
  CADENAS7.forEach(c => { if (c.length !== 7) e.push('cadena7 ' + c[0]); });
  ULTIMAS.forEach(c => { if (c.length !== 15) e.push('última ' + c[0]); });
  EMBUDO.forEach(x => { if (x.p.length !== 5) e.push('embudo ' + x.r); });
  return e;
}
