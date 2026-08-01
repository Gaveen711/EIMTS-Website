"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  divIcon,
  latLngBounds,
  type LatLngExpression,
  type Map as LeafletMap,
} from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "./BranchMap.css";

// ============================================================================
// SRI LANKA BRANCH MAP LOCATIONS & PINS
// To add/edit map pins: Add an object with id, name, address, phone, Google Maps URL,
// and GPS coordinates [latitude, longitude].
// ============================================================================
type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  mapsUrl: string;
  position: LatLngExpression;
};

const branches: Branch[] = [
  {
    id: "head-office",
    name: "Head office",
    city: "Dehiwala–Mount Lavinia",
    address: "198 Galle Road, Dehiwala–Mount Lavinia 10370, Colombo",
    phone: "+94 11 433 5444",
    phoneHref: "tel:+94114335444",
    mapsUrl: "https://share.google/jSW5rtcxaXVn9qE5k",
    position: [6.8425904, 79.866525],
  },
  {
    id: "kurunegala",
    name: "Kurunegala branch",
    city: "Kurunegala",
    address: "No. 72/1, 2nd Floor, Colombo Road, Kurunegala",
    phone: "+94 77 189 1890",
    phoneHref: "tel:+94771891890",
    mapsUrl: "https://share.google/DZbPHs5QIjT5bJpsa",
    position: [7.4870464, 80.364908],
  },
  {
    id: "batticaloa",
    name: "Batticaloa branch",
    city: "Batticaloa",
    address: "186 1/1, Fathima Building, Trinco Road, Batticaloa",
    phone: "+94 65 222 8448",
    phoneHref: "tel:+94652228448",
    mapsUrl: "https://share.google/W6UfxPkag34xZ8KzM",
    position: [7.7356027, 81.6941956],
  },
  {
    id: "kandy",
    name: "Kandy branch",
    city: "Kiribathkumbura",
    address: "420/1 Kehelwala Rd, Kiribathkumbura 20442",
    phone: "+94 11 433 5444",
    phoneHref: "tel:+94114335444",
    mapsUrl: "https://maps.google.com/?q=420/1+Kehelwala+Rd,+Kiribathkumbura+20442",
    position: [7.2718, 80.5794],
  },
];

const branchBounds = latLngBounds(branches.map((branch) => branch.position));
const sriLankaBounds = latLngBounds([5.72, 79.35], [10.18, 82.15]);

function markerIcon(isActive: boolean) {
  return divIcon({
    className: "branch-marker-icon",
    html: `<span class="branch-marker${isActive ? " is-active" : ""}" aria-hidden="true">
      <svg viewBox="0 0 48 60" focusable="false">
        <path d="M24 2C11.85 2 2 11.85 2 24c0 15.72 18.48 32.22 20.58 34.04a2.17 2.17 0 0 0 2.84 0C27.52 56.22 46 39.72 46 24 46 11.85 36.15 2 24 2Z" />
        <circle cx="24" cy="24" r="8" />
      </svg>
    </span>`,
    iconSize: [48, 60],
    iconAnchor: [24, 58],
    popupAnchor: [0, -54],
  });
}

function MapInit({ branch }: { branch: Branch | null }) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize();
    };

    invalidate();
    const timer1 = setTimeout(invalidate, 100);
    const timer2 = setTimeout(invalidate, 500);

    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  useEffect(() => {
    if (branch) {
      map.flyTo(branch.position, 14, { duration: 0.75 });
    }
  }, [branch, map]);

  return null;
}

function DirectionsIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5-5 5M19 10H9a4 4 0 0 0-4 4v5" /></svg>;
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3h3l1.5 5-2.1 1.3a15 15 0 0 0 5.7 5.7l1.3-2.1 5 1.5v3c0 2-1.6 3.6-3.6 3.6A14.4 14.4 0 0 1 3 6.6C3 4.6 4.6 3 6.6 3Z" /></svg>;
}

export function BranchMap() {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId) ?? null,
    [selectedBranchId],
  );

  const showAllBranches = () => {
    setSelectedBranchId(null);
    mapRef.current?.fitBounds(branchBounds, { padding: [44, 44] });
  };

  useEffect(() => {
    if (selectedBranchId) {
      const cardEl = document.querySelector(`.branch-map-card[data-id="${selectedBranchId}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedBranchId]);

  return <section className="branch-map-section" id="branch-map-section" aria-labelledby="branch-map-title">
    <div className="container">
      <header className="branch-map-heading">
        <div>
          <p className="section-kicker">Our Sri Lanka network</p>
          <h2 id="branch-map-title">Meet us closer to home.</h2>
          <p>Select an office to focus the map, call the local team or open turn-by-turn directions.</p>
        </div>
        <div className="branch-map-metric" aria-label={`${branches.length} Sri Lanka locations`}>
          <strong>{String(branches.length).padStart(2, "0")}</strong>
          <span>locations<br />across Sri Lanka</span>
        </div>
      </header>

      <div className="branch-map-shell">
        <div className="branch-map-canvas">
          <MapContainer
            ref={mapRef}
            className="branch-map"
            bounds={branchBounds}
            boundsOptions={{ padding: [44, 44] }}
            maxBounds={sriLankaBounds}
            maxBoundsViscosity={1}
            minZoom={7}
            maxZoom={17}
            scrollWheelZoom={false}
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapInit branch={selectedBranch} />
            {branches.map((branch) => <Marker
              key={branch.id}
              position={branch.position}
              icon={markerIcon(branch.id === selectedBranchId)}
              title={`${branch.name}, ${branch.city}`}
              eventHandlers={{ click: () => setSelectedBranchId(branch.id) }}
            >
              <Popup>
                <div className="branch-map-popup">
                  <strong>{branch.name}</strong>
                  <span>{branch.address}</span>
                  <a href={branch.phoneHref}>{branch.phone}</a>
                </div>
              </Popup>
            </Marker>)}
          </MapContainer>
          <div className="branch-map-country-label" aria-hidden="true">
            <span>Sri Lanka</span>
            <small>Island-wide branch locator</small>
          </div>
        </div>

        <aside className="branch-map-panel" aria-label="Sri Lanka branch locations">
          <div className="branch-map-panel-topline">
            <p>Choose a branch</p>
            <button type="button" onClick={showAllBranches}>View all</button>
          </div>

          <div className="branch-map-list">
            {branches.map((branch, index) => {
              const isSelected = branch.id === selectedBranchId;
              const directionsUrl = branch.mapsUrl;

              return <article className={`branch-map-card${isSelected ? " is-selected" : ""}`} key={branch.id} data-id={branch.id}>
                <button
                  className="branch-map-card-select"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedBranchId(branch.id)}
                >
                  <span className="branch-map-index">0{index + 1}</span>
                  <span className="branch-map-card-copy">
                    <strong>{branch.name}</strong>
                    <small>{branch.city}</small>
                    <span>{branch.address}</span>
                  </span>
                  <span className="branch-map-card-arrow" aria-hidden="true">↗</span>
                </button>
                <div className="branch-map-card-actions">
                  <a href={branch.phoneHref}><PhoneIcon />{branch.phone}</a>
                  <a href={directionsUrl} target="_blank" rel="noreferrer"><DirectionsIcon />Directions</a>
                </div>
              </article>;
            })}
          </div>
          <p className="branch-map-hint">Use the map controls or drag to explore. Scroll-wheel zoom is disabled.</p>
        </aside>
      </div>
    </div>
  </section>;
}
