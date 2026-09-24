// ============================================
// AquaCalc - Main Application JavaScript
// FAO-56 Species and Site-Specific Water Demand Calculator
// Created by Max Poiss
// Enhanced with Open-Meteo API integration and functional exports
// ============================================

// Global state
let currentCity = null;
let currentClimateData = null;
let currentClimateSource = 'embedded';
let currentPlant = null;
let currentPlantKc = null;
let currentArea = 10;
let currentSituation = 'open';
let currentIrrigationType = 'drip';
let currentPressure = 2;
let climateChart = null;
let monthlyChart = null;
let selectedCountry = null;
let projects = {};
let currentProjectId = null;
let elements = {};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initTabs();
    initCountrySelect();
    initPlantPresets();
    initPlantSearch();
    initThemeToggle();
    initInfoPanel();
    initFormInputs();
    initCharts();
    initProjects();
    initExports();
    initLanguage();
    loadState();
    console.log('AquaCalc initialized');
});

// Initialize DOM elements
function initializeElements() {
    elements.countrySelect = document.getElementById('country');
    elements.citySelect = document.getElementById('city');
    elements.climateCard = document.getElementById('climateCard');
    elements.climateInfo = document.getElementById('climateInfo');
    elements.climateDataTable = document.getElementById('climateData');
    elements.plantSearch = document.getElementById('plantSearch');
    elements.plantSelect = document.getElementById('plantSelect');
    elements.areaInput = document.getElementById('area');
    elements.situationSelect = document.getElementById('situation');
    elements.customKcInput = document.getElementById('customKc');
    elements.annualWater = document.getElementById('annualWater');
    elements.peakMonth = document.getElementById('peakMonth');
    elements.peakMonthValue = document.getElementById('peakMonthValue');
    elements.peakNeed = document.getElementById('peakNeed');
    elements.resultsTableBody = document.getElementById('resultsTableBody');
    elements.seasonCards = document.getElementById('seasonCards');
    elements.irrigationType = document.getElementById('irrigationType');
    elements.pressure = document.getElementById('pressure');
    elements.bedsList = document.getElementById('bedsList');
    elements.bedEditor = document.getElementById('bedEditor');
    elements.projectSummary = document.getElementById('projectSummary');
    elements.addBedBtn = document.getElementById('addBed');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.infoPanel = document.getElementById('infoPanel');
    elements.infoToggle = document.getElementById('infoToggle');
    elements.closeInfo = document.getElementById('closeInfo');
    elements.exportPDF = document.getElementById('exportPDF');
    elements.exportExcel = document.getElementById('exportExcel');
    elements.languageSelect = document.getElementById('language');
}

// Tab management
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabId + 'Tab').classList.add('active');
            
            if (tabId === 'site' && currentCity) displayClimateData(currentCity);
            else if (tabId === 'plant') populatePlantSearch();
            else if (tabId === 'results') calculateResults();
            else if (tabId === 'projects') renderProjects();
        });
    });
}

// Country and city selection
function initCountrySelect() {
    if (!elements.countrySelect) return;
    
    const countries = Object.keys(citiesByCountry);
    elements.countrySelect.innerHTML = '<option value="">Select Country</option>';
    const countryNames = {AT:'Austria',DE:'Germany',CH:'Switzerland',EU:'Europe',NA:'North America',
        SA:'South America',AF:'Africa',ME:'Middle East',AS:'Asia',OC:'Oceania',world:'Worldwide'};
    countries.forEach(code => {
        if (code) {
            const opt = document.createElement('option');
            opt.value = code; opt.textContent = countryNames[code] || code;
            elements.countrySelect.appendChild(opt);
        }
    });
    
    elements.countrySelect.addEventListener('change', () => {
        selectedCountry = elements.countrySelect.value;
        populateCities(selectedCountry);
        saveState();
    });
    
    if (elements.countrySelect.value) populateCities(elements.countrySelect.value);
}

function populateCities(countryCode) {
    if (!elements.citySelect) return;
    elements.citySelect.innerHTML = '<option value="">Select City</option>';
    currentCity = null;
    if (elements.climateCard) elements.climateCard.style.display = 'none';
    
    if (!countryCode) return;
    const cities = citiesByCountry[countryCode] || [];
    cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city; opt.textContent = city;
        elements.citySelect.appendChild(opt);
    });
    
    elements.citySelect.addEventListener('change', () => {
        const city = elements.citySelect.value;
        if (city) {
            currentCity = city;
            currentClimateSource = 'embedded';
            if (climateData[city]) {
                currentClimateData = climateData[city];
                displayClimateData(city);
                if (elements.climateCard) elements.climateCard.style.display = 'block';
            }
        } else {
            currentCity = null; currentClimateData = null;
            if (elements.climateCard) elements.climateCard.style.display = 'none';
        }
        saveState();
    });
}

function displayClimateData(cityName) {
    if (!elements.climateInfo || !currentClimateData) return;
    const data = currentClimateData;
    const et0Annual = data.slice(12,24).reduce((a,b)=>a+b,0);
    const rainAnnual = data.slice(0,12).reduce((a,b)=>a+b,0);
    elements.climateInfo.innerHTML = `<div class="row"><div class="col"><strong>Annual ET0:</strong> ${et0Annual} mm</div>
        <div class="col"><strong>Annual Rainfall:</strong> ${rainAnnual} mm</div></div>`;
    updateClimateTable(cityName, data);
    createClimateChart(cityName, data);
}

function updateClimateTable(cityName, data) {
    if (!elements.climateDataTable) return;
    const et0Data = data.slice(12,24); const rainData = data.slice(0,12);
    elements.climateDataTable.innerHTML = '';
    for (let i=0; i<12; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${months[i]}</td><td>${et0Data[i]}</td><td>${rainData[i]}</td>`;
        elements.climateDataTable.appendChild(row);
    }
}

function createClimateChart(cityName, data) {
    const et0Data = data.slice(12,24); const rainData = data.slice(0,12);
    const ctx = document.getElementById('climateChart'); if (!ctx) return;
    if (climateChart) climateChart.destroy();
    climateChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {label: 'Rainfall (mm)', data: rainData, backgroundColor: 'rgba(52,152,219,0.7)', borderColor: 'rgba(52,152,219,1)', yAxisID: 'y'},
                {label: 'ET0 (mm)', data: et0Data, type: 'line', backgroundColor: 'rgba(231,76,60,0.2)', 
                 borderColor: 'rgba(231,76,60,1)', borderWidth: 2, fill: false, tension: 0.3, yAxisID: 'y1'}
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: {type: 'linear', display: true, position: 'left', title: {display: true, text: 'Rainfall (mm)'}, beginAtZero: true},
                y1: {type: 'linear', display: true, position: 'right', title: {display: true, text: 'ET0 (mm)'}, 
                      grid: {drawOnChartArea: false}, beginAtZero: true}
            },
            plugins: {
                title: {display: true, text: `Climate Data - ${cityName}`, font: {size: 16}},
                legend: {position: 'top'},
                tooltip: {callbacks: {label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} mm`}}
            }
        }
    });
}

// Plant selection
function initPlantPresets() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const presetKey = btn.dataset.preset;
        const plantProfile = presets[presetKey];
        
        // Get Kc description for tooltip
        const kcDesc = plantProfile && kcDescriptions[plantProfile] ? 
            kcDescriptions[plantProfile] : 
            kcDescriptions[presetKey] || 'No description available';
        
        // Get average Kc value for display
        const kcProfile = kcProfiles[plantProfile] || kcProfiles[presetKey];
        let avgKc = 'N/A';
        if (kcProfile) {
            const sumKc = kcProfile.reduce((a, b) => a + b, 0);
            avgKc = (sumKc / 12).toFixed(2);
        }
        
        // Get species examples for tooltip
        const speciesExamples = presetSpeciesExamples[presetKey] || [];
        const speciesText = speciesExamples.length > 0 ? 
            `Examples: ${speciesExamples.join(', ')}` : '';
        
        // Set title attribute for hover tooltip
        btn.title = `${plantProfile || presetKey}\nKc (avg): ${avgKc}\n${kcDesc}${speciesText ? '\n' + speciesText : ''}`;
        
        btn.addEventListener('click', () => selectPlantPreset(btn.dataset.preset));
    });
}

function selectPlantPreset(presetKey) {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.preset-btn[data-preset="${presetKey}"]`);
    if (btn) btn.classList.add('active');
    const plantProfile = presets[presetKey];
    if (plantProfile) {
        currentPlant = plantProfile; currentPlantKc = null;
        const presetInfo = document.getElementById('presetInfo');
        const displayName = plantNamesEN[plantProfile] || plantProfile;
        if (presetInfo) presetInfo.innerHTML = `<strong>Selected:</strong> ${displayName}`;
        if (elements.customKcInput) elements.customKcInput.value = '';
        calculateResults(); saveState();
    }
}


function populatePlantSearch() {
    if (!elements.plantSelect) return; if (elements.plantSelect.options.length > 1) return;
    while (elements.plantSelect.options.length > 1) elements.plantSelect.remove(1);
    
    // Add preset options with tooltips
    Object.entries(presets).forEach(([k, p]) => {
        const opt = document.createElement('option');
        opt.value = k; 
        const displayName = plantNamesEN[p] || p;
        opt.textContent = `Preset: ${displayName}`;
        
        // Add Kc info to title for tooltip
        const kcDesc = kcDescriptions[p] || kcDescriptions[displayName] || '';
        const kcProfile = kcProfiles[p] || kcProfiles[displayName];
        let avgKc = '';
        if (kcProfile) {
            const sumKc = kcProfile.reduce((a, b) => a + b, 0);
            avgKc = ` | Avg Kc: ${(sumKc / 12).toFixed(2)}`;
        }
        // Add species examples for presets
        const speciesExamples = presetSpeciesExamples[k] || [];
        const speciesText = speciesExamples.length > 0 ? `\nExamples: ${speciesExamples.join(', ')}` : '';
        opt.title = `${displayName}${avgKc}${kcDesc ? '\n' + kcDesc : ''}${speciesText}`;
        
        elements.plantSelect.appendChild(opt);
    });
    
    const sep = document.createElement('option'); sep.disabled = true; sep.textContent = '─────────────────────';
    elements.plantSelect.appendChild(sep);
    
    // Add plant database options with tooltips
    plantDatabase.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.kc || p.id; 
        const displayName = p.name || p.kc || p.id;
        opt.textContent = displayName;
        
        // Add Kc info to title for tooltip
        const kcDesc = kcDescriptions[p.kc] || kcDescriptions[displayName] || '';
        opt.title = `${displayName} (${p.botanical || 'N/A'})${kcDesc ? '\n' + kcDesc : ''}`;
        if (p.avgKc) {
            opt.title += `\nAvg Kc: ${p.avgKc.toFixed(2)}`;
        }
        
        elements.plantSelect.appendChild(opt);
    });
    
    // Add remaining Kc profiles
    Object.keys(kcProfiles).forEach(k => {
        if (!plantDatabase.some(p => p.kc === k || p.id === k)) {
            const opt = document.createElement('option');
            opt.value = k; 
            const displayName = plantNamesEN[k] || k;
            opt.textContent = displayName;
            
            // Add Kc info to title for tooltip
            const kcDesc = kcDescriptions[k] || kcDescriptions[displayName] || '';
            const kcProfile = kcProfiles[k];
            let avgKc = '';
            if (kcProfile) {
                const sumKc = kcProfile.reduce((a, b) => a + b, 0);
                avgKc = ` | Avg Kc: ${(sumKc / 12).toFixed(2)}`;
            }
            opt.title = `${displayName}${avgKc}${kcDesc ? '\n' + kcDesc : ''}`;
            
            elements.plantSelect.appendChild(opt);
        }
    });
}

function initPlantSearch() {
    if (!elements.plantSearch && !elements.plantSelect) return;
    populatePlantSearch();
    if (elements.plantSearch) {
        elements.plantSearch.addEventListener('input', () => filterPlantSearch(elements.plantSearch.value.toLowerCase()));
    }
    if (elements.plantSelect) {
        elements.plantSelect.addEventListener('change', () => {
            const val = elements.plantSelect.value;
            if (val) {
                if (presets[val]) selectPlantPreset(val);
                else {
                    currentPlant = val; currentPlantKc = null;
                    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                    const presetInfo = document.getElementById('presetInfo');
                    const displayName = plantNamesEN[val] || plantDatabase.find(p => p.id === val || p.kc === val)?.name || val;
                    if (presetInfo) presetInfo.innerHTML = `<strong>Selected:</strong> ${displayName}`;
                    if (elements.customKcInput) elements.customKcInput.value = '';
                    calculateResults(); saveState();
                }
            }
        });
    }
    if (elements.customKcInput) {
        elements.customKcInput.addEventListener('input', () => {
            const kc = parseFloat(elements.customKcInput.value);
            if (!isNaN(kc) && kc >= 0 && kc <= 2) {
                currentPlantKc = kc; currentPlant = 'custom';
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                const presetInfo = document.getElementById('presetInfo');
                if (presetInfo) presetInfo.innerHTML = `<strong>Custom Kc:</strong> ${kc}`;
                calculateResults(); saveState();
            }
        });
    }
}

function filterPlantSearch(term) {
    if (!elements.plantSelect) return;
    for (let i = 1; i < elements.plantSelect.options.length; i++) {
        const opt = elements.plantSelect.options[i];
        opt.style.display = opt.textContent.toLowerCase().includes(term) ? '' : 'none';
    }
}

// Form inputs
function initFormInputs() {
    if (!elements.areaInput) return;
    elements.areaInput.addEventListener('input', () => { currentArea = parseFloat(elements.areaInput.value) || 0; calculateResults(); saveState(); });
    if (elements.situationSelect) {
        elements.situationSelect.addEventListener('change', () => { currentSituation = elements.situationSelect.value; calculateResults(); saveState(); });
    }
    currentArea = parseFloat(elements.areaInput.value) || 10;
    currentSituation = elements.situationSelect ? elements.situationSelect.value || 'open' : 'open';
    if (elements.irrigationType) {
        currentIrrigationType = elements.irrigationType.value;
        elements.irrigationType.addEventListener('change', () => { currentIrrigationType = elements.irrigationType.value; calculateResults(); saveState(); });
    }
    if (elements.pressure) {
        currentPressure = parseInt(elements.pressure.value) || 2;
        elements.pressure.addEventListener('change', () => { currentPressure = parseInt(elements.pressure.value) || 2; calculateResults(); saveState(); });
    }
}

// Sanity check function
function performSanityChecks(et0Data, rainData, kcValues) {
    const warnings = [];
    
    // Check ET0 values
    for (let i = 0; i < et0Data.length; i++) {
        const et0 = et0Data[i];
        if (et0 < sanityChecks.et0.min || et0 > sanityChecks.et0.max) {
            warnings.push(`ET0 for ${months[i]} (${et0} mm) is out of range (${sanityChecks.et0.min}-${sanityChecks.et0.max} mm/month)`);
        }
    }
    
    // Check rainfall values
    for (let i = 0; i < rainData.length; i++) {
        const rain = rainData[i];
        if (rain < sanityChecks.rainfall.min || rain > sanityChecks.rainfall.max) {
            warnings.push(`Rainfall for ${months[i]} (${rain} mm) is out of range (${sanityChecks.rainfall.min}-${sanityChecks.rainfall.max} mm/month)`);
        }
    }
    
    // Check Kc values
    for (let i = 0; i < kcValues.length; i++) {
        const kc = kcValues[i];
        if (kc < sanityChecks.kc.min || kc > sanityChecks.kc.max) {
            warnings.push(`Kc for ${months[i]} (${kc}) is out of range (${sanityChecks.kc.min}-${sanityChecks.kc.max})`);
        }
    }
    
    // Check annual totals
    const annualET0 = et0Data.reduce((a, b) => a + b, 0);
    const annualRain = rainData.reduce((a, b) => a + b, 0);
    
    // If annual ET0 seems too low or too high for the climate
    if (annualET0 < 300) {
        warnings.push(`Annual ET0 (${annualET0} mm) seems low. Typical range: 600-1500 mm/year`);
    } else if (annualET0 > 2000) {
        warnings.push(`Annual ET0 (${annualET0} mm) seems high. Typical range: 600-1500 mm/year`);
    }
    
    // Check for extreme values in individual months
    const maxMonthlyET0 = Math.max(...et0Data);
    const minMonthlyET0 = Math.min(...et0Data);
    
    if (maxMonthlyET0 > 150 && currentClimateSource === 'embedded') {
        warnings.push(`Peak ET0 (${maxMonthlyET0} mm/month) is high. Check climate data source.`);
    }
    
    if (minMonthlyET0 < 10 && currentClimateSource === 'embedded') {
        warnings.push(`Minimum ET0 (${minMonthlyET0} mm/month) is low. Check climate data source.`);
    }
    
    // Check rainfall vs ET0 balance
    let monthsWithHighDeficit = 0;
    for (let i = 0; i < 12; i++) {
        const monthlyDeficit = et0Data[i] - rainData[i];
        if (monthlyDeficit > 100) {
            monthsWithHighDeficit++;
        }
    }
    
    if (monthsWithHighDeficit > 6) {
        warnings.push(`${monthsWithHighDeficit} months have high deficit (ET0 - Rain > 100mm). Consider if climate data is appropriate.`);
    }
    
    return warnings;
}

function displaySanityWarnings(warnings) {
    // Remove existing warning display
    let warningContainer = document.getElementById('sanityWarnings');
    if (warningContainer) {
        warningContainer.remove();
    }
    
    // Only create warning display if there are warnings
    if (warnings.length === 0) return;
    
    // Create warning container
    warningContainer = document.createElement('div');
    warningContainer.id = 'sanityWarnings';
    warningContainer.className = 'warning-container';
    
    let warningHTML = '<div class="warning-header">⚠️ Data Validation Warnings</div>';
    warningHTML += '<ul class="warning-list">';
    warnings.forEach(warning => {
        warningHTML += `<li>${warning}</li>`;
    });
    warningHTML += '</ul>';
    warningHTML += '<small>These are informational. The calculations continue with the provided data.</small>';
    
    warningContainer.innerHTML = warningHTML;
    
    // Insert warning container in results tab
    const resultsTab = document.getElementById('resultsTab');
    if (resultsTab) {
        const firstChild = resultsTab.firstChild;
        if (firstChild) {
            resultsTab.insertBefore(warningContainer, firstChild);
        } else {
            resultsTab.appendChild(warningContainer);
        }
    }
}

// Calculations
function calculateResults() {
    if (!currentCity || !currentClimateData || !currentPlant) {
        if (elements.annualWater) elements.annualWater.textContent = '-';
        if (elements.peakMonth) elements.peakMonth.textContent = '-';
        if (elements.peakNeed) elements.peakNeed.textContent = '-';
        if (elements.resultsTableBody) elements.resultsTableBody.innerHTML = '<tr><td colspan="8">Select city and plant...</td></tr>';
        if (elements.seasonCards) elements.seasonCards.innerHTML = '';
        return;
    }
    
    const et0Data = currentClimateData.slice(12,24);
    const rainData = currentClimateData.slice(0,12);
    let kcValues = currentPlantKc ? Array(12).fill(currentPlantKc) : (kcProfiles[currentPlant] || Array(12).fill(0.7));
    const situation = situationFactors[currentSituation] || {demand: 1.0, rain: 1.0};
    
    // Perform sanity checks
    const sanityWarnings = performSanityChecks(et0Data, rainData, kcValues);
    displaySanityWarnings(sanityWarnings);
    
    const monthlyResults = []; let annualWater = 0; let peakMonth = ''; let peakNeed = 0; let peakMonthIndex = 0;
    
    for (let i=0; i<12; i++) {
        const etc = et0Data[i] * kcValues[i] * situation.demand;
        const effRain = rainData[i] * 0.8 * situation.rain;
        const net = Math.max(etc - effRain, 0);
        const litres = net * currentArea;
        monthlyResults.push({month: months[i], monthIndex: i, et0: et0Data[i].toFixed(1), kc: kcValues[i].toFixed(2), etc: etc.toFixed(1), 
            rain: rainData[i], effectiveRain: effRain.toFixed(1), net: net.toFixed(1), litres: litres.toFixed(0)});
        annualWater += litres;
        if (litres > peakNeed) { peakNeed = litres; peakMonth = months[i]; peakMonthIndex = i; }
    }
    
    if (elements.annualWater) elements.annualWater.textContent = Math.round(annualWater).toLocaleString();
    if (elements.peakMonth) elements.peakMonth.textContent = peakMonth;
    if (elements.peakMonthValue) elements.peakMonthValue.textContent = monthsFull[peakMonthIndex];
    if (elements.peakNeed) elements.peakNeed.textContent = Math.round(peakNeed).toLocaleString();
    updateResultsTable(monthlyResults); createMonthlyChart(monthlyResults);
    calculateWateringPlan(monthlyResults, peakMonthIndex);
}

function updateResultsTable(results) {
    if (!elements.resultsTableBody) return;
    elements.resultsTableBody.innerHTML = '';
    results.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${r.month}</td><td>${r.et0}</td><td>${r.kc}</td><td>${r.etc}</td><td>${r.rain}</td><td>${r.effectiveRain}</td><td>${r.net}</td><td>${parseFloat(r.litres).toLocaleString()}</td>`;
        elements.resultsTableBody.appendChild(row);
    });
}

function createMonthlyChart(monthlyResults) {
    const ctx = document.getElementById('monthlyChart'); if (!ctx) return;
    if (monthlyChart) monthlyChart.destroy();
    const netData = monthlyResults.map(r => parseFloat(r.net));
    const rainData = monthlyResults.map(r => r.rain);
    const etcData = monthlyResults.map(r => parseFloat(r.etc));
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyResults.map(r => r.month),
            datasets: [
                {label: 'Net Irrigation (mm)', data: netData, backgroundColor: 'rgba(231,76,60,0.7)', borderColor: 'rgba(231,76,60,1)'},
                {label: 'Rainfall (mm)', data: rainData, backgroundColor: 'rgba(52,152,219,0.7)', borderColor: 'rgba(52,152,219,1)'},
                {label: 'ETc (mm)', data: etcData, type: 'line', backgroundColor: 'rgba(46,204,113,0.2)', 
                 borderColor: 'rgba(46,204,113,1)', borderWidth: 2, fill: false, tension: 0.3}
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {y: {beginAtZero: true, title: {display: true, text: 'mm'}}},
            plugins: {
                title: {display: true, text: 'Monthly Water Balance', font: {size: 16}},
                legend: {position: 'top'}
            }
        }
    });
}

function calculateWateringPlan(monthlyResults, peakMonthIndex) {
    if (!elements.seasonCards || !elements.irrigationType || !elements.pressure) return;
    const type = elements.irrigationType.value; 
    const pressure = parseInt(elements.pressure.value);
    const config = irrigationTypes[type]; 
    if (!config) return;
    
    const peakNet = parseFloat(monthlyResults[peakMonthIndex].net);
    const peakLitres = parseFloat(monthlyResults[peakMonthIndex].litres);
    const weeklyLitres = peakLitres / 4.345;
    const flowRate = config.flowRate[pressure] || config.flowRate['4'];
    
    // Calculate emitters/units needed based on area and coverage factor
    const emittersNeeded = currentArea * (config.coverageFactor || 1);
    const totalFlowRate = flowRate * emittersNeeded;
    
    // Calculate time per session (in minutes)
    const litresPerSession = weeklyLitres / config.daysPerWeek;
    
    // For micro and sprinkler, flowRate is in L/h, need to convert to L/min for consistency
    let effectiveFlowRate = totalFlowRate;
    if (type === 'micro' || type === 'sprinkler') {
        effectiveFlowRate = totalFlowRate / 60; // Convert L/h to L/min
    }
    
    let minutesPerSession = litresPerSession / effectiveFlowRate;
    
    const seasons = [
        {name:'Spring', months:[2,3,4], key:'spring'},
        {name:'Summer', months:[5,6,7], key:'summer'},
        {name:'Autumn', months:[8,9,10], key:'autumn'},
        {name:'Winter', months:[11,0,1], key:'winter'}
    ];
    let peakSeasonIndex = 0;
    for (let i=0; i<seasons.length; i++) {
        if (seasons[i].months.includes(peakMonthIndex)) { peakSeasonIndex = i; break; }
    }
    
    elements.seasonCards.innerHTML = '';
    seasons.forEach((season, idx) => {
        const isPeak = idx === peakSeasonIndex;
        const days = config.daysPerWeek;
        const litres = isPeak ? weeklyLitres : Math.round(weeklyLitres * 0.7);
        const minutes = Math.round(minutesPerSession);
        const litresPer = Math.round(litres / days);
        
        // Calculate number of emitters/sprayers needed
        const unitsNeeded = Math.ceil(emittersNeeded);
        const flowRateDisplay = (type === 'micro' || type === 'sprinkler') ? 
            `${flowRate} L/h` : `${flowRate} L/min`;
        
        // Calculate total flow for the area
        const totalFlowDisplay = (type === 'micro' || type === 'sprinkler') ? 
            `${(totalFlowRate).toFixed(1)} L/h` : `${(totalFlowRate).toFixed(1)} L/min`;
        
        const card = document.createElement('div');
        card.className = 'season-card';
        card.innerHTML = `<h4>${season.name}</h4>
            <p><strong>Days per week:</strong> ${days}</p>
            <p><strong>Minutes per session:</strong> ${minutes}</p>
            <p><strong>Litres per session:</strong> ${litresPer.toLocaleString()}</p>
            <p><strong>Units needed:</strong> ${unitsNeeded} ${type === 'drip' ? 'emitters' : type === 'soaker' ? 'meters of hose' : type === 'micro' ? 'micro-sprayers' : 'sprinklers'} @ ${flowRateDisplay} each</p>
            <p><strong>Total flow:</strong> ${totalFlowDisplay} for ${currentArea} m²</p>
            ${isPeak ? '<p><em>(Peak season)</em></p>' : ''}`;
        elements.seasonCards.appendChild(card);
    });
}

// Theme toggle
function initThemeToggle() {
    if (!elements.themeToggle) return;
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') { html.setAttribute('data-theme', 'dark'); elements.themeToggle.textContent = 'Toggle Light Mode'; }
    elements.themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme'); const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next); localStorage.setItem('theme', next);
        elements.themeToggle.textContent = next === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
        updateChartsTheme();
    });
}

function updateChartsTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e0e0e0' : '#2c3e50';
    Chart.defaults.color = textColor; Chart.defaults.plugins.legend.labels.color = textColor;
    if (climateChart) createClimateChart(currentCity, currentClimateData);
    if (monthlyChart) calculateResults();
}

// Info panel
function initInfoPanel() {
    if (!elements.infoToggle || !elements.infoPanel || !elements.closeInfo) return;
    elements.infoToggle.addEventListener('click', () => elements.infoPanel.classList.add('active'));
    elements.closeInfo.addEventListener('click', () => elements.infoPanel.classList.remove('active'));
    elements.infoPanel.addEventListener('click', e => { if (e.target === elements.infoPanel) elements.infoPanel.classList.remove('active'); });
}

// Charts initialization
function initCharts() {
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#2c3e50';
    Chart.defaults.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#2c3e50';
}

// Projects
function initProjects() {
    if (!elements.addBedBtn) return;
    const saved = localStorage.getItem('aquacalc-projects');
    if (saved) projects = JSON.parse(saved);
    elements.addBedBtn.addEventListener('click', addNewBed);
    renderProjects(); initProjectEditors();
}

function addNewBed() {
    const bedId = 'bed_' + Date.now();
    projects[bedId] = {id: bedId, name: `Bed ${Object.keys(projects).length + 1}`, area: 10, situation: 'open', plantingCycles: []};
    currentProjectId = bedId; saveProjects(); renderProjects(); editBed(bedId);
}

function editBed(bedId) {
    currentProjectId = bedId; const bed = projects[bedId]; if (!bed) return;
    if (elements.bedEditor) elements.bedEditor.style.display = 'block';
    if (document.getElementById('bedName')) document.getElementById('bedName').value = bed.name;
    if (document.getElementById('bedAreaInput')) document.getElementById('bedAreaInput').value = bed.area;
    if (document.getElementById('bedSituationInput')) document.getElementById('bedSituationInput').value = bed.situation;
    renderPlantingCycles(bedId);
}

function renderPlantingCycles(bedId) {
    const bed = projects[bedId]; if (!bed) return;
    const container = document.getElementById('plantingCycles'); if (!container) return;
    container.innerHTML = '';
    bed.plantingCycles.forEach((cycle, idx) => {
        const div = document.createElement('div'); div.className = 'planting-cycle';
        div.innerHTML = `<div class="cycle-header"><span>Cycle ${idx+1}: ${cycle.startMonth} - ${cycle.endMonth}</span>
            <button class="btn-small delete-cycle" data-bed-id="${bedId}" data-cycle-index="${idx}">Delete</button></div>
            <div class="cycle-plants">${cycle.plants.map(p => `<span class="plant-tag">${p.name}</span>`).join('')}</div>`;
        container.appendChild(div);
    });
    container.querySelectorAll('.delete-cycle').forEach(btn => {
        btn.addEventListener('click', () => deletePlantingCycle(btn.dataset.bedId, parseInt(btn.dataset.cycleIndex)));
    });
}

function deletePlantingCycle(bedId, idx) {
    if (!projects[bedId] || !projects[bedId].plantingCycles[idx]) return;
    projects[bedId].plantingCycles.splice(idx, 1); saveProjects(); renderPlantingCycles(bedId);
}

function initProjectEditors() {
    const saveBtn = document.getElementById('saveBed'); const cancelBtn = document.getElementById('cancelBed');
    const addCycleBtn = document.getElementById('addPlantingCycle');
    if (saveBtn) saveBtn.addEventListener('click', saveBed);
    if (cancelBtn) cancelBtn.addEventListener('click', () => { if (elements.bedEditor) elements.bedEditor.style.display = 'none'; currentProjectId = null; });
    if (addCycleBtn) addCycleBtn.addEventListener('click', addPlantingCycle);
    document.querySelectorAll('.edit-bed').forEach(btn => btn.addEventListener('click', () => editBed(btn.dataset.bedId)));
    document.querySelectorAll('.delete-bed').forEach(btn => btn.addEventListener('click', () => deleteBed(btn.dataset.bedId)));
}

function saveBed() {
    if (!currentProjectId || !projects[currentProjectId]) return;
    const bed = projects[currentProjectId];
    if (document.getElementById('bedName')) bed.name = document.getElementById('bedName').value;
    if (document.getElementById('bedAreaInput')) bed.area = parseFloat(document.getElementById('bedAreaInput').value) || 10;
    if (document.getElementById('bedSituationInput')) bed.situation = document.getElementById('bedSituationInput').value;
    if (elements.bedEditor) elements.bedEditor.style.display = 'none'; currentProjectId = null;
    saveProjects(); renderProjects();
}

function addPlantingCycle() {
    if (!currentProjectId || !projects[currentProjectId]) return;
    projects[currentProjectId].plantingCycles.push({startMonth: 'Apr', endMonth: 'Sep', plants: []});
    saveProjects(); renderPlantingCycles(currentProjectId);
}

function deleteBed(bedId) { if (!projects[bedId]) return; delete projects[bedId]; saveProjects(); renderProjects(); }
function renderProjects() {
    if (!elements.bedsList) return; elements.bedsList.innerHTML = '';
    Object.values(projects).forEach(bed => {
        const card = document.createElement('div'); card.className = 'bed-card'; card.dataset.bedId = bed.id;
        card.innerHTML = `<h4>${bed.name}</h4><p>Area: <strong>${bed.area} m2</strong>, Situation: <strong>${bed.situation}</strong></p>
            <p>Planting Cycles: ${bed.plantingCycles.length}</p>
            <div class="bed-actions"><button class="btn-small edit-bed" data-bed-id="${bed.id}">Edit</button>
            <button class="btn-small delete-bed" data-bed-id="${bed.id}">Delete</button></div>`;
        elements.bedsList.appendChild(card);
    }); initProjectEditors(); renderProjectSummary();
}

function renderProjectSummary() {
    if (!elements.projectSummary) return;
    let totalArea = 0; Object.values(projects).forEach(bed => totalArea += bed.area);
    elements.projectSummary.innerHTML = `<div class="summary-card"><h4>Total</h4><p><strong>Area:</strong> ${totalArea} m2</p>
        <p><strong>Beds:</strong> ${Object.keys(projects).length}</p></div><p><em>Detailed project calculations coming soon.</em></p>`;
}

function saveProjects() { localStorage.setItem('aquacalc-projects', JSON.stringify(projects)); }

// Export functions
function initExports() {
    if (elements.exportPDF) elements.exportPDF.addEventListener('click', exportToPDF);
    if (elements.exportExcel) elements.exportExcel.addEventListener('click', exportToExcel);
}

function exportToPDF() {
    if (!currentCity || !currentPlant || !currentClimateData) { alert('Please select a city and plant first.'); return; }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePDFContent()); printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

function generatePDFContent() {
    const plantName = plantNamesEN[currentPlant] || currentPlant;
    const now = new Date(); const dateStr = now.toLocaleDateString();
    return `<!DOCTYPE html><html><head><title>AquaCalc Report - ${currentCity} | ${plantName}</title>
        <style>body{font-family:Arial,sans-serif;margin:20px;color:#333}h1{color:#2c3e50;font-size:24px}h2{color:#3498db;font-size:20px}h3{color:#2c3e50;font-size:18px}
        .header{margin-bottom:30px;border-bottom:2px solid #2c3e50;padding-bottom:20px}.section{margin-bottom:25px}
        .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:20px 0}.result-card{border:1px solid #ddd;padding:15px;border-radius:5px;background:#f9f9f9}
        .result-value{font-size:24px;font-weight:bold;color:#e74c3c}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#2c3e50;color:white}tr:nth-child(even){background:#f2f2f2}
        .footer{margin-top:40px;font-size:12px;color:#7f8c8d}.metadata{font-size:12px;color:#7f8c8d;margin-top:5px}</style></head>
        <body><div class="header"><h1>AquaCalc</h1><p><strong>FAO-56 Irrigation Water Calculator</strong></p>
        <div class="metadata"><p>Generated: ${dateStr}</p><p>City: ${currentCity}</p><p>Plant: ${plantName}</p>
        <p>Area: ${currentArea} m2</p><p>Situation: ${currentSituation}</p></div></div>
        <div class="section"><h2>Climate Data</h2>${generateClimateTableHTML()}</div>
        <div class="section"><h2>Monthly Water Balance</h2>${generateResultsTableHTML()}</div>
        <div class="section"><h2>Summary</h2><div class="results-grid">
        <div class="result-card"><h3>Annual Water Need</h3><div class="result-value">${elements.annualWater?elements.annualWater.textContent:'-'}</div><p>litres</p></div>
        <div class="result-card"><h3>Peak Month</h3><div class="result-value">${elements.peakMonth?elements.peakMonth.textContent:'-'}</div><p>${elements.peakMonthValue?elements.peakMonthValue.textContent:'-'}</p></div>
        <div class="result-card"><h3>Peak Month Need</h3><div class="result-value">${elements.peakNeed?elements.peakNeed.textContent:'-'}</div><p>litres</p></div></div></div>
        <div class="section"><h2>Seasonal Watering Plan</h2>${generateWateringPlanHTML()}</div>
        <div class="footer"><p>&#169; ${new Date().getFullYear()} | AquaCalc - FAO-56 Irrigation Water Calculator</p>
        <p>Data Sources: FAO-56, GeoSphere Austria, DWD, MeteoSwiss, ${currentClimateSource==='api'?'Open-Meteo API':'Embedded Climate Data'}</p></div></body></html>`;
}

function generateClimateTableHTML() {
    if (!currentClimateData) return '<p>No climate data.</p>';
    const et0 = currentClimateData.slice(12,24); const rain = currentClimateData.slice(0,12);
    let html = '<table><thead><tr><th>Month</th><th>ET0 (mm)</th><th>Rainfall (mm)</th></tr></thead><tbody>';
    for (let i=0; i<12; i++) html += `<tr><td>${months[i]}</td><td>${et0[i]}</td><td>${rain[i]}</td></tr>`;
    return html + '</tbody></table>';
}

function generateResultsTableHTML() {
    if (!elements.resultsTableBody) return '<p>No results.</p>';
    let html = '<table><thead><tr><th>Month</th><th>ET0 (mm)</th><th>Kc</th><th>ETc (mm)</th><th>Rain (mm)</th><th>Effective Rain (mm)</th><th>Net (mm)</th><th>Litres</th></tr></thead><tbody>';
    elements.resultsTableBody.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 8) { html += '<tr>'; cells.forEach(c => html += `<td>${c.textContent}</td>`); html += '</tr>'; }
    });
    return html + '</tbody></table>';
}

function generateWateringPlanHTML() {
    if (!elements.seasonCards) return '<p>No plan.</p>';
    const cards = elements.seasonCards.querySelectorAll('.season-card');
    if (cards.length === 0) return '<p>No watering plan.</p>';
    let html = '<div class="results-grid">';
    cards.forEach(c => html += `<div class="result-card">${c.innerHTML}</div>`);
    return html + '</div>';
}

function exportToExcel() {
    if (!currentCity || !currentPlant || !currentClimateData) { alert('Please select city and plant first.'); return; }
    const csv = generateCSVContent();
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `AquaCalc_${currentCity}_${currentPlant}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function generateCSVContent() {
    const plantName = plantNamesEN[currentPlant] || currentPlant;
    const date = new Date().toLocaleDateString();
    let csv = 'AquaCalc Export\nGenerated: ' + date + '\nCity: ' + currentCity + '\nPlant: ' + plantName + '\nArea: ' + currentArea + ' m\u001b2\nSituation: ' + currentSituation + '\n\n';
    csv += 'Climate Data\nMonth,ET\u001a0 (mm),Rainfall (mm)\n';
    const et0 = currentClimateData.slice(12,24); const rain = currentClimateData.slice(0,12);
    for (let i=0; i<12; i++) csv += months[i] + ',' + et0[i] + ',' + rain[i] + '\n';
    csv += '\nMonthly Water Balance\nMonth,ET\u001a0 (mm),Kc,ETc (mm),Rain (mm),Effective Rain (mm),Net (mm),Litres\n';
    elements.resultsTableBody.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 8) csv += Array.from(cells).map(c => c.textContent).join(',') + '\n';
    });
    csv += '\nSummary\nAnnual Water Need (litres),' + (elements.annualWater?elements.annualWater.textContent:'-') + '\n';
    csv += 'Peak Month,' + (elements.peakMonth?elements.peakMonth.textContent:'-') + '\n';
    csv += 'Peak Month Need (litres),' + (elements.peakNeed?elements.peakNeed.textContent:'-') + '\n';
    return csv;
}

// State management
function saveState() {
    localStorage.setItem('aquacalc-state', JSON.stringify({
        country: selectedCountry, city: currentCity, climateSource: currentClimateSource,
        plant: currentPlant, customKc: currentPlantKc, area: currentArea, situation: currentSituation,
        irrigationType: currentIrrigationType, pressure: currentPressure,
        theme: document.documentElement.getAttribute('data-theme') || 'light',
        language: elements.languageSelect?elements.languageSelect.value:'en'
    }));
}

function loadState() {
    const saved = localStorage.getItem('aquacalc-state'); if (!saved) return;
    try { const state = JSON.parse(saved);
        if (state.theme) { document.documentElement.setAttribute('data-theme', state.theme);
            if (elements.themeToggle) elements.themeToggle.textContent = state.theme==='dark'?'Toggle Light Mode':'Toggle Dark Mode';
            setTimeout(updateChartsTheme, 100); }
        if (state.language && elements.languageSelect) { elements.languageSelect.value = state.language; initLanguage(); }
        if (state.country && elements.countrySelect) { elements.countrySelect.value = state.country; selectedCountry = state.country; populateCities(state.country); }
        if (state.city) { setTimeout(() => {
            if (elements.citySelect) { elements.citySelect.value = state.city; currentCity = state.city;
                currentClimateSource = state.climateSource || 'embedded';
                if (climateData[state.city]) { currentClimateData = climateData[state.city]; displayClimateData(state.city);
                    if (elements.climateCard) elements.climateCard.style.display = 'block'; } }
        }, 100); }
        if (state.plant) { currentPlant = state.plant;
            if (state.plant === 'custom' && state.customKc) { currentPlantKc = state.customKc;
                if (elements.customKcInput) elements.customKcInput.value = state.customKc;
                const pi = document.getElementById('presetInfo'); if (pi) pi.innerHTML = '<strong>Custom Kc:</strong> ' + state.customKc; }
            else { for (const [k,v] of Object.entries(presets)) { if (v === state.plant) { selectPlantPreset(k); break; } } }
        }
        if (state.area && elements.areaInput) { currentArea = state.area; elements.areaInput.value = state.area; }
        if (state.situation && elements.situationSelect) { currentSituation = state.situation; elements.situationSelect.value = state.situation; }
        if (state.irrigationType && elements.irrigationType) { currentIrrigationType = state.irrigationType; elements.irrigationType.value = state.irrigationType; }
        if (state.pressure && elements.pressure) { currentPressure = state.pressure; elements.pressure.value = state.pressure; }
    } catch (e) { console.error('Error loading state:', e); }
}

// Language management
function initLanguage() { if (!elements.languageSelect) return;
    elements.languageSelect.addEventListener('change', () => { const lang = elements.languageSelect.value; localStorage.setItem('language', lang); });
    const saved = localStorage.getItem('language') || 'en';
    if (elements.languageSelect) elements.languageSelect.value = saved;
}

