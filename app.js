// ============================================
// AQUACALC STATE
// ============================================

let state = {
    site: {
        country: 'AT',
        city: '',
        climate: null
    },
    plant: {
        selected: '',
        customKc: null,
        area: 10,
        situation: 'open'
    },
    results: {
        calculations: null,
        chart: null
    },
    projects: {
        currentProject: null,
        beds: [],
        currentBed: null
    },
    settings: {
        language: 'en',
        theme: 'light'
    }
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

function calculateETc(eto, kc, situation) {
    const factor = situationFactors[situation].demand;
    return eto * kc * factor;
}

function calculateEffectiveRain(rainfall, situation) {
    const factor = situationFactors[situation].rain;
    return rainfall * 0.8 * factor;
}

function calculateNetIrrigation(etc, effectiveRain) {
    return Math.max(0, etc - effectiveRain);
}

function calculateMonthlyResults(city, plant, area, situation, customKc = null) {
    if (!city || (!plant && customKc === null)) {
        return null;
    }
    
    const climate = climateData[city];
    if (!climate) return null;
    
    const kcValues = customKc !== null ? Array(12).fill(customKc) : kcProfiles[plant];
    if (!kcValues) return null;
    
    const results = [];
    let totalLitres = 0;
    let peakMonth = '';
    let peakValue = 0;
    
    for (let i = 0; i < 12; i++) {
        const eto = climate[i];
        const rainfall = climate[i + 12];
        const kc = kcValues[i];
        
        const etc = calculateETc(eto, kc, situation);
        const effectiveRain = calculateEffectiveRain(rainfall, situation);
        const net = calculateNetIrrigation(etc, effectiveRain);
        const litresPerM2 = net; // 1mm = 1l/m2
        const totalLitresForMonth = litresPerM2 * area;
        
        totalLitres += totalLitresForMonth;
        
        if (totalLitresForMonth > peakValue) {
            peakValue = totalLitresForMonth;
            peakMonth = months[i];
        }
        
        results.push({
            month: months[i],
            eto: eto,
            kc: kc,
            etc: etc,
            rainfall: rainfall,
            effectiveRain: effectiveRain,
            net: net,
            litresPerM2: litresPerM2,
            totalLitres: totalLitresForMonth
        });
    }
    
    return {
        monthly: results,
        total: totalLitres,
        peakMonth: peakMonth,
        peakValue: peakValue,
        peakMonthLitres: peakValue
    };
}

function calculateWateringPlan(monthlyResults, irrigationType, pressure, area) {
    const type = irrigationTypes[irrigationType];
    const daysPerWeek = type.daysPerWeek;
    const flowRate = flowRates[irrigationType][pressure]; // litres/hour
    
    // Find busiest month for each season
    const seasonData = {};
    for (const season in seasons) {
        seasonData[season] = { 
            months: seasons[season].months, 
            busiestMonth: null, 
            value: 0 
        };
    }
    
    for (const result of monthlyResults) {
        for (const season in seasonData) {
            if (seasonData[season].months.includes(result.month)) {
                if (result.totalLitres > seasonData[season].value) {
                    seasonData[season].value = result.totalLitres;
                    seasonData[season].busiestMonth = result.month;
                }
            }
        }
    }
    
    // Calculate watering plan for each season
    const plan = {};
    for (const season in seasonData) {
        const monthlyValue = seasonData[season].value;
        const weeklyValue = monthlyValue / 4.345; // monthly to weekly
        const dailyValue = weeklyValue / daysPerWeek; // weekly to daily
        
        // Calculate minutes per session
        // flowRate is in litres/hour, we need litres per session
        const litresPerSession = dailyValue; // litres needed per day
        const hoursNeeded = litresPerSession / flowRate;
        const minutesNeeded = hoursNeeded * 60;
        
        plan[season] = {
            busiestMonth: seasonData[season].busiestMonth,
            monthlyTotal: Math.round(seasonData[season].value),
            weeklyTotal: Math.round(weeklyValue),
            litresPerSession: Math.round(litresPerSession * 100) / 100,
            minutesPerSession: Math.round(minutesNeeded),
            daysPerWeek: daysPerWeek,
            flowRate: flowRate
        };
    }
    
    return plan;
}

// ============================================
// UI FUNCTIONS
// ============================================

function updateCityList() {
    const country = state.site.country;
    const citySelect = document.getElementById('city');
    
    citySelect.innerHTML = '<option value="">Select a city...</option>';
    
    const cities = citiesByCountry[country] || [];
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    state.site.city = '';
    updateClimateCard();
}

function updateClimateCard() {
    const city = state.site.city;
    const climateDataDiv = document.getElementById('climateData');
    
    if (!city) {
        climateDataDiv.innerHTML = '<p>Select a city to view its climate data (Reference Evapotranspiration ET₀ and Rainfall).</p>';
        return;
    }
    
    const climate = climateData[city];
    if (!climate) {
        climateDataDiv.innerHTML = '<p>No climate data available for this city.</p>';
        return;
    }
    
    let html = '<div class="climate-grid">';
    
    // ET0 row
    for (let i = 0; i < 12; i++) {
        html += `
            <div class="climate-item">
                <label>${months[i]}</label>
                <div class="value">${climate[i]}</div>
                <small>ET₀ (mm)</small>
            </div>
        `;
    }
    
    html += '</div>';
    html += '<hr style="margin: 15px 0;">';
    
    html += '<div class="climate-grid">';
    
    // Rainfall row
    for (let i = 0; i < 12; i++) {
        html += `
            <div class="climate-item">
                <label>${months[i]}</label>
                <div class="value">${climate[i + 12]}</div>
                <small>Rain (mm)</small>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Annual totals
    const annualET0 = climate.slice(0, 12).reduce((a, b) => a + b, 0);
    const annualRain = climate.slice(12).reduce((a, b) => a + b, 0);
    
    html += `
        <hr style="margin: 15px 0;">
        <div style="display: flex; justify-content: space-around; padding: 15px; background-color: var(--background-color); border-radius: 8px;">
            <div>
                <strong>Annual ET₀:</strong> ${annualET0} mm
            </div>
            <div>
                <strong>Annual Rainfall:</strong> ${annualRain} mm
            </div>
        </div>
    `;
    
    climateDataDiv.innerHTML = html;
    state.site.climate = climate;
}

function updatePlantSearch() {
    const searchTerm = document.getElementById('plantSearch').value.toLowerCase();
    const plantSelect = document.getElementById('plantSelect');
    
    if (!searchTerm) {
        plantSelect.innerHTML = '<option value="">Search results will appear here...</option>';
        return;
    }
    
    plantSelect.innerHTML = '';
    
    // Search in plant names
    for (const plant of Object.keys(kcProfiles)) {
        const enName = plantNamesEN[plant] || plant;
        if (plant.toLowerCase().includes(searchTerm) || enName.toLowerCase().includes(searchTerm)) {
            const option = document.createElement('option');
            option.value = plant;
            option.textContent = `${plant} (${enName})`;
            plantSelect.appendChild(option);
        }
    }
    
    // Also search for botanical names
    const botanicalMap = {
        'tilia': 'Tilia cordata',
        'lavandula': 'Lavandula',
        'sedum': 'Sedum',
        'clematis': 'Clematis',
        'ivy': 'Efeu'
    };
    
    for (const [key, value] of Object.entries(botanicalMap)) {
        if (searchTerm.includes(key) || searchTerm.includes(value.toLowerCase())) {
            // Find matching plants
            for (const plant of Object.keys(kcProfiles)) {
                const enName = plantNamesEN[plant] || '';
                if (plant.toLowerCase().includes(value.toLowerCase()) || enName.toLowerCase().includes(value.toLowerCase())) {
                    const option = document.createElement('option');
                    option.value = plant;
                    option.textContent = `${plant} (${enName}) - ${value}`;
                    plantSelect.appendChild(option);
                }
            }
        }
    }
}

function updateResults() {
    const city = state.site.city;
    const plant = state.plant.selected;
    const area = state.plant.area;
    const situation = state.plant.situation;
    const customKc = state.plant.customKc;
    
    const results = calculateMonthlyResults(city, plant, area, situation, customKc);
    
    if (!results) {
        document.getElementById('mainResults').innerHTML = '<p>Please complete the Site and Plant tabs to see results.</p>';
        return;
    }
    
    state.results.calculations = results;
    
    // Update main results
    document.getElementById('annualWater').textContent = Math.round(results.total);
    document.getElementById('peakMonth').textContent = results.peakMonth;
    document.getElementById('peakMonthValue').textContent = `${results.peakMonth} (${Math.round(results.peakValue)} l)`;
    document.getElementById('peakNeed').textContent = Math.round(results.peakValue);
    
    // Update table
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';
    
    for (const result of results.monthly) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.month}</td>
            <td>${result.eto.toFixed(0)}</td>
            <td>${result.kc.toFixed(2)}</td>
            <td>${result.etc.toFixed(1)}</td>
            <td>${result.rainfall.toFixed(0)}</td>
            <td>${result.effectiveRain.toFixed(1)}</td>
            <td>${result.net.toFixed(1)}</td>
            <td>${(result.net * area).toFixed(0)}</td>
        `;
        tbody.appendChild(row);
    }
    
    // Update chart
    updateChart(results);
    
    // Update watering plan
    updateWateringPlan();
}

function updateChart(results) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (state.results.chart) {
        state.results.chart.destroy();
    }
    
    const months = results.monthly.map(r => r.month);
    const etc = results.monthly.map(r => r.etc);
    const rainfall = results.monthly.map(r => r.rainfall);
    const net = results.monthly.map(r => r.net);
    
    state.results.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'ETc (mm)',
                    data: etc,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Rainfall (mm)',
                    data: rainfall,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Net Irrigation (mm)',
                    data: net,
                    type: 'line',
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
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
                        text: 'Millimeters (mm)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Water Balance: ETc, Rainfall, and Net Irrigation',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

function updateWateringPlan() {
    if (!state.results.calculations) {
        return;
    }
    
    const irrigationType = document.getElementById('irrigationType').value;
    const pressure = document.getElementById('pressure').value;
    const area = state.plant.area;
    
    const plan = calculateWateringPlan(
        state.results.calculations.monthly,
        irrigationType,
        pressure,
        area
    );
    
    const wateringPlanDiv = document.getElementById('wateringPlan');
    let html = '';
    
    const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
    
    for (const season of seasonOrder) {
        const seasonData = plan[season];
        html += `
            <div class="season-card">
                <h4>${seasons[season].name}</h4>
                <p><strong>Busiest Month:</strong> ${seasonData.busiestMonth}</p>
                <div class="season-detail">
                    <span>Watering Days:</span>
                    <span>${seasonData.daysPerWeek} per week</span>
                </div>
                <div class="season-detail">
                    <span>Minutes per Session:</span>
                    <span>${seasonData.minutesPerSession}</span>
                </div>
                <div class="season-detail">
                    <span>Litres per Session:</span>
                    <span>${seasonData.litresPerSession}</span>
                </div>
                <div class="season-detail">
                    <span>Monthly Total:</span>
                    <span>${seasonData.monthlyTotal} l</span>
                </div>
            </div>
        `;
    }
    
    wateringPlanDiv.innerHTML = html;
}

// ============================================
// PROJECT FUNCTIONS
// ============================================

function showBedForm() {
    state.projects.currentBed = { 
        plants: [{
            plant: 'Rasen cool-season (sunny)',
            startMonth: 'Jan',
            endMonth: 'Dec'
        }]
    };
    
    document.getElementById('bedName').value = '';
    document.getElementById('bedArea').value = '10';
    document.getElementById('bedSituation').value = 'open';
    document.getElementById('bedForm').style.display = 'block';
    
    updatePlantingCyclesUI();
}

function editBed(index) {
    const bed = state.projects.beds[index];
    state.projects.currentBed = { ...bed, index: index };
    
    // Populate form
    document.getElementById('bedName').value = bed.name || '';
    document.getElementById('bedArea').value = bed.area || 10;
    document.getElementById('bedSituation').value = bed.situation || 'open';
    
    // Populate planting cycles
    updatePlantingCyclesUI();
    
    // Show form
    document.getElementById('bedForm').style.display = 'block';
}

function deleteBed(index) {
    if (confirm('Are you sure you want to delete this bed?')) {
        state.projects.beds.splice(index, 1);
        updateBedsList();
        saveProjectToLocalStorage();
    }
}

function updateBedsList() {
    const bedsList = document.getElementById('bedsList');
    
    if (state.projects.beds.length === 0) {
        bedsList.innerHTML = '<li style="padding: 10px; color: #777;">No beds yet. Create a bed to start.</li>';
        return;
    }
    
    bedsList.innerHTML = '';
    
    state.projects.beds.forEach((bed, index) => {
        const li = document.createElement('li');
        li.className = 'project-item';
        li.innerHTML = `
            <strong>${bed.name || `Bed ${index + 1}`}</strong>
            <p>Area: ${bed.area} m² | Situation: ${bed.situation}</p>
            <p>Plants: ${bed.plants ? bed.plants.length : 0} cycles</p>
            <button class="btn btn-secondary" onclick="editBed(${index})">Edit</button>
            <button class="btn btn-secondary" onclick="deleteBed(${index})">Delete</button>
        `;
        bedsList.appendChild(li);
    });
}

function updatePlantingCyclesUI() {
    const container = document.getElementById('plantingCycles');
    
    if (!state.projects.currentBed || !state.projects.currentBed.plants) {
        container.innerHTML = '<p>No planting cycles yet.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    state.projects.currentBed.plants.forEach((cycle, index) => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        div.style.padding = '15px';
        div.style.backgroundColor = 'var(--background-color)';
        div.style.borderRadius = '8px';
        div.innerHTML = `
            <div class="row">
                <div class="col">
                    <label>Plant</label>
                    <select onchange="updatePlantingCycle(${index}, 'plant', this.value)">
                        ${Object.keys(kcProfiles).map(p => `<option value="${p}" ${cycle.plant === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div class="col">
                    <label>Start Month</label>
                    <select onchange="updatePlantingCycle(${index}, 'startMonth', this.value)">
                        ${months.map(m => `<option value="${m}" ${cycle.startMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div class="col">
                    <label>End Month</label>
                    <select onchange="updatePlantingCycle(${index}, 'endMonth', this.value)">
                        ${months.map(m => `<option value="${m}" ${cycle.endMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
            </div>
            <button class="btn btn-secondary" onclick="deletePlantingCycle(${index})" style="margin-top: 10px;">Remove Cycle</button>
        `;
        container.appendChild(div);
    });
}

function updatePlantingCycle(index, field, value) {
    if (!state.projects.currentBed) {
        state.projects.currentBed = { plants: [] };
    }
    
    if (!state.projects.currentBed.plants) {
        state.projects.currentBed.plants = [];
    }
    
    state.projects.currentBed.plants[index][field] = value;
}

function deletePlantingCycle(index) {
    if (state.projects.currentBed && state.projects.currentBed.plants) {
        state.projects.currentBed.plants.splice(index, 1);
        updatePlantingCyclesUI();
    }
}

function saveBed() {
    const name = document.getElementById('bedName').value;
    const area = parseFloat(document.getElementById('bedArea').value) || 10;
    const situation = document.getElementById('bedSituation').value;
    
    const bed = {
        name: name,
        area: area,
        situation: situation,
        plants: state.projects.currentBed?.plants || []
    };
    
    if (state.projects.currentBed?.index !== undefined) {
        // Update existing bed
        state.projects.beds[state.projects.currentBed.index] = bed;
    } else {
        // Add new bed
        if (!state.projects.currentProject) {
            state.projects.currentProject = { name: 'New Project', beds: [] };
        }
        state.projects.currentProject.beds.push(bed);
        state.projects.beds = state.projects.currentProject.beds;
    }
    
    // Reset form
    document.getElementById('bedForm').style.display = 'none';
    state.projects.currentBed = null;
    updateBedsList();
    saveProjectToLocalStorage();
}

function cancelBed() {
    document.getElementById('bedForm').style.display = 'none';
    state.projects.currentBed = null;
}

function saveProjectToLocalStorage() {
    if (state.projects.currentProject) {
        localStorage.setItem('aquacalc_project', JSON.stringify(state.projects.currentProject));
    }
}

function loadProjectFromLocalStorage() {
    const saved = localStorage.getItem('aquacalc_project');
    if (saved) {
        try {
            state.projects.currentProject = JSON.parse(saved);
            state.projects.beds = state.projects.currentProject.beds || [];
            updateBedsList();
        } catch (e) {
            console.error('Error loading project:', e);
        }
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportResultsToCSV() {
    if (!state.results.calculations) {
        alert('No results to export. Please complete the Site and Plant tabs first.');
        return;
    }
    
    const headers = ['Month', 'ET₀ (mm)', 'Kc', 'ETc (mm)', 'Rainfall (mm)', 'Effective Rain (mm)', 'Net (mm)', 'Litres'];
    const rows = state.results.calculations.monthly.map(r => [
        r.month,
        r.eto.toFixed(0),
        r.kc.toFixed(2),
        r.etc.toFixed(1),
        r.rainfall.toFixed(0),
        r.effectiveRain.toFixed(1),
        r.net.toFixed(1),
        (r.net * state.plant.area).toFixed(0)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aquacalc_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportProjectToCSV() {
    if (!state.projects.beds || state.projects.beds.length === 0) {
        alert('No project data to export.');
        return;
    }
    
    alert('Project export functionality would calculate all beds and create a comprehensive CSV.');
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
            
            // Update results when switching to results tab
            if (tab.dataset.tab === 'results') {
                updateResults();
            }
        });
    });
    
    // Country change
    document.getElementById('country').addEventListener('change', (e) => {
        state.site.country = e.target.value;
        updateCityList();
    });
    
    // City change
    document.getElementById('city').addEventListener('change', (e) => {
        state.site.city = e.target.value;
        updateClimateCard();
    });
    
    // Plant search
    document.getElementById('plantSearch').addEventListener('input', updatePlantSearch);
    
    // Plant selection from dropdown
    document.getElementById('plantSelect').addEventListener('click', (e) => {
        if (e.target.value) {
            state.plant.selected = e.target.value;
            state.plant.customKc = null;
            document.getElementById('customKc').value = '';
        }
    });
    
    // Custom Kc input
    document.getElementById('customKc').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 2) {
            state.plant.customKc = value;
            state.plant.selected = '';
        }
    });
    
    // Area input
    document.getElementById('area').addEventListener('input', (e) => {
        state.plant.area = parseFloat(e.target.value) || 0;
    });
    
    // Situation change
    document.getElementById('situation').addEventListener('change', (e) => {
        state.plant.situation = e.target.value;
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            state.plant.selected = presets[preset];
            state.plant.customKc = null;
            document.getElementById('plantSearch').value = '';
            document.getElementById('customKc').value = '';
        });
    });
    
    // Irrigation type and pressure changes
    document.getElementById('irrigationType').addEventListener('change', updateWateringPlan);
    document.getElementById('pressure').addEventListener('change', updateWateringPlan);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        state.settings.theme = newTheme;
        localStorage.setItem('aquacalc_theme', newTheme);
    });
    
    // Language toggle
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        state.settings.language = e.target.value;
    });
    
    // Info panel toggle
    document.getElementById('infoToggle').addEventListener('click', () => {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById('infoPanel').classList.add('active');
    });
    
    // Close info panel
    document.getElementById('closeInfo').addEventListener('click', () => {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('infoPanel').classList.remove('active');
    });
    
    // Close modal on overlay click
    document.getElementById('modalOverlay').addEventListener('click', () => {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('infoPanel').classList.remove('active');
    });
    
    // Export buttons
    document.getElementById('exportExcel').addEventListener('click', exportResultsToCSV);
    document.getElementById('exportProjectExcel').addEventListener('click', exportProjectToCSV);
    
    // Project buttons
    document.getElementById('newProjectBtn').addEventListener('click', showBedForm);
    document.getElementById('saveProject').addEventListener('click', saveProjectToLocalStorage);
    document.getElementById('addPlantingCycle').addEventListener('click', () => {
        if (!state.projects.currentBed) {
            state.projects.currentBed = { plants: [] };
        }
        
        if (!state.projects.currentBed.plants) {
            state.projects.currentBed.plants = [];
        }
        
        state.projects.currentBed.plants.push({
            plant: 'Rasen cool-season (sunny)',
            startMonth: 'Jan',
            endMonth: 'Dec'
        });
        
        updatePlantingCyclesUI();
    });
    
    document.getElementById('saveBed').addEventListener('click', saveBed);
    document.getElementById('cancelBed').addEventListener('click', cancelBed);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('aquacalc_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    state.settings.theme = savedTheme;
    
    // Initialize cities
    updateCityList();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load saved project
    loadProjectFromLocalStorage();
    
    // Set default plant
    state.plant.selected = 'Rasen cool-season (sunny)';
    
    // For demo purposes, pre-select Vienna
    state.site.city = 'Wien';
    document.getElementById('city').value = 'Wien';
    updateClimateCard();
    
    console.log('AquaCalc initialized');
}

// Make functions available globally for button onclick handlers
window.editBed = editBed;
window.deleteBed = deleteBed;
window.deletePlantingCycle = deletePlantingCycle;
window.updatePlantingCycle = updatePlantingCycle;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
