// Optimización: Cargar script de manera diferida y eficiente
'use strict';

const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const gameSection = document.getElementById('game-section');
const rewardsSection = document.getElementById('rewards-section');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const userDisplay = document.getElementById('user-display');
const scoreDisplay = document.getElementById('score-display');
const finalScoreElement = document.getElementById('final-score');
const prizesListElement = document.getElementById('prizes-list');
const restartButton = document.getElementById('restart-btn');

let shuffledQuestions, currentQuestionIndex;
let score = 0;
let currentUser = '';
let currentRoundIds = [];

// Reducido para dispositivos de bajo rendimiento
const QUESTIONS_PER_ROUND = 5;

// Pool de preguntas sobre cacao en Colombia (100+)
// Nota: Preguntas generales y educativas, sin datos polémicos.
const questionsPool = [
    { id: 1, question: '¿Qué tipo de cacao es reconocido en Colombia por su calidad?', answers: [
        { text: 'Cacao fino de aroma', correct: true },
        { text: 'Cacao industrial básico', correct: false },
        { text: 'Cacao instantáneo', correct: false },
        { text: 'Cacao artificial', correct: false }
    ] },
    { id: 2, question: '¿Cuál es una entidad gremial clave para los cacaocultores en Colombia?', answers: [
        { text: 'Fedecacao', correct: true },
        { text: 'FIFA', correct: false },
        { text: 'ICONTEC', correct: false },
        { text: 'DANE', correct: false }
    ] },
    { id: 3, question: '¿Cuál departamento es históricamente destacado por la producción de cacao?', answers: [
        { text: 'Santander', correct: true },
        { text: 'La Guajira', correct: false },
        { text: 'San Andrés', correct: false },
        { text: 'Chocó', correct: false }
    ] },
    { id: 4, question: '¿Qué variedad de cacao se asocia a mejor perfil sensorial?', answers: [
        { text: 'Criollo', correct: true },
        { text: 'Trigo', correct: false },
        { text: 'Maíz', correct: false },
        { text: 'Forastero de baja calidad', correct: false }
    ] },
    { id: 5, question: '¿Qué proceso postcosecha desarrolla aromas en el cacao?', answers: [
        { text: 'Fermentación', correct: true },
        { text: 'Congelación', correct: false },
        { text: 'Cernido', correct: false },
        { text: 'Empacado al vacío inmediato', correct: false }
    ] },
    { id: 6, question: '¿Qué etapa reduce la humedad del grano antes del almacenamiento?', answers: [
        { text: 'Secado', correct: true },
        { text: 'Irrigación', correct: false },
        { text: 'Inmersión en agua', correct: false },
        { text: 'Pulverización', correct: false }
    ] },
    { id: 7, question: '¿Qué organización técnica investiga agricultura en Colombia, incluyendo cacao?', answers: [
        { text: 'Agrosavia', correct: true },
        { text: 'NASA', correct: false },
        { text: 'OMS', correct: false },
        { text: 'OCDE', correct: false }
    ] },
    { id: 8, question: '¿Cuál es un departamento productor de cacao en la región oriental?', answers: [
        { text: 'Arauca', correct: true },
        { text: 'San Andrés', correct: false },
        { text: 'Atlántico', correct: false },
        { text: 'Guainía', correct: false }
    ] },
    { id: 9, question: '¿Qué institución forma técnicamente a productores en Colombia?', answers: [
        { text: 'SENA', correct: true },
        { text: 'Real Madrid', correct: false },
        { text: 'Avianca', correct: false },
        { text: 'Colciencias de aviación', correct: false }
    ] },
    { id: 10, question: '¿Qué práctica sostenible es común en cacaotales?', answers: [
        { text: 'Sistemas agroforestales con sombra', correct: true },
        { text: 'Deforestación total', correct: false },
        { text: 'Riego salino', correct: false },
        { text: 'Incendios controlados frecuentes', correct: false }
    ] },
    { id: 11, question: '¿Qué plaga/enfermedad afecta al cacao y requiere manejo?', answers: [
        { text: 'Monilia (podredumbre helada)', correct: true },
        { text: 'Mildiu de la papa', correct: false },
        { text: 'Gorgojo del trigo', correct: false },
        { text: 'Royas del café exclusivamente', correct: false }
    ] },
    { id: 12, question: '¿Qué institución regula sanidad vegetal en Colombia?', answers: [
        { text: 'ICA', correct: true },
        { text: 'BBC', correct: false },
        { text: 'ONU Mujeres', correct: false },
        { text: 'WTO', correct: false }
    ] },
    { id: 13, question: '¿Qué departamento andino también produce cacao?', answers: [
        { text: 'Huila', correct: true },
        { text: 'Antártida', correct: false },
        { text: 'Nariño sin agricultura', correct: false },
        { text: 'Vaupés exclusivamente minero', correct: false }
    ] },
    { id: 14, question: '¿Qué paso mejora la calidad al remover granos planos y rotos?', answers: [
        { text: 'Selección y clasificación', correct: true },
        { text: 'Contaminación cruzada', correct: false },
        { text: 'Mezcla de residuos', correct: false },
        { text: 'Humectación excesiva', correct: false }
    ] },
    { id: 15, question: '¿Qué recurso natural es clave para el cultivo de cacao?', answers: [
        { text: 'Suelo fértil y clima húmedo', correct: true },
        { text: 'Suelo salino extremo', correct: false },
        { text: 'Altas nevadas constantes', correct: false },
        { text: 'Desierto sin agua', correct: false }
    ] },
    { id: 16, question: '¿Qué parte del fruto se fermenta para desarrollar sabor?', answers: [
        { text: 'La pulpa y los granos', correct: true },
        { text: 'La cáscara dura solamente', correct: false },
        { text: 'Las hojas del árbol', correct: false },
        { text: 'El tronco', correct: false }
    ] },
    { id: 17, question: '¿Qué producto se obtiene al moler granos de cacao?', answers: [
        { text: 'Licor de cacao', correct: true },
        { text: 'Aceite de palma', correct: false },
        { text: 'Harina de maíz', correct: false },
        { text: 'Azúcar invertido', correct: false }
    ] },
    { id: 18, question: '¿Qué derivado se separa del licor de cacao por prensado?', answers: [
        { text: 'Manteca de cacao', correct: true },
        { text: 'Mantequilla de vaca', correct: false },
        { text: 'Aceite de oliva', correct: false },
        { text: 'Jarabe de caña', correct: false }
    ] },
    { id: 19, question: '¿Qué característica buscan los chocolateros artesanales?', answers: [
        { text: 'Notas florales y frutales', correct: true },
        { text: 'Sabor plano y amargo excesivo', correct: false },
        { text: 'Sabores metálicos', correct: false },
        { text: 'Aroma a humo intenso por contaminación', correct: false }
    ] },
    { id: 20, question: '¿Qué técnica de manejo mejora la productividad del cacao?', answers: [
        { text: 'Poda sanitaria y de formación', correct: true },
        { text: 'No podar nunca', correct: false },
        { text: 'Eliminar toda sombra', correct: false },
        { text: 'Fertilizar con sal de mesa', correct: false }
    ] },
    { id: 21, question: '¿Cuál región del país también destaca por cacao?', answers: [
        { text: 'Norte de Santander', correct: true },
        { text: 'Guajira desértica exclusiva', correct: false },
        { text: 'Isla de Pascua', correct: false },
        { text: 'Tundra siberiana', correct: false }
    ] },
    { id: 22, question: '¿Qué material común se usa para cajas de fermentación?', answers: [
        { text: 'Madera limpia', correct: true },
        { text: 'Plomo', correct: false },
        { text: 'Cartón húmedo sucio', correct: false },
        { text: 'Aluminio sin perforaciones', correct: false }
    ] },
    { id: 23, question: '¿Qué buena práctica evita mohos en secado?', answers: [
        { text: 'Secar en patios o bandejas ventiladas', correct: true },
        { text: 'Almacenar húmedo en bolsas cerradas', correct: false },
        { text: 'Secar en sótano sin ventilación', correct: false },
        { text: 'Secar bajo lluvia', correct: false }
    ] },
    { id: 24, question: '¿Qué país vecino también es referente en cacao fino?', answers: [
        { text: 'Ecuador', correct: true },
        { text: 'Chile por cacao tropical', correct: false },
        { text: 'Uruguay por cacao selvático', correct: false },
        { text: 'Paraguay por cacao marino', correct: false }
    ] },
    { id: 25, question: '¿Qué se busca en la fermentación adecuada?', answers: [
        { text: 'Desarrollo de precursores de sabor', correct: true },
        { text: 'Sabor crudo y ácido extremo', correct: false },
        { text: 'Parada completa de enzimas desde el inicio', correct: false },
        { text: 'Putrefacción', correct: false }
    ] },
    { id: 26, question: '¿Qué departamento llanero produce cacao?', answers: [
        { text: 'Meta', correct: true },
        { text: 'San Andrés', correct: false },
        { text: 'Quindío exclusivamente cafetero sin cacao', correct: false },
        { text: 'Tierra del Fuego', correct: false }
    ] },
    { id: 27, question: '¿Cuál es un uso gastronómico del cacao colombiano?', answers: [
        { text: 'Chocolate artesanal de origen', correct: true },
        { text: 'Salsa de pescado fermentado', correct: false },
        { text: 'Queso azul', correct: false },
        { text: 'Vinagre balsámico', correct: false }
    ] },
    { id: 28, question: '¿Qué parámetro se cuida en el almacenamiento?', answers: [
        { text: 'Humedad baja y limpieza', correct: true },
        { text: 'Humedad alta y calor', correct: false },
        { text: 'Exposición directa al sol por semanas', correct: false },
        { text: 'Contacto con combustibles', correct: false }
    ] },
    { id: 29, question: '¿Qué práctica comunitaria fortalece la cadena del cacao?', answers: [
        { text: 'Asociatividad y cooperativas', correct: true },
        { text: 'Competencia desleal', correct: false },
        { text: 'Aislamiento total', correct: false },
        { text: 'Desinformación', correct: false }
    ] },
    { id: 30, question: '¿Qué característica del grano indica buena fermentación?', answers: [
        { text: 'Interior pardo uniforme', correct: true },
        { text: 'Interior blanco crudo', correct: false },
        { text: 'Interior verde', correct: false },
        { text: 'Interior negro pegajoso', correct: false }
    ] },
    { id: 31, question: '¿Qué departamento amazónico reporta cacaotales?', answers: [
        { text: 'Caquetá', correct: true },
        { text: 'Amazonas sin agricultura', correct: false },
        { text: 'Magdalena costero exclusivo', correct: false },
        { text: 'Putumayo inexistente', correct: false }
    ] },
    { id: 32, question: '¿Cuál es una práctica básica de inocuidad?', answers: [
        { text: 'Uso de superficies limpias', correct: true },
        { text: 'Mezclar con pesticidas', correct: false },
        { text: 'Secar en el piso con animales', correct: false },
        { text: 'Empacar con residuos', correct: false }
    ] },
    { id: 33, question: '¿Qué actor compra cacao para chocolate fino?', answers: [
        { text: 'Chocolateros bean-to-bar', correct: true },
        { text: 'Refinerías de petróleo', correct: false },
        { text: 'Productores de acero', correct: false },
        { text: 'Industria de cemento', correct: false }
    ] },
    { id: 34, question: '¿Qué región cafetera también cultiva cacao?', answers: [
        { text: 'Antioquia', correct: true },
        { text: 'Islas Malvinas', correct: false },
        { text: 'Nevada perpetua', correct: false },
        { text: 'Desierto de Atacama', correct: false }
    ] },
    { id: 35, question: '¿Qué acción se realiza durante la fermentación?', answers: [
        { text: 'Remover/Voltear masas de granos', correct: true },
        { text: 'Compactar con cemento', correct: false },
        { text: 'Lavar con cloro', correct: false },
        { text: 'Aplastarlos con piedras', correct: false }
    ] },
    { id: 36, question: '¿Cuál es un indicador de buen secado?', answers: [
        { text: 'Granos quebradizos y sin humedad excesiva', correct: true },
        { text: 'Granos gomosos y húmedos', correct: false },
        { text: 'Granos mojados', correct: false },
        { text: 'Granos con moho visible', correct: false }
    ] },
    { id: 37, question: '¿Qué practica ayuda a la biodiversidad en cacaotales?', answers: [
        { text: 'Árboles de sombra nativa', correct: true },
        { text: 'Eliminación de toda vegetación', correct: false },
        { text: 'Uso constante de fuego', correct: false },
        { text: 'Herbicidas sin control', correct: false }
    ] },
    { id: 38, question: '¿Qué departamento del suroccidente cultiva cacao?', answers: [
        { text: 'Nariño', correct: true },
        { text: 'Guajira polar', correct: false },
        { text: 'Tíbet', correct: false },
        { text: 'Islandia', correct: false }
    ] },
    { id: 39, question: '¿Cuál es un objetivo de la selección de clones?', answers: [
        { text: 'Mejorar rendimiento y calidad', correct: true },
        { text: 'Reducir sabor', correct: false },
        { text: 'Aumentar defectos', correct: false },
        { text: 'Eliminar aromas agradables', correct: false }
    ] },
    { id: 40, question: '¿Qué proceso transforma el licor en barra de chocolate?', answers: [
        { text: 'Conchado y templado', correct: true },
        { text: 'Fresado de arroz', correct: false },
        { text: 'Trituración de piedra caliza', correct: false },
        { text: 'Destilación de alcohol', correct: false }
    ] },
    { id: 41, question: '¿Qué actor apoya la extensión rural en Colombia?', answers: [
        { text: 'Secretarías de agricultura', correct: true },
        { text: 'Clubes de fútbol', correct: false },
        { text: 'Aerolíneas', correct: false },
        { text: 'Museos de arte', correct: false }
    ] },
    { id: 42, question: '¿Qué buena práctica postcosecha minimiza defectos?', answers: [
        { text: 'Tiempo adecuado de fermentación', correct: true },
        { text: 'Fermentación nula', correct: false },
        { text: 'Secar bajo lluvia', correct: false },
        { text: 'Mezclar granos crudos y fermentados', correct: false }
    ] },
    { id: 43, question: '¿Qué departamento andino adicional tiene cacaotales?', answers: [
        { text: 'Tolima', correct: true },
        { text: 'Atlántico marino exclusivo', correct: false },
        { text: 'San Andrés coralino', correct: false },
        { text: 'Archipiélago polar', correct: false }
    ] },
    { id: 44, question: '¿Qué es el nib de cacao?', answers: [
        { text: 'Fragmento del grano tostado', correct: true },
        { text: 'Pulpa verde', correct: false },
        { text: 'Cáscara externa del fruto', correct: false },
        { text: 'Hojas secas', correct: false }
    ] },
    { id: 45, question: '¿Qué herramienta mide humedad en postcosecha?', answers: [
        { text: 'Higrómetro', correct: true },
        { text: 'Altímetro', correct: false },
        { text: 'Sismógrafo', correct: false },
        { text: 'Anemómetro', correct: false }
    ] },
    { id: 46, question: '¿Qué alternativa de comercialización agrega valor?', answers: [
        { text: 'Chocolate de origen', correct: true },
        { text: 'Grano mezclado sin trazabilidad', correct: false },
        { text: 'Venta húmeda sin secar', correct: false },
        { text: 'Mezcla con materiales extraños', correct: false }
    ] },
    { id: 47, question: '¿Qué entidad estadística reporta agricultura en Colombia?', answers: [
        { text: 'DANE', correct: true },
        { text: 'NBA', correct: false },
        { text: 'FMI', correct: false },
        { text: 'NHL', correct: false }
    ] },
    { id: 48, question: '¿Qué defectos sensorios se buscan evitar?', answers: [
        { text: 'Moho y humo', correct: true },
        { text: 'Frutal y floral', correct: false },
        { text: 'Cítrico limpio', correct: false },
        { text: 'Cacao intenso agradable', correct: false }
    ] },
    { id: 49, question: '¿Qué departamento fronterizo cultiva cacao?', answers: [
        { text: 'Norte de Santander', correct: true },
        { text: 'Guajira glaciar', correct: false },
        { text: 'Archipiélago del polo', correct: false },
        { text: 'Islas de coral árticas', correct: false }
    ] },
    { id: 50, question: '¿Qué se requiere para buen secado?', answers: [
        { text: 'Ventilación y protección de lluvia', correct: true },
        { text: 'Encierro hermético húmedo', correct: false },
        { text: 'Fuego directo sobre granos', correct: false },
        { text: 'Humedad constante', correct: false }
    ] },
    { id: 51, question: '¿Qué práctica reduce plagas sin químicos excesivos?', answers: [
        { text: 'Manejo integrado de plagas', correct: true },
        { text: 'Uso indiscriminado', correct: false },
        { text: 'Cero monitoreo', correct: false },
        { text: 'Aplicar sal', correct: false }
    ] },
    { id: 52, question: '¿Qué producto colombiano se elabora con cacao?', answers: [
        { text: 'Chocolate de mesa', correct: true },
        { text: 'Aceite diésel', correct: false },
        { text: 'Cemento', correct: false },
        { text: 'Sal de cocina', correct: false }
    ] },
    { id: 53, question: '¿Qué departamento del sur también cultiva cacao?', answers: [
        { text: 'Putumayo', correct: true },
        { text: 'Magallanes', correct: false },
        { text: 'Antártida', correct: false },
        { text: 'Islas Galápagos', correct: false }
    ] },
    { id: 54, question: '¿Qué rol cumplen las asociaciones de productores?', answers: [
        { text: 'Negociación y capacitación', correct: true },
        { text: 'Aumentar costos y desorden', correct: false },
        { text: 'Eliminar calidad', correct: false },
        { text: 'Evitar la trazabilidad', correct: false }
    ] },
    { id: 55, question: '¿Qué etapa define el perfil sensorial final del chocolate?', answers: [
        { text: 'Procesos de postcosecha y fabricación', correct: true },
        { text: 'Transporte marítimo', correct: false },
        { text: 'Marketing', correct: false },
        { text: 'Empaque únicamente', correct: false }
    ] },
    { id: 56, question: '¿Qué departamento andino adicional produce cacao?', answers: [
        { text: 'Cundinamarca', correct: true },
        { text: 'Islas del Caribe no agrícolas', correct: false },
        { text: 'Desierto polar', correct: false },
        { text: 'Tíbet', correct: false }
    ] },
    { id: 57, question: '¿Qué resultado busca el conchado?', answers: [
        { text: 'Mejorar textura y aroma', correct: true },
        { text: 'Agregar piedras', correct: false },
        { text: 'Endurecer con sal', correct: false },
        { text: 'Secar hojas', correct: false }
    ] },
    { id: 58, question: '¿Qué herramienta ayuda a evaluar calidad?', answers: [
        { text: 'Panel sensorial', correct: true },
        { text: 'Microscopio de peces', correct: false },
        { text: 'Detector de metales pesados casero', correct: false },
        { text: 'Regla de plástico', correct: false }
    ] },
    { id: 59, question: '¿Qué Departamento del centro-oriente produce cacao?', answers: [
        { text: 'Boyacá', correct: true },
        { text: 'La Antártida', correct: false },
        { text: 'Islas Faroe', correct: false },
        { text: 'Groenlandia', correct: false }
    ] },
    { id: 60, question: '¿Qué se evita durante la fermentación?', answers: [
        { text: 'Contaminaciones y objetos extraños', correct: true },
        { text: 'Control de temperatura', correct: false },
        { text: 'Aireación moderada', correct: false },
        { text: 'Remoción periódica', correct: false }
    ] },
    { id: 61, question: '¿Qué departamento pacífico tiene potencial cacaotero?', answers: [
        { text: 'Cauca', correct: true },
        { text: 'Isla ártica', correct: false },
        { text: 'Atacama', correct: false },
        { text: 'Sahara', correct: false }
    ] },
    { id: 62, question: '¿Qué es el templado del chocolate?', answers: [
        { text: 'Control de cristales de manteca de cacao', correct: true },
        { text: 'Secado de granos', correct: false },
        { text: 'Fermentación prolongada', correct: false },
        { text: 'Separación de nibs', correct: false }
    ] },
    { id: 63, question: '¿Qué objetivo tiene la trazabilidad?', answers: [
        { text: 'Rastrear origen y procesos', correct: true },
        { text: 'Ocultar información', correct: false },
        { text: 'Mezclar sin registro', correct: false },
        { text: 'Eliminar datos', correct: false }
    ] },
    { id: 64, question: '¿Qué departamento caribeño también puede cultivar cacao?', answers: [
        { text: 'Cesar', correct: true },
        { text: 'Aruba', correct: false },
        { text: 'Islas Svalbard', correct: false },
        { text: 'Islas Marshall', correct: false }
    ] },
    { id: 65, question: '¿Qué práctica genera mejores precios?', answers: [
        { text: 'Calidad consistente y certificaciones', correct: true },
        { text: 'Eliminar limpieza', correct: false },
        { text: 'No secar', correct: false },
        { text: 'Mezclar con impurezas', correct: false }
    ] },
    { id: 66, question: '¿Qué departamento de la región andina norte produce cacao?', answers: [
        { text: 'Santander', correct: true },
        { text: 'Risaralda polar', correct: false },
        { text: 'Antártida', correct: false },
        { text: 'Islandia', correct: false }
    ] },
    { id: 67, question: '¿Cuál es una buena práctica de cosecha?', answers: [
        { text: 'Cortar frutos maduros sin dañar el cojín floral', correct: true },
        { text: 'Arrancar ramas', correct: false },
        { text: 'Golpear tronco', correct: false },
        { text: 'Almacenar con lodo', correct: false }
    ] },
    { id: 68, question: '¿Qué actor puede certificar calidad?', answers: [
        { text: 'Laboratorios acreditados', correct: true },
        { text: 'Club deportivo', correct: false },
        { text: 'Teatros', correct: false },
        { text: 'Agencias de turismo', correct: false }
    ] },
    { id: 69, question: '¿Qué departamento andino adicional reporta cacao?', answers: [
        { text: 'Valle del Cauca', correct: true },
        { text: 'Islas glaciares', correct: false },
        { text: 'Sahara', correct: false },
        { text: 'Atolón ártico', correct: false }
    ] },
    { id: 70, question: '¿Qué defectos se evitan con buen secado?', answers: [
        { text: 'Moho y sabores indeseados', correct: true },
        { text: 'Aromas frutales limpios', correct: false },
        { text: 'Notas florales', correct: false },
        { text: 'Cacao intenso agradable', correct: false }
    ] },
    { id: 71, question: '¿Qué proceso ayuda a reducir acidez?', answers: [
        { text: 'Fermentación y conchado', correct: true },
        { text: 'Humectación', correct: false },
        { text: 'Mezcla con sal', correct: false },
        { text: 'Agregar agua cruda', correct: false }
    ] },
    { id: 72, question: '¿Qué departamento del oriente adicional produce cacao?', answers: [
        { text: 'Casanare', correct: true },
        { text: 'Islas árticas', correct: false },
        { text: 'Polo norte', correct: false },
        { text: 'Desierto del Namib', correct: false }
    ] },
    { id: 73, question: '¿Qué actor internacional compra cacao colombiano?', answers: [
        { text: 'Chocolaterías de especialidad', correct: true },
        { text: 'Refinerías de cobre', correct: false },
        { text: 'Compañías de gas', correct: false },
        { text: 'Fábricas de vidrio', correct: false }
    ] },
    { id: 74, question: '¿Qué etapa define color de los granos?', answers: [
        { text: 'Fermentación y secado', correct: true },
        { text: 'Cosecha exclusivamente', correct: false },
        { text: 'Marketing', correct: false },
        { text: 'Transporte', correct: false }
    ] },
    { id: 75, question: '¿Qué departamento del suroriente reporta cacao?', answers: [
        { text: 'Guaviare', correct: true },
        { text: 'Laponia', correct: false },
        { text: 'Islandia', correct: false },
        { text: 'Escocia polar', correct: false }
    ] },
    { id: 76, question: '¿Qué es el grano bien fermentado?', answers: [
        { text: 'Grano con interior pardo y aromático', correct: true },
        { text: 'Grano blanco crudo', correct: false },
        { text: 'Grano con moho', correct: false },
        { text: 'Grano verdoso', correct: false }
    ] },
    { id: 77, question: '¿Qué combinación de variedades es común?', answers: [
        { text: 'Trinitario (mezcla de Criollo y Forastero)', correct: true },
        { text: 'Maíz + trigo', correct: false },
        { text: 'Café + cacao en un mismo grano', correct: false },
        { text: 'Cacao de plástico', correct: false }
    ] },
    { id: 78, question: '¿Qué departamento del centro-sur produce cacao?', answers: [
        { text: 'Tolima', correct: true },
        { text: 'Isla polar', correct: false },
        { text: 'Desierto absoluto', correct: false },
        { text: 'Tundra', correct: false }
    ] },
    { id: 79, question: '¿Qué paso se realiza tras secado para calidad?', answers: [
        { text: 'Clasificación final y empaque', correct: true },
        { text: 'Mezcla con piedras', correct: false },
        { text: 'Almacenamiento húmedo', correct: false },
        { text: 'Fumigación con humo', correct: false }
    ] },
    { id: 80, question: '¿Qué departamento del centro produce cacao?', answers: [
        { text: 'Caldas', correct: true },
        { text: 'Islas volcánicas árticas', correct: false },
        { text: 'Sahara', correct: false },
        { text: 'Polo sur', correct: false }
    ] },
    { id: 81, question: '¿Qué etapa del chocolate define brillo y snap?', answers: [
        { text: 'Templado adecuado', correct: true },
        { text: 'Marketing', correct: false },
        { text: 'Fermentación', correct: false },
        { text: 'Cosecha', correct: false }
    ] },
    { id: 82, question: '¿Qué departamento del Caribe interior produce cacao?', answers: [
        { text: 'Magdalena', correct: true },
        { text: 'Islas árticas', correct: false },
        { text: 'Groenlandia', correct: false },
        { text: 'Islandia', correct: false }
    ] },
    { id: 83, question: '¿Qué actor comercial impulsa calidad?', answers: [
        { text: 'Compradores especializados', correct: true },
        { text: 'Intermediarios sin trazabilidad', correct: false },
        { text: 'Bancos de metales', correct: false },
        { text: 'Clubes de cine', correct: false }
    ] },
    { id: 84, question: '¿Qué medición básica se controla en secado?', answers: [
        { text: 'Contenido de humedad', correct: true },
        { text: 'Radiación cósmica', correct: false },
        { text: 'Sonido', correct: false },
        { text: 'Altitud exacta del mar', correct: false }
    ] },
    { id: 85, question: '¿Qué departamento del centro-occidente produce cacao?', answers: [
        { text: 'Risaralda', correct: true },
        { text: 'Islas británicas polares', correct: false },
        { text: 'Ártico', correct: false },
        { text: 'Desierto polar', correct: false }
    ] },
    { id: 86, question: '¿Qué manejo reduce enfermedades en campo?', answers: [
        { text: 'Poda y retiro de frutos enfermos', correct: true },
        { text: 'Dejar mohos proliferar', correct: false },
        { text: 'Rociar con azúcares', correct: false },
        { text: 'Golpear con palos', correct: false }
    ] },
    { id: 87, question: '¿Qué departamento del oriente adicional tiene cacao?', answers: [
        { text: 'Vichada', correct: true },
        { text: 'Islas antárticas', correct: false },
        { text: 'Polo norte', correct: false },
        { text: 'Desierto gélido', correct: false }
    ] },
    { id: 88, question: '¿Qué resultado da una fermentación insuficiente?', answers: [
        { text: 'Sabores crudos y astringentes', correct: true },
        { text: 'Aromas complejos agradables', correct: false },
        { text: 'Textura refinada', correct: false },
        { text: 'Baja acidez controlada', correct: false }
    ] },
    { id: 89, question: '¿Qué departamento andino adicional produce cacao?', answers: [
        { text: 'Quindío', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Sahara', correct: false },
        { text: 'Atacama', correct: false }
    ] },
    { id: 90, question: '¿Qué etapa de fabricación mezcla sólidos y manteca?', answers: [
        { text: 'Refinado y conchado', correct: true },
        { text: 'Cosecha', correct: false },
        { text: 'Secado', correct: false },
        { text: 'Fermentación', correct: false }
    ] },
    { id: 91, question: '¿Qué departamento adicional de la región norte produce cacao?', answers: [
        { text: 'Atlántico (zonas específicas)', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Groenlandia', correct: false },
        { text: 'Desierto ártico', correct: false }
    ] },
    { id: 92, question: '¿Qué objetivo tiene la limpieza del grano?', answers: [
        { text: 'Eliminar impurezas', correct: true },
        { text: 'Añadir polvo', correct: false },
        { text: 'Mezclar materiales extraños', correct: false },
        { text: 'Incrementar humedad', correct: false }
    ] },
    { id: 93, question: '¿Qué departamento andino adicional tiene cacao?', answers: [
        { text: 'Norte de Santander', correct: true },
        { text: 'Laponia', correct: false },
        { text: 'Islandia', correct: false },
        { text: 'Svalbard', correct: false }
    ] },
    { id: 94, question: '¿Qué ocurre si el secado es muy rápido con humo?', answers: [
        { text: 'Defectos de sabor', correct: true },
        { text: 'Mejora siempre el aroma', correct: false },
        { text: 'Aumenta calidad garantizada', correct: false },
        { text: 'Elimina acidez sin afectar sabor', correct: false }
    ] },
    { id: 95, question: '¿Qué departamento del centro-este produce cacao?', answers: [
        { text: 'Arauca', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Desierto frío', correct: false },
        { text: 'Tundra', correct: false }
    ] },
    { id: 96, question: '¿Qué se busca con la trazabilidad y origen?', answers: [
        { text: 'Valor agregado y confianza', correct: true },
        { text: 'Confusión', correct: false },
        { text: 'Pérdida de calidad', correct: false },
        { text: 'Ocultar procesos', correct: false }
    ] },
    { id: 97, question: '¿Qué departamento del eje cafetero también reporta cacao?', answers: [
        { text: 'Santander (histórico)', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Sahara', correct: false },
        { text: 'Atolón', correct: false }
    ] },
    { id: 98, question: '¿Qué manejo del suelo favorece el cacao?', answers: [
        { text: 'Materia orgánica y drenaje', correct: true },
        { text: 'Compactación extrema', correct: false },
        { text: 'Salinización', correct: false },
        { text: 'Erosión intencional', correct: false }
    ] },
    { id: 99, question: '¿Qué departamento del sur produce cacao?', answers: [
        { text: 'Amazonas (zonas específicas)', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Polo norte', correct: false },
        { text: 'Desierto ártico', correct: false }
    ] },
    { id: 100, question: '¿Qué etapa evita sabores crudos en el grano?', answers: [
        { text: 'Fermentación suficiente', correct: true },
        { text: 'Cosecha temprana', correct: false },
        { text: 'Secado en lluvia', correct: false },
        { text: 'Almacenaje húmedo', correct: false }
    ] },
    { id: 101, question: '¿Qué práctica de campo mejora sanidad?', answers: [
        { text: 'Recolección oportuna de frutos', correct: true },
        { text: 'Dejar frutos podridos', correct: false },
        { text: 'Cortar raíces', correct: false },
        { text: 'Romper troncos', correct: false }
    ] },
    { id: 102, question: '¿Qué departamento del oriente adicional reporta cacao?', answers: [
        { text: 'Guainía', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Polo sur', correct: false },
        { text: 'Tundra', correct: false }
    ] },
    { id: 103, question: '¿Qué etapa del chocolate requiere curva de temperatura?', answers: [
        { text: 'Templado', correct: true },
        { text: 'Cosecha', correct: false },
        { text: 'Secado', correct: false },
        { text: 'Fermentación', correct: false }
    ] },
    { id: 104, question: '¿Qué material se evita en postcosecha?', answers: [
        { text: 'Contenedores sucios o oxidados', correct: true },
        { text: 'Madera limpia', correct: false },
        { text: 'Acero inoxidable limpio', correct: false },
        { text: 'Plástico grado alimenticio', correct: false }
    ] },
    { id: 105, question: '¿Qué actor apoya exportaciones?', answers: [
        { text: 'ProColombia', correct: true },
        { text: 'Liga de fútbol', correct: false },
        { text: 'Club de pesca', correct: false },
        { text: 'Biblioteca local', correct: false }
    ] },
    { id: 106, question: '¿Qué departamento adicional del centro produce cacao?', answers: [
        { text: 'Boyacá', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Polo norte', correct: false },
        { text: 'Desierto ártico', correct: false }
    ] },
    { id: 107, question: '¿Qué etapa separa cáscara del grano?', answers: [
        { text: 'Descascarillado (winnowing)', correct: true },
        { text: 'Cosecha', correct: false },
        { text: 'Secado', correct: false },
        { text: 'Fermentación', correct: false }
    ] },
    { id: 108, question: '¿Qué departamento del centro sur adicional produce cacao?', answers: [
        { text: 'Huila', correct: true },
        { text: 'Islas polares', correct: false },
        { text: 'Polo norte', correct: false },
        { text: 'Desierto ártico', correct: false }
    ] },
    { id: 109, question: '¿Qué resultado da un buen templado?', answers: [
        { text: 'Brillo y textura crujiente', correct: true },
        { text: 'Superficie opaca y blanda', correct: false },
        { text: 'Aroma metálico', correct: false },
        { text: 'Sabor salado', correct: false }
    ] },
    { id: 110, question: '¿Qué etapa homogeniza masa de chocolate?', answers: [
        { text: 'Conchado', correct: true },
        { text: 'Cosecha', correct: false },
        { text: 'Secado', correct: false },
        { text: 'Fermentación', correct: false }
    ] }
];

function sampleUniqueQuestions(pool, count, excludeIds = []) {
    const available = pool.filter(q => !excludeIds.includes(q.id));
    const copy = available.slice();
    // Mezclar
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
}

// Event Listeners
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    currentUser = usernameInput;
    userDisplay.innerText = currentUser;
    startGame();
});

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});

restartButton.addEventListener('click', startGame);

function startGame() {
    loginSection.classList.add('hidden');
    rewardsSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    
    score = 0;
    updateScore();
    currentRoundIds = [];

    // Obtener preguntas únicas por usuario usando localStorage
    const seenKey = `trivia_seen_${currentUser || 'anon'}`;
    const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
    let selection = sampleUniqueQuestions(questionsPool, QUESTIONS_PER_ROUND, seen);
    // Si no hay suficientes, reiniciar el historial para asegurar ronda completa
    if (selection.length < QUESTIONS_PER_ROUND) {
        localStorage.removeItem(seenKey);
        selection = sampleUniqueQuestions(questionsPool, QUESTIONS_PER_ROUND, []);
    }

    shuffledQuestions = selection; // ya vienen mezcladas
    currentQuestionIndex = 0;
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < shuffledQuestions.length) {
        showQuestion(shuffledQuestions[currentQuestionIndex]);
    } else {
        showRewards();
    }
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    
    // Mezclar las respuestas para que no siempre esté la correcta en la primera posición
    const shuffledAnswers = question.answers.slice();
    for (let i = shuffledAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
    }
    
    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn-answer');
        // Evitar exponer respuestas correctas como atributos del DOM
        // Usamos una propiedad interna no reflejada en HTML
        button._isCorrect = !!answer.correct;
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
    // Registrar el ID de la pregunta actual para el historial
    if (question.id && !currentRoundIds.includes(question.id)) {
        currentRoundIds.push(question.id);
    }
}

function resetState() {
    nextButton.classList.add('hidden');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = !!selectedButton._isCorrect;

    setStatusClass(selectedButton, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, !!button._isCorrect);
        button.disabled = true; // Deshabilitar botones después de elegir
    });

    if (correct) {
        score += 10;
        updateScore();
    }

    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hidden');
    } else {
        setTimeout(showRewards, 1000); // Esperar un poco antes de mostrar premios
    }
}

// --- Protecciones básicas contra inspección (F12/DevTools) ---
// Nota: Estas medidas dificultan, pero no impiden al 100%.
(function setupBasicProtections() {
    // Bloquear clic derecho
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Bloquear atajos básicos
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;

        // F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S
        if (key === 'F12' || 
            (ctrl && e.shiftKey && ['I','J','C'].includes(key)) ||
            (ctrl && ['U','S'].includes(key))) {
            e.preventDefault();
        }
    });
})();

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function updateScore() {
    scoreDisplay.innerText = `${score} pts`;
}

function showRewards() {
    gameSection.classList.add('hidden');
    rewardsSection.classList.remove('hidden');
    finalScoreElement.innerText = score;
    
    prizesListElement.innerHTML = '';
    
    // Lógica simple de premios
    const rewards = [];
    if (score >= 10) rewards.push('Un cupón de 10% de descuento');
    if (score >= 30) rewards.push('Una barra de chocolate gratis');
    if (score == 50) rewards.push('¡Visita guiada a la fábrica!');
    
    if (rewards.length === 0) {
        const p = document.createElement('p');
        p.innerText = "Sigue intentando para ganar premios.";
        prizesListElement.appendChild(p);
    } else {
        rewards.forEach(reward => {
            const div = document.createElement('div');
            div.classList.add('prize-item');
            div.innerText = reward;
            prizesListElement.appendChild(div);
        });
    }

    // Guardar preguntas vistas por usuario
    const seenKey = `trivia_seen_${currentUser || 'anon'}`;
    const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
    const merged = Array.from(new Set([ ...seen, ...currentRoundIds ]));
    localStorage.setItem(seenKey, JSON.stringify(merged));
}

// ========== OPTIMIZACIONES PARA DISPOSITIVOS DE BAJO RENDIMIENTO ==========

// Prevenir zoom accidental en iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Optimizar localStorage
function cleanOldData() {
    try {
        const keys = Object.keys(localStorage);
        if (keys.length > 50) {
            keys.slice(0, 20).forEach(key => {
                if (key.startsWith('trivia_')) localStorage.removeItem(key);
            });
        }
    } catch (e) {}
}

if (Math.random() < 0.1) cleanOldData();
