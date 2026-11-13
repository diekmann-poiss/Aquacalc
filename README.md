# AquaCalc - FAO-56 Irrigation Water Calculator

A web-based tool for calculating site-specific irrigation water demand using the FAO-56 methodology.

## Citation Suggestion

Poiss, M. (2026) Aquacalc (Version 2.7.1) [Computer software]. Available at: https://diekmann-poiss.github.io/Aquacalc/ (Accessed: DAY MONTH YEAR).

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
- **Vertical Greening**: Specialized calculations for facade greening systems with orientation factors

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

### Vertical Greening Factors
- **Orientation factors**: Monthly solar geometry calculations for facade orientation
- **Shading factors**: none (1.0), light (0.75), medium (0.5), heavy (0.25)
- **Albedo values**: Asphalt (0.15), Concrete (0.30), Vegetation (0.22), Custom
- **System factors (Kf)**: Soil-based (0.9), Trough (1.0), Living Wall Panels (1.225), Custom
- **Efficiency factors (η)**: Soil (0.925), Trough (0.925), Living Wall (0.80), Custom (0.85)
- **Rain factors for vertical surfaces**: Standard 0.2, roof overhang 0.0

## Data Sources

### Methodology
- FAO Irrigation & Drainage Paper 56 (Allen et al., 1998)
- ASCE-EWRI standardised reference ET equation (2005)
- WUCOLS landscape water-use classification (Costello et al., UC Cooperative Extension)

### ET₀ Data
- Live Data via [Open Meteo](https://open-meteo.com) (API)
- FAO CLIMWAT (global cross-check)

## Features

### 5-Tab Workflow
1. **Site**: Select country and city to view climate data (12-month ET₀ and rainfall)
2. **Plant**: Choose from presets, search species, or enter custom Kc values with area and situation
3. **Vertical Greening**: Specialized tab for facade greening calculations with climbing plants
4. **Results**: View annual water need, peak month, monthly charts, and seasonal watering plans
5. **Projects**: Plan multiple beds with different planting cycles and view combined totals

### Irrigation Types
- Drip line
- Soaker hose
- Micro-sprayer
- Pop-up sprinkler

### Pressure Options for Watering Plan
- 2 bar
- 4 bar
- 6 bar

### Export Options
- PDF
- Excel

### Vertical Greening Features
- Orientation-specific calculations (N, NE, E, SE, S, SW, W, NW)
- System-specific Kf values (soil-based, trough, living wall panels, custom)
- Shading factor support
- Albedo (ground reflection) consideration
- Roof overhang compensation
- Custom Kc profile support for climbing plants
- Separate results display in Results tab

## Usage

1. Open `https://diekmann-poiss.github.io/Aquacalc/` in web browser
2. Select your site location
3. Choose your plant type and enter area
4. For vertical greening: Select climbing plant, orientation, system, and wall area
5. View results and watering plan
6. Export to PDF or Excel as needed

## Version History

- **v2.7.1**: Fixed chart display issues, added proper subscript formatting, improved spacing
- **v2.7**: Redesign to match main homepage style, vertical greening calculations, results tab integration
- **v2.6**: Added project management, improved UI
- **v2.5.4**: Initial public release

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages. When you push to the main branch, the workflow will automatically deploy the site.

Your site will be available at: `https://diekmann-poiss.github.io/Aquacalc/`

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit issues.

## Contact

For questions or feedback, please refer to the info panel within the application or check the data sources listed above.

---

**Note**: The city climate values are planning estimates based on regional patterns from open source weather API open-meteo. For double checking official values, please consult the listed institutions (GeoSphere Austria, DWD, MeteoSwiss, FAO CLIMWAT). The Kc values, situation factors, and flow rates are reasonable planning defaults, not measured data.
