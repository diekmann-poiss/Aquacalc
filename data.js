// ============================================
// DATA FOR AQUACALC
// ============================================

// Climate data: [ET0_Jan, ET0_Feb, ..., ET0_Dec, Rain_Jan, Rain_Feb, ..., Rain_Dec]
const climateData = {
    'Wien': [15, 25, 60, 95, 125, 155, 165, 140, 95, 55, 25, 15, 36, 36, 43, 48, 69, 72, 75, 69, 60, 51, 51, 43],
    'Graz': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 40, 40, 50, 60, 75, 85, 90, 80, 70, 60, 50, 45],
    'Linz': [12, 22, 58, 92, 122, 152, 162, 138, 92, 52, 22, 12, 45, 45, 55, 65, 80, 90, 95, 85, 75, 65, 55, 50],
    'Salzburg': [10, 20, 50, 85, 115, 145, 155, 130, 85, 45, 20, 10, 50, 50, 60, 75, 95, 105, 110, 100, 85, 75, 65, 55],
    'Innsbruck': [8, 18, 45, 80, 110, 140, 150, 125, 80, 40, 18, 8, 55, 55, 65, 80, 100, 115, 120, 110, 90, 80, 70, 60],
    'Klagenfurt': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 45, 55, 70, 85, 95, 100, 90, 80, 70, 60, 50],
    'Eisenstadt': [14, 24, 58, 93, 123, 153, 163, 138, 93, 53, 23, 14, 38, 38, 45, 50, 70, 75, 80, 70, 60, 50, 45, 40],
    'Bregenz': [8, 18, 45, 80, 110, 140, 150, 125, 80, 40, 18, 8, 60, 60, 70, 85, 105, 120, 125, 115, 95, 85, 75, 65],
    'St. Pölten': [14, 24, 58, 93, 123, 153, 163, 138, 93, 53, 23, 14, 40, 40, 50, 60, 75, 85, 90, 80, 70, 60, 50, 45],
    'Berlin': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 40, 35, 40, 40, 55, 65, 70, 60, 50, 45, 45, 40],
    'Hamburg': [8, 18, 45, 80, 110, 140, 150, 125, 80, 40, 18, 8, 50, 40, 45, 50, 60, 75, 80, 75, 65, 55, 50, 45],
    'Köln': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 45, 40, 45, 50, 65, 75, 80, 70, 60, 50, 45, 40],
    'Leipzig': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 40, 35, 40, 45, 60, 70, 75, 65, 55, 45, 40, 35],
    'Basel': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 50, 45, 50, 60, 75, 85, 90, 80, 70, 60, 50, 45],
    'Lugano': [12, 22, 58, 92, 122, 152, 162, 138, 92, 52, 22, 12, 100, 80, 100, 120, 140, 150, 140, 120, 100, 80, 70, 60],
    'Zürich': [10, 20, 55, 90, 120, 150, 160, 135, 90, 50, 20, 10, 60, 50, 60, 70, 85, 95, 100, 85, 75, 65, 55, 50],
    'Bern': [10, 20, 50, 85, 115, 145, 155, 130, 85, 45, 20, 10, 60, 55, 65, 80, 95, 105, 110, 90, 75, 65, 55, 50]
};

// Cities by country
const citiesByCountry = {
    'AT': ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Eisenstadt', 'Bregenz', 'St. Pölten'],
    'DE': ['Berlin', 'Hamburg', 'Köln', 'Leipzig'],
    'CH': ['Basel', 'Lugano', 'Zürich', 'Bern']
};

// Kc profiles for each plant
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
    'Baum (Nadelbaum, ausgewachsen)': [0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4]
};

// English plant names
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
    'Baum (Nadelbaum, ausgewachsen)': 'Mature Conifer'
};

// Situation demand and rain factors
const situationFactors = {
    'open': { demand: 1.0, rain: 1.0 },
    'wall': { demand: 1.15, rain: 0.75 },
    'overhang': { demand: 1.0, rain: 0.3 },
    'roofed': { demand: 0.9, rain: 0.0 },
    'shaded': { demand: 0.7, rain: 0.9 }
};

// Irrigation types and their days per week
const irrigationTypes = {
    'drip': { daysPerWeek: 5, name: 'Drip line' },
    'soaker': { daysPerWeek: 4, name: 'Soaker hose' },
    'micro': { daysPerWeek: 3, name: 'Micro-sprayer' },
    'sprinkler': { daysPerWeek: 2, name: 'Pop-up sprinkler' }
};

// Flow rates at different pressures (litres per hour per emitter)
// These are approximate values for typical systems
const flowRates = {
    'drip': { 2: 1.6, 4: 2.0, 6: 2.4 },
    'soaker': { 2: 2.5, 4: 3.0, 6: 3.5 },
    'micro': { 2: 40, 4: 50, 6: 60 },
    'sprinkler': { 2: 100, 4: 120, 6: 140 }
};

// Preset plant selections
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
    'grapevines': 'Kletterpflanzen (Weinrebe)'
};

// Month names
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Season definitions
const seasons = {
    spring: { months: ['Mar', 'Apr', 'May'], name: 'Spring' },
    summer: { months: ['Jun', 'Jul', 'Aug'], name: 'Summer' },
    autumn: { months: ['Sep', 'Oct', 'Nov'], name: 'Autumn' },
    winter: { months: ['Dec', 'Jan', 'Feb'], name: 'Winter' }
};
