// ============================================
// AquaCalc - Main Application JavaScript
// FAO-56 Species and Site-Specific Water Demand Calculator
// Created by Max Poiss
// Enhanced with Open-Meteo API integration and functional exports
// ============================================

// Global state
let currentCity = null;
let currentClimateData = null;
let currentPlant = null;
let currentPlantKc = null;
let currentArea = 10;
let currentSituation = 'open';
let currentIrrigationType = 'drip';
let currentPressure = 2;
let currentTimePeriod = '30';
let climateChart = null;
let monthlyChart = null;
let vgMonthlyChart = null;
let vgResultsChart = null;
let vgChart = null;
let monthlyResults = null;
let selectedCountry = null;
let projects = {};
let currentProjectId = null;
let elements = {};
let currentResultsView = 'horizontal'; // 'horizontal' or 'vertical'
let verticalGreeningResults = null; // Stores latest VG calculation results
let manualResultsViewSelection = false; // True if user manually selected view

// ============================================
// API Request Cache and Rate Limit Tracking
// ============================================

// Cache for API responses: keys are "cityName_timePeriod"
const apiResponseCache = new Map();

// Track API request statistics
let apiRequestCount = 0;
let apiRequestLimit = 1000; // Open-Meteo free tier limit: 1000 requests/day

// Retry configuration
const maxRetries = 3;
const retryBaseDelay = 1000; // 1 second base delay

// Initialize request tracking
function initApiTracking() {
    // Check if we have saved request data from today
    const savedData = localStorage.getItem('aquacalc-api-stats');
    const today = new Date().toDateString();
    
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.date === today) {
            apiRequestCount = data.count || 0;
        } else {
            // Different day, reset counter
            apiRequestCount = 0;
        }
    }
}

// Save request statistics
function saveApiStats() {
    const data = {
        date: new Date().toDateString(),
        count: apiRequestCount
    };
    localStorage.setItem('aquacalc-api-stats', JSON.stringify(data));
}

// Increment request counter
function incrementRequestCount() {
    apiRequestCount++;
    saveApiStats();
}

// Check if we're near or at the rate limit
function checkRateLimit() {
    const remaining = apiRequestLimit - apiRequestCount;
    if (remaining <= 0) {
        return { allowed: false, remaining: 0, message: 'Daily API limit reached (1000 requests/day)' };
    } else if (remaining <= 10) {
        return { allowed: true, remaining: remaining, message: `Warning: ${remaining} requests remaining` };
    } else {
        return { allowed: true, remaining: remaining, message: null };
    }
}

// Generate cache key from city and time period
function getCacheKey(cityName, years) {
    return `${cityName}_${years}`;
}

// Get user-friendly HTTP error messages
function getHttpErrorMessage(statusCode) {
    const messages = {
        400: 'Bad Request - Invalid parameters',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Access denied',
        404: 'Not Found - Location or data not available',
        429: 'Too Many Requests - Rate limit exceeded',
        500: 'Internal Server Error - API server issue',
        502: 'Bad Gateway - API service temporarily unavailable',
        503: 'Service Unavailable - API service overloaded',
        504: 'Gateway Timeout - API request timed out'
    };
    return messages[statusCode] || `HTTP Error ${statusCode}`;
}

// Update the API status display with request count
function updateApiStatusDisplay() {
    const apiStatus = document.getElementById('apiStatus');
    if (!apiStatus) return;
    
    const rateCheck = checkRateLimit();
    const remaining = apiRequestLimit - apiRequestCount;
    
    if (rateCheck.remaining <= 10) {
        apiStatus.textContent = `⚠️ ${apiRequestCount}/${apiRequestLimit} requests today - ${remaining} remaining`;
        apiStatus.style.color = 'orange';
    } else {
        apiStatus.textContent = `API: ${apiRequestCount}/${apiRequestLimit} requests today`;
        apiStatus.style.color = 'inherit';
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initApiTracking();
    initTabs();
    initCountrySelect();
    initPlantPresets();
    initPlantSearch();
    initInfoPanel();
    initFormInputs();
    initCharts();
    initProjects();
    initExports();
    initVerticalGreening();
    initResultsToggle();
    loadState();
    updateApiStatusDisplay();
    console.log('AquaCalc initialized with API request tracking');
});

// Initialize DOM elements
function initializeElements() {
    elements.countrySelect = document.getElementById('country');
    elements.citySelect = document.getElementById('city');
    elements.timePeriodSelect = document.getElementById('timePeriod');
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
    elements.infoPanel = document.getElementById('infoPanel');
    elements.infoToggle = document.getElementById('infoToggle');
    elements.closeInfo = document.getElementById('closeInfoBtn');
    elements.exportPDF = document.getElementById('exportPDF');
    elements.exportExcel = document.getElementById('exportExcel');
    
    // Vertical Greening elements (in Vertical Greening Tab)
    elements.vgOrientation = document.getElementById('vgOrientation');
    elements.vgSystem = document.getElementById('vgSystem');
    elements.vgCustomKf = document.getElementById('vgCustomKf');
    elements.vgShading = document.getElementById('vgShading');
    elements.vgAlbedo = document.getElementById('vgAlbedo');
    elements.vgCustomAlbedo = document.getElementById('vgCustomAlbedo');
    elements.vgWallArea = document.getElementById('vgWallArea');
    elements.vgRoofOverhang = document.getElementById('vgRoofOverhang');
    elements.vgPlant = document.getElementById('vgPlant');
    elements.vgPlantSearch = document.getElementById('vgPlantSearch');
    elements.vgCustomKcValue = document.getElementById('vgCustomKcValue');
    elements.vgCustomKcGroup = document.getElementById('vgCustomKcGroup');
    
    // Results view toggle elements
    elements.viewHorizontal = document.getElementById('viewHorizontal');
    elements.viewVertical = document.getElementById('viewVertical');
    elements.resultsTitle = document.getElementById('resultsTitle');
    elements.resultsDescription = document.getElementById('resultsDescription');
    elements.vgResultsInResults = document.getElementById('vgResultsInResults');
    elements.vgResultsGridInResults = document.getElementById('vgResultsGridInResults');
    elements.calculateVerticalGreening = document.getElementById('calculateVerticalGreening');
    elements.vgResults = document.getElementById('vgResults');
    elements.vgAnnualWater = document.getElementById('vgAnnualWater');
    elements.vgPeakMonth = document.getElementById('vgPeakMonth');
    elements.vgPeakMonthName = document.getElementById('vgPeakMonthName');
    elements.vgPeakNeed = document.getElementById('vgPeakNeed');
    elements.vgResultsTableBody = document.getElementById('vgResultsTableBody');
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
            else if (tabId === 'plant') populatePlantSearch(false);
            else if (tabId === 'verticalGreening') initVerticalGreening();
            else if (tabId === 'results') {
                manualResultsViewSelection = false;
                
                // If we have Vertical Greening results, prioritize showing them
                if (verticalGreeningResults && verticalGreeningResults.monthlyData) {
                    currentResultsView = 'vertical';
                    displayResults();
                } else {
                    calculateResults();
                }
            }
            else if (tabId === 'projects') renderProjects();
        });
    });
}

// Results view toggle
function initResultsToggle() {
    if (!elements.viewHorizontal || !elements.viewVertical) return;
    
    elements.viewHorizontal.addEventListener('click', () => {
        elements.viewHorizontal.classList.add('active');
        elements.viewVertical.classList.remove('active');
        currentResultsView = 'horizontal';
        manualResultsViewSelection = true;
        displayResults();
    });
    
    elements.viewVertical.addEventListener('click', () => {
        elements.viewVertical.classList.add('active');
        elements.viewHorizontal.classList.remove('active');
        currentResultsView = 'vertical';
        manualResultsViewSelection = true;
        displayResults();
    });
    
    // Initialize display
    displayResults();
}

// Display results based on current view
function displayResults() {
    if (!elements.resultsTitle || !elements.resultsDescription) return;
    
    // Sync button states with current view
    if (currentResultsView === 'horizontal') {
        if (elements.viewHorizontal) elements.viewHorizontal.classList.add('active');
        if (elements.viewVertical) elements.viewVertical.classList.remove('active');
        
        elements.resultsTitle.textContent = 'Horizontal Planting Results';
        elements.resultsDescription.innerHTML = 'Water demand based on FAO-56 Penman-Monteith method: ET<sub>c</sub> = ET<sub>0</sub> × K<sub>c</sub> × situation factors. Effective rain = rainfall × 0.8 × situation rain factor. Net irrigation = ET<sub>c</sub> - effective rain (minimum 0).';
        
        // Show horizontal results, hide vertical
        const mainResults = document.getElementById('mainResults');
        const monthlyChart = document.getElementById('monthlyChart');
        const resultsTable = document.getElementById('resultsTable');
        
        if (mainResults) mainResults.style.display = 'grid';
        if (monthlyChart) monthlyChart.parentElement.style.display = 'block';
        if (resultsTable) resultsTable.parentElement.style.display = 'block';
        if (elements.vgResultsInResults) elements.vgResultsInResults.style.display = 'none';
        
        // Recreate chart for horizontal planting
        if (monthlyResults && monthlyResults.length > 0) {
            createMonthlyChart(monthlyResults);
        }
    } else {
        if (elements.viewHorizontal) elements.viewHorizontal.classList.remove('active');
        if (elements.viewVertical) elements.viewVertical.classList.add('active');
        
        elements.resultsTitle.textContent = 'Vertical Greening Results';
        elements.resultsDescription.textContent = 'Vertical facade irrigation water demand with orientation factors and system-specific Kf values.';
        
        // Hide horizontal results, show vertical
        const mainResults = document.getElementById('mainResults');
        const monthlyChart = document.getElementById('monthlyChart');
        const resultsTable = document.getElementById('resultsTable');
        
        if (mainResults) mainResults.style.display = 'none';
        if (monthlyChart) monthlyChart.parentElement.style.display = 'none';
        if (resultsTable) resultsTable.parentElement.style.display = 'none';
        
        const vgResultsElement = document.getElementById('vgResultsInResults');
        if (vgResultsElement) {
            vgResultsElement.style.display = 'block';
        }
        
        // Display vertical greening results only if results are available
        if (verticalGreeningResults?.monthlyData) {
            displayVerticalGreeningInResults();
        }
    }
    
    // Always show the view toggle
    const viewToggle = document.querySelector('#resultsTab .toggle-group');
    if (viewToggle) viewToggle.style.display = 'flex';
}

// Display Vertical Greening results in Results tab only
function displayVerticalGreeningResults() {
    // ✅ Only show results in Results Tab, nothing in VG Tab
}

// Display Vertical Greening results in Vertical Greening Tab
function displayVerticalGreeningInVGTab() {
    // ✅ Do NOT display anything in Vertical Greening Tab
    // All results will be shown only in Results Tab
}

// Create chart for Vertical Greening in VG Tab
function createVerticalGreeningVGTabChart() {
    // ✅ Not used anymore - VG Tab shows no chart
}

// Display Vertical Greening results in Results tab
function displayVerticalGreeningInResults() {
    const vgContainer = document.getElementById('vgResultsInResults');
    const resultsTab = document.getElementById('resultsTab');
    const resultsTabBtn = document.querySelector('.tab[data-tab="results"]');
    
    // ✅ NUR ANZEIGEN, WENN RESULTS-TAB AKTIV IST
    if (!vgContainer || !resultsTab || !resultsTab.classList.contains('active')) {
        return;
    }
    
    // Make container visible
    vgContainer.style.display = 'block';
    vgContainer.style.visibility = 'visible';
    
    // Check for results
    if (!verticalGreeningResults?.monthlyData?.length) {
        const tableBody = document.getElementById('vgResultsTableBodyInResults');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="8">No VG data. Please calculate first.</td></tr>';
        return;
    }
    
    // Update result cards
    if (document.getElementById('vgAnnualWaterResults')) 
        document.getElementById('vgAnnualWaterResults').textContent = Math.round(verticalGreeningResults.annualWater).toLocaleString();
    if (document.getElementById('vgPeakMonthResults')) 
        document.getElementById('vgPeakMonthResults').textContent = verticalGreeningResults.peakMonth;
    if (document.getElementById('vgPeakMonthNameResults')) 
        document.getElementById('vgPeakMonthNameResults').textContent = verticalGreeningResults.peakMonthName || '-';
    if (document.getElementById('vgPeakNeedResults')) 
        document.getElementById('vgPeakNeedResults').textContent = Math.round(verticalGreeningResults.peakNeed).toLocaleString();
    
    // Update table
    const tableBody = document.getElementById('vgResultsTableBodyInResults');
    const wallArea = verticalGreeningResults.wallArea || 1;
    if (tableBody) {
        try {
            tableBody.innerHTML = verticalGreeningResults.monthlyData.map(row => {
                const et0_vert = parseFloat(row.et0_vert) || 0;
                const etc_vert = parseFloat(row.etc_vert) || 0;
                const p_eff = parseFloat(row.p_eff) || 0;
                const kc = parseFloat(row.kc) || 0;
                const kf = parseFloat(row.kf) || 0;
                const net_mm = etc_vert - p_eff;
                const litres = Math.max(net_mm * wallArea, 0);
                return `<tr>
                    <td>${row.month}</td>
                    <td>${et0_vert.toFixed(1)}</td>
                    <td>${kc.toFixed(2)}</td>
                    <td>${kf.toFixed(2)}</td>
                    <td>${etc_vert.toFixed(1)}</td>
                    <td>${p_eff.toFixed(1)}</td>
                    <td>${net_mm.toFixed(1)}</td>
                    <td>${Math.round(litres).toLocaleString()}</td>
                </tr>`;
            }).join('');
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="8">Error displaying table: ' + e.message + '</td></tr>';
        }
    }
    
    // Create chart with delay
    setTimeout(createVerticalGreeningResultsChart, 100);
}

// Create chart for Vertical Greening results in Results tab
function createVerticalGreeningResultsChart() {
    const ctx = document.getElementById('vgMonthlyChartResults');
    if (!ctx) {
        console.error('vgMonthlyChartResults canvas not found');
        return;
    }
    
    // Ensure we have data
    if (!verticalGreeningResults || !verticalGreeningResults.monthlyData) {
        console.error('No vertical greening results data for chart');
        return;
    }
    
    // Make sure canvas is visible
    ctx.style.display = 'block';
    ctx.style.visibility = 'visible';
    ctx.style.opacity = '1';
    
    // Ensure chart container is visible and has enough height for title + legend
    const chartContainer = ctx.closest('.chart-container');
    if (chartContainer) {
        chartContainer.style.display = 'block';
        chartContainer.style.visibility = 'visible';
        chartContainer.style.opacity = '1';
        chartContainer.style.height = 'auto';
        chartContainer.style.minHeight = '450px';
        chartContainer.style.marginBottom = '40px';
    }
    
    // Destroy existing chart if it exists
    if (vgResultsChart) {
        try {
            vgResultsChart.destroy();
        } catch (e) {
            // Silent fail
        }
    }
    vgResultsChart = null;
    
    const wallArea = verticalGreeningResults.wallArea || 1;
    const etc_vert_data = verticalGreeningResults.monthlyData.map(r => parseFloat(r.etc_vert));
    const p_eff_data = verticalGreeningResults.monthlyData.map(r => parseFloat(r.p_eff));
    const net_data = verticalGreeningResults.monthlyData.map(r => {
        const etc_vert = parseFloat(r.etc_vert);
        const p_eff = parseFloat(r.p_eff);
        return etc_vert - p_eff;
    });
    
    vgResultsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: verticalGreeningResults.monthlyData.map(r => r.month),
            datasets: [
                {
                    label: 'Net (mm)',
                    data: net_data,
                    backgroundColor: 'rgba(231,76,60,0.7)',
                    borderColor: 'rgba(231,76,60,1)',
                    borderWidth: 1
                },
                {
                    label: 'P<sub>eff</sub> (mm)',
                    data: p_eff_data,
                    backgroundColor: 'rgba(52,152,219,0.7)',
                    borderColor: 'rgba(52,152,219,1)',
                    borderWidth: 1
                },
                {
                    label: 'ET<sub>c,vert</sub> (mm)',
                    data: etc_vert_data,
                    type: 'line',
                    backgroundColor: 'rgba(107,158,122,0.2)',
                    borderColor: 'rgba(107,158,122,1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Water Depth (mm)'
                    },
                    suggestedMax: Math.max(...etc_vert_data, ...p_eff_data, ...net_data) * 1.1
                }
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' mm';
                        }
                    }
                }
            }
        }
    });
    
    // ✅ Add title and legend before canvas (inside chart container)
    if (chartContainer && ctx) {
        // Create title and legend element
        const titleLegendHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Vertical Greening Monthly Water Balance</div>
            <div class="custom-legend" style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 18px; height: 10px; background-color: rgba(231,76,60,0.7); border: 1px solid rgba(231,76,60,1);"></span>
                    <span>Net (mm)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 18px; height: 10px; background-color: rgba(52,152,219,0.7); border: 1px solid rgba(52,152,219,1);"></span>
                    <span>P<sub>eff</sub> (mm)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 18px; height: 10px; background-color: rgba(107,158,122,1); border: 1px solid rgba(107,158,122,1);"></span>
                    <span>ET<sub>c,vert</sub> (mm)</span>
                </div>
            </div>
        </div>`;
        // Insert before the canvas (inside chart container)
        chartContainer.insertBefore(
            (() => {
                const div = document.createElement('div');
                div.innerHTML = titleLegendHTML;
                return div;
            })(),
            ctx
        );
    }
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
    
    // Move city select handler here to avoid duplicate listeners
    if (elements.citySelect) {
        elements.citySelect.addEventListener('change', async () => {
            const city = elements.citySelect.value;
            if (city) {
                currentCity = city;
                if (elements.climateCard) elements.climateCard.style.display = 'block';
                
                // API only - always load from OpenMeteo
                const apiData = await loadClimateData(city);
                if (apiData) {
                    displayClimateData(city);
                } else {
                    // Could not load data
                    currentClimateData = null;
                    if (elements.climateCard) elements.climateCard.style.display = 'none';
                }
            } else {
                currentCity = null; currentClimateData = null;
                if (elements.climateCard) elements.climateCard.style.display = 'none';
            }
            saveState();
        });
    }
    
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
}

// ============================================
// OpenMeteo API Integration Functions
// Fetch climate data from OpenMeteo API for selected city and time period
// ============================================

// Fetch climate data from OpenMeteo API with caching and retry logic
async function fetchClimateDataFromOpenMeteo(cityName, years) {
    const coords = cityCoordinates[cityName];
    if (!coords) {
        console.error('City coordinates not found:', cityName);
        return null;
    }
    
    // Check rate limit before making request
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed && rateCheck.remaining <= 0) {
        console.error('API rate limit reached');
        return null;
    }
    
    // Generate cache key
    const cacheKey = getCacheKey(cityName, years);
    
    // Return cached response if available
    if (apiResponseCache.has(cacheKey)) {
        console.log('Returning cached data for:', cacheKey);
        return apiResponseCache.get(cacheKey);
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - parseInt(years));
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    // Format: YYYY-MM-DD
    const apiUrl = `https://archive-api.open-meteo.com/v1/era5?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=${startStr}&end_date=${endStr}&daily=precipitation_sum,et0_fao_evapotranspiration&timezone=auto`;
    
    let lastError = null;
    
    // Retry loop with exponential backoff
    for (let retry = 0; retry <= maxRetries; retry++) {
        try {
            const response = await fetch(apiUrl);
            
            // Check for rate limiting (429 Too Many Requests)
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 5;
                console.warn(`Rate limited. Retry after ${retryAfter} seconds.`);
                
                if (retry < maxRetries) {
                    // Wait for the specified time or exponential backoff, whichever is longer
                    const delay = Math.max(retryAfter * 1000, retryBaseDelay * Math.pow(2, retry));
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                } else {
                    throw new Error(`Rate limited. Please wait ${retryAfter} seconds.`);
                }
            }
            
            // Check for other HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${getHttpErrorMessage(response.status)}`);
            }
            
            const data = await response.json();
            
            // Increment request counter only on successful response
            incrementRequestCount();
            updateApiStatusDisplay();
            
            // Process and cache the response
            const processedData = processOpenMeteoData(data, years);
            if (processedData) {
                apiResponseCache.set(cacheKey, processedData);
                return processedData;
            } else {
                // Invalid data format
                throw new Error('Invalid data format in API response');
            }
            
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${retry + 1} failed for ${cityName}:`, error);
            
            // Wait before retrying (exponential backoff)
            if (retry < maxRetries) {
                const delay = retryBaseDelay * Math.pow(2, retry);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // All retries failed
    console.error('All retry attempts failed for:', cityName, lastError);
    return null;
}

// Process OpenMeteo API response into our format
function processOpenMeteoData(apiData, years) {
    if (!apiData || !apiData.daily || !apiData.daily.precipitation_sum || !apiData.daily.et0_fao_evapotranspiration) {
        console.error('Invalid OpenMeteo API response:', apiData);
        return null;
    }
    
    const precip = apiData.daily.precipitation_sum;
    const et0 = apiData.daily.et0_fao_evapotranspiration;
    const dates = apiData.daily.time;
    
    // Validate we have data
    if (!Array.isArray(precip) || !Array.isArray(et0) || precip.length === 0 || et0.length === 0) {
        console.error('No valid data in OpenMeteo response');
        return null;
    }
    
    // Group by month and calculate monthly averages
    const monthlyData = Array(24).fill(0); // 12 months rainfall + 12 months ET0
    const monthlyDayCounts = Array(12).fill(0); // Count days per month for averaging
    
    for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        const month = date.getMonth(); // 0-11
        
        // Sum precipitation for each month
        if (precip[i] !== null && !isNaN(precip[i])) {
            monthlyData[month] += precip[i];
            monthlyDayCounts[month]++;
        }
        
        // Sum ET0 for each month
        if (et0[i] !== null && !isNaN(et0[i])) {
            monthlyData[month + 12] += et0[i];
        }
    }
    
    // Calculate monthly averages: divide by number of years
    // The sum for each month is the total across all years, so divide by years to get average
    const yearsOfData = parseInt(years) || 30;
    
    for (let m = 0; m < 12; m++) {
        if (monthlyDayCounts[m] > 0) {
            // Divide total by number of years to get average monthly value
            monthlyData[m] = parseFloat((monthlyData[m] / yearsOfData).toFixed(1));
            monthlyData[m + 12] = parseFloat((monthlyData[m + 12] / yearsOfData).toFixed(1));
        }
    }
    
    return monthlyData;
}

// Load climate data - API only
async function loadClimateData(cityName) {
    if (currentTimePeriod) {
        // Show loading state
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            apiStatus.textContent = 'Loading from OpenMeteo...';
            apiStatus.style.color = 'orange';
        }
        
        // Check rate limit before attempting
        const rateCheck = checkRateLimit();
        if (!rateCheck.allowed) {
            if (apiStatus) {
                apiStatus.textContent = rateCheck.message || 'API rate limit reached';
                apiStatus.style.color = 'red';
            }
            return null;
        }
        
        try {
            const apiData = await fetchClimateDataFromOpenMeteo(cityName, currentTimePeriod);
            if (apiData) {
                currentClimateData = apiData;
                if (apiStatus) {
                    apiStatus.textContent = 'Live data from OpenMeteo';
                    apiStatus.style.color = 'green';
                }
                return apiData;
            } else {
                // fetchClimateDataFromOpenMeteo returned null (rate limited or error)
                if (apiStatus) {
                    const rateCheckNow = checkRateLimit();
                    if (!rateCheckNow.allowed) {
                        apiStatus.textContent = rateCheckNow.message || 'API rate limit reached';
                    } else {
                        apiStatus.textContent = 'API request failed. Please try again later.';
                    }
                    apiStatus.style.color = 'red';
                }
            }
        } catch (error) {
            console.error('API fetch failed:', error);
            if (apiStatus) {
                apiStatus.textContent = `API Error: ${error.message || 'Please try again later'}`;
                apiStatus.style.color = 'red';
            }
        }
    }
    
    // No fallback - API only
    const apiStatus = document.getElementById('apiStatus');
    if (apiStatus) {
        apiStatus.textContent = 'API request failed. Please try again later.';
        apiStatus.style.color = 'red';
    }
    return null;
}

function displayClimateData(cityName) {
    if (!elements.climateInfo || !currentClimateData) return;
    const data = currentClimateData;
    const et0Annual = data.slice(12,24).reduce((a,b)=>a+b,0);
    const rainAnnual = data.slice(0,12).reduce((a,b)=>a+b,0);
    elements.climateInfo.innerHTML = `<div class="row"><div class="col"><strong>Annual ET0:</strong> ${et0Annual.toFixed(1)} mm</div>
        <div class="col"><strong>Annual Rainfall:</strong> ${rainAnnual.toFixed(1)} mm</div></div>`;
    updateClimateTable(cityName, data);
    createClimateChart(cityName, data);
}

function updateClimateTable(cityName, data) {
    if (!elements.climateDataTable) return;
    const et0Data = data.slice(12,24); const rainData = data.slice(0,12);
    elements.climateDataTable.innerHTML = '';
    for (let i=0; i<12; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${months[i]}</td><td>${et0Data[i].toFixed(1)}</td><td>${rainData[i].toFixed(1)}</td>`;
        elements.climateDataTable.appendChild(row);
    }
}

function createClimateChart(cityName, data) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const et0Data = data.slice(12,24); const rainData = data.slice(0,12);
    const maxRain = Math.max(...rainData);
    const maxEt0 = Math.max(...et0Data);
    const maxValue = Math.max(maxRain, maxEt0);
    const ctx = document.getElementById('climateChart'); if (!ctx) return;
    if (climateChart) climateChart.destroy();
    climateChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {label: 'Rainfall (mm)', data: rainData, backgroundColor: 'rgba(52,152,219,0.7)', borderColor: 'rgba(52,152,219,1)', yAxisID: 'y'},
                {label: 'ET0 (mm)', data: et0Data, type: 'line', backgroundColor: 'rgba(231,76,60,0.2)', 
                 borderColor: 'rgba(231,76,60,1)', borderWidth: 2, fill: false, tension: 0.3, yAxisID: 'y1'}
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: {type: 'linear', display: true, position: 'left', title: {display: true, text: 'Rainfall (mm)'}, beginAtZero: true, suggestedMax: maxValue * 1.1},
                y1: {type: 'linear', display: true, position: 'right', title: {display: true, text: 'ET0 (mm)'}, 
                      grid: {drawOnChartArea: false}, beginAtZero: true, suggestedMax: maxValue * 1.1}
            },
            plugins: {
                title: {display: true, text: `Climate Data - ${cityName}`, font: {size: 16}},
                legend: {position: 'top'},
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            let label = ctx.dataset.label;
                            if (label.includes('ET0')) label = label.replace('ET0', 'Reference Evapotranspiration (ET₀)');
                            if (label.includes('Rainfall')) label = label.replace('Rainfall', 'Precipitation');
                            return `${label}: ${ctx.parsed.y} mm`;
                        }
                    }
                }
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


function populatePlantSearch(includeClimbers = true) {
    if (!elements.plantSelect) return;
    // Only repopulate if includeClimbers is false (for horizontal planting) or if not already populated
    if (includeClimbers && elements.plantSelect.options.length > 1) return;
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
    
    // Add plant database options with tooltips - filter out climbers if needed
    plantDatabase.forEach(p => {
        // Skip climbers for horizontal planting
        if (!includeClimbers && p.category === 'Climbers') return;
        
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
        // Skip climbing plant profiles for horizontal planting
        if (!includeClimbers && (k.toLowerCase().includes('kletter') || k.toLowerCase().includes('climbing') || k.toLowerCase().includes('climber'))) return;
        
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
    if (!elements.plantSelect) return;
    // For horizontal planting, exclude climbers
    populatePlantSearch(false);
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

function filterVgPlantSearch(term) {
    if (!elements.vgPlant) return;
    for (let i = 1; i < elements.vgPlant.options.length; i++) {
        const opt = elements.vgPlant.options[i];
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
    // Time period control
    if (elements.timePeriodSelect) {
        currentTimePeriod = elements.timePeriodSelect.value || '30';
        elements.timePeriodSelect.addEventListener('change', async () => { 
            currentTimePeriod = elements.timePeriodSelect.value; 
            
            // Reload climate data from API with new time period
            if (currentCity) {
                const apiData = await loadClimateData(currentCity);
                if (apiData) {
                    displayClimateData(currentCity);
                }
            }
            
            calculateResults(); saveState(); 
        });
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
    
    if (maxMonthlyET0 > 150) {
        warnings.push(`Peak ET0 (${maxMonthlyET0} mm/month) is high. Check climate data source.`);
    }
    
    if (minMonthlyET0 < 10) {
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
    
    monthlyResults = []; let annualWater = 0; let peakMonth = ''; let peakNeed = 0; let peakMonthIndex = 0;
    
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
    displayResults();
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
                {label: 'ETc (mm)', data: etcData, type: 'line', backgroundColor: 'rgba(107,158,122,0.2)', 
                 borderColor: 'rgba(107,158,122,1)', borderWidth: 2, fill: false, tension: 0.3}
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {display: true, text: 'Water Depth (mm)'},
                    suggestedMax: Math.max(...netData, ...rainData, ...etcData) * 1.1
                }
            },
            plugins: {
                title: {display: true, text: 'Monthly Water Balance', font: {size: 16}},
                legend: {position: 'top'},
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            let label = ctx.dataset.label;
                            const mappings = {
                                'Net Irrigation': 'Net Irrigation (ETc - Effective Rain)',
                                'Rainfall': 'Precipitation',
                                'ETc': 'Crop Evapotranspiration (ET₀ × Kc × Situation Factor)'
                            };
                            return `${mappings[label] || label}: ${ctx.parsed.y} mm`;
                        }
                    }
                }
            }
        }
    });
}

function calculateWateringPlan(monthlyResults, peakMonthIndex, area = currentArea, plant = currentPlant) {
    if (!elements.seasonCards || !elements.irrigationType || !elements.pressure) return;
    const type = elements.irrigationType.value; 
    const pressure = parseInt(elements.pressure.value);
    const config = irrigationTypes[type]; 
    if (!config) return;
    
    // Handle both horizontal (litres) and vertical (totalLitres) result formats
    const peakLitres = parseFloat(monthlyResults[peakMonthIndex].litres || monthlyResults[peakMonthIndex].totalLitres);
    const weeklyLitres = peakLitres / 4.345;
    const flowRate = config.flowRate[pressure] || config.flowRate['4'];
    
    // Calculate emitters/units needed based on area and coverage factor
    const emittersNeeded = area * (config.coverageFactor || 1);
    const unitsNeeded = Math.ceil(emittersNeeded);
    
    // Convert ALL flow rates to L/min for consistent calculation
    // All irrigationTypes now use L/hour, so we need to divide by 60
    const flowRateLmin = flowRate / 60; // Convert L/hour to L/min
    const totalFlowLmin = flowRateLmin * unitsNeeded;
    
    // Get plant type
    const plantType = getPlantType(plant);
    
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
        
        // Calculate season-specific litres using plant-specific factors
        const seasonFactor = getSeasonalFactor(plant, season.key);
        const seasonWeeklyLitres = weeklyLitres * seasonFactor;
        
        const seasonLitresPerSession = seasonWeeklyLitres / days;
        
        // Calculate minutes per session for THIS season
        let seasonMinutes = 0;
        if (totalFlowLmin > 0) {
            seasonMinutes = seasonLitresPerSession / totalFlowLmin;
        }
        
        const litresPerSessionDisplay = Math.round(seasonLitresPerSession);
        const minutesDisplay = seasonMinutes.toFixed(1);
        
        // Add practical validation warnings
        let warningHtml = '';
        if (seasonMinutes < 1) {
            warningHtml = '<p class="warning">⚠️ Session too short (< 1 min). Consider lower flow rate or more units.</p>';
        } else if (seasonMinutes > 120) {
            const numSessions = Math.ceil(seasonMinutes / 120);
            const adjustedMinutes = (seasonMinutes / numSessions).toFixed(1);
            warningHtml = `<p class="warning">⚠️ Long session (${seasonMinutes.toFixed(0)} min). Consider ${numSessions} sessions of ${adjustedMinutes} minutes each.</p>`;
        }
        
        // Flow rate display
        const flowRateDisplay = `${flowRate} L/h`; // All now in L/hour
        const totalFlowDisplay = `${(totalFlowLmin * 60).toFixed(1)} L/h`; // Total in L/hour
        
        // Unit type
        const unitType = type === 'drip' ? 'emitters' : type === 'micro' ? 'micro-sprayers' : 'sprinklers';
        
        const card = document.createElement('div');
        card.className = 'season-card';
        card.innerHTML = `<h4>${season.name}</h4>
            <p><strong>Days per week:</strong> ${days}</p>
            <p><strong>Minutes per session:</strong> ${minutesDisplay}</p>
            <p><strong>Litres per session:</strong> ${litresPerSessionDisplay.toLocaleString()}</p>
            <p><strong>Weekly water:</strong> ${Math.round(seasonWeeklyLitres).toLocaleString()} litres</p>
            <p><strong>Units needed:</strong> ${unitsNeeded} ${unitType} @ ${flowRateDisplay} each</p>
            <p><strong>Total flow:</strong> ${totalFlowDisplay} for ${area} m²</p>
            ${isPeak ? '<p><em>(Peak season - highest water demand)</em></p>' : ''}
            ${warningHtml}`;
        elements.seasonCards.appendChild(card);
    });
}

// Theme toggle
// Info panel
function initInfoPanel() {
    if (!elements.infoToggle || !elements.infoPanel || !elements.closeInfo) return;
    elements.infoToggle.addEventListener('click', () => elements.infoPanel.classList.add('active'));
    elements.closeInfo.addEventListener('click', () => elements.infoPanel.classList.remove('active'));
    elements.infoPanel.addEventListener('click', e => { if (e.target === elements.infoPanel) elements.infoPanel.classList.remove('active'); });
}

// Vertical Greening
function initVerticalGreening() {
    // Vertical Greening is now in its own tab, no toggle needed
    
    // Initialize vertical greening form inputs
    if (elements.vgSystem) {
        elements.vgSystem.addEventListener('change', updateCustomKfVisibility);
        updateCustomKfVisibility();
    }
    
    if (elements.vgAlbedo) {
        elements.vgAlbedo.addEventListener('change', updateCustomAlbedoVisibility);
        updateCustomAlbedoVisibility();
    }
    
    // Plant search functionality
    if (elements.vgPlant) {
        initVerticalGreeningPlantSearch();
    }
    
    // Custom Kc handling
    if (elements.vgPlant && elements.vgCustomKcGroup) {
        elements.vgPlant.addEventListener('change', function() {
            const selectedValue = elements.vgPlant.value;
            if (selectedValue === 'custom_kc') {
                elements.vgCustomKcGroup.style.display = 'block';
            } else {
                elements.vgCustomKcGroup.style.display = 'none';
            }
            // Auto-calculate on plant change
            debounceCalculateVerticalGreening();
        });
    }
    
    // Auto-calculate on input changes
    initVerticalGreeningAutoCalc();
    
    // Listen for wall area changes for validation
    if (elements.vgWallArea) {
        elements.vgWallArea.addEventListener('change', validateVerticalGreeningInputs);
        elements.vgWallArea.addEventListener('input', validateVerticalGreeningInputs);
    }
    
    populateVerticalGreeningDefaults();
}

// Auto-calculate for Vertical Greening
let vgCalcTimeout = null;
function debounceCalculateVerticalGreening() {
    clearTimeout(vgCalcTimeout);
    
    // Only calculate if we have required data
    if (currentCity && currentClimateData) {
        vgCalcTimeout = setTimeout(calculateVerticalGreeningResults, 500);
    } else {
        // Show warning if city not selected
        const warningEl = document.getElementById('vgCityWarning');
        if (warningEl) {
            warningEl.style.display = (!currentCity || !currentClimateData) ? 'block' : 'none';
        }
    }
}

function initVerticalGreeningAutoCalc() {
    const inputs = [
        elements.vgOrientation, elements.vgSystem, elements.vgCustomKf,
        elements.vgShading, elements.vgAlbedo, elements.vgCustomAlbedo,
        elements.vgWallArea, elements.vgRoofOverhang, elements.vgPlant,
        elements.vgPlantSearch, elements.vgCustomKcValue
    ].filter(Boolean);
    
    inputs.forEach(input => {
        input.addEventListener('input', debounceCalculateVerticalGreening);
        input.addEventListener('change', debounceCalculateVerticalGreening);
    });
}

function initVerticalGreeningPlantSearch() {
    if (!elements.vgPlant) return;
    
    const plantSelect = elements.vgPlant;
    
    // Populate the select with all climbing plants from data.js
    // Structure: { id: { name: "Botanical (Common)", months: [...] } }
    plantSelect.innerHTML = '<option value="">Select a plant from the dropdown...</option>';
    
    Object.entries(climbingPlantKcProfiles || {}).forEach(([id, data]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = data.name;
        plantSelect.appendChild(option);
    });
    
    // Add Custom Kc option
    const customOption = document.createElement('option');
    customOption.value = 'custom_kc';
    customOption.textContent = 'Custom Kc Profile';
    plantSelect.appendChild(customOption);
    
    // Select plant from dropdown
    plantSelect.addEventListener('change', function() {
        if (plantSelect.value === 'custom_kc') {
            elements.vgCustomKcGroup.style.display = 'block';
        } else {
            elements.vgCustomKcGroup.style.display = 'none';
        }
    });
}

function populateVerticalGreeningDefaults() {
    // Set default values if not already set
    if (elements.vgOrientation && !elements.vgOrientation.value) {
        elements.vgOrientation.value = 'S';
    }
    if (elements.vgSystem && !elements.vgSystem.value) {
        elements.vgSystem.value = 'trough';
    }
    if (elements.vgShading && !elements.vgShading.value) {
        elements.vgShading.value = 'none';
    }
    if (elements.vgAlbedo && !elements.vgAlbedo.value) {
        elements.vgAlbedo.value = '0.22';
    }
    if (elements.vgWallArea && !elements.vgWallArea.value) {
        elements.vgWallArea.value = 50;
    }
    if (elements.vgRoofOverhang && !elements.vgRoofOverhang.value) {
        elements.vgRoofOverhang.value = 'no';
    }
}

function updateCustomKfVisibility() {
    if (!elements.vgSystem || !elements.vgCustomKf) return;
    const showCustom = elements.vgSystem.value === 'custom';
    elements.vgCustomKf.style.display = showCustom ? 'block' : 'none';
}

function updateCustomAlbedoVisibility() {
    if (!elements.vgAlbedo || !elements.vgCustomAlbedo) return;
    const showCustom = elements.vgAlbedo.value === 'custom';
    elements.vgCustomAlbedo.style.display = showCustom ? 'block' : 'none';
}

function validateVerticalGreeningInputs() {
    if (!elements.vgWallArea) return;
    
    const area = parseFloat(elements.vgWallArea.value) || 0;
    const warningContainer = document.getElementById('vgInputWarning') || createWarningContainer();
    
    if (area > 0 && area < 1) {
        warningContainer.innerHTML = '⚠️ Wall area should be at least 1 m².';
        warningContainer.style.display = 'block';
    } else if (area > 10000) {
        warningContainer.innerHTML = '⚠️ Very large wall area. Please verify input.';
        warningContainer.style.display = 'block';
    } else {
        warningContainer.style.display = 'none';
    }
}

function createWarningContainer() {
    const container = document.createElement('div');
    container.id = 'vgInputWarning';
    container.style.cssText = 'color: var(--accent-color); margin-top: 10px; padding: 10px; background: rgba(231, 76, 60, 0.1); border-radius: 5px; border-left: 4px solid var(--accent-color); display: none;';
    
    const vgTab = document.getElementById('verticalGreeningTab');
    if (vgTab && elements.vgWallArea) {
        // Insert after wall area field
        const wallAreaGroup = elements.vgWallArea.closest('.form-group');
        if (wallAreaGroup) {
            wallAreaGroup.parentNode.insertBefore(container, wallAreaGroup.nextSibling);
        } else {
            const formSection = vgTab.querySelector('.form-section');
            if (formSection) {
                formSection.insertBefore(container, formSection.firstChild);
            }
        }
    }
    return container;
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
    // Check if Vertical Greening results are available
    if (verticalGreeningResults && verticalGreeningResults.monthlyData) {
        exportVerticalGreeningToPDF();
        return;
    }
    if (!currentCity || !currentPlant || !currentClimateData) { alert('Please select a city and plant first.'); return; }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePDFContent()); printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

function exportVerticalGreeningToPDF() {
    if (!verticalGreeningResults || !verticalGreeningResults.monthlyData) { 
        alert('Please calculate Vertical Greening results first.'); 
        return; 
    }
    const plantName = verticalGreeningResults.monthlyData.length > 0 ? verticalGreeningResults.monthlyData[0].plantName || 'Unknown' : 'Unknown';
    const now = new Date(); const dateStr = now.toLocaleDateString();
    const wallArea = verticalGreeningResults.wallArea || 0;
    
    printWindow.document.write(generateVerticalGreeningPDFContent()); 
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

function generateVerticalGreeningPDFContent() {
    if (!verticalGreeningResults || !verticalGreeningResults.monthlyData) return '<p>No Vertical Greening data.</p>';
    const plantName = 'Vertical Greening';
    const now = new Date(); const dateStr = now.toLocaleDateString();
    const wallArea = verticalGreeningResults.wallArea || 0;
    
    const orientation = document.getElementById('vgOrientation') ? document.getElementById('vgOrientation').value : 'Unknown';
    const system = document.getElementById('vgSystem') ? document.getElementById('vgSystem').value : 'Unknown';
    const plant = document.getElementById('vgPlant') ? document.getElementById('vgPlant').value : 'Unknown';
    const plantDisplayName = plantNamesEN[plant] || plant;
    
    return `<!DOCTYPE html><html><head><title>AquaCalc Vertical Greening Report - ${currentCity} | ${plantDisplayName}</title>
        <style>body{font-family:Arial,sans-serif;margin:20px;color:#333}h1{color:#2c3e50;font-size:24px}h2{color:#3498db;font-size:20px}h3{color:#2c3e50;font-size:18px}
        .header{margin-bottom:30px;border-bottom:2px solid #2c3e50;padding-bottom:20px}.section{margin-bottom:25px}
        .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:20px 0}.result-card{border:1px solid #ddd;padding:15px;border-radius:5px;background:#f9f9f9}
        .result-value{font-size:24px;font-weight:bold;color:#e74c3c}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#2c3e50;color:white}tr:nth-child(even){background:#f2f2f2}
        .footer{margin-top:40px;font-size:12px;color:#7f8c8d}.metadata{font-size:12px;color:#7f8c8d;margin-top:5px}</style></head>
        <body><div class="header"><h1>AquaCalc - Vertical Greening</h1><p><strong>FAO-56 Based Irrigation Water Calculator</strong></p>
        <div class="metadata"><p>Generated: ${dateStr}</p><p>City: ${currentCity}</p><p>Plant: ${plantDisplayName}</p>
        <p>Wall Area: ${wallArea} m²</p><p>Facade Orientation: ${getOrientationName(orientation)}</p>
        <p>Greening System: ${getSystemName(system)}</p></div></div>
        <div class="section"><h2>Vertical Greening Monthly Water Balance</h2>${generateVerticalGreeningResultsTableHTML()}</div>
        <div class="section"><h2>Summary</h2><div class="results-grid">
        <div class="result-card"><h3>Annual Water Need</h3><div class="result-value">${verticalGreeningResults.annualWater ? Math.round(verticalGreeningResults.annualWater).toLocaleString() : '-'}</div><p>litres</p></div>
        <div class="result-card"><h3>Peak Month</h3><div class="result-value">${verticalGreeningResults.peakMonth || '-'}</div><p>${verticalGreeningResults.peakMonthName || '-'}</p></div>
        <div class="result-card"><h3>Peak Month Need</h3><div class="result-value">${verticalGreeningResults.peakNeed ? Math.round(verticalGreeningResults.peakNeed).toLocaleString() : '-'}</div><p>litres</p></div></div></div>
        <div class="footer"><p>&#169; ${new Date().getFullYear()} | AquaCalc - FAO-56 Irrigation Water Calculator</p>
        <p>Data Source: Open-Meteo API (ERA5 reanalysis)</p></div></body></html>`;
}

function getOrientationName(code) {
    const names = {'N':'North', 'NE':'Northeast', 'E':'East', 'SE':'Southeast', 'S':'South', 'SW':'Southwest', 'W':'West', 'NW':'Northwest'};
    return names[code] || code;
}

function getSystemName(code) {
    const names = {'soil':'Soil-based', 'trough':'Wall-mounted trough', 'living_wall':'Living Wall Panels', 'custom':'Custom'};
    return names[code] || code;
}

function generateVerticalGreeningResultsTableHTML() {
    if (!verticalGreeningResults || !verticalGreeningResults.monthlyData) return '<p>No results.</p>';
    const wallArea = verticalGreeningResults.wallArea || 0;
    let html = '<table><thead><tr><th>Month</th><th>ET0_vert (mm)</th><th>Kc</th><th>Kf</th><th>ETc_vert (mm)</th><th>P_eff (mm)</th><th>Net (mm)</th><th>Litres</th></tr></thead><tbody>';
    verticalGreeningResults.monthlyData.forEach(row => {
        const etc_vert = parseFloat(row.etc_vert);
        const p_eff = parseFloat(row.p_eff);
        const net_mm = etc_vert - p_eff;
        const litres = Math.max(net_mm * wallArea, 0);
        html += `<tr><td>${row.month}</td><td>${row.et0_vert}</td><td>${row.kc}</td><td>${row.kf}</td><td>${row.etc_vert}</td><td>${row.p_eff}</td><td>${net_mm.toFixed(1)}</td><td>${Math.round(litres).toLocaleString()}</td></tr>`;
    });
    return html + '</tbody></table>';
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
        <p>Data Source: Open-Meteo API (ERA5 reanalysis)</p></div></body></html>`;
}

function generateClimateTableHTML() {
    if (!currentClimateData) return '<p>No climate data.</p>';
    const et0 = currentClimateData.slice(12,24); const rain = currentClimateData.slice(0,12);
    let html = '<table><thead><tr><th>Month</th><th>ET0 (mm)</th><th>Rainfall (mm)</th></tr></thead><tbody>';
    for (let i=0; i<12; i++) html += `<tr><td>${months[i]}</td><td>${et0[i]}</td><td>${rain[i]}</td></tr>`;
    return html + '</tbody></table>';
}

function generateResultsTableHTML() {
    if (!elements.resultsTableBody) return '<p>No results.</p>';
    let html = '<table><thead><tr><th>Month</th><th>ET0 (mm)</th><th>Kc</th><th>ETc (mm)</th><th>Rain (mm)</th><th>Effective Rain (mm)</th><th>Net (mm)</th><th>Litres</th></tr></thead><tbody>';
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
    // Check if Vertical Greening results are available
    if (verticalGreeningResults && verticalGreeningResults.monthlyData) {
        exportVerticalGreeningToExcel();
        return;
    }
    if (!currentCity || !currentPlant || !currentClimateData) { alert('Please select city and plant first.'); return; }
    const csv = generateCSVContent();
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `AquaCalc_${currentCity}_${currentPlant}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function exportVerticalGreeningToExcel() {
    if (!verticalGreeningResults || !verticalGreeningResults.monthlyData) { 
        alert('Please calculate Vertical Greening results first.'); 
        return; 
    }
    const csv = generateVerticalGreeningCSVContent();
    const plant = document.getElementById('vgPlant') ? document.getElementById('vgPlant').value : 'Unknown';
    const plantName = plantNamesEN[plant] || plant;
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `AquaCalc_VerticalGreening_${currentCity}_${plantName}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function generateVerticalGreeningCSVContent() {
    if (!verticalGreeningResults || !verticalGreeningResults.monthlyData) return '';
    const plant = document.getElementById('vgPlant') ? document.getElementById('vgPlant').value : 'Unknown';
    const plantName = plantNamesEN[plant] || plant;
    const orientation = document.getElementById('vgOrientation') ? document.getElementById('vgOrientation').value : 'Unknown';
    const system = document.getElementById('vgSystem') ? document.getElementById('vgSystem').value : 'Unknown';
    const wallArea = verticalGreeningResults.wallArea || 0;
    const date = new Date().toLocaleDateString();
    
    let csv = 'AquaCalc Vertical Greening Export\nGenerated: ' + date + '\nCity: ' + currentCity + '\nPlant: ' + plantName + '\nWall Area: ' + wallArea + ' m²\nFacade Orientation: ' + getOrientationName(orientation) + '\nGreening System: ' + getSystemName(system) + '\n\n';
    csv += 'Climate Data\nMonth,ET0 (mm),Rainfall (mm)\n';
    const et0 = currentClimateData.slice(12,24); const rain = currentClimateData.slice(0,12);
    for (let i=0; i<12; i++) csv += months[i] + ',' + et0[i] + ',' + rain[i] + '\n';
    csv += '\nVertical Greening Monthly Water Balance\nMonth,ET0_vert (mm),Kc,Kf,ETc_vert (mm),P_eff (mm),Net (mm),Litres\n';
    const wallAreaVal = verticalGreeningResults.wallArea || 0;
    verticalGreeningResults.monthlyData.forEach(row => {
        const etc_vert = parseFloat(row.etc_vert);
        const p_eff = parseFloat(row.p_eff);
        const net_mm = etc_vert - p_eff;
        const litres = Math.max(net_mm * wallAreaVal, 0);
        csv += row.month + ',' + row.et0_vert + ',' + row.kc + ',' + row.kf + ',' + row.etc_vert + ',' + row.p_eff + ',' + net_mm.toFixed(1) + ',' + Math.round(litres) + '\n';
    });
    csv += '\nSummary\nAnnual Water Need (litres),' + Math.round(verticalGreeningResults.annualWater) + '\n';
    csv += 'Peak Month,' + (verticalGreeningResults.peakMonth || '-') + '\n';
    csv += 'Peak Month Need (litres),' + Math.round(verticalGreeningResults.peakNeed) + '\n';
    return csv;
}

function generateCSVContent() {
    const plantName = plantNamesEN[currentPlant] || currentPlant;
    const date = new Date().toLocaleDateString();
    let csv = 'AquaCalc Export\nGenerated: ' + date + '\nCity: ' + currentCity + '\nPlant: ' + plantName + '\nArea: ' + currentArea + ' m\u001b2\nSituation: ' + currentSituation + '\n\n';
    csv += 'Climate Data\nMonth,ET0 (mm),Rainfall (mm)\n';
    const et0 = currentClimateData.slice(12,24); const rain = currentClimateData.slice(0,12);
    for (let i=0; i<12; i++) csv += months[i] + ',' + et0[i] + ',' + rain[i] + '\n';
    csv += '\nMonthly Water Balance\nMonth,ET0 (mm),Kc,ETc (mm),Rain (mm),Effective Rain (mm),Net (mm),Litres\n';
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
        country: selectedCountry, city: currentCity, plant: currentPlant, customKc: currentPlantKc, area: currentArea, situation: currentSituation,
        irrigationType: currentIrrigationType, pressure: currentPressure,
        timePeriod: currentTimePeriod,
        theme: document.documentElement.getAttribute('data-theme') || 'light'
    }));
}

function loadState() {
    const saved = localStorage.getItem('aquacalc-state'); if (!saved) return;
    try { const state = JSON.parse(saved);
        if (state.country && elements.countrySelect) { elements.countrySelect.value = state.country; selectedCountry = state.country; populateCities(state.country); }
        if (state.city) { setTimeout(async () => {
            if (elements.citySelect) { elements.citySelect.value = state.city; currentCity = state.city;
                
                // Set time period if available in state
                if (state.timePeriod && elements.timePeriodSelect) {
                    currentTimePeriod = state.timePeriod;
                    elements.timePeriodSelect.value = state.timePeriod;
                }
                
                // Load climate data
                if (currentCity && currentTimePeriod) {
                    await loadClimateData(currentCity);
                }
            }
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

// ============================================
// Vertical Greening Calculation Functions
// ============================================

// Kf values for different systems
const vgSystemKfValues = {
    'soil': 0.9,
    'trough': 1.0,
    'living_wall': 1.225, // Average of 1.15-1.3
    'custom': 1.0
};

// Bewässerungswirkungsgrad η_Bew
const vgEfficiencyValues = {
    'soil': 0.925, // Average of 0.90-0.95 for drip irrigation
    'trough': 0.925,
    'living_wall': 0.80, // Average of 0.75-0.85 for living wall systems
    'custom': 0.85
};

// Beschattungsfaktoren
const vgShadingFactors = {
    'none': 1.0,
    'light': 0.75,
    'medium': 0.5,
    'heavy': 0.25
};

// Standard-Albedo-Werte
const vgAlbedoValues = {
    '0.15': 0.15, // Asphalt
    '0.30': 0.30, // Beton/Pflaster
    '0.22': 0.22, // Rasen/Vegetation average
    'custom': 0.2
};

// Calculate rain factor based on wall height
// H ≤ 2 m: R_f = 0.5
// 2 m < H ≤ 5 m: R_f = 0.25
// H > 5 m: R_f = 0.1
// Calculate orientation factors F_or for each month
// Based on solar geometry: direct component from sun angle, diffuse component, and ground reflection
// Uses pre-calculated monthly orientation factors based on solar geometry
// for typical mid-latitude locations 40-55 deg N. Factors account for:
// - Direct component: ratio of cosine-theta to sine-gamma for incidence angle and solar altitude
//   averaged over daylight hours, representative of month center
// - Diffuse component: isotropic sky model with 0.5 view factor for vertical surfaces
//   diffuse portion approx 40-60 percent of global radiation
// - Ground reflection: albedo times 0.5 times 0.5 for lower facade half and view factor
//   calculated separately and added to orientation factor
function calculateOrientationFactors(orientation, latitude, month) {
    // Pre-calculated monthly orientation factors for direct+diffuse components
    // Based on solar geometry calculations for mid-latitudes (40-55°N)
    // Values represent the ratio of vertical to horizontal global radiation
    // Higher values in spring/autumn for S-facing (peak May/Sept), summer for E/W-facing facades (peak July/Aug)
    // S-facing: Mai>Juli due to high sun angle in summer causing oblique incidence on vertical surface
    // For S facade at 50°N: Solar altitude in July ~60° -> incidence angle ~30° -> cos(30°)/sin(60°) ≈ 0.866
    // For S facade at 50°N: Solar altitude in May ~45° -> incidence angle ~45° -> cos(45°)/sin(45°) = 1.0
    // E/W facade: Low morning/evening sun in summer -> more direct radiation on vertical surface
    const monthlyOrientationFactors = {
        'N': [0.20, 0.22, 0.25, 0.28, 0.30, 0.32, 0.30, 0.28, 0.25, 0.22, 0.20, 0.20],
        'NE': [0.35, 0.40, 0.50, 0.60, 0.70, 0.80, 0.85, 0.80, 0.65, 0.50, 0.35, 0.35],
        'E': [0.40, 0.45, 0.60, 0.75, 0.85, 0.95, 1.05, 1.00, 0.75, 0.60, 0.40, 0.40],
        'SE': [0.50, 0.55, 0.70, 0.85, 0.95, 1.05, 1.15, 1.10, 0.85, 0.70, 0.50, 0.50],
        'S': [0.50, 0.60, 0.85, 1.05, 1.20, 1.10, 0.80, 0.90, 1.00, 0.85, 0.60, 0.50],
        'SW': [0.50, 0.55, 0.70, 0.85, 0.95, 1.05, 1.15, 1.10, 0.85, 0.70, 0.50, 0.50],
        'W': [0.40, 0.45, 0.60, 0.75, 0.85, 0.95, 1.05, 1.00, 0.75, 0.60, 0.40, 0.40],
        'NW': [0.35, 0.40, 0.50, 0.60, 0.70, 0.80, 0.85, 0.80, 0.65, 0.50, 0.35, 0.35]
    };
    
    // Get base factor (direct + diffuse components)
    const orientationFactor = monthlyOrientationFactors[orientation][month];
    
    // Diffuse component portion (already included in orientationFactor)
    // For shading calculation, we need to estimate the direct portion
    // Assumption: direct portion ≈ 60%, diffuse portion ≈ 40% of the orientation factor
    // This is a reasonable approximation for mid-latitudes
    return orientationFactor;
}

// Calculate vertical ET0 for each month
function calculateVerticalGreeningResults() {
    // Don't reset - keep previous results until new calculation succeeds
    
    // Check if we have the required data
    if (!currentCity || !currentClimateData) {
        const tableBody = document.getElementById('vgResultsTableBodyInResults');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8">Error: Please select a city first to load climate data. Current city: ' + (currentCity || 'none') + ', Climate data loaded: ' + (currentClimateData ? 'yes' : 'no') + '</td></tr>';
        }
        alert('Please select a city first to load climate data.');
        return;
    }
    
    // Get input values
    const orientation = elements.vgOrientation ? elements.vgOrientation.value : 'S';
    const system = elements.vgSystem ? elements.vgSystem.value : 'trough';
    const customKf = elements.vgCustomKf && elements.vgCustomKf.style.display === 'block' ? parseFloat(elements.vgCustomKf.value) || 1.0 : null;
    const shading = elements.vgShading ? elements.vgShading.value : 'none';
    const albedoType = elements.vgAlbedo ? elements.vgAlbedo.value : '0.22';
    const customAlbedo = elements.vgCustomAlbedo && elements.vgCustomAlbedo.style.display === 'block' ? parseFloat(elements.vgCustomAlbedo.value) || 0.22 : null;
    const wallArea = elements.vgWallArea ? parseFloat(elements.vgWallArea.value) || 50 : 50;
    const roofOverhang = elements.vgRoofOverhang ? elements.vgRoofOverhang.value === 'yes' : false;
    const plant = elements.vgPlant ? elements.vgPlant.value : 'hedera_helix';
    
    // Get city coordinates for latitude
    const coords = cityCoordinates[currentCity];
    if (!coords) {
        alert('City coordinates not found for Vertical Greening calculation. Please select a city with defined coordinates.');
        // Also show error in both tables
        const vgTable1 = document.getElementById('vgResultsTableBody');
        const vgTable2 = document.getElementById('vgResultsTableBodyInResults');
        if (vgTable1) vgTable1.innerHTML = '<tr><td colspan="8">Error: City coordinates not found. Vertical Greening requires city coordinates for orientation calculations.</td></tr>';
        if (vgTable2) vgTable2.innerHTML = '<tr><td colspan="8">Error: City coordinates not found. Vertical Greening requires city coordinates for orientation calculations.</td></tr>';
        return;
    }
    const latitude = coords.latitude;
    
    // Get Kf value
    let kf = customKf !== null ? customKf : vgSystemKfValues[system];
    if (kf === undefined) kf = 1.0;
    
    // Get albedo value
    let albedo = customAlbedo !== null ? customAlbedo : vgAlbedoValues[albedoType];
    if (albedo === undefined) albedo = 0.22;
    
    // Get shading factor
    const shadingFactor = vgShadingFactors[shading] || 1.0;
    
    // Get efficiency
    const efficiency = vgEfficiencyValues[system] || 0.85;
    
    // Get plant Kc values - use monthly profile
    let kcValues;
    const plantId = plant || 'hedera_helix';
    
    if (plantId === 'custom_kc' && elements.vgCustomKcValue) {
        // Parse custom Kc input
        const customInput = elements.vgCustomKcValue.value.trim();
        if (customInput) {
            const parts = customInput.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
            if (parts.length === 12) {
                kcValues = parts; // Use all 12 values
            } else if (parts.length === 1) {
                kcValues = Array(12).fill(parts[0]); // Use single value for all months
            } else {
                kcValues = Array(12).fill(0.7); // Default
            }
        } else {
            kcValues = Array(12).fill(0.7); // Default if no custom input
        }
    } else {
        // Get monthly profile from data.js, handling hemisphere
        const profile = getMonthlyKcProfile(plantId, latitude);
        if (profile) {
            kcValues = profile;
        } else {
            // Fallback: use avgKc from plantDatabase or default
            const plantData = plantDatabase.find(p => p.id === plantId);
            const avgKc = plantData?.avgKc || 0.7;
            kcValues = Array(12).fill(avgKc);
        }
    }
    
    // Get climate data
    const et0Data = currentClimateData.slice(12, 24); // ET0 values (mm)
    const rainData = currentClimateData.slice(0, 12);   // Rain values (mm)
    
    // Calculate rain factor for vertical surfaces
    // Rain effectiveness on vertical surfaces is reduced compared to horizontal surfaces
    // Standard factor: 0.2 for vertical walls (only 20% of rainfall is effective)
    // If roof overhang is present, reduce to 0 (upper wall protected)
    const rainFactor = roofOverhang ? 0 : 0.2;
    
    // Calculate monthly results
    const monthlyResults = [];
    let annualWater = 0;
    let peakMonth = '';
    let peakNeed = 0;
    let peakMonthIndex = 0;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let m = 0; m < 12; m++) {
        // Calculate orientation factor for this month (direct + diffuse components)
        const f_or_base = calculateOrientationFactors(orientation, latitude, m);
        
        // Apply shading to direct component only
        // Assumption: direct portion ≈ 60%, diffuse portion ≈ 40% of the base orientation factor
        // This is a reasonable approximation for mid-latitudes
        const directPortion = 0.6; 
        const diffusePortion = 1 - directPortion;
        
        // Calculate effective orientation factor with shading
        // Shading only affects the direct portion
        const f_or_effective = (f_or_base * directPortion * shadingFactor) + (f_or_base * diffusePortion);
        
        // Add albedo (ground reflection) component
        // Albedo contribution: Albedo × 0.5 (lower facade half) × 0.5 (view factor) = Albedo × 0.25
        // This represents reflected radiation from the ground reaching the lower part of the facade
        const albedoComponent = albedo * 0.25; // Geometric factor for ground reflection
        
        // Total vertical ET0 factor: orientation factor + ground reflection
        const f_or_total = f_or_effective + albedoComponent;
        
        // Calculate vertical ET0
        const et0_vert = et0Data[m] * f_or_total;
        
        // Calculate ETc_vert
        const kc = kcValues[m];
        const etc_vert = et0_vert * kc * kf;
        
        // Calculate effective rain
        const p_eff = rainData[m] * 0.8 * rainFactor;
        
        // Calculate net irrigation
        const net = Math.max(etc_vert - p_eff, 0);
        
        // Calculate irrigation volume in L/m²
        const v_irr = net / efficiency;
        
        // Calculate total for the wall area
        const totalLitres = v_irr * wallArea;
        
        monthlyResults.push({
            month: months[m],
            monthFull: monthsFull[m],
            monthIndex: m,
            et0: et0Data[m].toFixed(1),
            et0_vert: et0_vert.toFixed(1),
            kc: kc.toFixed(2),
            kf: kf.toFixed(2),
            etc_vert: etc_vert.toFixed(1),
            p_eff: p_eff.toFixed(1),
            v_irr: v_irr.toFixed(1),
            totalLitres: totalLitres.toFixed(0)
        });
        
        annualWater += totalLitres;
        if (totalLitres > peakNeed) {
            peakNeed = totalLitres;
            peakMonth = months[m];
            peakMonthIndex = m;
        }
    }
    
    // Validate we have complete monthly data before storing
    if (!monthlyResults || monthlyResults.length !== 12) {
        console.error('Vertical Greening: monthlyResults incomplete. Length:', monthlyResults ? monthlyResults.length : 'null');
        const tableBody = document.getElementById('vgResultsTableBodyInResults');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8">Error: Incomplete monthly data. monthlyResults length: ' + (monthlyResults ? monthlyResults.length : 'null') + '</td></tr>';
        }
        verticalGreeningResults = null;
        return;
    }
    
    // Store results for display in Results tab only
    verticalGreeningResults = {
        annualWater: annualWater,
        peakMonth: peakMonth,
        peakMonthName: monthsFull[peakMonthIndex],
        peakNeed: peakNeed,
        wallArea: wallArea,
        monthlyData: monthlyResults
    };
    
    // Update display in Vertical Greening tab only
    displayVerticalGreeningResults();
    
    // Calculate watering plan for vertical greening
    calculateWateringPlan(monthlyResults, peakMonthIndex, wallArea, plant);
}

// Language management removed - English only version

