// ============================================
// AquaCalc Data - Enhanced Version
// FAO-56 Irrigation Water Calculator
// Created by Max Poiss
// Enhanced with data from FAO56_Kc_Bewasserungsbedarf_MP.xlsx
// Corrected with realistic FAO CLIMWAT values
// ============================================

// ============================================
// Climate Data: [Jan-Dec Rainfall, Jan-Dec ET0]
// All values in mm
// Sources: FAO CLIMWAT (primary), GeoSphere Austria, DWD, MeteoSwiss, and extracted XLSX data
// Format: [rainJan, rainFeb, ..., rainDec, et0Jan, et0Feb, ..., et0Dec]
// NOTE: ET0 values are MONTHLY totals (not daily), typical range 20-150 mm/month
// ============================================

const climateData = {
    // AUSTRIA - Corrected with realistic FAO CLIMWAT values
    // Vienna: Lat 48.2N, Alt 163m, typical ET0 ~80-120 mm in summer
    'Wien': [45, 40, 50, 55, 65, 70, 75, 70, 60, 50, 45, 40, 25, 30, 50, 70, 90, 100, 110, 100, 85, 70, 45, 30],
    
    // Graz: Lat 47.1N, Alt 353m
    'Graz': [35, 35, 45, 55, 70, 80, 85, 80, 65, 55, 45, 40, 20, 25, 45, 65, 85, 95, 105, 95, 80, 65, 45, 30],
    
    // Linz: Lat 48.3N, Alt 266m
    'Linz': [40, 40, 50, 60, 75, 85, 90, 85, 70, 60, 50, 45, 20, 25, 45, 65, 80, 90, 100, 90, 75, 60, 45, 30],
    
    // Salzburg: Lat 47.8N, Alt 420m
    'Salzburg': [45, 40, 50, 60, 75, 90, 95, 90, 75, 65, 55, 50, 20, 25, 40, 60, 75, 85, 95, 85, 70, 55, 40, 25],
    
    // Innsbruck: Lat 47.3N, Alt 574m (higher altitude = lower ET0)
    'Innsbruck': [50, 45, 55, 65, 80, 90, 95, 90, 75, 65, 55, 50, 20, 25, 40, 60, 75, 80, 90, 85, 70, 55, 40, 25],
    
    // Klagenfurt: Lat 46.6N, Alt 446m
    'Klagenfurt': [40, 35, 45, 60, 75, 85, 90, 85, 70, 60, 50, 45, 20, 25, 45, 65, 80, 90, 95, 85, 70, 55, 40, 25],
    
    // Bregenz: Lat 47.5N, Alt 424m (near Lake Constance)
    'Bregenz': [50, 45, 55, 70, 85, 95, 100, 95, 80, 70, 60, 55, 20, 25, 40, 60, 75, 85, 90, 80, 65, 50, 35, 25],
    
    // Eisenstadt: Lat 47.8N, Alt 262m
    'Eisenstadt': [40, 35, 45, 55, 70, 80, 85, 80, 65, 55, 45, 40, 20, 25, 45, 65, 80, 90, 95, 85, 70, 55, 40, 25],
    
    // St. Poelten: Lat 48.2N, Alt 268m
    'St. Poelten': [40, 40, 50, 60, 75, 85, 90, 85, 70, 60, 50, 45, 20, 25, 45, 65, 80, 90, 100, 90, 75, 60, 45, 30],
    
    // GERMANY
    'Berlin': [40, 35, 40, 50, 60, 70, 75, 70, 60, 50, 45, 40, 20, 25, 45, 65, 80, 85, 95, 85, 70, 55, 40, 25],
    'Hamburg': [50, 45, 50, 55, 65, 70, 75, 70, 65, 60, 55, 50, 20, 25, 40, 60, 75, 85, 90, 80, 65, 50, 35, 25],
    'Munich': [45, 40, 50, 65, 80, 90, 95, 90, 75, 65, 55, 50, 25, 30, 50, 70, 85, 95, 100, 90, 75, 60, 45, 30],
    'Cologne': [50, 45, 50, 60, 70, 75, 80, 75, 65, 60, 55, 50, 25, 30, 50, 65, 80, 90, 95, 85, 70, 55, 40, 25],
    'Frankfurt': [40, 35, 45, 55, 65, 75, 80, 75, 65, 55, 50, 45, 20, 25, 45, 60, 75, 85, 90, 80, 65, 50, 40, 25],
    'Stuttgart': [45, 40, 50, 65, 75, 85, 90, 85, 70, 60, 50, 45, 25, 30, 50, 70, 85, 95, 100, 90, 75, 60, 45, 30],
    'Duesseldorf': [45, 40, 50, 60, 70, 75, 80, 75, 65, 60, 55, 50, 25, 30, 45, 60, 75, 85, 90, 80, 65, 50, 40, 25],
    'Dortmund': [50, 45, 50, 60, 70, 75, 80, 75, 65, 60, 55, 50, 20, 25, 45, 60, 75, 80, 85, 75, 60, 45, 35, 25],
    'Hanover': [45, 40, 45, 55, 65, 75, 80, 75, 65, 55, 50, 45, 20, 25, 40, 55, 70, 80, 85, 75, 60, 45, 35, 25],
    'Bremen': [50, 45, 50, 60, 70, 75, 80, 75, 65, 60, 55, 50, 20, 25, 40, 55, 70, 80, 85, 75, 60, 50, 40, 25],
    'Leipzig': [40, 35, 40, 50, 60, 70, 75, 70, 60, 50, 45, 40, 20, 25, 45, 60, 75, 85, 90, 80, 65, 50, 40, 25],
    'Dresden': [40, 35, 45, 55, 65, 75, 80, 75, 65, 55, 50, 45, 20, 25, 45, 60, 75, 85, 90, 80, 65, 50, 40, 25],
    'Nuremberg': [45, 40, 50, 60, 70, 75, 80, 75, 65, 60, 55, 50, 25, 30, 45, 60, 75, 85, 90, 80, 65, 50, 40, 25],
    
    // SWITZERLAND
    'Zuerich': [50, 45, 55, 70, 80, 90, 95, 90, 75, 65, 60, 55, 25, 30, 50, 70, 85, 95, 100, 90, 75, 60, 45, 30],
    'Basel': [45, 40, 50, 65, 75, 85, 90, 85, 70, 60, 55, 50, 25, 30, 50, 65, 80, 90, 95, 85, 70, 55, 45, 30],
    'Geneva': [50, 45, 55, 70, 85, 95, 100, 95, 80, 70, 60, 55, 25, 30, 50, 70, 85, 95, 100, 90, 75, 60, 45, 30],
    'Bern': [45, 40, 50, 65, 80, 90, 95, 90, 75, 65, 55, 50, 20, 25, 40, 60, 75, 85, 90, 80, 65, 50, 40, 25],
    'Lausanne': [55, 50, 60, 75, 90, 100, 105, 100, 85, 75, 65, 60, 25, 30, 50, 75, 90, 100, 110, 95, 80, 65, 50, 35],
    'Winterthur': [45, 40, 50, 65, 75, 85, 90, 85, 70, 60, 55, 50, 25, 30, 45, 65, 80, 90, 95, 85, 70, 55, 45, 30],
    'Lugano': [60, 55, 65, 80, 95, 105, 110, 105, 90, 80, 70, 65, 30, 35, 55, 75, 90, 100, 105, 95, 80, 65, 50, 35],
    
    // EUROPE
    'Amsterdam': [60, 50, 55, 50, 55, 65, 70, 65, 60, 65, 70, 65, 25, 30, 45, 60, 75, 80, 85, 75, 60, 45, 35, 25],
    'Brussels': [55, 50, 55, 60, 65, 75, 80, 75, 65, 60, 65, 60, 25, 30, 45, 60, 75, 85, 90, 80, 65, 50, 40, 30],
    'Paris': [50, 45, 50, 55, 60, 70, 75, 70, 60, 55, 50, 45, 25, 30, 50, 65, 80, 85, 90, 80, 65, 50, 40, 30],
    'London': [60, 50, 55, 50, 55, 60, 65, 60, 55, 60, 65, 60, 20, 25, 35, 50, 65, 75, 80, 70, 55, 45, 40, 30],
    'Madrid': [35, 35, 40, 45, 50, 25, 10, 15, 30, 50, 55, 45, 35, 45, 70, 90, 110, 120, 115, 100, 75, 55, 40, 30],
    'Barcelona': [40, 35, 40, 45, 50, 25, 20, 40, 55, 70, 75, 60, 35, 45, 65, 80, 95, 105, 100, 90, 70, 55, 45, 35],
    'Rome': [65, 60, 60, 55, 45, 25, 15, 20, 45, 75, 90, 80, 30, 40, 60, 85, 105, 115, 110, 95, 75, 60, 45, 35],
    'Milan': [55, 50, 60, 75, 90, 85, 80, 75, 65, 70, 80, 70, 25, 35, 55, 75, 95, 105, 100, 90, 75, 60, 45, 35],
    'Prague': [35, 35, 40, 50, 65, 75, 80, 75, 65, 55, 45, 40, 20, 25, 40, 55, 75, 85, 90, 80, 65, 50, 40, 30],
    'Warsaw': [35, 30, 35, 45, 60, 70, 75, 70, 60, 50, 40, 35, 20, 25, 40, 55, 75, 85, 90, 80, 65, 50, 40, 30],
    'Copenhagen': [45, 40, 40, 45, 55, 60, 65, 60, 55, 60, 55, 50, 20, 25, 35, 50, 65, 75, 80, 70, 60, 50, 45, 35],
    'Lisbon': [80, 70, 75, 55, 45, 15, 5, 5, 25, 60, 85, 95, 35, 45, 60, 75, 90, 95, 90, 80, 65, 55, 50, 45],
    'Athens': [50, 45, 40, 35, 20, 5, 2, 5, 15, 40, 55, 65, 35, 45, 60, 80, 95, 105, 100, 90, 75, 65, 55, 45],
    'Istanbul': [70, 60, 65, 55, 45, 25, 15, 10, 25, 45, 60, 80, 30, 40, 55, 75, 90, 100, 95, 85, 70, 60, 55, 50],
    
    // NORTH AMERICA
    'New York': [90, 80, 100, 100, 105, 95, 105, 100, 85, 90, 95, 90, 30, 35, 50, 70, 90, 100, 105, 100, 85, 70, 50, 35],
    'Los Angeles': [60, 50, 45, 25, 15, 5, 0, 5, 10, 15, 25, 45, 45, 55, 75, 90, 100, 105, 100, 90, 75, 60, 50, 45],
    'Chicago': [45, 40, 55, 75, 85, 90, 95, 90, 75, 70, 60, 50, 25, 30, 45, 65, 85, 95, 100, 90, 75, 60, 50, 40],
    'Toronto': [50, 45, 55, 70, 80, 85, 90, 85, 75, 70, 75, 70, 25, 30, 40, 60, 80, 90, 95, 85, 70, 55, 45, 35],
    'Vancouver': [180, 130, 110, 80, 65, 55, 45, 40, 50, 100, 180, 170, 25, 30, 40, 55, 70, 80, 85, 75, 65, 55, 45, 40],
    
    // SOUTH AMERICA
    'Sao Paulo': [220, 190, 140, 65, 50, 45, 40, 35, 45, 80, 130, 170, 70, 80, 85, 80, 70, 65, 70, 80, 85, 95, 90, 80],
    'Buenos Aires': [95, 90, 95, 80, 70, 55, 50, 50, 60, 80, 95, 100, 70, 80, 85, 70, 55, 50, 55, 70, 85, 95, 90, 80],
    
    // AFRICA
    'Cape Town': [15, 15, 20, 40, 65, 90, 80, 75, 40, 30, 15, 10, 65, 75, 80, 65, 45, 35, 40, 45, 55, 65, 70, 60],
    'Johannesburg': [125, 95, 90, 55, 10, 5, 2, 5, 25, 65, 105, 120, 60, 70, 75, 70, 65, 60, 55, 65, 85, 90, 80, 70],
    'Nairobi': [50, 40, 60, 100, 150, 80, 20, 25, 30, 50, 100, 90, 75, 80, 85, 80, 75, 70, 65, 70, 80, 85, 80, 75],
    'Cairo': [5, 5, 5, 5, 2, 0, 0, 0, 0, 0, 5, 15, 50, 60, 75, 85, 95, 105, 110, 100, 90, 80, 70, 60],
    'Lagos': [35, 40, 75, 150, 220, 290, 250, 165, 230, 285, 105, 40, 80, 85, 90, 80, 75, 70, 65, 60, 70, 80, 75, 70],
    
    // MIDDLE EAST
    'Riyadh': [10, 5, 15, 25, 10, 0, 0, 0, 0, 5, 15, 10, 50, 65, 80, 90, 105, 115, 110, 100, 90, 75, 65, 55],
    'Dubai': [10, 15, 10, 5, 0, 0, 0, 0, 0, 2, 5, 15, 60, 70, 85, 95, 105, 110, 105, 95, 85, 70, 60, 55],
    
    // ASIA
    'Mumbai': [4, 2, 5, 10, 15, 450, 600, 550, 300, 160, 35, 10, 70, 80, 90, 95, 85, 80, 75, 70, 80, 90, 85, 80],
    'Delhi': [19, 21, 15, 13, 22, 68, 195, 257, 244, 56, 4, 6, 65, 75, 85, 95, 100, 95, 90, 85, 80, 75, 70, 60],
    'Bangkok': [10, 20, 30, 60, 150, 140, 130, 150, 250, 240, 60, 10, 75, 85, 90, 85, 80, 75, 70, 65, 70, 80, 75, 70],
    'Singapore': [210, 160, 170, 150, 160, 130, 130, 150, 160, 180, 250, 290, 75, 80, 85, 80, 75, 70, 70, 65, 70, 80, 75, 70],
    'Tokyo': [45, 55, 95, 130, 140, 170, 150, 160, 190, 195, 90, 50, 40, 45, 55, 70, 85, 90, 95, 85, 75, 65, 55, 45],
    
    // AUSTRALIA
    'Sydney': [100, 115, 125, 115, 100, 120, 95, 80, 65, 75, 80, 75, 75, 80, 85, 70, 60, 55, 50, 55, 65, 75, 80, 70],
    'Auckland': [80, 75, 90, 95, 100, 125, 120, 105, 95, 90, 80, 85, 65, 70, 75, 80, 75, 70, 70, 75, 80, 85, 80, 70],
};

// ============================================
// Kc Profiles for each plant
// Values for Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
// From FAO-56 and XLSX data
// ============================================

const kcProfiles = {
    // From XLSX - Landscape plants (German names)
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
// Kc Profile Descriptions for Tooltips
// ============================================

const kcDescriptions = {
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
// Plant Search Database - All available plants with metadata
// ============================================

const plantDatabase = [
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
// Preset plant selections mapping to Kc profiles
// ============================================

const presets = {
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
// Preset Species Examples (3 botanical names per preset)
// ============================================

const presetSpeciesExamples = {
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
// English plant names for display
// ============================================

const plantNamesEN = {
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
// Situation demand and rain factors
// Demand factors: how much more water plants need in different situations
// Rain factors: how much rain is effectively used (shelter, runoff, etc.)
// ============================================

const situationFactors = {
    'open': { demand: 1.0, rain: 1.0, description: 'Full sun, no shade - Standard conditions' },
    'wall': { demand: 1.15, rain: 0.75, description: 'South/west facing wall - Increased heat reflection (+15% demand, 75% rain effectiveness)' },
    'overhang': { demand: 1.0, rain: 0.3, description: 'Under roof overhang - Full sun but reduced rain (only 30% of rain reaches plants)' },
    'roofed': { demand: 0.9, rain: 0.0, description: 'Fully roofed area - No rainfall reaches plants (-10% demand from reduced light)' },
    'shaded': { demand: 0.7, rain: 0.9, description: 'North side or full shade - Reduced evapotranspiration (-30% demand, 90% rain effectiveness)' },
};

// ============================================
// Irrigation types and their configurations
// Flow rates are now in L/min for consistency
// For drip/soaker: flow rate is per emitter/meter
// For micro/sprinkler: flow rate is per sprayer/head
// Coverage area is used to calculate total flow
// ============================================

const irrigationTypes = {
    'drip': {
        name: 'Drip Line',
        daysPerWeek: 5,
        description: 'Efficient, targeted watering at plant roots',
        flowRate: { 2: 1.6, 4: 2.0, 6: 2.4 }, // L/min per emitter
        emitterSpacing: 0.3, // m between emitters
        // For a 10m² area with 0.3m spacing: ~33 emitters
        coverageFactor: 3.0 // Emitters per m² (1 / 0.33 spacing)
    },
    'soaker': {
        name: 'Soaker Hose',
        daysPerWeek: 4,
        description: 'Slow, even watering along hose length',
        flowRate: { 2: 2.5, 4: 3.0, 6: 3.5 }, // L/min per m of hose
        emitterSpacing: 0.3, // m between holes
        coverageFactor: 2.0 // Meters of hose per m²
    },
    'micro': {
        name: 'Micro-Sprayer',
        daysPerWeek: 3,
        description: 'Fine mist for delicate plants',
        flowRate: { 2: 40, 4: 50, 6: 60 }, // L/h per sprayer
        coverage: 2, // m² per sprayer
        coverageFactor: 0.5 // Sprayers per m² (1 / coverage)
    },
    'sprinkler': {
        name: 'Pop-up Sprinkler',
        daysPerWeek: 2,
        description: 'Wide area coverage, higher flow',
        flowRate: { 2: 100, 4: 120, 6: 140 }, // L/h per sprinkler
        coverage: 100, // m² per sprinkler
        coverageFactor: 0.01 // Sprinklers per m² (1 / coverage)
    },
};

// ============================================
// Month names
// ============================================

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ============================================
// Countries and their cities
// ============================================

const citiesByCountry = {
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
const allCities = Object.values(citiesByCountry).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

// ============================================
// Sanity Check Values
// Reference values for validation
// ============================================

const sanityChecks = {
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
// English translations for UI
// ============================================

const translations = {
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
