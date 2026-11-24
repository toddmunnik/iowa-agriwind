Iowa Wind Dual-Revenue Estimator

index.html     page markup (open directly in a browser, no server needed)
styles.css     all styling, light and dark themes
app.js         ISU 2026 county data, wind capacity-factor table, turbine spacing model, layout generator, calculator
county_wind.py builds iowa_wind.json from a Global Wind Atlas capacity-factor GeoTIFF (see the top of the file)
iowa_wind.json (optional) drop it next to index.html on a web host such as GitHub Pages and the page uses it automatically.
               Until then the page shows regional ESTIMATES, badged "Estimate".
Fonts load from Google Fonts; the page falls back to system fonts offline.

Credits: ISU Extension Ag Decision Maker C2-10 and A1-20 (2026); ISU CARD Agricultural Policy Review ($4,000/MW/yr);
Global Wind Atlas 3.0 (DTU, World Bank Group/ESMAP, Vortex), CC BY 4.0; NREL Denholm et al. 2009.
