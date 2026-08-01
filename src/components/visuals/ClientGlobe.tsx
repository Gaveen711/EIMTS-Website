"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================================================
// 3D CLIENT GLOBE DATA & CONFIGURATION
// HUB: Primary origin point (Sri Lanka)
// CLIENT_MARKETS: Destination markets displayed on the interactive 3D globe
// ============================================================================
type Market = {
  name: string;
  region: "Africa" | "Asia" | "Europe";
  latitude: number;
  longitude: number;
};

const HUB: Market = { name: "Sri Lanka", region: "Asia", latitude: 7.8731, longitude: 80.7718 };

const CLIENT_MARKETS: Market[] = [
  { name: "Pakistan", region: "Asia", latitude: 30.3753, longitude: 69.3451 },
  { name: "Nepal", region: "Asia", latitude: 28.3949, longitude: 84.124 },
  { name: "Myanmar", region: "Asia", latitude: 21.9162, longitude: 95.956 },
  { name: "Korea", region: "Asia", latitude: 35.9078, longitude: 127.7669 },
  { name: "Saudi Arabia", region: "Asia", latitude: 23.8859, longitude: 45.0792 },
  { name: "Qatar", region: "Asia", latitude: 25.3548, longitude: 51.1839 },
  { name: "Kuwait", region: "Asia", latitude: 29.3117, longitude: 47.4818 },
  { name: "UAE", region: "Asia", latitude: 23.4241, longitude: 53.8478 },
  { name: "Nigeria", region: "Africa", latitude: 9.082, longitude: 8.6753 },
  { name: "Ghana", region: "Africa", latitude: 7.9465, longitude: -1.0232 },
  { name: "Uganda", region: "Africa", latitude: 1.3733, longitude: 32.2903 },
  { name: "Kenya", region: "Africa", latitude: -0.0236, longitude: 37.9062 },
  { name: "Serbia", region: "Europe", latitude: 44.0165, longitude: 21.0059 },
  { name: "Romania", region: "Europe", latitude: 45.9432, longitude: 24.9668 },
];

const toGlobePosition = ({ latitude, longitude }: Market, radius = 1) => {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

const makeLatitude = (latitude: number, radius: number) => {
  const points: THREE.Vector3[] = [];
  for (let longitude = -180; longitude <= 180; longitude += 4) {
    points.push(toGlobePosition({ name: "", region: "Asia", latitude, longitude }, radius));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
};

const makeLongitude = (longitude: number, radius: number) => {
  const points: THREE.Vector3[] = [];
  for (let latitude = -90; latitude <= 90; latitude += 3) {
    points.push(toGlobePosition({ name: "", region: "Asia", latitude, longitude }, radius));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
};

export default function ClientGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const focusMarketRef = useRef<(market: Market) => void>(() => undefined);

  // Default initial country state set to Pakistan (static on load)
  const selectedRef = useRef("Pakistan");
  const [selectedMarket, setSelectedMarket] = useState<Market>(() => CLIENT_MARKETS.find((m) => m.name === "Pakistan") ?? CLIENT_MARKETS[0]);

  const selectMarket = (market: Market) => {
    selectedRef.current = market.name;
    setSelectedMarket(market);
    focusMarketRef.current(market);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.2, 3.25);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 4.2;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;

    const globe = new THREE.Group();
    scene.add(globe);

    const earthTexture = new THREE.TextureLoader().load("/assets/earth-blue-marble.jpg");
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    const globeSurface = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ map: earthTexture, color: 0xffffff, emissive: 0x02100d, emissiveIntensity: 0.12, shininess: 18 }),
    );
    globe.add(globeSurface);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.055, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x8fd8ff, transparent: true, opacity: 0.1, side: THREE.BackSide }),
    );
    globe.add(atmosphere);

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.065 });
    for (let latitude = -60; latitude <= 60; latitude += 20) {
      globe.add(new THREE.Line(makeLatitude(latitude, 1.005), gridMaterial));
    }
    for (let longitude = -160; longitude < 180; longitude += 20) {
      globe.add(new THREE.Line(makeLongitude(longitude, 1.005), gridMaterial));
    }

    const hubPosition = toGlobePosition(HUB, 1.025);
    const arcMaterial = new THREE.LineBasicMaterial({ color: 0xf3b84b, transparent: true, opacity: 0.62 });
    CLIENT_MARKETS.forEach((market) => {
      const destination = toGlobePosition(market, 1.025);
      const lift = 1.16 + hubPosition.angleTo(destination) * 0.25;
      const midpoint = hubPosition.clone().add(destination).normalize().multiplyScalar(lift);
      const curve = new THREE.QuadraticBezierCurve3(hubPosition, midpoint, destination);
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), arcMaterial));
    });

    const markets = [HUB, ...CLIENT_MARKETS];
    const pinMeshes: THREE.Mesh[] = [];
    markets.forEach((market) => {
      const isHub = market.name === HUB.name;
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(isHub ? 0.055 : 0.037, 20, 20),
        new THREE.MeshBasicMaterial({ color: isHub ? 0xffffff : 0xf3b84b }),
      );
      pin.position.copy(toGlobePosition(market, 1.04));
      pin.userData.market = market;
      pinMeshes.push(pin);
      globe.add(pin);
    });

    const selectedHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const selectedHalo = new THREE.Mesh(new THREE.RingGeometry(0.068, 0.09, 32), selectedHaloMaterial);
    const haloNormal = new THREE.Vector3(0, 0, 1);
    const updateSelectedHalo = (market: Market) => {
      const position = toGlobePosition(market, 1.045);
      selectedHalo.position.copy(position);
      selectedHalo.quaternion.setFromUnitVectors(haloNormal, position.clone().normalize());
    };
    globe.add(selectedHalo);

    scene.add(new THREE.HemisphereLight(0xdff7ef, 0x02130f, 1.65));
    const keyLight = new THREE.DirectionalLight(0xffdfa3, 2.4);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = new THREE.Vector2();

    const getPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const findMarket = (event: PointerEvent) => {
      getPointer(event);
      raycaster.setFromCamera(pointer, camera);

      const firstHit = raycaster.intersectObjects([globeSurface, ...pinMeshes], false)[0];
      if (!firstHit || firstHit.object === globeSurface) return undefined;

      return firstHit.object.userData.market as Market | undefined;
    };

    const handlePointerMove = (event: PointerEvent) => {
      canvas.style.cursor = findMarket(event) ? "pointer" : "grab";
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = new THREE.Vector2(event.clientX, event.clientY);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerDown.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 6) return;
      const market = findMarket(event);
      if (market && market.name !== HUB.name) selectMarket(market);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    const focusStartDirection = new THREE.Vector3();
    const focusRotation = new THREE.Quaternion();
    const focusStep = new THREE.Quaternion();
    const focusPosition = new THREE.Vector3();
    let focusStartedAt: number | null = null;
    let focusStartDistance = camera.position.length();

    const focusMarket = (market: Market) => {
      controls.autoRotate = false;
      updateSelectedHalo(market);

      const targetDirection = toGlobePosition(market).normalize();
      if (reducedMotion) {
        camera.position.copy(targetDirection.multiplyScalar(3.15));
        camera.lookAt(0, 0, 0);
        controls.update();
        return;
      }

      focusStartDirection.copy(camera.position).normalize();
      focusRotation.setFromUnitVectors(focusStartDirection, targetDirection);
      focusStartDistance = camera.position.length();
      focusStartedAt = performance.now();
      controls.enabled = false;
    };
    focusMarketRef.current = focusMarket;
    focusMarket(selectedMarket);

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    let frameId = 0;
    const render = (now = performance.now()) => {
      pinMeshes.forEach((pin) => {
        const market = pin.userData.market as Market;
        const scale = market.name === selectedRef.current ? 1.65 : 1;
        pin.scale.setScalar(THREE.MathUtils.lerp(pin.scale.x, scale, 0.12));
      });

      const haloPulse = reducedMotion ? 1 : 1 + Math.sin(now * 0.005) * 0.08;
      selectedHalo.scale.setScalar(haloPulse);

      if (focusStartedAt !== null) {
        const progress = Math.min((now - focusStartedAt) / 620, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        focusStep.identity().slerp(focusRotation, eased);
        const distance = THREE.MathUtils.lerp(focusStartDistance, 3.15, eased);
        focusPosition.copy(focusStartDirection).applyQuaternion(focusStep).multiplyScalar(distance);
        camera.position.copy(focusPosition);
        camera.lookAt(0, 0, 0);

        if (progress === 1) {
          focusStartedAt = null;
          controls.enabled = true;
          controls.update();
        }
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      globe.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) child.geometry.dispose();
      });
      globeSurface.material.dispose();
      atmosphere.material.dispose();
      gridMaterial.dispose();
      arcMaterial.dispose();
      selectedHaloMaterial.dispose();
      pinMeshes.forEach((pin) => (pin.material as THREE.Material).dispose());
      earthTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <section id="client-network" className="ei-client-map" aria-labelledby="client-map-title">
    <div className="container">
      <header className="ei-client-map-heading" data-reveal>
        <div>
          <p className="ei-kicker">Our client network</p>
          <h2 id="client-map-title">Partnerships that travel further.</h2>
        </div>
        <div className="ei-client-map-intro">
          <p>From our Sri Lankan hub, we support trusted client relationships across Africa, Asia and Europe.</p>
          <dl>
            <div><dt>14</dt><dd>client markets</dd></div>
            <div><dt>3</dt><dd>global regions</dd></div>
            <div><dt>1</dt><dd>accountable partner</dd></div>
          </dl>
        </div>
      </header>

      <div className="ei-client-map-layout" data-reveal>
        <div className="ei-client-market-panel">
          <p>Explore our client markets</p>
          <div className="ei-client-market-list" aria-label="Client countries">
            {CLIENT_MARKETS.map((market) => <button
              type="button"
              className={selectedMarket.name === market.name ? "is-active" : ""}
              aria-pressed={selectedMarket.name === market.name}
              onClick={() => selectMarket(market)}
              key={market.name}
            >
              <span>{market.name}</span>
              <small>{market.region}</small>
            </button>)}
          </div>
          <div className="ei-client-map-status" aria-live="polite">
            <span>Active connection</span>
            <strong>Sri Lanka <i aria-hidden="true">to</i> {selectedMarket.name}</strong>
            <small>{selectedMarket.region} client market</small>
          </div>
        </div>

        <div className="ei-client-globe-wrap">
          <div className="ei-client-globe" ref={stageRef}>
            <canvas ref={canvasRef} role="img" aria-label="Interactive 3D globe showing client connections from Sri Lanka. Drag to rotate or use the country controls." />
          </div>
          <div className="ei-client-map-legend" aria-hidden="true"><span><i className="is-hub" /> Sri Lanka hub</span><span><i /> Client market</span><span>Drag to explore</span></div>
        </div>
      </div>
    </div>
  </section>;
}
