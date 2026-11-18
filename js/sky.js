// Shared parts for EclipseClear: constants, shadow-cone maths, a sky scene, Earth and Moon, spherical caps,
// a camera-locked inset, and a painted "what you see in the sky" view (SkyView).
// World units in the true-scale chapters: 1 unit = 1,000 km.
import { THREE, M, canvasTexture, clamp, lerp, smooth, approach } from './kit.js';

export { THREE, M, clamp, lerp, smooth, approach };
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const COL = { sun: 0xffd37a, umbra: 0xc49bff, pen: 0x8ef0ff, anti: 0xffb547, red: 0xff7a59, lime: 0xa3e635 };
const DEG = Math.PI / 180;

// Numbers (km, s). Sun radius 695,700 (IAU nominal), Moon mean radius 1,737.4, Earth mean radius 6,371.
// Moon distance: closest about 356,500 and farthest about 406,700 km. Sun distance: 147.1 to 152.1 million km.
export const K = { Rs: 695700, Rm: 1737.4, Re: 6371, AU: 149.6e6, AUmin: 147.1e6, AUmax: 152.1e6, dMoon: 384400, perigee: 356500, apogee: 406700, GM: 398600, wE: 7.292115e-5, aMoon: 381600 };

export const umbraAt = (x, dms = K.AU) => K.Rm - (x * (K.Rs - K.Rm)) / dms; // km radius x km past the Moon; negative = antumbra
export const penAt = (x, dms = K.AU) => K.Rm + (x * (K.Rs + K.Rm)) / dms;
export const umbraLength = (dms = K.AU) => (dms * K.Rm) / (K.Rs - K.Rm);
export const moonSpeed = (d) => Math.sqrt(K.GM * (2 / d - 1 / K.aMoon)); // km/s, vis-viva
export const angDiam = (r, d) => 2 * Math.atan(r / d) / DEG; // degrees
export const fmtKm = (v) => Math.round(v).toLocaleString('en-US');
export const fmtMin = (sec) => { const m = Math.floor(sec / 60), r = Math.round(sec - m * 60); return r === 60 ? `${m + 1} min 0 s` : `${m} min ${r} s`; };
export function overlap(r1, r2, c) {
  if (c >= r1 + r2) return 0;
  if (c <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a1 = Math.acos((c * c + r1 * r1 - r2 * r2) / (2 * c * r1)), a2 = Math.acos((c * c + r2 * r2 - r1 * r1) / (2 * c * r2));
  return r1 * r1 * (a1 - Math.sin(2 * a1) / 2) + r2 * r2 * (a2 - Math.sin(2 * a2) / 2);
}
// Sun/Moon in the sky: q = Moon's apparent radius / Sun's, centre offset c in Sun radii.
export function skyState(q, c) {
  const f = 1 - overlap(1, q, c) / Math.PI; // fraction of the Sun's disc still visible
  let kind = 'none';
  if (c < 1 + q) kind = q >= 1 && c <= q - 1 ? 'total' : q < 1 && c <= 1 - q ? 'annular' : 'partial';
  return { f, kind, mag: clamp((1 + q - c) / 2, 0, 1.2) };
}
export const latlon = (r, lat, lon) => V(r * Math.cos(lat * DEG) * Math.cos(lon * DEG), r * Math.sin(lat * DEG), -r * Math.cos(lat * DEG) * Math.sin(lon * DEG));

// ---------------------------------------------------------------- scene
export function setupSky(stage, { fov = 42, sun = [-0.8, 0.35, 0.5], amb = 0.4, sunLight = 2.6, maxDist = 700 } = {}) {
  stage.setWorldMode(true);
  stage.camera.fov = fov; stage.camera.updateProjectionMatrix();
  stage.controls.maxDistance = maxDist;
  const root = stage.root;
  root.add(new THREE.AmbientLight(0x9fb4e8, amb));
  const dl = new THREE.DirectionalLight(0xfff4e0, sunLight);
  dl.position.set(...sun).multiplyScalar(100);
  root.add(dl);
  const R = rng(7), n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = R() * 2 - 1, a = R() * 6.283, r = Math.sqrt(1 - u * u); pos.set([r * Math.cos(a) * 1500, u * 1500, r * Math.sin(a) * 1500], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.7 }));
  stars.frustumCulled = false; root.add(stars);
  return { dl };
}

const POLY = {
  na: [[-168, 66], [-140, 70], [-95, 72], [-80, 68], [-62, 60], [-55, 50], [-67, 44], [-76, 35], [-81, 25], [-97, 26], [-97, 20], [-87, 21], [-83, 10], [-78, 8], [-90, 14], [-105, 20], [-117, 32], [-125, 42], [-125, 49], [-135, 58], [-150, 60], [-165, 62]],
  sa: [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-58, -38], [-65, -55], [-72, -50], [-71, -30], [-75, -15], [-81, -5]],
  af: [[-17, 21], [-5, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [33, -27], [20, -35], [12, -17], [9, 4], [-8, 5], [-17, 14]],
  eu: [[-10, 36], [-9, 43], [0, 50], [10, 56], [25, 70], [60, 70], [100, 78], [140, 72], [180, 68], [170, 60], [140, 50], [130, 35], [122, 30], [120, 22], [108, 10], [100, 3], [98, 10], [92, 22], [80, 8], [73, 18], [67, 25], [57, 25], [50, 30], [56, 17], [43, 13], [35, 28], [30, 36], [22, 37], [12, 44], [3, 43]],
  au: [[114, -22], [130, -12], [142, -11], [153, -26], [147, -38], [135, -35], [115, -34]],
  gl: [[-55, 60], [-20, 70], [-20, 82], [-60, 82], [-70, 76]],
};
export function earthTexture() {
  return canvasTexture(1024, 512, (g, W, H) => {
    const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#2a6aa8'); grad.addColorStop(0.5, '#1c5a9c'); grad.addColorStop(1, '#2a6aa8');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    const P = (lon, lat) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
    for (const [k, pts] of Object.entries(POLY)) {
      g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
      g.fillStyle = k === 'gl' ? '#e8eef5' : k === 'au' ? '#b59b62' : k === 'af' ? '#a39a58' : '#4f8a4c'; g.fill();
    }
    g.fillStyle = '#eef3fa'; g.fillRect(0, 0, W, H * 0.045); g.fillRect(0, H * 0.935, W, H * 0.07);
    const R = rng(3); g.fillStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 60; i++) { g.beginPath(); g.ellipse(R() * W, R() * H, 20 + R() * 50, 5 + R() * 10, 0, 0, 7); g.fill(); }
  });
}
export function earthMesh(r = K.Re / 1000, seg = 64) {
  const t = earthTexture();
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg / 2), new THREE.MeshStandardMaterial({ map: t.tex, roughness: 0.8, metalness: 0 }));
}
export function moonTexture() {
  return canvasTexture(512, 256, (g, W, H) => {
    g.fillStyle = '#a7a59f'; g.fillRect(0, 0, W, H);
    const R = rng(11);
    g.fillStyle = 'rgba(70,70,78,.55)';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(R() * W, H * (0.25 + R() * 0.5), 30 + R() * 60, 20 + R() * 35, R() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 260; i++) {
      const x = R() * W, y = R() * H, r = 1.5 + R() * R() * 12;
      g.fillStyle = 'rgba(60,60,64,.35)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = 'rgba(235,235,230,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(x - 0.5, y - 0.5, r, 0, 7); g.stroke();
    }
  });
}
export function moonMesh(r = K.Rm / 1000) {
  const t = moonTexture();
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), new THREE.MeshStandardMaterial({ map: t.tex, roughness: 0.95, metalness: 0 }));
  m.userData.tex = t.tex;
  return m;
}
// The Moon, lit by sunlight along +x, with Earth's umbra (red) and penumbra drawn from a disc in the y-z plane.
export function eclipsedMoonMaterial(tex) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, ax: { value: new THREE.Vector2(0, 0) }, rUm: { value: 4.6 }, rPen: { value: 8.2 } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `uniform sampler2D map; uniform vec2 ax; uniform float rUm; uniform float rPen; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 c = texture2D(map, vUv).rgb;
        float lam = max(dot(normalize(vN), vec3(-1.,0.,0.)), 0.);
        float d = length(vW.yz - ax);
        float pen = smoothstep(rUm, rPen, d);
        float inU = 1. - smoothstep(rUm*0.97, rUm*1.03, d);
        vec3 red = vec3(0.62,0.16,0.05) * (0.45 + 0.55*smoothstep(0., rUm, d)) * 0.5;
        vec3 lit = mix(vec3(0.02 + 0.98*pen), red, inU);
        vec3 col = c * (0.012 + lam) * lit * 1.15;
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// A cone (frustum) along +x from x0 (radius r0) to x1 (radius r1); .set() rebuilds it.
export function frustumX(mat, seg = 48) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  m.userData.key = '';
  m.set = (x0, x1, r0, r1) => {
    const key = [x0, x1, r0, r1].map((v) => v.toFixed(4)).join();
    if (key === m.userData.key) return m; m.userData.key = key;
    m.geometry.dispose();
    const g = new THREE.CylinderGeometry(Math.max(0, r1), Math.max(0, r0), Math.max(1e-4, Math.abs(x1 - x0)), seg, 1, true); g.rotateZ(-Math.PI / 2);
    m.geometry = g; m.position.x = (x0 + x1) / 2; m.visible = Math.abs(x1 - x0) > 1e-3;
    return m;
  };
  return m;
}
// A spherical cap on a sphere of radius R (points +y until you .pointTo a direction).
export function capMesh(R, mat) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(R * 1.004, 8, 2, 0, 6.283, 0, 0.1), mat);
  m.userData.a = -1;
  m.setAlpha = (a) => {
    a = clamp(a, 0.002, Math.PI);
    if (Math.abs(a - m.userData.a) < 1e-4) return m; m.userData.a = a;
    m.geometry.dispose(); m.geometry = new THREE.SphereGeometry(R * 1.004, 48, 12, 0, 6.283, 0, a);
    return m;
  };
  m.pointTo = (dir) => { m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize()); return m; };
  return m;
}
export function ringLine(R, color, opacity = 0.5, n = 180, plane = 'xz') {
  const pts = []; for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832; pts.push(plane === 'xz' ? new THREE.Vector3(R * Math.cos(a), 0, R * Math.sin(a)) : new THREE.Vector3(R * Math.cos(a), R * Math.sin(a), 0)); }
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
export function lineBetween(a, b, color, opacity = 0.6) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
export function setLine(l, a, b) { const p = l.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; l.geometry.computeBoundingSphere(); }
export function glowSprite(color, size) {
  const t = canvasTexture(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,230,160,.55)'); r.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  s.scale.setScalar(size); return s;
}

// A flat picture locked to a corner of the screen. Call hud.update() every frame.
export function hud(stage, mesh, { size = 0.34, corner = 'br', dist = 4 } = {}) {
  stage.root.add(mesh);
  mesh.renderOrder = 999; mesh.material.depthTest = false; mesh.frustumCulled = false;
  mesh.userData.update = () => {
    const cam = stage.camera, hh = dist * Math.tan((cam.fov * DEG) / 2), hw = hh * cam.aspect, s = size * 2 * hh, m = 0.04 * hh;
    const sx = corner.includes('r') ? 1 : -1, sy = corner.includes('b') ? -1 : 1;
    const off = V(sx * (hw - s / 2 - m), sy * (hh - s / 2 - m * (sy < 0 ? 1.6 : 3.5)), -dist);
    mesh.position.copy(off.applyQuaternion(cam.quaternion).add(cam.position));
    mesh.quaternion.copy(cam.quaternion); mesh.scale.setScalar(s);
  };
  return mesh;
}

// ---------------------------------------------------------------- the sky as seen from the ground
const LIMB = (() => { const R = rng(21), ph = Array.from({ length: 9 }, () => R() * 6.28); return (a) => { let h = 0; for (let k = 0; k < 9; k++) h += Math.sin((k + 3) * a + ph[k]) / (k + 2); return h * 0.55; }; })();
let CORONA = null;
function coronaCanvas() {
  if (CORONA) return CORONA;
  const c = document.createElement('canvas'); c.width = c.height = 768; const g = c.getContext('2d'), R = 150, cx = 384, cy = 384, r = rng(5);
  g.globalCompositeOperation = 'lighter';
  const grad = g.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 3.2);
  grad.addColorStop(0, 'rgba(255,255,255,.95)'); grad.addColorStop(0.12, 'rgba(235,240,255,.55)'); grad.addColorStop(0.4, 'rgba(190,205,255,.18)'); grad.addColorStop(1, 'rgba(160,180,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 768, 768);
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 6.283 + r() * 0.3, len = R * (1.6 + r() * 1.9), w = 0.1 + r() * 0.12;
    g.save(); g.translate(cx, cy); g.rotate(a);
    const sg = g.createLinearGradient(R, 0, R + len, 0); sg.addColorStop(0, 'rgba(230,238,255,.5)'); sg.addColorStop(1, 'rgba(200,215,255,0)');
    g.fillStyle = sg; g.beginPath(); g.moveTo(R * 0.98, -R * w); g.quadraticCurveTo(R + len * 0.4, -R * w * 0.5, R + len, 0); g.quadraticCurveTo(R + len * 0.4, R * w * 0.5, R * 0.98, R * w); g.fill(); g.restore();
  }
  return (CORONA = c);
}
const PROM = [0.5, 1.9, 3.3, 4.6, 5.4];
function drawSky(g, W, H, p) {
  const R = 150, cx = W / 2, cy = H / 2;
  const q = p.q, sep = p.sep, dy = p.dy || 0, c = Math.hypot(sep, dy), st = skyState(q, c), f = st.f;
  const sb = p.glasses ? 0 : Math.pow(clamp(f, 0, 1), 0.5);
  const sky = `rgb(${Math.round(4 + 70 * sb)},${Math.round(6 + 120 * sb)},${Math.round(16 + 200 * sb)})`;
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const ca = clamp(1 - f / 0.012, 0, 1) * (p.glasses ? 0 : 1);
  if (ca > 0.01) {
    g.globalAlpha = ca; g.globalCompositeOperation = 'lighter'; g.drawImage(coronaCanvas(), 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = '#ff5b6b'; g.lineWidth = 6;
    PROM.forEach((a, i) => { g.beginPath(); g.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * (0.07 + 0.012 * i), a + 3.14 - 1.2, a + 3.14 + 1.2); g.stroke(); });
    g.globalAlpha = 1;
  }
  // the Sun
  const sg = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
  if (p.glasses) { sg.addColorStop(0, '#ffb14a'); sg.addColorStop(1, '#c8641c'); } else { sg.addColorStop(0, '#fffdf0'); sg.addColorStop(0.8, '#ffe9a8'); sg.addColorStop(1, '#ffc766'); }
  g.fillStyle = sg; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fill();
  if (!p.glasses && f > 0.0005) {
    g.globalCompositeOperation = 'lighter';
    const gl = g.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * (1.2 + 3.2 * Math.sqrt(f)));
    gl.addColorStop(0, `rgba(255,236,190,${0.55 * Math.sqrt(f)})`); gl.addColorStop(1, 'rgba(255,236,190,0)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  }
  // the Moon, with an exaggerated, bumpy edge so you can see Baily's beads
  const mx = cx + sep * R, my = cy - dy * R, black = 3 + 90 * sb * 0.2;
  g.fillStyle = sb > 0.45 ? sky : `rgb(${black},${black},${black + 4})`;
  g.beginPath(); for (let i = 0; i <= 360; i++) { const a = (i / 360) * 6.2832, rr = q * R * (1 + 0.0125 * LIMB(a)); const x = mx + rr * Math.cos(a), y = my + rr * Math.sin(a); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.fill();
  if (!p.glasses) {
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1.5; g.stroke();
    // diamond ring: just before or after totality, the last bead blazes against the corona
    const gap = c - (q - 1);
    if (q > 1 && gap > 0 && gap < 0.015) {
      const k = 1 - gap / 0.015, px = cx - (sep / c) * R, py = cy + (dy / c) * R;
      g.globalCompositeOperation = 'lighter';
      const bg = g.createRadialGradient(px, py, 0, px, py, 70 * (0.4 + k)); bg.addColorStop(0, 'rgba(255,255,255,1)'); bg.addColorStop(0.2, 'rgba(255,240,200,.6)'); bg.addColorStop(1, 'rgba(255,230,160,0)');
      g.fillStyle = bg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    }
  }
  // caption
  const names = { none: 'No eclipse', partial: `Partial: ${Math.round((1 - f) * 100)}% of the Sun covered`, annular: 'Annular: a ring of fire', total: 'Total: the corona appears' };
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, H - 60, W, 60);
  g.fillStyle = '#eef0f6'; g.font = '500 26px Geist, system-ui, sans-serif'; g.textAlign = 'center';
  g.fillText(p.glasses ? `Through eclipse glasses: ${names[st.kind] || ''}` : names[st.kind] || '', W / 2, H - 22);
  g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '500 20px Geist, system-ui, sans-serif'; g.fillText(p.title || 'The sky from the ground', 16, 30);
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, W - 3, H - 3);
}
export class SkyView {
  constructor() {
    this.ct = canvasTexture(768, 768, (g, W, H, p) => drawSky(g, W, H, p || { sep: 3, q: 1 }));
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.ct.tex, toneMapped: false }));
    this.key = '';
  }
  show(p) {
    const k = [p.sep.toFixed(3), p.q.toFixed(3), (p.dy || 0).toFixed(3), p.glasses ? 1 : 0, p.title].join();
    if (k === this.key) return; this.key = k; this.ct.redraw(p);
  }
}
