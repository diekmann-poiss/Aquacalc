// ============================================
// AquaCalc Data - API-Only Version
// FAO-56 Irrigation Water Calculator
// Created by Max Poiss
// Uses Open-Meteo API for all climate data
// ============================================

var cityCoordinates = {
    // AUSTRIA
    'Wien': { latitude: 48.2082, longitude: 16.3738 },
    'Graz': { latitude: 47.0707, longitude: 15.4395 },
    'Linz': { latitude: 48.3064, longitude: 14.2858 },
    'Salzburg': { latitude: 47.8095, longitude: 13.0550 },
    'Innsbruck': { latitude: 47.2692, longitude: 11.3924 },
    'Klagenfurt': { latitude: 46.6359, longitude: 14.3119 },
    'Bregenz': { latitude: 47.5042, longitude: 9.7476 },
    'Eisenstadt': { latitude: 47.8475, longitude: 16.5220 },
    'St. Poelten': { latitude: 48.2050, longitude: 15.6121 },
    
    // GERMANY
    'Berlin': { latitude: 52.5200, longitude: 13.4050 },
    'Hamburg': { latitude: 53.5511, longitude: 9.9937 },
    'Munich': { latitude: 48.1351, longitude: 11.5820 },
    'Cologne': { latitude: 50.9375, longitude: 6.9603 },
    'Frankfurt': { latitude: 50.1109, longitude: 8.6821 },
    'Stuttgart': { latitude: 48.7758, longitude: 9.1829 },
    'Duesseldorf': { latitude: 51.2277, longitude: 6.7735 },
    'Dortmund': { latitude: 51.5136, longitude: 7.4653 },
    'Hanover': { latitude: 52.3759, longitude: 9.7320 },
    'Bremen': { latitude: 53.0793, longitude: 8.8017 },
    'Leipzig': { latitude: 51.3397, longitude: 12.3731 },
    'Dresden': { latitude: 51.0504, longitude: 13.7373 },
    'Nuremberg': { latitude: 49.4521, longitude: 11.0767 },
    
    // SWITZERLAND
    'Zuerich': { latitude: 47.3769, longitude: 8.5417 },
    'Basel': { latitude: 47.5584, longitude: 7.5873 },
    'Geneva': { latitude: 46.2044, longitude: 6.1432 },
    'Bern': { latitude: 46.9481, longitude: 7.4474 },
    'Lausanne': { latitude: 46.5197, longitude: 6.6323 },
    'Winterthur': { latitude: 47.4995, longitude: 8.7358 },
    'Lugano': { latitude: 46.0034, longitude: 8.9510 },
    
    // EUROPE
    'Amsterdam': { latitude: 52.3676, longitude: 4.9041 },
    'Brussels': { latitude: 50.8503, longitude: 4.3517 },
    'Paris': { latitude: 48.8566, longitude: 2.3522 },
    'London': { latitude: 51.5074, longitude: -0.1278 },
    'Madrid': { latitude: 40.4168, longitude: -3.7038 },
    'Barcelona': { latitude: 41.3851, longitude: 2.1734 },
    'Rome': { latitude: 41.9028, longitude: 12.4964 },
    'Milan': { latitude: 45.4642, longitude: 9.1900 },
    'Prague': { latitude: 50.0755, longitude: 14.4378 },
    'Warsaw': { latitude: 52.2297, longitude: 21.0122 },
    'Copenhagen': { latitude: 55.6761, longitude: 12.5683 },
    'Lisbon': { latitude: 38.7223, longitude: -9.1393 },
    'Athens': { latitude: 37.9838, longitude: 23.7275 },
    'Istanbul': { latitude: 41.0082, longitude: 28.9784 },
    
    // NORTH AMERICA
    'New York': { latitude: 40.7128, longitude: -74.0060 },
    'Los Angeles': { latitude: 34.0522, longitude: -118.2437 },
    'Chicago': { latitude: 41.8781, longitude: -87.6298 },
    'Toronto': { latitude: 43.6511, longitude: -79.3470 },
    'Vancouver': { latitude: 49.2827, longitude: -123.1207 },
    
    // SOUTH AMERICA
    'Sao Paulo': { latitude: -23.5505, longitude: -46.6333 },
    'Buenos Aires': { latitude: -34.6037, longitude: -58.3816 },
    
    // AFRICA
    'Cape Town': { latitude: -33.9249, longitude: 18.4241 },
    'Johannesburg': { latitude: -26.2041, longitude: 28.0473 },
    'Nairobi': { latitude: -1.2921, longitude: 36.8219 },
    'Cairo': { latitude: 30.0444, longitude: 31.2357 },
    'Lagos': { latitude: 6.5244, longitude: 3.3792 },
    
    // MIDDLE EAST
    'Riyadh': { latitude: 24.7136, longitude: 46.6753 },
    'Dubai': { latitude: 25.2048, longitude: 55.2708 },
    
    // ASIA
    'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'Delhi': { latitude: 28.7041, longitude: 77.1025 },
    'Bangkok': { latitude: 13.7563, longitude: 100.5018 },
    'Singapore': { latitude: 1.3521, longitude: 103.8198 },
    'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
    
    // AUSTRALIA
    'Sydney': { latitude: -33.8688, longitude: 151.2093 },
    'Auckland': { latitude: -36.8485, longitude: 174.7633 },
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Kc Profiles for each plant
// Values for Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var kcProfiles = {
    'Rasen cool-season (sunny)': [0.70, 0.70, 0.80, 0.95, 1.00, 1.05, 1.05, 1.00, 0.90, 0.80, 0.75, 0.70],
    'Rasen warm-season (sunny)': [0.40, 0.45, 0.60, 0.75, 0.90, 1.00, 1.05, 1.00, 0.85, 0.65, 0.50, 0.40],
    'Stauden sonnig': [0.60, 0.60, 0.70, 0.80, 0.90, 0.95, 0.95, 0.90, 0.80, 0.70, 0.65, 0.60],
    'Stauden halbschatten': [0.50, 0.50, 0.60, 0.70, 0.80, 0.85, 0.85, 0.80, 0.70, 0.60, 0.55, 0.50],
    'Bodendecker': [0.50, 0.50, 0.60, 0.70, 0.80, 0.85, 0.85, 0.80, 0.70, 0.60, 0.55, 0.50],
    'Strauch immergrn': [0.45, 0.45, 0.55, 0.65, 0.75, 0.80, 0.80, 0.75, 0.65, 0.55, 0.50, 0.45],
    'Strauch laubabwerfend': [0.35, 0.35, 0.50, 0.65, 0.75, 0.80, 0.80, 0.75, 0.60, 0.50, 0.40, 0.35],
    'Sukkulenten/Xerophyten': [0.25, 0.25, 0.30, 0.35, 0.40, 0.45, 0.45, 0.40, 0.35, 0.30, 0.30, 0.25],
    'Kletterpflanzen (Efeu/Wilder Wein)': [0.30, 0.30, 0.40, 0.60, 0.70, 0.80, 0.80, 0.75, 0.65, 0.50, 0.40, 0.30],
    'Kletterpflanzen (Kletterrose)': [0.30, 0.30, 0.40, 0.60, 0.70, 0.70, 0.70, 0.65, 0.55, 0.45, 0.35, 0.30],
    'Kletterpflanzen (Clematis)': [0.25, 0.25, 0.35, 0.50, 0.60, 0.60, 0.60, 0.55, 0.50, 0.40, 0.30, 0.25],
    'Kletterpflanzen (Weinrebe)': [0.20, 0.20, 0.30, 0.50, 0.60, 0.70, 0.70, 0.65, 0.55, 0.40, 0.30, 0.20],
    'Baum (jung, 1-5 Jahre)': [0.20, 0.20, 0.30, 0.40, 0.50, 0.60, 0.65, 0.60, 0.50, 0.40, 0.30, 0.20],
    'Baum (Laubbaum, ausgewachsen)': [0.30, 0.30, 0.40, 0.60, 0.75, 0.85, 0.90, 0.85, 0.70, 0.55, 0.40, 0.30],
    'Baum (Nadelbaum, ausgewachsen)': [0.40, 0.40, 0.50, 0.60, 0.70, 0.80, 0.85, 0.80, 0.70, 0.60, 0.50, 0.40],
    
    // English translations of German profiles
    'Cool Season Grass (sunny)': [0.70, 0.70, 0.80, 0.95, 1.00, 1.05, 1.05, 1.00, 0.90, 0.80, 0.75, 0.70],
    'Warm Season Grass (sunny)': [0.40, 0.45, 0.60, 0.75, 0.90, 1.00, 1.05, 1.00, 0.85, 0.65, 0.50, 0.40],
    'Herbaceous Perennials (sunny)': [0.60, 0.60, 0.70, 0.80, 0.90, 0.95, 0.95, 0.90, 0.80, 0.70, 0.65, 0.60],
    'Herbaceous Perennials (semi-shade)': [0.50, 0.50, 0.60, 0.70, 0.80, 0.85, 0.85, 0.80, 0.70, 0.60, 0.55, 0.50],
    'Ground Cover': [0.50, 0.50, 0.60, 0.70, 0.80, 0.85, 0.85, 0.80, 0.70, 0.60, 0.55, 0.50],
    'Evergreen Shrubs': [0.45, 0.45, 0.55, 0.65, 0.75, 0.80, 0.80, 0.75, 0.65, 0.55, 0.50, 0.45],
    'Deciduous Shrubs': [0.35, 0.35, 0.50, 0.65, 0.75, 0.80, 0.80, 0.75, 0.60, 0.50, 0.40, 0.35],
    'Succulents/Xerophytes': [0.25, 0.25, 0.30, 0.35, 0.40, 0.45, 0.45, 0.40, 0.35, 0.30, 0.30, 0.25],
    'Climbing Plants (Ivy/Wild Vine)': [0.30, 0.30, 0.40, 0.60, 0.70, 0.80, 0.80, 0.75, 0.65, 0.50, 0.40, 0.30],
    'Climbing Rose': [0.30, 0.30, 0.40, 0.60, 0.70, 0.70, 0.70, 0.65, 0.55, 0.45, 0.35, 0.30],
    'Clematis': [0.25, 0.25, 0.35, 0.50, 0.60, 0.60, 0.60, 0.55, 0.50, 0.40, 0.30, 0.25],
    'Grapevine': [0.20, 0.20, 0.30, 0.50, 0.60, 0.70, 0.70, 0.65, 0.55, 0.40, 0.30, 0.20],
    'Young Tree (1-5 years)': [0.20, 0.20, 0.30, 0.40, 0.50, 0.60, 0.65, 0.60, 0.50, 0.40, 0.30, 0.20],
    'Mature Deciduous Tree': [0.30, 0.30, 0.40, 0.60, 0.75, 0.85, 0.90, 0.85, 0.70, 0.55, 0.40, 0.30],
    'Mature Conifer': [0.40, 0.40, 0.50, 0.60, 0.70, 0.80, 0.85, 0.80, 0.70, 0.60, 0.50, 0.40],
    
    // FAO-56 crop profiles (single Kc for mid-season, extended to monthly)
    'Wheat': [0.4, 0.4, 0.4, 0.6, 0.8, 1.05, 1.15, 1.1, 1.0, 0.9, 0.5, 0.4],
    'Maize (Corn)': [0.3, 0.3, 0.4, 0.6, 0.8, 1.05, 1.2, 1.15, 1.05, 1.0, 0.7, 0.3],
    'Rice': [1.0, 1.0, 1.0, 1.05, 1.05, 1.05, 1.05, 1.0, 1.0, 1.0, 1.0, 1.0],
    'Soybean': [0.4, 0.4, 0.4, 0.5, 0.7, 0.85, 1.0, 1.0, 1.0, 0.8, 0.5, 0.4],
    'Potato': [0.4, 0.4, 0.5, 0.6, 0.75, 0.9, 1.0, 0.95, 0.9, 0.7, 0.5, 0.4],
    'Tomato': [0.4, 0.4, 0.5, 0.6, 0.75, 0.9, 1.05, 1.1, 1.05, 0.9, 0.6, 0.4],
    'Cotton': [0.4, 0.4, 0.5, 0.6, 0.8, 1.0, 1.15, 1.1, 1.0, 0.9, 0.6, 0.4],
    'Sugarcane': [0.4, 0.4, 0.5, 0.6, 0.8, 0.95, 1.1, 1.15, 1.1, 1.05, 1.0, 0.9],
    'Alfalfa': [0.3, 0.3, 0.4, 0.6, 0.85, 1.05, 1.15, 1.1, 1.0, 0.9, 0.6, 0.3],
    'Grape': [0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.75, 0.7, 0.6, 0.4, 0.3],
    'Apple': [0.3, 0.3, 0.4, 0.5, 0.65, 0.8, 0.85, 0.85, 0.75, 0.6, 0.4, 0.3],
    'Orange': [0.45, 0.45, 0.5, 0.6, 0.7, 0.8, 0.85, 0.8, 0.7, 0.6, 0.5, 0.45],
    'Banana': [0.5, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.95, 0.9, 0.8, 0.7, 0.5],
    'Coffee': [0.7, 0.7, 0.7, 0.75, 0.8, 0.85, 0.9, 0.9, 0.85, 0.8, 0.75, 0.7],
    'Tea': [0.6, 0.6, 0.65, 0.7, 0.75, 0.8, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55],
    'Cocoa': [0.4, 0.4, 0.45, 0.5, 0.6, 0.7, 0.75, 0.75, 0.7, 0.6, 0.5, 0.4],
    'Olive': [0.3, 0.3, 0.35, 0.4, 0.45, 0.5, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25],
    
    // Preset categories with representative Kc values (monthly averages)
    'Street & Shade Trees': [0.3, 0.3, 0.4, 0.6, 0.75, 0.85, 0.9, 0.85, 0.7, 0.55, 0.4, 0.3],
    'Conifers': [0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4],
    'Climbers / Facade Greening': [0.3, 0.3, 0.4, 0.6, 0.7, 0.8, 0.8, 0.75, 0.65, 0.5, 0.4, 0.3],
    'Hedges & Shrubs': [0.4, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.75, 0.7, 0.6, 0.5, 0.4],
    'Ornamental Grasses': [0.6, 0.6, 0.7, 0.8, 0.9, 0.95, 0.95, 0.9, 0.8, 0.7, 0.65, 0.6],
    'Wet Perennials': [0.7, 0.7, 0.8, 0.9, 1.0, 1.0, 1.0, 0.95, 0.85, 0.75, 0.7, 0.65],
    'Medium Perennials': [0.6, 0.6, 0.7, 0.8, 0.9, 0.9, 0.9, 0.85, 0.75, 0.65, 0.6, 0.55],
    'Dry Perennials': [0.3, 0.3, 0.4, 0.5, 0.6, 0.65, 0.65, 0.6, 0.5, 0.4, 0.4, 0.35],
    'Lawn': [0.7, 0.7, 0.8, 0.95, 1.0, 1.05, 1.05, 1.0, 0.9, 0.8, 0.75, 0.7],
    'Seasonal Bedding': [0.6, 0.6, 0.7, 0.8, 0.9, 0.95, 0.95, 0.9, 0.8, 0.7, 0.65, 0.6],
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Kc Profile Descriptions for Tooltips
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var kcDescriptions = {
    // Presets
    'Street & Shade Trees': 'Mature deciduous trees (e.g., Oak, Linden, Maple). Kc values: 0.3-0.9, peaks in summer.',
    'Conifers': 'Mature coniferous trees (e.g., Pine, Spruce, Fir). Kc values: 0.4-0.85, consistent year-round.',
    'Climbers / Facade Greening': 'Climbing plants for facades (e.g., Ivy, Wild Vine). Kc values: 0.3-0.8, peaks in growing season.',
    'Hedges & Shrubs': 'Evergreen and deciduous shrubs. Kc values: 0.4-0.8, moderate water use.',
    'Ornamental Grasses': 'Decorative grasses. Kc values: 0.6-0.95, higher in active growth.',
    'Wet Perennials': 'Perennials that prefer moist conditions. Kc values: 0.7-1.0, consistently high water use.',
    'Medium Perennials': 'Perennials with moderate water needs. Kc values: 0.6-0.9, balanced water use.',
    'Dry Perennials': 'Drought-tolerant perennials (e.g., Sedum, Lavender). Kc values: 0.3-0.65, low water use.',
    'Lawn': 'Cool season grass (e.g., Kentucky Bluegrass, Ryegrass). Kc values: 0.7-1.05, high water use in summer.',
    'Seasonal Bedding': 'Annual bedding plants. Kc values: 0.6-0.95, moderate to high water use.',
    'Grapevines': 'Grape vines for wine production. Kc values: 0.2-0.75, moderate water use with seasonal variation.',
    
    // Individual plants
    'Cool Season Grass (sunny)': 'Cool season turf grass. Kc: Winter 0.7, Spring 0.8-1.0, Summer 1.0-1.05, Fall 0.8-0.9.',
    'Warm Season Grass (sunny)': 'Warm season turf grass. Kc: Winter 0.3-0.4, Spring 0.45-0.75, Summer 0.9-1.05, Fall 0.65-0.9.',
    'Herbaceous Perennials (sunny)': 'Sun-loving perennials. Kc: 0.6-0.95, peaks in mid-summer.',
    'Herbaceous Perennials (semi-shade)': 'Partially shaded perennials. Kc: 0.5-0.85, lower than sunny perennials.',
    'Ground Cover': 'Low-growing ground cover plants. Kc: 0.5-0.85, moderate water use.',
    'Evergreen Shrubs': 'Evergreen shrubs (e.g., Boxwood, Holly). Kc: 0.45-0.8, consistent year-round.',
    'Deciduous Shrubs': 'Deciduous shrubs (e.g., Hydrangea, Lilac). Kc: 0.35-0.8, peaks in summer.',
    'Succulents/Xerophytes': 'Drought-tolerant plants (e.g., Sedum, Cacti). Kc: 0.25-0.45, very low water use.',
    'Climbing Plants (Ivy/Wild Vine)': 'Vigorous climbers. Kc: 0.3-0.8, peaks in growing season.',
    'Climbing Rose': 'Climbing rose varieties. Kc: 0.3-0.7, moderate water use.',
    'Clematis': 'Clematis vines. Kc: 0.25-0.6, moderate water use.',
    'Grapevine': 'Wine grape vines. Kc: 0.2-0.75, moderate water use with seasonal variation.',
    'Young Tree (1-5 years)': 'Young trees establishing root systems. Kc: 0.2-0.65, increasing as trees mature.',
    'Mature Deciduous Tree': 'Mature deciduous trees. Kc: 0.3-0.9, peaks in summer.',
    'Mature Conifer': 'Mature coniferous trees. Kc: 0.4-0.85, consistent year-round.',
    
    // FAO-56 Crops
    'Wheat': 'Cereal crop. Kc: Initial 0.4, Mid-season 1.05-1.15, Late 0.9-0.5.',
    'Maize (Corn)': 'Cereal crop. Kc: Initial 0.3, Mid-season 1.15-1.2, Late 1.0-0.3.',
    'Rice': 'Paddy rice. Kc: Consistently 1.0-1.05 throughout growing season.',
    'Soybean': 'Legume crop. Kc: Initial 0.4, Mid-season 1.0, Late 0.8-0.4.',
    'Potato': 'Root crop. Kc: Initial 0.4, Mid-season 0.9-1.0, Late 0.9-0.4.',
    'Tomato': 'Vegetable crop. Kc: Initial 0.4, Mid-season 0.9-1.1, Late 0.9-0.4.',
    'Cotton': 'Fiber crop. Kc: Initial 0.4, Mid-season 1.0-1.15, Late 0.9-0.4.',
    'Sugarcane': 'Sugar crop. Kc: Initial 0.4, Mid-season 1.1-1.15, Late 1.05-0.9.',
    'Alfalfa': 'Forage crop. Kc: Initial 0.3, Mid-season 1.05-1.15, Late 0.9-0.3.',
    'Grape': 'Fruit crop. Kc: Initial 0.3, Mid-season 0.7-0.75, Late 0.7-0.3.',
    'Apple': 'Fruit tree. Kc: Initial 0.3, Mid-season 0.65-0.85, Late 0.75-0.3.',
    'Orange': 'Citrus tree. Kc: Initial 0.45, Mid-season 0.7-0.85, Late 0.8-0.45.',
    'Banana': 'Fruit crop. Kc: Consistently 0.5-0.95, tropical climate.',
    'Coffee': 'Beverage crop. Kc: Consistently 0.7-0.9, tropical climate.',
    'Tea': 'Beverage crop. Kc: Consistently 0.6-0.8, moderate climate.',
    'Cocoa': 'Beverage crop. Kc: Initial 0.4, Mid-season 0.6-0.75, Late 0.7-0.4.',
    'Olive': 'Oil crop. Kc: Initial 0.3, Mid-season 0.45-0.5, Late 0.5-0.25.',
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Plant Search Database - All available plants with metadata
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var plantDatabase = [
    // Landscape Plants
    { id: 'lawn', name: 'Lawn', botanical: 'Grass spp.', kc: 'Lawn', category: 'Ground Cover', type: 'landscape', avgKc: 0.85 },
    { id: 'street_trees', name: 'Street & Shade Trees', botanical: 'Various', kc: 'Street & Shade Trees', category: 'Trees', type: 'landscape', avgKc: 0.6 },
    { id: 'conifers', name: 'Conifers', botanical: 'Pinus, Abies, etc.', kc: 'Conifers', category: 'Trees', type: 'landscape', avgKc: 0.65 },
    { id: 'climbers', name: 'Climbers / Facade Greening', botanical: 'Various', kc: 'Climbers / Facade Greening', category: 'Climbers', type: 'landscape', avgKc: 0.55 },
    { id: 'hedges', name: 'Hedges & Shrubs', botanical: 'Various', kc: 'Hedges & Shrubs', category: 'Shrubs', type: 'landscape', avgKc: 0.6 },
    { id: 'ground_cover', name: 'Ground Cover', botanical: 'Various', kc: 'Ground Cover', category: 'Ground Cover', type: 'landscape', avgKc: 0.7 },
    { id: 'ornamental_grasses', name: 'Ornamental Grasses', botanical: 'Various', kc: 'Ornamental Grasses', category: 'Grasses', type: 'landscape', avgKc: 0.8 },
    { id: 'perennials_wet', name: 'Wet Perennials', botanical: 'Various', kc: 'Wet Perennials', category: 'Perennials', type: 'landscape', avgKc: 0.85 },
    { id: 'perennials_medium', name: 'Medium Perennials', botanical: 'Various', kc: 'Medium Perennials', category: 'Perennials', type: 'landscape', avgKc: 0.75 },
    { id: 'perennials_dry', name: 'Dry Perennials', botanical: 'Various', kc: 'Dry Perennials', category: 'Perennials', type: 'landscape', avgKc: 0.5 },
    { id: 'seasonal_bedding', name: 'Seasonal Bedding', botanical: 'Various', kc: 'Seasonal Bedding', category: 'Annuals', type: 'landscape', avgKc: 0.8 },
    { id: 'grapevines', name: 'Grapevines', botanical: 'Vitis spp.', kc: 'Grapevines', category: 'Fruit', type: 'landscape', avgKc: 0.45 },
    
    // Individual Plants with Kc profiles
    { id: 'rasen_cool', name: 'Cool Season Grass', botanical: 'Lolium perenne, Poa pratensis', kc: 'Cool Season Grass (sunny)', category: 'Grass', type: 'landscape', avgKc: 0.85 },
    { id: 'rasen_warm', name: 'Warm Season Grass', botanical: 'Cynodon dactylon, Zoysia spp.', kc: 'Warm Season Grass (sunny)', category: 'Grass', type: 'landscape', avgKc: 0.75 },
    { id: 'stauden_sonnig', name: 'Herbaceous Perennials (sunny)', botanical: 'Various', kc: 'Herbaceous Perennials (sunny)', category: 'Perennials', type: 'landscape', avgKc: 0.8 },
    { id: 'stauden_halbschatten', name: 'Herbaceous Perennials (semi-shade)', botanical: 'Various', kc: 'Herbaceous Perennials (semi-shade)', category: 'Perennials', type: 'landscape', avgKc: 0.7 },
    { id: 'bodendecker', name: 'Ground Cover Plants', botanical: 'Sedum, Ajuga, etc.', kc: 'Ground Cover', category: 'Ground Cover', type: 'landscape', avgKc: 0.7 },
    { id: 'strauch_immergruen', name: 'Evergreen Shrubs', botanical: 'Buxus, Ilex, etc.', kc: 'Evergreen Shrubs', category: 'Shrubs', type: 'landscape', avgKc: 0.65 },
    { id: 'strauch_laub', name: 'Deciduous Shrubs', botanical: 'Forsythia, Hydrangea, etc.', kc: 'Deciduous Shrubs', category: 'Shrubs', type: 'landscape', avgKc: 0.6 },
    { id: 'sukkulenten', name: 'Succulents & Xerophytes', botanical: 'Sedum, Echeveria, etc.', kc: 'Succulents/Xerophytes', category: 'Succulents', type: 'landscape', avgKc: 0.35 },
    { id: 'efeu', name: 'Ivy & Wild Vine', botanical: 'Hedera helix, Parthenocissus', kc: 'Climbing Plants (Ivy/Wild Vine)', category: 'Climbers', type: 'landscape', avgKc: 0.55 },
    { id: 'kletterrose', name: 'Climbing Rose', botanical: 'Rosa spp.', kc: 'Climbing Rose', category: 'Climbers', type: 'landscape', avgKc: 0.5 },
    { id: 'clematis', name: 'Clematis', botanical: 'Clematis spp.', kc: 'Clematis', category: 'Climbers', type: 'landscape', avgKc: 0.45 },
    { id: 'weinrebe', name: 'Grapevine', botanical: 'Vitis vinifera', kc: 'Grapevine', category: 'Fruit', type: 'landscape', avgKc: 0.45 },
    { id: 'baum_jung', name: 'Young Tree (1-5 years)', botanical: 'Various', kc: 'Young Tree (1-5 years)', category: 'Trees', type: 'landscape', avgKc: 0.45 },
    { id: 'baum_laub', name: 'Mature Deciduous Tree', botanical: 'Quercus, Tilia, etc.', kc: 'Mature Deciduous Tree', category: 'Trees', type: 'landscape', avgKc: 0.6 },
    { id: 'baum_nadel', name: 'Mature Conifer', botanical: 'Picea, Pinus, etc.', kc: 'Mature Conifer', category: 'Trees', type: 'landscape', avgKc: 0.65 },
    
    // FAO-56 Crops
    { id: 'wheat', name: 'Wheat', botanical: 'Triticum aestivum', kc: 'Wheat', category: 'Cereals', type: 'crop', avgKc: 0.85 },
    { id: 'maize', name: 'Maize (Corn)', botanical: 'Zea mays', kc: 'Maize (Corn)', category: 'Cereals', type: 'crop', avgKc: 0.8 },
    { id: 'rice', name: 'Rice', botanical: 'Oryza sativa', kc: 'Rice', category: 'Cereals', type: 'crop', avgKc: 1.05 },
    { id: 'soybean', name: 'Soybean', botanical: 'Glycine max', kc: 'Soybean', category: 'Legumes', type: 'crop', avgKc: 0.8 },
    { id: 'potato', name: 'Potato', botanical: 'Solanum tuberosum', kc: 'Potato', category: 'Root Crops', type: 'crop', avgKc: 0.75 },
    { id: 'tomato', name: 'Tomato', botanical: 'Solanum lycopersicum', kc: 'Tomato', category: 'Vegetables', type: 'crop', avgKc: 0.8 },
    { id: 'cotton', name: 'Cotton', botanical: 'Gossypium hirsutum', kc: 'Cotton', category: 'Fiber', type: 'crop', avgKc: 0.85 },
    { id: 'sugarcane', name: 'Sugarcane', botanical: 'Saccharum officinarum', kc: 'Sugarcane', category: 'Sugar Crops', type: 'crop', avgKc: 0.9 },
    { id: 'alfalfa', name: 'Alfalfa', botanical: 'Medicago sativa', kc: 'Alfalfa', category: 'Forage', type: 'crop', avgKc: 0.85 },
    { id: 'grape', name: 'Grape', botanical: 'Vitis vinifera', kc: 'Grape', category: 'Fruit', type: 'crop', avgKc: 0.55 },
    { id: 'apple', name: 'Apple', botanical: 'Malus domestica', kc: 'Apple', category: 'Fruit', type: 'crop', avgKc: 0.6 },
    { id: 'orange', name: 'Orange', botanical: 'Citrus sinensis', kc: 'Orange', category: 'Fruit', type: 'crop', avgKc: 0.65 },
    { id: 'banana', name: 'Banana', botanical: 'Musa spp.', kc: 'Banana', category: 'Fruit', type: 'crop', avgKc: 0.75 },
    { id: 'coffee', name: 'Coffee', botanical: 'Coffea spp.', kc: 'Coffee', category: 'Beverage Crops', type: 'crop', avgKc: 0.8 },
    { id: 'tea', name: 'Tea', botanical: 'Camellia sinensis', kc: 'Tea', category: 'Beverage Crops', type: 'crop', avgKc: 0.7 },
    { id: 'cocoa', name: 'Cocoa', botanical: 'Theobroma cacao', kc: 'Cocoa', category: 'Beverage Crops', type: 'crop', avgKc: 0.6 },
    { id: 'olive', name: 'Olive', botanical: 'Olea europaea', kc: 'Olive', category: 'Oil Crops', type: 'crop', avgKc: 0.4 },
    
    // Additional common plants with botanical names
    { id: 'tilia', name: 'Linden Tree', botanical: 'Tilia cordata', kc: 'Mature Deciduous Tree', category: 'Trees', type: 'landscape', avgKc: 0.6 },
    { id: 'lavandula', name: 'Lavender', botanical: 'Lavandula spp.', kc: 'Dry Perennials', category: 'Perennials', type: 'landscape', avgKc: 0.5 },
    { id: 'sedum', name: 'Sedum', botanical: 'Sedum spp.', kc: 'Succulents/Xerophytes', category: 'Succulents', type: 'landscape', avgKc: 0.35 },
    { id: 'hortensia', name: 'Hydrangea', botanical: 'Hydrangea macrophylla', kc: 'Deciduous Shrubs', category: 'Shrubs', type: 'landscape', avgKc: 0.6 },
    { id: 'buxus', name: 'Boxwood', botanical: 'Buxus sempervirens', kc: 'Evergreen Shrubs', category: 'Shrubs', type: 'landscape', avgKc: 0.65 },
];

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Preset plant selections mapping to Kc profiles
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var presets = {
    'street_trees': 'Mature Deciduous Tree',
    'conifers': 'Mature Conifer',
    'climbers': 'Climbing Plants (Ivy/Wild Vine)',
    'hedges': 'Evergreen Shrubs',
    'ground_cover': 'Ground Cover',
    'ornamental_grasses': 'Ornamental Grasses',
    'perennials_wet': 'Wet Perennials',
    'perennials_medium': 'Medium Perennials',
    'perennials_dry': 'Dry Perennials',
    'lawn': 'Lawn',
    'seasonal_bedding': 'Seasonal Bedding',
    'grapevines': 'Grapevine',
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Preset Species Examples (3 botanical names per preset)
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var presetSpeciesExamples = {
    'street_trees': ['Quercus robur', 'Tilia cordata', 'Acer platanoides'],
    'conifers': ['Pinus sylvestris', 'Picea abies', 'Abies alba'],
    'climbers': ['Hedera helix', 'Parthenocissus tricuspidata', 'Clematis montana'],
    'hedges': ['Buxus sempervirens', 'Ilex aquifolium', 'Ligustrum vulgare'],
    'ground_cover': ['Ajuga reptans', 'Sedum acre', 'Thymus serpyllum'],
    'ornamental_grasses': ['Miscanthus sinensis', 'Pennisetum alopecuroides', 'Stipa tenuissima'],
    'perennials_wet': ['Iris pseudacorus', 'Caltha palustris', 'Lobelia cardinalis'],
    'perennials_medium': ['Hemerocallis fulva', 'Echinacea purpurea', 'Salvia nemorosa'],
    'perennials_dry': ['Lavandula angustifolia', 'Sedum telephium', 'Achillea millefolium'],
    'lawn': ['Lolium perenne', 'Poa pratensis', 'Festuca arundinacea'],
    'seasonal_bedding': ['Petunia hybrida', 'Tagetes erecta', 'Impatiens walleriana'],
    'grapevines': ['Vitis vinifera', 'Vitis labrusca', 'Vitis riparia'],
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// English plant names for display
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var plantNamesEN = {
    'Rasen cool-season (sunny)': 'Cool Season Grass (sunny)',
    'Rasen warm-season (sunny)': 'Warm Season Grass (sunny)',
    'Stauden sonnig': 'Herbaceous Perennials (sunny)',
    'Stauden halbschatten': 'Herbaceous Perennials (semi-shade)',
    'Bodendecker': 'Ground Cover',
    'Strauch immergrn': 'Evergreen Shrubs',
    'Strauch laubabwerfend': 'Deciduous Shrubs',
    'Sukkulenten/Xerophyten': 'Succulents/Xerophytes',
    'Kletterpflanzen (Efeu/Wilder Wein)': 'Climbing Plants (Ivy/Wild Vine)',
    'Kletterpflanzen (Kletterrose)': 'Climbing Rose',
    'Kletterpflanzen (Clematis)': 'Clematis',
    'Kletterpflanzen (Weinrebe)': 'Grapevine',
    'Baum (jung, 1-5 Jahre)': 'Young Tree (1-5 years)',
    'Baum (Laubbaum, ausgewachsen)': 'Mature Deciduous Tree',
    'Baum (Nadelbaum, ausgewachsen)': 'Mature Conifer',
    'Street & Shade Trees': 'Street & Shade Trees',
    'Conifers': 'Conifers',
    'Climbers / Facade Greening': 'Climbers / Facade Greening',
    'Hedges & Shrubs': 'Hedges & Shrubs',
    'Ornamental Grasses': 'Ornamental Grasses',
    'Wet Perennials': 'Wet Perennials',
    'Medium Perennials': 'Medium Perennials',
    'Dry Perennials': 'Dry Perennials',
    'Seasonal Bedding': 'Seasonal Bedding',
    'Cool Season Grass (sunny)': 'Cool Season Grass (sunny)',
    'Warm Season Grass (sunny)': 'Warm Season Grass (sunny)',
    'Herbaceous Perennials (sunny)': 'Herbaceous Perennials (sunny)',
    'Herbaceous Perennials (semi-shade)': 'Herbaceous Perennials (semi-shade)',
    'Ground Cover': 'Ground Cover',
    'Evergreen Shrubs': 'Evergreen Shrubs',
    'Deciduous Shrubs': 'Deciduous Shrubs',
    'Succulents/Xerophytes': 'Succulents/Xerophytes',
    'Climbing Plants (Ivy/Wild Vine)': 'Climbing Plants (Ivy/Wild Vine)',
    'Climbing Rose': 'Climbing Rose',
    'Clematis': 'Clematis',
    'Grapevine': 'Grapevine',
    'Young Tree (1-5 years)': 'Young Tree (1-5 years)',
    'Mature Deciduous Tree': 'Mature Deciduous Tree',
    'Mature Conifer': 'Mature Conifer',
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Situation demand and rain factors
// Demand factors: how much more water plants need in different situations
// Rain factors: how much rain is effectively used (shelter, runoff, etc.)
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var situationFactors = {
    'open': { demand: 1.0, rain: 1.0, description: 'Full sun, no shade - Standard conditions' },
    'wall': { demand: 1.15, rain: 0.75, description: 'South/west facing wall - Increased heat reflection (+15% demand, 75% rain effectiveness)' },
    'overhang': { demand: 1.0, rain: 0.3, description: 'Under roof overhang - Full sun but reduced rain (only 30% of rain reaches plants)' },
    'roofed': { demand: 0.9, rain: 0.0, description: 'Fully roofed area - No rainfall reaches plants (-10% demand from reduced light)' },
    'shaded': { demand: 0.7, rain: 0.9, description: 'North side or full shade - Reduced evapotranspiration (-30% demand, 90% rain effectiveness)' },
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Irrigation types and their configurations
// Flow rates are now in L/min for consistency
// For drip: flow rate is per emitter
// For micro/sprinkler: flow rate is per sprayer/head
// Coverage area is used to calculate total flow
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var irrigationTypes = {
    'drip': {
        name: 'Drip Line',
        daysPerWeek: 5,
        description: 'Efficient, targeted watering at plant roots',
        flowRate: { 2: 1.6, 4: 2.0, 6: 2.4 }, // L/hour per emitter
        emitterSpacing: 0.3, // m between emitters
        coverageFactor: 3.0, // Emitters per m² (1 / 0.33 spacing)
        unit: 'L/hour' // Flow rate unit
    },
    'micro': {
        name: 'Micro-Sprayer',
        daysPerWeek: 3,
        description: 'Fine mist for delicate plants',
        flowRate: { 2: 40, 4: 50, 6: 60 }, // L/hour per sprayer
        coverage: 2, // m² per sprayer
        coverageFactor: 0.5, // Sprayers per m² (1 / coverage)
        unit: 'L/hour' // Flow rate unit
    },
    'sprinkler': {
        name: 'Pop-up Sprinkler',
        daysPerWeek: 2,
        description: 'Wide area coverage, higher flow',
        flowRate: { 2: 100, 4: 120, 6: 140 }, // L/hour per sprinkler
        coverage: 100, // m² per sprinkler
        coverageFactor: 0.01, // Sprinklers per m² (1 / coverage)
        unit: 'L/hour' // Flow rate unit
    }
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Month names
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Countries and their cities
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var citiesByCountry = {
    'AT': ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Eisenstadt', 'Bregenz', 'St. Poelten'],
    'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Duesseldorf', 'Dortmund', 'Hanover', 'Bremen', 'Leipzig', 'Dresden', 'Nuremberg'],
    'CH': ['Zuerich', 'Basel', 'Geneva', 'Bern', 'Lausanne', 'Winterthur', 'Lugano'],
    'EU': ['Amsterdam', 'Brussels', 'Paris', 'London', 'Madrid', 'Barcelona', 'Rome', 'Milan', 'Prague', 'Warsaw', 'Copenhagen', 'Lisbon', 'Athens', 'Istanbul'],
    'NA': ['New York', 'Los Angeles', 'Chicago', 'Toronto', 'Vancouver'],
    'SA': ['Sao Paulo', 'Buenos Aires'],
    'AF': ['Cape Town', 'Johannesburg', 'Nairobi', 'Cairo', 'Lagos'],
    'ME': ['Riyadh', 'Dubai'],
    'AS': ['Mumbai', 'Delhi', 'Bangkok', 'Singapore', 'Tokyo'],
    'OC': ['Sydney', 'Auckland'],
    'world': ['Wien', 'Berlin', 'Zuerich', 'Amsterdam', 'Paris', 'London', 'New York', 'Los Angeles', 'Tokyo', 'Sydney'],
    '': [],
};

// All cities list for search
var allCities = Object.values(citiesByCountry).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Sanity Check Values
// Reference values for validation
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var sanityChecks = {
    // Typical ET0 ranges (mm/month) by climate zone
    et0: {
        min: 10,  // Minimum monthly ET0 (winter, cold climates)
        max: 200, // Maximum monthly ET0 (hot desert climates)
        typical: {
            temperate: { min: 30, max: 120 },
            mediterranean: { min: 40, max: 150 },
            tropical: { min: 60, max: 150 },
            desert: { min: 50, max: 200 }
        }
    },
    // Typical rainfall ranges (mm/month)
    rainfall: {
        min: 0,
        max: 500,
        typical: {
            arid: { min: 0, max: 50 },
            semiArid: { min: 20, max: 100 },
            temperate: { min: 30, max: 150 },
            tropical: { min: 100, max: 300 }
        }
    },
    // Typical Kc ranges
    kc: {
        min: 0.1,
        max: 1.3,
        typical: {
            low: { min: 0.1, max: 0.4, description: 'Succulents, desert plants' },
            medium: { min: 0.4, max: 0.7, description: 'Shrubs, trees' },
            high: { min: 0.7, max: 1.2, description: 'Grass, lush vegetation' }
        }
    },
    // Typical annual water need ranges (litres/m²)
    annualWater: {
        min: 0,
        max: 15000,
        typical: {
            dry: { min: 0, max: 2000, description: 'Desert plants' },
            medium: { min: 2000, max: 5000, description: 'Most landscape plants' },
            wet: { min: 5000, max: 10000, description: 'Lush vegetation, rice' }
        }
    }
};


// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Seasonal Factors for different plant types
// These factors adjust watering needs by season
// Based on plant physiology and growth patterns
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var seasonalFactors = {
    grass: { spring: 0.80, summer: 1.00, autumn: 0.70, winter: 0.40 },
    deciduous: { spring: 0.85, summer: 1.00, autumn: 0.60, winter: 0.30 },
    evergreen: { spring: 0.80, summer: 1.00, autumn: 0.75, winter: 0.50 },
    dry: { spring: 0.70, summer: 1.00, autumn: 0.60, winter: 0.20 },
    general: { spring: 0.80, summer: 1.00, autumn: 0.70, winter: 0.50 }
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Helper function to get plant type category
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

function getPlantType(plantKey) {
    if (!plantKey) return 'general';
    const dryTypes = ['dry perennials', 'succulents', 'xerophytes', 'sukkulenten', 'perennials_dry'];
    const grassTypes = ['lawn', 'grass', 'rasen', 'perennials_wet', 'perennials_medium', 'seasonal_bedding', 
                       'ornamental_grasses', 'ground_cover'];
    const deciduousTypes = ['hedges', 'tree', 'deciduous', 'shrubs', 'strauch_laub', 'baum_laub'];
    const evergreenTypes = ['conifer', 'evergreen', 'strauch_immergrn', 'baum_nadel'];
    const plantName = plantKey.toString().toLowerCase();
    if (dryTypes.some(t => plantName.includes(t))) return 'dry';
    if (grassTypes.some(t => plantName.includes(t))) return 'grass';
    if (deciduousTypes.some(t => plantName.includes(t))) return 'deciduous';
    if (evergreenTypes.some(t => plantName.includes(t))) return 'evergreen';
    if (presets && plantKey in presets) {
        const profile = presets[plantKey];
        if (profile && profile.toLowerCase().includes('dry')) return 'dry';
        if (profile && profile.toLowerCase().includes('lawn')) return 'grass';
        if (profile && profile.toLowerCase().includes('tree')) return 'deciduous';
        if (profile && profile.toLowerCase().includes('conifer')) return 'evergreen';
    }
    return 'general';
}

function getSeasonalFactor(plantKey, season) {
    const plantType = getPlantType(plantKey);
    const factors = seasonalFactors[plantType] || seasonalFactors.general;
    return factors[season] || 0.7;
}

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Soil Type Factors for irrigation adjustment
// Clay soils have slow infiltration, need more frequent, shorter sessions
// Sandy soils have fast infiltration, need less frequent, longer sessions
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var soilTypeFactors = {
    clay: {
        infiltrationRate: 0.25, // cm/hour
        sessionMultiplier: 1.3, // Increase session time by 30% for better infiltration
        frequencyMultiplier: 1.5, // Increase frequency by 50%
        maxSessionMinutes: 30, // Split sessions longer than this
        description: 'Slow drainage, high water retention (FAO-56 class: Clay, Infiltration: 0.25 cm/h = 6.94 × 10^-7 m/s)'
    },
    silt: {
        infiltrationRate: 0.5, // cm/hour
        sessionMultiplier: 1.0, // No adjustment needed
        frequencyMultiplier: 1.0,
        maxSessionMinutes: 60,
        description: 'Medium drainage, moderate water retention (FAO-56 class: Silt, Infiltration: 0.5 cm/h = 1.39 × 10^-6 m/s)'
    },
    sand: {
        infiltrationRate: 1.5, // cm/hour
        sessionMultiplier: 0.8, // Decrease session time by 20%
        frequencyMultiplier: 0.7, // Decrease frequency by 30%
        maxSessionMinutes: 90,
        description: 'Fast drainage, low water retention (FAO-56 class: Sand, Infiltration: 1.5 cm/h = 4.17 × 10^-6 m/s)'
    },
    sandyLoam: {
        infiltrationRate: 1.0, // cm/hour - RECOMMENDED DEFAULT
        sessionMultiplier: 1.0,
        frequencyMultiplier: 1.0,
        maxSessionMinutes: 60,
        description: 'Good drainage, balanced water retention (FAO-56 class: Sandy Loam, Infiltration: 1.0 cm/h = 2.78 × 10^-6 m/s)'
    },
        loam: {
        infiltrationRate: 0.75, // cm/hour
        sessionMultiplier: 1.0,
        frequencyMultiplier: 1.0,
        maxSessionMinutes: 60,
        description: 'Balanced drainage, good water retention (FAO-56 class: Loam, Infiltration: 0.75 cm/h = 2.08 × 10^-6 m/s)'
    },
    standard: {
        infiltrationRate: 1.0, // cm/hour
        sessionMultiplier: 1.0,
        frequencyMultiplier: 1.0,
        maxSessionMinutes: 60,
        description: 'Standard reference soil (FAO-56 class: Reference, Infiltration: 1.0 cm/h = 2.78 × 10^-6 m/s)'
    }
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Slope Factors for effective rainfall adjustment
// Steeper slopes have more runoff, less effective rainfall
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var slopeFactors = {
    flat: { gradient: 0, rainEffectiveness: 1.0, description: '0-2% slope' },
    gentle: { gradient: 5, rainEffectiveness: 0.95, description: '2-5% slope' },
    moderate: { gradient: 10, rainEffectiveness: 0.90, description: '5-10% slope' },
    steep: { gradient: 20, rainEffectiveness: 0.80, description: '10-20% slope' },
    very_steep: { gradient: 30, rainEffectiveness: 0.70, description: '>20% slope' }
};

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Soil type selection options
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var soilTypes = ['sandyLoam', 'clay', 'silt', 'sand', 'loam', 'standard'];

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Slope selection options
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var slopeOptions = ['flat', 'gentle', 'moderate', 'steep', 'very_steep'];

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Helper function to get soil factor
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

function getSoilFactor(soilType) {
    return soilTypeFactors[soilType] || soilTypeFactors.standard;
}

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Helper function to get slope factor
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

function getSlopeFactor(slope) {
    return slopeFactors[slope] || slopeFactors.flat;
}

// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// Global variables for soil and slope settings
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================




// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================
// English translations for UI
// ============================================
// Soil Type Factors - Based on FAO-56 and USDA Soil Texture Classification
// Source: FAO-56 Paper (Allen et al., 1998)
// ============================================

var translations = {
    en: {
        site: 'Site',
        plant: 'Plant',
        results: 'Results',
        projects: 'Projects',
        selectCountry: 'Select Country',
        selectCity: 'Select City',
        selectPlant: 'Select Plant',
        area: 'Area (m\u0012)',
        situation: 'Planting Situation',
        open: 'Open',
        wall: 'Against a Wall',
        overhang: 'Under an Overhang',
        roofed: 'Roofed',
        shaded: 'Shaded / North Side',
    }
};
