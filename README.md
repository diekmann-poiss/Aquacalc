# AquaCalc - Updated Version

## Summary of Changes

This repository contains the updated AquaCalc tool with the following enhancements:

### ✅ Completed Features

1. **Worldwide City Database** - Added 100+ cities from:
   - All 16 German Bundesländer (federal states)
   - USA, Canada, Brazil
   - South Africa, Morocco, Egypt, Ethiopia
   - Japan, China, Nepal
   - Australia and Oceania
   - And more...

2. **Climate Visualization**
   - Bar chart displaying monthly ET₀ and Rainfall (mm)
   - Table showing detailed monthly data
   - Data sourced from FAO CLIMWAT and Open-Meteo patterns

3. **Plant Presets**
   - Fixed preset buttons to show Kc values
   - Each preset now displays its Kc coefficient
   - Working selection and display

4. **Original Color Scheme**
   - Preserved the blue/green color scheme:
     - Primary: #2c3e50
     - Secondary: #3498db  
     - Accent: #2ecc71
     - Background: #ecf0f1

5. **Attribution**
   - Added "Created by Max Poiss" to the info panel

### Files Modified

- `index.html` - Added climate chart containers, updated structure
- `app.js` - Climate chart rendering, fixed plant presets with Kc display
- `data.js` - 100+ worldwide cities with climate data
- `styles.css` - Original color scheme preserved

### How to Deploy to GitHub Pages

#### Method 1: Using GitHub Desktop
1. Open GitHub Desktop
2. File → Add Local Repository
3. Select this folder: `/Users/admin/Desktop/DIV/GIT/Aquacalc`
4. Click "Publish repository" to push to GitHub

#### Method 2: Using Command Line

```bash
# Navigate to the directory
cd /Users/admin/Desktop/DIV/GIT/Aquacalc

# Add your GitHub credentials to the URL (replace TOKEN with your personal access token)
git remote set-url origin https://TOKEN@github.com/diekmann-poiss/Aquacalc.git

# Push to main branch
git push -u origin main
```

#### Method 3: Create a Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token"
3. Name it "Aquacalc Push"
4. Select these scopes: `repo`
5. Click "Generate token"
6. Copy the token
7. Run:
   ```bash
   cd /Users/admin/Desktop/DIV/GIT/Aquacalc
   git remote set-url origin https://YOUR_TOKEN@github.com/diekmann-poiss/Aquacalc.git
   git push -u origin main
   ```

### Verification

After pushing, wait 1-2 minutes and visit:
https://diekmann-poiss.github.io/Aquacalc/

You should see:
- ✅ Dropdown with worldwide cities (not just AT/DE/CH)
- ✅ Climate chart appearing after city selection
- ✅ Plant presets showing Kc values when clicked
- ✅ "Created by Max Poiss" in the info panel
- ✅ Original blue/green color scheme

### Notes

- The repository is currently on the local `main` branch
- No SSH keys are configured on this machine
- You'll need to authenticate to push to GitHub
- The remote is set to: `https://github.com/diekmann-poiss/Aquacalc.git`
