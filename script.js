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
const livesDisplay = document.getElementById('lives-display');
const finalScoreElement = document.getElementById('final-score');
const prizesListElement = document.getElementById('prizes-list');
const restartButton = document.getElementById('restart-btn');
const extraLifeContainer = document.getElementById('extra-life-container');
const extraLifeText = document.getElementById('extra-life-text');
const watchAdButton = document.getElementById('watch-ad-btn');
const adVideo = document.getElementById('ad-video');

let shuffledQuestions, currentQuestionIndex;
let score = 0;
let currentUser = '';
let currentRoundIds = [];

const MAX_LIVES = 3;
let lives = MAX_LIVES;
let extraLifeUsed = false;
let awaitingRevive = false;

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
    ] },
    // Preguntas surtidas sobre San José del Guaviare (Colombia)
    { id: 111, question: '¿San José del Guaviare es la capital de qué departamento?', answers: [
        { text: 'Guaviare', correct: true },
        { text: 'Guainía', correct: false },
        { text: 'Vaupés', correct: false },
        { text: 'Meta', correct: false }
    ] },
    { id: 112, question: '¿En qué país se encuentra San José del Guaviare?', answers: [
        { text: 'Colombia', correct: true },
        { text: 'Ecuador', correct: false },
        { text: 'Perú', correct: false },
        { text: 'Brasil', correct: false }
    ] },
    { id: 113, question: '¿Qué río pasa junto a San José del Guaviare y le da nombre al territorio?', answers: [
        { text: 'Río Guaviare', correct: true },
        { text: 'Río Magdalena', correct: false },
        { text: 'Río Cauca', correct: false },
        { text: 'Río Atrato', correct: false }
    ] },
    { id: 114, question: 'San José del Guaviare se ubica en una zona de transición entre dos grandes regiones naturales. ¿Cuáles?', answers: [
        { text: 'Orinoquía y Amazonía', correct: true },
        { text: 'Caribe y Pacífico', correct: false },
        { text: 'Andina e Insular', correct: false },
        { text: 'Páramo y Desierto', correct: false }
    ] },
    { id: 115, question: '¿Qué tipo de clima predomina en San José del Guaviare?', answers: [
        { text: 'Tropical cálido', correct: true },
        { text: 'Frío de alta montaña', correct: false },
        { text: 'Mediterráneo', correct: false },
        { text: 'Polar', correct: false }
    ] },
    { id: 116, question: '¿Cuál es un atractivo natural reconocido en el área de La Lindosa?', answers: [
        { text: 'Arte rupestre', correct: true },
        { text: 'Géiseres volcánicos', correct: false },
        { text: 'Glaciares', correct: false },
        { text: 'Fiordos', correct: false }
    ] },
    { id: 117, question: 'La Serranía de La Lindosa es conocida especialmente por:', answers: [
        { text: 'Formaciones rocosas y paisajes', correct: true },
        { text: 'Rascacielos históricos', correct: false },
        { text: 'Campos de nieve', correct: false },
        { text: 'Dunas gigantes costeras', correct: false }
    ] },
    { id: 118, question: '¿Qué código IATA tiene el aeropuerto de San José del Guaviare?', answers: [
        { text: 'SJE', correct: true },
        { text: 'BOG', correct: false },
        { text: 'MDE', correct: false },
        { text: 'CTG', correct: false }
    ] },
    { id: 119, question: '¿Cuál de estos atractivos se asocia con la Serranía de La Lindosa (cerca de San José del Guaviare)?', answers: [
        { text: 'Puerta de Orión', correct: true },
        { text: 'Caño Cristales', correct: false },
        { text: 'Cabo de la Vela', correct: false },
        { text: 'Piedra del Peñol', correct: false }
    ] },
    { id: 120, question: '¿Qué sitio cercano a San José del Guaviare es conocido por arte rupestre?', answers: [
        { text: 'Cerro Azul', correct: true },
        { text: 'Monserrate', correct: false },
        { text: 'Ciudad Perdida', correct: false },
        { text: 'Plaza Botero', correct: false }
    ] },
    { id: 121, question: '¿Cuál es una forma de movilidad fluvial tradicional en la región?', answers: [
        { text: 'Navegación por ríos', correct: true },
        { text: 'Teleféricos urbanos', correct: false },
        { text: 'Tranvías subterráneos', correct: false },
        { text: 'Túneles submarinos', correct: false }
    ] },
    { id: 122, question: '¿Cuál de estos ecosistemas es común en el departamento del Guaviare?', answers: [
        { text: 'Bosque tropical', correct: true },
        { text: 'Tundra ártica', correct: false },
        { text: 'Taiga boreal', correct: false },
        { text: 'Matorral mediterráneo', correct: false }
    ] },
    { id: 123, question: '¿Qué tipo de fauna se puede avistar en el área de San José del Guaviare?', answers: [
        { text: 'Aves, monos y reptiles', correct: true },
        { text: 'Pingüinos y focas', correct: false },
        { text: 'Osos polares', correct: false },
        { text: 'Canguros', correct: false }
    ] },
    { id: 124, question: '¿Cuál es una práctica recomendada para visitar sitios naturales del Guaviare?', answers: [
        { text: 'Ir con guía local y respetar señalización', correct: true },
        { text: 'Dejar basura “para no cargar”', correct: false },
        { text: 'Rayar rocas para “marcar” la visita', correct: false },
        { text: 'Extraer plantas como recuerdo', correct: false }
    ] },
    { id: 125, question: '¿Qué elemento natural es clave para la vida y el transporte en la zona?', answers: [
        { text: 'Los ríos', correct: true },
        { text: 'Los glaciares', correct: false },
        { text: 'Los mares', correct: false },
        { text: 'Los volcanes activos', correct: false }
    ] },
    { id: 126, question: '¿Cuál de estos productos agrícolas es común en zonas cálidas como Guaviare?', answers: [
        { text: 'Yuca', correct: true },
        { text: 'Trigo de páramo', correct: false },
        { text: 'Uvas de clima mediterráneo', correct: false },
        { text: 'Manzanas de alta montaña', correct: false }
    ] },
    { id: 127, question: '¿Qué característica describe bien a San José del Guaviare como destino?', answers: [
        { text: 'Puerta a experiencias de naturaleza y cultura', correct: true },
        { text: 'Ciudad costera con puerto marítimo', correct: false },
        { text: 'Capital nevada con pistas de hielo', correct: false },
        { text: 'Isla con arrecifes tropicales', correct: false }
    ] },
    { id: 128, question: '¿Qué significa “arte rupestre” en el contexto de La Lindosa?', answers: [
        { text: 'Pinturas y grabados antiguos en roca', correct: true },
        { text: 'Esculturas hechas con hielo', correct: false },
        { text: 'Murales modernos con aerosol', correct: false },
        { text: 'Figuras en arena de playa', correct: false }
    ] },
    { id: 129, question: '¿Qué práctica apoya el turismo responsable en Guaviare?', answers: [
        { text: 'No tocar ni alterar el arte rupestre', correct: true },
        { text: 'Llevarse “un pedacito” de roca', correct: false },
        { text: 'Encender fogatas en cualquier sitio', correct: false },
        { text: 'Alimentar fauna silvestre', correct: false }
    ] },
    { id: 130, question: '¿Cuál de estas opciones describe mejor una “serranía”?', answers: [
        { text: 'Conjunto de colinas o montañas', correct: true },
        { text: 'Océano con islas', correct: false },
        { text: 'Planicie cubierta de hielo', correct: false },
        { text: 'Desierto de dunas', correct: false }
    ] },
    { id: 131, question: 'San José del Guaviare está asociado a paisajes de:', answers: [
        { text: 'Selva, sabanas y ríos', correct: true },
        { text: 'Glaciares y volcanes nevados', correct: false },
        { text: 'Acantilados marinos', correct: false },
        { text: 'Desiertos costeros', correct: false }
    ] },
    { id: 132, question: '¿Qué forma de energía renovable es comúnmente viable en zonas rurales del Guaviare?', answers: [
        { text: 'Solar', correct: true },
        { text: 'Mareomotriz (mareas)', correct: false },
        { text: 'Geotérmica de alta montaña', correct: false },
        { text: 'Energía de olas oceánicas', correct: false }
    ] },
    { id: 133, question: '¿En Colombia, qué huso horario usa San José del Guaviare?', answers: [
        { text: 'UTC−5', correct: true },
        { text: 'UTC+1', correct: false },
        { text: 'UTC+9', correct: false },
        { text: 'UTC−3', correct: false }
    ] },
    { id: 134, question: '¿Qué tipo de cuerpo de agua es el río Guaviare?', answers: [
        { text: 'Río de agua dulce', correct: true },
        { text: 'Mar interior', correct: false },
        { text: 'Golfo oceánico', correct: false },
        { text: 'Arrecife coralino', correct: false }
    ] },
    { id: 135, question: '¿Qué actividad económica suele existir en municipios amazónicos y de transición como San José del Guaviare?', answers: [
        { text: 'Comercio y servicios locales', correct: true },
        { text: 'Pesca de altura en mar', correct: false },
        { text: 'Industria naviera oceánica', correct: false },
        { text: 'Minería de carbón a gran escala en alta montaña', correct: false }
    ] },
    { id: 136, question: 'Un ejemplo de “biodiversidad” en Guaviare es:', answers: [
        { text: 'Gran variedad de plantas y animales', correct: true },
        { text: 'Un solo tipo de árbol en toda la región', correct: false },
        { text: 'Ausencia total de insectos', correct: false },
        { text: 'Solo fauna marina', correct: false }
    ] },
    { id: 137, question: '¿Qué práctica protege los ecosistemas al visitar ríos y cascadas?', answers: [
        { text: 'Usar bloqueador biodegradable y no contaminar', correct: true },
        { text: 'Lavar motos dentro del río', correct: false },
        { text: 'Botar residuos orgánicos “porque se degradan”', correct: false },
        { text: 'Usar jabón en el agua', correct: false }
    ] },
    { id: 138, question: '¿Qué tipo de turismo es más coherente con el potencial del Guaviare?', answers: [
        { text: 'Turismo de naturaleza', correct: true },
        { text: 'Turismo de nieve', correct: false },
        { text: 'Cruceros de mar', correct: false },
        { text: 'Turismo de fiordos', correct: false }
    ] },
    { id: 139, question: '¿Qué se recomienda para el avistamiento de fauna en Guaviare?', answers: [
        { text: 'Mantener distancia y silencio', correct: true },
        { text: 'Perseguir animales para fotos', correct: false },
        { text: 'Alimentarlos con snacks', correct: false },
        { text: 'Tocarlos para que “no tengan miedo”', correct: false }
    ] },
    { id: 140, question: '¿Cuál de estos lugares se asocia con la Serranía de La Lindosa en Guaviare?', answers: [
        { text: 'Ciudad de Piedra', correct: true },
        { text: 'Desierto de la Tatacoa', correct: false },
        { text: 'Salinas de Manaure', correct: false },
        { text: 'Ciénaga Grande de Santa Marta', correct: false }
    ] },
    { id: 141, question: '¿Cuál es una razón por la que se debe evitar tocar pinturas rupestres?', answers: [
        { text: 'Se deterioran con el contacto y la grasa de la piel', correct: true },
        { text: 'Porque cambian de color para siempre', correct: false },
        { text: 'Porque “se activan” alarmas automáticas', correct: false },
        { text: 'Porque son de plástico', correct: false }
    ] },
    { id: 142, question: 'En términos de división política, San José del Guaviare es un:', answers: [
        { text: 'Municipio', correct: true },
        { text: 'País', correct: false },
        { text: 'Continente', correct: false },
        { text: 'Océano', correct: false }
    ] },
    { id: 143, question: '¿Qué instrumento es común en músicas llaneras que pueden escucharse en la región?', answers: [
        { text: 'Arpa', correct: true },
        { text: 'Gaita escocesa', correct: false },
        { text: 'Balalaika', correct: false },
        { text: 'Sitar', correct: false }
    ] },
    { id: 144, question: '¿Cuál es un ejemplo de gastronomía típica de ríos amazónicos y llaneros?', answers: [
        { text: 'Pescado de río', correct: true },
        { text: 'Paella marina', correct: false },
        { text: 'Salmón ahumado nórdico', correct: false },
        { text: 'Langosta caribeña', correct: false }
    ] },
    { id: 145, question: '¿Qué elemento del paisaje suele ser protagonista en fotos de Guaviare?', answers: [
        { text: 'Rocas y ríos en selva', correct: true },
        { text: 'Rascacielos frente al mar', correct: false },
        { text: 'Dunas con camellos', correct: false },
        { text: 'Catedrales góticas nevadas', correct: false }
    ] },
    { id: 146, question: '¿Qué tipo de ropa es más adecuada para visitar San José del Guaviare?', answers: [
        { text: 'Ligera, fresca y de manga larga (protección solar)', correct: true },
        { text: 'Abrigo pesado y guantes', correct: false },
        { text: 'Traje de nieve', correct: false },
        { text: 'Traje de neopreno para agua helada', correct: false }
    ] },
    { id: 147, question: '¿Qué se debe priorizar al caminar por senderos naturales?', answers: [
        { text: 'Seguir rutas señalizadas', correct: true },
        { text: 'Abrir atajos cortando vegetación', correct: false },
        { text: 'Entrar a cuevas sin guía', correct: false },
        { text: 'Pisar nidos para “ver qué hay”', correct: false }
    ] },
    { id: 148, question: '¿Qué práctica ayuda a reducir el impacto ambiental del turista?', answers: [
        { text: 'Llevar botella reutilizable', correct: true },
        { text: 'Comprar botellas desechables para cada tramo', correct: false },
        { text: 'Usar pajillas plásticas siempre', correct: false },
        { text: 'Quemar residuos para “no cargar”', correct: false }
    ] },
    { id: 149, question: 'Si vas por un sendero en Guaviare, ¿qué es lo correcto sobre “marcar” el camino?', answers: [
        { text: 'No se marca: se sigue la señalización y la guía', correct: true },
        { text: 'Pintar flechas en las rocas con aerosol', correct: false },
        { text: 'Romper ramas para dejar “señales”', correct: false },
        { text: 'Amarrar cintas plásticas en los árboles', correct: false }
    ] },
    { id: 150, question: '¿Cuál de estos es un buen comportamiento en un área con arte rupestre?', answers: [
        { text: 'Tomar fotos sin flash y sin tocar', correct: true },
        { text: 'Raspar la roca para “ver mejor” el dibujo', correct: false },
        { text: 'Pintar encima para “resaltar”', correct: false },
        { text: 'Mojar con agua y jabón', correct: false }
    ] },
    { id: 151, question: 'San José del Guaviare es conocido como un punto de partida para explorar:', answers: [
        { text: 'La Serranía de La Lindosa y sitios naturales cercanos', correct: true },
        { text: 'Arrecifes de San Andrés', correct: false },
        { text: 'Nevados andinos', correct: false },
        { text: 'Desiertos costeros', correct: false }
    ] },
    { id: 152, question: '¿Qué opción describe mejor el turismo comunitario?', answers: [
        { text: 'Visitar con apoyo de guías y emprendimientos locales', correct: true },
        { text: 'Ignorar normas y entrar sin permiso', correct: false },
        { text: 'Comprar todo afuera y no consumir local', correct: false },
        { text: 'Evitar cualquier interacción cultural', correct: false }
    ] },
    { id: 153, question: '¿Qué objeto es útil para las caminatas en clima cálido y húmedo?', answers: [
        { text: 'Repelente de insectos', correct: true },
        { text: 'Cadena para nieve', correct: false },
        { text: 'Anticongelante para radiador', correct: false },
        { text: 'Calentador portátil', correct: false }
    ] },
    { id: 154, question: '¿Qué es una “formación rocosa” como las de La Lindosa?', answers: [
        { text: 'Estructura natural de piedra moldeada por el tiempo', correct: true },
        { text: 'Edificio construido con ladrillo', correct: false },
        { text: 'Puente metálico industrial', correct: false },
        { text: 'Muelle marítimo', correct: false }
    ] },
    { id: 155, question: '¿Qué aspecto cultural puede encontrarse en recorridos guiados del Guaviare?', answers: [
        { text: 'Relatos y memoria local sobre el territorio', correct: true },
        { text: 'Ópera vienesa del siglo XVIII como tradición principal', correct: false },
        { text: 'Fiestas de nieve', correct: false },
        { text: 'Carnavales de hielo', correct: false }
    ] },
    { id: 156, question: '¿Qué práctica apoya la conservación del agua en viajes?', answers: [
        { text: 'Reducir el uso de jabones y químicos cerca de ríos', correct: true },
        { text: 'Verter aceite de cocina en el suelo', correct: false },
        { text: 'Lavar ropa directamente en el río con detergente', correct: false },
        { text: 'Tirar colillas al agua', correct: false }
    ] },
    { id: 157, question: '¿Qué opción es un ejemplo de “senderismo”?', answers: [
        { text: 'Caminar por rutas naturales', correct: true },
        { text: 'Esquiar en nieve', correct: false },
        { text: 'Navegar en altamar', correct: false },
        { text: 'Volar en parapente sobre acantilados marinos', correct: false }
    ] },
    { id: 158, question: '¿Qué elemento ayuda a la seguridad en recorridos por naturaleza?', answers: [
        { text: 'Hidratarse y llevar agua suficiente', correct: true },
        { text: 'Evitar avisar a alguien a dónde se va', correct: false },
        { text: 'Salir sin mapa ni guía', correct: false },
        { text: 'Desestimar el clima', correct: false }
    ] },
    { id: 159, question: '¿Cuál es un ejemplo de “turismo de observación” en Guaviare?', answers: [
        { text: 'Avistamiento de aves', correct: true },
        { text: 'Carreras de trineos', correct: false },
        { text: 'Safari de camellos', correct: false },
        { text: 'Pesca en hielo', correct: false }
    ] },
    { id: 160, question: '¿Cuál es una recomendación al tomar fotos de fauna silvestre?', answers: [
        { text: 'No usar flash a corta distancia', correct: true },
        { text: 'Aproximarse hasta tocar al animal', correct: false },
        { text: 'Perseguirlo para que mire la cámara', correct: false },
        { text: 'Bloquearle el paso', correct: false }
    ] },
    { id: 161, question: '¿Qué tipo de paisaje es común al navegar por el río Guaviare?', answers: [
        { text: 'Bosques ribereños', correct: true },
        { text: 'Acantilados glaciares', correct: false },
        { text: 'Playas coralinas', correct: false },
        { text: 'Campos de hielo', correct: false }
    ] },
    { id: 162, question: '¿Qué significa “municipio capital” en Colombia?', answers: [
        { text: 'La ciudad principal donde funciona el gobierno departamental', correct: true },
        { text: 'El barrio más antiguo de un pueblo', correct: false },
        { text: 'La isla principal de un archipiélago', correct: false },
        { text: 'El punto más alto de una cordillera', correct: false }
    ] },
    { id: 163, question: '¿Cuál es una buena forma de apoyar a emprendedores locales en San José del Guaviare?', answers: [
        { text: 'Comprar artesanías y servicios de guianza local', correct: true },
        { text: 'Regatear hasta pagar casi nada', correct: false },
        { text: 'Consumir solo marcas importadas', correct: false },
        { text: 'Evitar el comercio local', correct: false }
    ] },
    { id: 164, question: '¿Qué tipo de botas son recomendables para senderos con barro o humedad?', answers: [
        { text: 'Botas de trekking', correct: true },
        { text: 'Botas de esquí', correct: false },
        { text: 'Patines de hielo', correct: false },
        { text: 'Zapatos de tacón', correct: false }
    ] },
    { id: 165, question: '¿Qué representa la biodiversidad para el turismo del Guaviare?', answers: [
        { text: 'Oportunidad de educación ambiental y conservación', correct: true },
        { text: 'Un problema que debe eliminarse', correct: false },
        { text: 'Algo exclusivo de ciudades costeras', correct: false },
        { text: 'Una tradición europea', correct: false }
    ] },
    { id: 166, question: '¿Qué es recomendable llevar en una caminata por clima tropical?', answers: [
        { text: 'Sombrero o gorra', correct: true },
        { text: 'Guantes térmicos de invierno', correct: false },
        { text: 'Botas con crampones', correct: false },
        { text: 'Bufanda de lana gruesa', correct: false }
    ] },
    { id: 167, question: '¿Qué opción describe mejor un “bosque de galería”?', answers: [
        { text: 'Bosque que acompaña el curso de un río', correct: true },
        { text: 'Bosque plantado en interiores de edificios', correct: false },
        { text: 'Bosque submarino', correct: false },
        { text: 'Bosque de hielo', correct: false }
    ] },
    { id: 168, question: '¿Qué práctica ayuda a cuidar los senderos naturales?', answers: [
        { text: 'No salirse del camino para evitar erosión', correct: true },
        { text: 'Caminar por cualquier parte “para explorar”', correct: false },
        { text: 'Arrancar plantas para despejar', correct: false },
        { text: 'Romper ramas como señal', correct: false }
    ] },
    { id: 169, question: '¿Cuál de estas actividades es compatible con el turismo sostenible?', answers: [
        { text: 'Recoger basura propia y ajena si es posible', correct: true },
        { text: 'Dejar latas porque “alguien las recoge”', correct: false },
        { text: 'Hacer grafitis en rocas', correct: false },
        { text: 'Capturar animales para selfies', correct: false }
    ] },
    { id: 170, question: '¿Qué es una “pictografía” (en arte rupestre)?', answers: [
        { text: 'Dibujo o pintura realizada en roca', correct: true },
        { text: 'Fotografía digital', correct: false },
        { text: 'Plano arquitectónico', correct: false },
        { text: 'Código de barras', correct: false }
    ] },
    { id: 171, question: '¿Qué opción describe mejor la ubicación general del Guaviare dentro de Colombia?', answers: [
        { text: 'Suroriente del país', correct: true },
        { text: 'Extremo noroccidente costero', correct: false },
        { text: 'Zona insular en el Caribe', correct: false },
        { text: 'Centro de la cordillera nevada', correct: false }
    ] },
    { id: 172, question: '¿Qué significa “ecoturismo”?', answers: [
        { text: 'Viajar con enfoque de naturaleza y conservación', correct: true },
        { text: 'Viajar solo a centros comerciales', correct: false },
        { text: 'Viajar exclusivamente en cruceros', correct: false },
        { text: 'Viajar únicamente a desiertos', correct: false }
    ] },
    { id: 173, question: '¿Qué elemento cultural puede promoverse con turismo responsable?', answers: [
        { text: 'Respeto por comunidades y conocimiento local', correct: true },
        { text: 'Imposición de costumbres externas', correct: false },
        { text: 'Burla de tradiciones', correct: false },
        { text: 'Apropiación de piezas sin permiso', correct: false }
    ] },
    { id: 174, question: '¿Qué opción es una medida básica de salud en clima cálido?', answers: [
        { text: 'Hidratación constante', correct: true },
        { text: 'Evitar beber agua todo el día', correct: false },
        { text: 'Usar ropa muy pesada', correct: false },
        { text: 'No protegerse del sol', correct: false }
    ] },
    { id: 175, question: '¿Qué tipo de actividad educativa puede hacerse en Guaviare?', answers: [
        { text: 'Interpretación ambiental con guías', correct: true },
        { text: 'Visita a estaciones de esquí', correct: false },
        { text: 'Paseos por rompehielos', correct: false },
        { text: 'Tour por fiordos árticos', correct: false }
    ] },
    { id: 176, question: '¿Qué se recomienda llevar para lluvias tropicales?', answers: [
        { text: 'Impermeable o poncho', correct: true },
        { text: 'Sombrilla de nieve', correct: false },
        { text: 'Bufanda térmica', correct: false },
        { text: 'Cadena para hielo', correct: false }
    ] },
    { id: 177, question: '¿Qué práctica ayuda a respetar el patrimonio cultural?', answers: [
        { text: 'No extraer piezas ni intervenir sitios', correct: true },
        { text: 'Coleccionar fragmentos como souvenirs', correct: false },
        { text: 'Romper rocas para “investigar”', correct: false },
        { text: 'Pintar sobre evidencias', correct: false }
    ] },
    { id: 178, question: '¿Qué tipo de agua es la de los ríos de la zona?', answers: [
        { text: 'Dulce', correct: true },
        { text: 'Salada', correct: false },
        { text: 'Carbonatada natural', correct: false },
        { text: 'De mar', correct: false }
    ] },
    { id: 179, question: '¿Qué característica es común en ríos de llanura?', answers: [
        { text: 'Curvas y meandros', correct: true },
        { text: 'Cascadas de hielo', correct: false },
        { text: 'Túneles submarinos', correct: false },
        { text: 'Arrecifes', correct: false }
    ] },
    { id: 180, question: '¿Qué tipo de turismo se relaciona con el arte rupestre de Guaviare?', answers: [
        { text: 'Turismo cultural', correct: true },
        { text: 'Turismo de playa', correct: false },
        { text: 'Turismo de nieve', correct: false },
        { text: 'Turismo de crucero', correct: false }
    ] },
    { id: 181, question: '¿Cuál de estas acciones es adecuada en un río?', answers: [
        { text: 'Nadar solo en zonas permitidas y seguras', correct: true },
        { text: 'Entrar sin evaluar corrientes', correct: false },
        { text: 'Arrojar residuos para “marcar” ruta', correct: false },
        { text: 'Lavar vehículos en el cauce', correct: false }
    ] },
    { id: 182, question: '¿Qué tipo de actividad artesanal puede encontrarse en regiones amazónicas y de transición?', answers: [
        { text: 'Artesanías con fibras naturales', correct: true },
        { text: 'Artesanías con hielo tallado', correct: false },
        { text: 'Artesanías con coral marino', correct: false },
        { text: 'Artesanías con lava volcánica reciente', correct: false }
    ] },
    { id: 183, question: '¿Qué opción es una buena práctica para proteger la fauna?', answers: [
        { text: 'No comprar productos de fauna silvestre', correct: true },
        { text: 'Comprar animales como recuerdo', correct: false },
        { text: 'Capturar mariposas para colección', correct: false },
        { text: 'Llevarse nidos para “cuidarlos”', correct: false }
    ] },
    { id: 184, question: '¿Qué se recomienda respecto al ruido en recorridos por naturaleza?', answers: [
        { text: 'Mantener volumen bajo para no espantar fauna', correct: true },
        { text: 'Poner música a todo volumen', correct: false },
        { text: 'Usar bocinas en senderos', correct: false },
        { text: 'Gritar para que “se note el grupo”', correct: false }
    ] },
    { id: 185, question: '¿Qué es una ventaja de viajar con guía local?', answers: [
        { text: 'Mejor orientación, seguridad e interpretación del lugar', correct: true },
        { text: 'Evitar cualquier norma del sitio', correct: false },
        { text: 'Entrar a zonas restringidas', correct: false },
        { text: 'No necesitar hidratación', correct: false }
    ] },
    { id: 186, question: '¿Qué práctica reduce el riesgo de perderse en senderos del Guaviare?', answers: [
        { text: 'Mantenerse con el grupo', correct: true },
        { text: 'Separarse para explorar más rápido', correct: false },
        { text: 'Apagar el teléfono siempre', correct: false },
        { text: 'Entrar sin informar a nadie', correct: false }
    ] },
    { id: 187, question: '¿Qué elemento es importante para prevenir insolación?', answers: [
        { text: 'Protector solar', correct: true },
        { text: 'Sal gruesa en la piel', correct: false },
        { text: 'Aceite de cocina', correct: false },
        { text: 'Pintura acrílica', correct: false }
    ] },
    { id: 188, question: '¿Qué opción es un ejemplo de educación ambiental?', answers: [
        { text: 'Aprender sobre especies y su conservación', correct: true },
        { text: 'Arrancar plantas para “conocerlas”', correct: false },
        { text: 'Perseguir animales para “estudiarlos”', correct: false },
        { text: 'Pintar sobre rocas para “enseñar”', correct: false }
    ] },
    { id: 189, question: '¿Qué tipo de paisaje NO es típico de San José del Guaviare?', answers: [
        { text: 'Fiordos con nieve', correct: true },
        { text: 'Ríos', correct: false },
        { text: 'Bosque tropical', correct: false },
        { text: 'Formaciones rocosas', correct: false }
    ] },
    { id: 190, question: '¿Qué modo de transporte conecta a San José del Guaviare con otras ciudades del país?', answers: [
        { text: 'Vuelos nacionales', correct: true },
        { text: 'Ferries oceánicos', correct: false },
        { text: 'Tren de alta velocidad continental', correct: false },
        { text: 'Metro submarino', correct: false }
    ] },
    { id: 191, question: '¿Cuál es un principio del “No Dejar Rastro” aplicado al Guaviare?', answers: [
        { text: 'Empacar toda la basura de vuelta', correct: true },
        { text: 'Enterrar plásticos', correct: false },
        { text: 'Quemar latas', correct: false },
        { text: 'Dejar residuos “escondidos”', correct: false }
    ] },
    { id: 192, question: 'El “Raudal del Guayabero” recibe su nombre de qué río?', answers: [
        { text: 'Río Guayabero', correct: true },
        { text: 'Río Bogotá', correct: false },
        { text: 'Río Sinú', correct: false },
        { text: 'Río San Jorge', correct: false }
    ] },
    { id: 193, question: '¿Qué Parque Nacional Natural de la región amazónica es famoso por tepuyes y arte rupestre?', answers: [
        { text: 'Serranía de Chiribiquete', correct: true },
        { text: 'Tayrona', correct: false },
        { text: 'Los Nevados', correct: false },
        { text: 'Utría', correct: false }
    ] },
    { id: 194, question: '¿Qué comportamiento es más seguro ante lluvia fuerte durante una caminata?', answers: [
        { text: 'Buscar refugio y seguir indicaciones del guía', correct: true },
        { text: 'Cruzar ríos crecidos por atajo', correct: false },
        { text: 'Ignorar el pronóstico y seguir igual', correct: false },
        { text: 'Separarse del grupo', correct: false }
    ] },
    { id: 195, question: '¿Qué opción describe mejor el “patrimonio natural” del Guaviare?', answers: [
        { text: 'Paisajes, especies y ecosistemas que se deben cuidar', correct: true },
        { text: 'Solo edificios modernos', correct: false },
        { text: 'Solo centros comerciales', correct: false },
        { text: 'Solo carreteras', correct: false }
    ] },
    { id: 196, question: '¿Qué se recomienda respecto a fogatas en zonas naturales?', answers: [
        { text: 'Evitar hacerlas y seguir normas del lugar', correct: true },
        { text: 'Hacer fogatas en cualquier parte', correct: false },
        { text: 'Encender fuego cerca de rocas con pictografías', correct: false },
        { text: 'Quemar residuos plásticos', correct: false }
    ] },
    { id: 197, question: '¿Qué es una “ruta turística” de naturaleza?', answers: [
        { text: 'Recorrido planificado por sitios de interés natural', correct: true },
        { text: 'Autopista marítima', correct: false },
        { text: 'Línea de tren subterráneo', correct: false },
        { text: 'Puente colgante sobre el océano', correct: false }
    ] },
    { id: 198, question: '¿Qué tipo de paisaje ayuda a explicar por qué hay arte rupestre en la zona?', answers: [
        { text: 'Rocas expuestas adecuadas para pinturas', correct: true },
        { text: 'Hielo permanente', correct: false },
        { text: 'Corales marinos', correct: false },
        { text: 'Arena de desierto costero', correct: false }
    ] },
    { id: 199, question: '¿Cuál es una recomendación para proteger equipos electrónicos por la humedad?', answers: [
        { text: 'Usar bolsa impermeable o funda', correct: true },
        { text: 'Sumergirlos para “enfriar”', correct: false },
        { text: 'Dejarlos expuestos a la lluvia', correct: false },
        { text: 'Guardarlos con agua dentro', correct: false }
    ] },
    { id: 200, question: '¿Qué tipo de paisaje NO corresponde a una serranía como La Lindosa?', answers: [
        { text: 'Arrecife coralino', correct: true },
        { text: 'Afloramientos de roca', correct: false },
        { text: 'Colinas', correct: false },
        { text: 'Miradores naturales', correct: false }
    ] },
    { id: 201, question: '¿Qué valor tiene el arte rupestre para la historia?', answers: [
        { text: 'Aporta información sobre comunidades antiguas', correct: true },
        { text: 'Sirve solo como decoración moderna', correct: false },
        { text: 'Es publicidad reciente', correct: false },
        { text: 'No tiene relevancia cultural', correct: false }
    ] },
    { id: 202, question: '¿Cuál de estas acciones ayuda a conservar los sitios turísticos?', answers: [
        { text: 'Respetar capacidad de carga y normas', correct: true },
        { text: 'Entrar en grupos enormes sin control', correct: false },
        { text: 'Dejar basura “biodegradable”', correct: false },
        { text: 'Arrancar señalización', correct: false }
    ] },
    { id: 203, question: '¿Qué se recomienda para caminar en zonas con insectos?', answers: [
        { text: 'Usar ropa de manga larga y repelente', correct: true },
        { text: 'Usar perfume fuerte para atraerlos', correct: false },
        { text: 'Dormir sin toldillo en zonas rurales', correct: false },
        { text: 'No llevar agua', correct: false }
    ] },
    { id: 204, question: '¿Qué elemento es clave para el turismo seguro en ríos y cascadas?', answers: [
        { text: 'Evaluar corrientes y seguir recomendaciones locales', correct: true },
        { text: 'Saltar desde cualquier altura sin revisar', correct: false },
        { text: 'Nadar de noche sin guía', correct: false },
        { text: 'Ir solo y sin comunicación', correct: false }
    ] },
    { id: 205, question: '¿Qué tipo de actividad promueve la economía local de San José del Guaviare?', answers: [
        { text: 'Servicios turísticos (guías, hospedaje, alimentos)', correct: true },
        { text: 'Cruceros internacionales', correct: false },
        { text: 'Pesca industrial de altamar', correct: false },
        { text: 'Esquí en estaciones alpinas', correct: false }
    ] },
    { id: 206, question: '¿Cuál es una característica típica de los ríos amazónicos y de transición?', answers: [
        { text: 'Gran caudal en temporadas lluviosas', correct: true },
        { text: 'Agua salada por mareas', correct: false },
        { text: 'Icebergs todo el año', correct: false },
        { text: 'Olas oceánicas', correct: false }
    ] },
    { id: 207, question: '¿Qué opción describe mejor una visita respetuosa a comunidades?', answers: [
        { text: 'Pedir permiso y seguir acuerdos locales', correct: true },
        { text: 'Entrar sin avisar y grabar todo', correct: false },
        { text: 'Tomar fotos de personas sin consentimiento', correct: false },
        { text: 'Imponer reglas propias', correct: false }
    ] },
    { id: 208, question: '¿Qué elemento natural puede servir como “mirador” en zonas rocosas?', answers: [
        { text: 'Elevaciones y afloramientos de roca', correct: true },
        { text: 'Arrecifes submarinos', correct: false },
        { text: 'Glaciares costeros', correct: false },
        { text: 'Campos de nieve', correct: false }
    ] },
    { id: 209, question: '¿Qué tipo de relación tiene San José del Guaviare con el río Guaviare?', answers: [
        { text: 'Río cercano clave para paisaje y actividades', correct: true },
        { text: 'Es un río marítimo con mareas', correct: false },
        { text: 'Es un río de agua salada', correct: false },
        { text: 'Es un río congelado la mayor parte del año', correct: false }
    ] },
    { id: 210, question: '¿Qué conducta refleja turismo responsable en San José del Guaviare?', answers: [
        { text: 'Respetar naturaleza, cultura y normas locales', correct: true },
        { text: 'Dejar residuos para “no cargar peso”', correct: false },
        { text: 'Tocar y rayar rocas para “recuerdo”', correct: false },
        { text: 'Molestar fauna para fotos', correct: false }
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

watchAdButton?.addEventListener('click', async () => {
    // Mostrar video y forzar que se vea completo para otorgar la vida
    if (!adVideo) return;
    watchAdButton.disabled = true;
    adVideo.classList.remove('hidden');
    try {
        // Algunos navegadores requieren interacción del usuario; el click ya cuenta.
        await adVideo.play();
    } catch (_) {
        // Si no puede reproducir automáticamente, el usuario puede darle play manual.
    }
});

adVideo?.addEventListener('ended', () => {
    // Otorga UNA vida extra solo una vez.
    if (extraLifeUsed) return;
    extraLifeUsed = true;
    awaitingRevive = false;
    lives = Math.min(lives + 1, MAX_LIVES);
    updateLivesUI();
    hideExtraLifeOffer();

    // Si el juego estaba pausado por 0 vidas, permitir continuar.
    if (shuffledQuestions && typeof currentQuestionIndex === 'number') {
        if (shuffledQuestions.length > currentQuestionIndex + 1) {
            nextButton.classList.remove('hidden');
        } else {
            setTimeout(showRewards, 400);
        }
    }

    // Preparar el video por si se vuelve a mostrar el contenedor (no se otorgará otra vida)
    adVideo.currentTime = 0;
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

    lives = MAX_LIVES;
    extraLifeUsed = false;
    awaitingRevive = false;
    updateLivesUI();
    hideExtraLifeOffer();

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
    } else {
        loseLife();
    }

    // Si el usuario quedó sin vidas, dar opción de video (una sola vez). Si no, termina.
    if (lives <= 0) {
        if (!extraLifeUsed) {
            awaitingRevive = true;
            showExtraLifeOffer('😵 Te quedaste sin vidas. Mira el video completo para ganar 1 vida extra y continuar.');
            return;
        }
        setTimeout(showRewards, 800);
        return;
    }

    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hidden');
    } else {
        setTimeout(showRewards, 1000); // Esperar un poco antes de mostrar premios
    }
}

function loseLife() {
    lives = Math.max(0, lives - 1);
    updateLivesUI();

    // Mostrar opción de vida extra cuando haya perdido al menos 1 vida
    if (!extraLifeUsed && lives > 0 && lives < MAX_LIVES) {
        showExtraLifeOffer('🎬 Mira el video completo para recuperar 1 vida.');
    }
}

function updateLivesUI() {
    if (!livesDisplay) return;
    livesDisplay.innerText = `${lives}`;
}

function showExtraLifeOffer(message) {
    if (!extraLifeContainer) return;
    extraLifeText && (extraLifeText.innerText = message);
    extraLifeContainer.classList.remove('hidden');

    if (watchAdButton) {
        watchAdButton.disabled = false;
        watchAdButton.classList.toggle('hidden', extraLifeUsed);
    }

    if (adVideo) {
        adVideo.classList.add('hidden');
        adVideo.currentTime = 0;
    }
}

function hideExtraLifeOffer() {
    if (!extraLifeContainer) return;
    extraLifeContainer.classList.add('hidden');
    if (adVideo) {
        adVideo.pause();
        adVideo.classList.add('hidden');
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
