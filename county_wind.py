"""Build Iowa county wind capacity factors from a Global Wind Atlas GeoTIFF and the Census county gazetteer.

Inputs
  1. Global Wind Atlas 3 capacity-factor GeoTIFF for the United States or Iowa (CC BY 4.0), from
     https://globalwindatlas.info/en/download/gis-files . Choose the capacity factor layer for
     the turbine class and height you want (IEC class 2 at 100 m is a reasonable modern default).
  2. Census county gazetteer: 2026_Gaz_counties_national.zip (or the .txt inside it)
     https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_counties_national.zip
     It lists each county's internal point (INTPTLAT, INTPTLONG), a geographic interior point,
     not the population center.

Usage
  pip install rasterio
  python county_wind.py info  CF.tif                       # print layers, units, CRS
  python county_wind.py build CF.tif 2026_Gaz_counties_national.zip
  (add --percent if the raster holds 0-100 instead of 0-1)

Output: iowa_wind.json  ->  {"Story": 0.47, ...}  capacity factor as a fraction (0 to 1).
Put iowa_wind.json next to index.html; the page loads it automatically and switches the badge from Estimate to Measured.
"""
import csv, io, json, math, sys, zipfile
import rasterio
from rasterio.warp import transform

def info(path):
    with rasterio.open(path) as src:
        print("CRS:", src.crs, "| size:", src.width, "x", src.height, "| bands:", src.count)
        print("nodata:", src.nodata, "| band descriptions:", src.descriptions)
        print("dataset tags:", src.tags())
        for i in range(1, src.count + 1):
            print(f"band {i} tags:", src.tags(i))

def read_gazetteer(path):
    raw = zipfile.ZipFile(path).read(next(n for n in zipfile.ZipFile(path).namelist() if n.endswith(".txt"))).decode("utf-8", "replace") \
          if path.endswith(".zip") else open(path, encoding="utf-8", errors="replace").read()
    delim = "|" if raw.splitlines()[0].count("|") > raw.splitlines()[0].count("\t") else "\t"
    rows = csv.DictReader(io.StringIO(raw), delimiter=delim)
    for r in rows:
        r = {k.strip(): (v or "").strip() for k, v in r.items() if k}
        if r.get("USPS") == "IA":
            lat = next(v for k, v in r.items() if k.startswith("INTPTLAT"))
            lon = next(v for k, v in r.items() if k.startswith("INTPTLONG"))
            yield r["NAME"].replace(" County", ""), float(lat), float(lon)

def build(tif, gaz, percent, band=1):
    pts = list(read_gazetteer(gaz))
    if len(pts) != 99:
        print(f"warning: expected 99 Iowa counties, found {len(pts)}")
    out = {}
    with rasterio.open(tif) as src:
        lons, lats = [p[2] for p in pts], [p[1] for p in pts]
        xs, ys = transform("EPSG:4326", src.crs, lons, lats)
        for (name, _, _), val in zip(pts, src.sample(list(zip(xs, ys)), indexes=band)):
            v = float(val[0])
            if math.isnan(v) or (src.nodata is not None and not math.isnan(src.nodata) and v == src.nodata):
                print("no data for", name); continue
            out[name] = round(v / 100 if percent else v, 4)
    if out and max(out.values()) > 1.0:
        print("WARNING: values above 1. This looks like percent or another unit. Re-run with --percent or check the layer.")
    json.dump(out, open("iowa_wind.json", "w"), indent=1, sort_keys=True)
    print("wrote iowa_wind.json:", len(out), "counties; min", min(out.values()), "max", max(out.values()))

if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "info":
        info(sys.argv[2])
    elif len(sys.argv) >= 4 and sys.argv[1] == "build":
        build(sys.argv[2], sys.argv[3], "--percent" in sys.argv)
    else:
        print(__doc__)
