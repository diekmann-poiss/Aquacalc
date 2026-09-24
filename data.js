// ============================================
// AquaCalc Data
// Created by Max Poiss
// ============================================

// Climate Data: [Jan-Dec ET0, Jan-Dec Rainfall]
// All values in mm
// Sources: FAO CLIMWAT, GeoSphere Austria, DWD, regional patterns
const climateData = {
    // AUSTRIA
    'Wien': [15, 25, 60, 95, 125, 155, 165, 140, 95, 55, 25, 15, 45, 40, 45, 50, 60, 75, 80, 75, 65, 55, 50, 45],
    'Graz': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 40, 35, 40, 45, 55, 65, 70, 65, 55, 45, 40, 35],
    'Linz': [12, 22, 58, 92, 122, 152, 162, 138, 92, 52, 22, 12, 50, 45, 50, 55, 65, 80, 85, 80, 70, 60, 50, 45],
    'Salzburg': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 55, 50, 55, 60, 70, 80, 85, 75, 65, 55, 50, 45],
    'Innsbruck': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 50, 45, 45, 50, 60, 70, 75, 70, 60, 50, 45, 40],
    'Klagenfurt': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 40, 45, 50, 60, 70, 75, 70, 60, 50, 45, 40],
    'Bregenz': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 60, 55, 60, 65, 75, 85, 90, 80, 70, 60, 50, 45],
    'Eisenstadt': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 40, 45, 50, 60, 70, 75, 70, 60, 50, 45, 40],
    'St. Pölten': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 40, 45, 50, 60, 70, 75, 70, 60, 50, 45, 40],
    
    // GERMANY
    'Berlin': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 40, 35, 40, 45, 60, 70, 75, 70, 60, 50, 45, 40],
    'Hamburg': [8, 18, 45, 80, 110, 140, 150, 125, 80, 40, 18, 8, 50, 40, 45, 50, 60, 75, 80, 75, 65, 55, 50, 45],
    'Munich': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 55, 50, 60, 75, 95, 105, 110, 90, 70, 60, 50, 45],
    'Cologne': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 40, 45, 50, 60, 75, 80, 70, 60, 50, 45, 40],
    'Frankfurt': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 40, 35, 45, 55, 70, 75, 80, 65, 55, 50, 45, 40],
    'Stuttgart': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 40, 50, 60, 75, 85, 90, 75, 65, 55, 50, 45],
    'Düsseldorf': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 50, 40, 50, 60, 70, 80, 85, 70, 60, 50, 45, 40],
    
    // SWITZERLAND
    'Zürich': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 60, 50, 60, 70, 85, 95, 100, 85, 75, 65, 55, 50],
    'Basel': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 50, 45, 50, 60, 75, 85, 90, 80, 70, 60, 50, 45],
    'Geneva': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 65, 55, 60, 70, 80, 85, 90, 80, 70, 60, 55, 50],
    
    // EUROPE - Other
    'Amsterdam': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 60, 45, 50, 55, 65, 70, 75, 70, 65, 60, 55, 50],
    'Brussels': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 65, 55, 60, 65, 70, 75, 80, 75, 70, 65, 60, 55],
    'Paris': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 50, 45, 50, 60, 70, 75, 80, 70, 60, 50, 45, 40],
    'London': [8, 18, 45, 80, 110, 140, 150, 125, 80, 40, 18, 8, 60, 55, 50, 55, 60, 65, 70, 65, 60, 55, 50, 45],
    'Madrid': [15, 25, 60, 95, 125, 155, 165, 140, 95, 55, 25, 15, 35, 35, 40, 45, 50, 15, 10, 25, 40, 55, 55, 45],
    'Barcelona': [15, 25, 60, 95, 125, 155, 165, 140, 95, 55, 25, 15, 40, 35, 40, 50, 45, 25, 20, 50, 65, 60, 55, 45],
    'Rome': [15, 25, 60, 95, 125, 155, 165, 140, 95, 55, 25, 15, 70, 60, 60, 50, 35, 20, 25, 50, 80, 90, 85, 70],
    'Milan': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 60, 55, 65, 80, 90, 75, 65, 60, 70, 80, 75, 65],
    'Prague': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 40, 35, 40, 55, 70, 75, 80, 65, 55, 50, 45, 40],
    'Warsaw': [8, 18, 50, 85, 115, 145, 155, 130, 85, 45, 18, 8, 40, 35, 35, 45, 60, 70, 75, 60, 50, 40, 35, 30],
    'Copenhagen': [8, 18, 45, 80, 110, 140, 150, 125, 80, 40, 18, 8, 45, 40, 40, 45, 55, 65, 70, 65, 60, 55, 50, 45],
    'Lisbon': [15, 25, 60, 95, 125, 155, 165, 140, 95, 55, 25, 15, 100, 80, 70, 45, 20, 5, 5, 15, 60, 90, 110, 100],
    
    // Add more cities as needed
};

// Kc Profiles for each plant
// Values for Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
const kcProfiles = {
    'Rasen cool-season (sunny)': [0.7, 0.7, 0.8, 0.95, 1.0, 1.05, 1.05, 1.0, 0.9, 0.8, 0.75, 0.7],
    'Rasen warm-season (sunny)': [0.4, 0.45, 0.6, 0.75, 0.9, 1.0, 1.05, 1.0, 0.85, 0.65, 0.5, 0.4],
    'Stauden sonnig': [0.6, 0.6, 0.7, 0.8, 0.9, 0.95, 0.95, 0.9, 0.8, 0.7, 0.65, 0.6],
    'Stauden halbschatten': [0.5, 0.5, 0.6, 0.7, 0.8, 0.85, 0.85, 0.8, 0.7, 0.6, 0.55, 0.5],
    'Bodendecker': [0.5, 0.5, 0.6, 0.7, 0.8, 0.85, 0.85, 0.8, 0.7, 0.6, 0.55, 0.5],
    'Strauch immergrün': [0.45, 0.45, 0.55, 0.65, 0.75, 0.8, 0.8, 0.75, 0.65, 0.55, 0.5, 0.45],
    'Strauch laubabwerfend': [0.35, 0.35, 0.5, 0.65, 0.75, 0.8, 0.8, 0.75, 0.6, 0.5, 0.4, 0.35],
    'Sukkulenten/Xerophyten': [0.25, 0.25, 0.3, 0.35, 0.4, 0.45, 0.45, 0.4, 0.35, 0.3, 0.3, 0.25],
    'Kletterpflanzen (Efeu/Wilder Wein)': [0.3, 0.3, 0.4, 0.6, 0.7, 0.8, 0.8, 0.75, 0.65, 0.5, 0.4, 0.3],
    'Kletterpflanzen (Kletterrose)': [0.3, 0.3, 0.4, 0.6, 0.7, 0.7, 0.7, 0.65, 0.55, 0.45, 0.35, 0.3],
    'Kletterpflanzen (Clematis)': [0.25, 0.25, 0.35, 0.5, 0.6, 0.6, 0.6, 0.55, 0.5, 0.4, 0.3, 0.25],
    'Kletterpflanzen (Weinrebe)': [0.2, 0.2, 0.3, 0.5, 0.6, 0.7, 0.7, 0.65, 0.55, 0.4, 0.3, 0.2],
    'Baum (jung, 1-5 Jahre)': [0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.65, 0.6, 0.5, 0.4, 0.3, 0.2],
    'Baum (Laubbaum, ausgewachsen)': [0.3, 0.3, 0.4, 0.6, 0.75, 0.85, 0.9, 0.85, 0.7, 0.55, 0.4, 0.3],
    'Baum (Nadelbaum, ausgewachsen)': [0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4],
};

// Preset plant selections mapping to Kc profiles
const presets = {
    'street_trees': 'Baum (Laubbaum, ausgewachsen)',
    'conifers': 'Baum (Nadelbaum, ausgewachsen)',
    'climbers': 'Kletterpflanzen (Efeu/Wilder Wein)',
    'hedges': 'Strauch immergrün',
    'ground_cover': 'Bodendecker',
    'ornamental_grasses': 'Stauden sonnig',
    'perennials_wet': 'Stauden sonnig',
    'perennials_medium': 'Stauden halbschatten',
    'perennials_dry': 'Sukkulenten/Xerophyten',
    'lawn': 'Rasen cool-season (sunny)',
    'seasonal_bedding': 'Stauden sonnig',
    'grapevines': 'Kletterpflanzen (Weinrebe)',
};

// English plant names for display
const plantNamesEN = {
    'Rasen cool-season (sunny)': 'Cool Season Grass (sunny)',
    'Rasen warm-season (sunny)': 'Warm Season Grass (sunny)',
    'Stauden sonnig': 'Herbaceous Perennials (sunny)',
    'Stauden halbschatten': 'Herbaceous Perennials (semi-shade)',
    'Bodendecker': 'Ground Cover',
    'Strauch immergrün': 'Evergreen Shrubs',
    'Strauch laubabwerfend': 'Deciduous Shrubs',
    'Sukkulenten/Xerophyten': 'Succulents/Xerophytes',
    'Kletterpflanzen (Efeu/Wilder Wein)': 'Climbing Plants (Ivy/Wild Vine)',
    'Kletterpflanzen (Kletterrose)': 'Climbing Rose',
    'Kletterpflanzen (Clematis)': 'Clematis',
    'Kletterpflanzen (Weinrebe)': 'Grapevine',
    'Baum (jung, 1-5 Jahre)': 'Young Tree (1-5 years)',
    'Baum (Laubbaum, ausgewachsen)': 'Mature Deciduous Tree',
    'Baum (Nadelbaum, ausgewachsen)': 'Mature Conifer',
};

// Situation demand and rain factors
const situationFactors = {
    'open': { demand: 1.0, rain: 1.0 },
    'wall': { demand: 1.15, rain: 0.75 },
    'overhang': { demand: 1.0, rain: 0.3 },
    'roofed': { demand: 0.9, rain: 0.0 },
    'shaded': { demand: 0.7, rain: 0.9 },
};

// Irrigation types and their days per week
const irrigationTypes = {
    'drip': { daysPerWeek: 5, name: 'Drip line', flowRate: { 2: 1.6, 4: 2.0, 6: 2.4 } },
    'soaker': { daysPerWeek: 4, name: 'Soaker hose', flowRate: { 2: 2.5, 4: 3.0, 6: 3.5 } },
    'micro': { daysPerWeek: 3, name: 'Micro-sprayer', flowRate: { 2: 40, 4: 50, 6: 60 } },
    'sprinkler': { daysPerWeek: 2, name: 'Pop-up sprinkler', flowRate: { 2: 100, 4: 120, 6: 140 } },
};

// Month names
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Countries and their cities
const citiesByCountry = {
    'AT': ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Bregenz', 'Eisenstadt', 'St. Pölten'],
    'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Hanover', 'Bremen', 'Leipzig', 'Dresden', 'Nuremberg', 'Duesseldorf'],
    'CH': ['Zürich', 'Basel', 'Geneva', 'Bern', 'Lausanne', 'Winterthur', 'Lugano', 'Lucerne'],
    'other': ['Amsterdam', 'Brussels', 'Paris', 'London', 'Madrid', 'Barcelona', 'Rome', 'Milan', 'Prague', 'Warsaw', 'Copenhagen', 'Lisbon', 'Athens', 'Istanbul'],
    'world': ['New York', 'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Mexico City', 'Sao Paulo', 'Buenos Aires', 'Cape Town', 'Johannesburg', 'Nairobi', 'Cairo', 'Lagos', 'Riyadh', 'Dubai', 'Mumbai', 'Delhi', 'Bangkok', 'Singapore', 'Tokyo', 'Sydney', 'Auckland'],
};

// English translations for UI
const translations = {
    en: {
        site: 'Site',
        plant: 'Plant',
        results: 'Results',
        projects: 'Projects',
        selectCountry: 'Select Country',
        selectCity: 'Select City',
        selectPlant: 'Select Plant',
        area: 'Area (m²)',
        situation: 'Planting Situation',
        open: 'Open',
        wall: 'Against a Wall',
        overhang: 'Under an Overhang',
        roofed: 'Roofed',
        shaded: 'Shaded / North Side',
        calculate: 'Calculate',
        annualWater: 'Annual Water Need',
        peakMonth: 'Peak Month',
        peakNeed: 'Peak Month Need',
    },
    de: {
        site: 'Standort',
        plant: 'Pflanze',
        results: 'Ergebnisse',
        projects: 'Projekte',
        selectCountry: 'Land auswählen',
        selectCity: 'Stadt auswählen',
        selectPlant: 'Pflanze auswählen',
        area: 'Fläche (m²)',
        situation: 'Pflanzsituation',
        open: 'Frei',
        wall: 'An der Wand',
        overhang: 'Unter einem Vorsprung',
        roofed: 'Überdacht',
        shaded: 'Schatten / Nordseite',
        calculate: 'Berechnen',
        annualWater: 'Jährlicher Wasserbedarf',
        peakMonth: 'Spitzenmonat',
        peakNeed: 'Spitzenmonatsbedarf',
    },
    es: {
        site: 'Sitio',
        plant: 'Planta',
        results: 'Resultados',
        projects: 'Proyectos',
        selectCountry: 'Seleccionar país',
        selectCity: 'Seleccionar ciudad',
        selectPlant: 'Seleccionar planta',
        area: 'Área (m²)',
        situation: 'Situación de plantación',
        open: 'Abierto',
        wall: 'Contra una pared',
        overhang: 'Bajo un alero',
        roofed: 'Cubierto',
        shaded: 'Sombra / Lado norte',
        calculate: 'Calcular',
        annualWater: 'Necesidad anual de agua',
        peakMonth: 'Mes pico',
        peakNeed: 'Necesidad del mes pico',
    },
};
