# AquaCalc - FAO-56 Irrigation Water Calculator

A web-based tool for calculating site-specific irrigation water demand using the FAO-56 methodology.

## Overview

AquaCalc helps landscape professionals, gardeners, and farmers determine the precise water needs for plants based on:
- **Site conditions**: Reference evapotranspiration (ET₀) and rainfall data for 70+ cities worldwide
- **Plant types**: 55+ landscape species and 70+ FAO-56 crops with customizable Kc values
- **Planting situation**: Open, against wall, under overhang, roofed, or shaded/north side

The calculator provides:
- Annual water need estimates
- Peak month identification
- Monthly water balance charts and tables
- Seasonal watering plans with irrigation type and pressure settings
- PDF and Excel export capabilities

## Methodology

AquaCalc implements the FAO Irrigation & Drainage Paper 56 methodology:

- **Crop water use**: ETc = ET₀ × Kc × situation demand factor
- **Effective rain**: rainfall × 0.8 × situation rain factor
- **Net irrigation**: ETc - effective rain (minimum 0)
- **Unit conversion**: 1 mm over 1 m² = 1 litre

### Demand Factors
- Wall: 1.15
- Open: 1.0
- Overhang: 1.0
- Roofed: 0.9
- Shaded: 0.7

### Rain Factors
- Open: 1.0
- Shaded: 0.9
- Wall: 0.75
- Overhang: 0.3
- Roofed: 0.0

## Data Sources

### Methodology
- FAO Irrigation & Drainage Paper 56 (Allen et al., 1998)
- ASCE-EWRI standardized reference ET equation (2005)
- WUCOLS landscape water-use classification (Costello et al., UC Cooperative Extension)

### ET₀ Data
- GeoSphere Austria
- Deutscher Wetterdienst (DWD) Climate Data Center
- MeteoSwiss
- FAO CLIMWAT (global cross-check)

## Features

### 4-Tab Workflow
1. **Site**: Select country and city to view climate data (12-month ET₀ and rainfall)
2. **Plant**: Choose from presets, search species, or enter custom Kc values with area and situation
3. **Results**: View annual water need, peak month, monthly charts, and seasonal watering plans
4. **Projects**: Plan multiple beds with different planting cycles and view combined totals

### Irrigation Types
- Drip line
- Soaker hose
- Micro-sprayer
- Pop-up sprinkler

### Pressure Options
- 2 bar
- 4 bar
- 6 bar

### Export Options
- PDF
- Excel

### User Interface
- Language switcher: English, German, Spanish
- Light/dark theme toggle
- Info panel with methodology details

## Usage

1. Open `index.html` in a web browser
2. Select your site location
3. Choose your plant type and enter area
4. View results and watering plan
5. Export to PDF or Excel as needed

## Project Structure

```
Aquacalc/
├── index.html          # Main application HTML
├── data.js             # Climate and plant data
├── styles.css          # CSS styling
├── README.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages. When you push to the main branch, the workflow will automatically deploy the site.

Your site will be available at: `https://[username].github.io/Aquacalc/`

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Contact

For questions or feedback, please refer to the info panel within the application or check the data sources listed above.

---

**Note**: The city climate values are planning estimates based on regional patterns. For official values, please consult the listed institutions (GeoSphere Austria, DWD, MeteoSwiss, FAO CLIMWAT). The Kc values, situation factors, and flow rates are reasonable planning defaults, not measured data.
