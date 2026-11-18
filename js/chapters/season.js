// Chapter 2: why not every month. The Moon's orbit is tilted about 5.1 degrees to the ecliptic (the plane of
// Earth's orbit, which is the Sun's yearly path across our sky). The two crossing points are the nodes. Eclipses
// need the Sun to be near a node at new moon (solar) or full moon (lunar). Simplified model: circular orbits, the
// node line held fixed (really it turns once in 18.6 years), Moon-Sun separation limits of about 1.5 degrees.
// With the real tilt that gives a window of about 35 days around each node, which matches the roughly 34.5-day
// eclipse season. Sizes are exaggerated and the view is centred on Earth.
import { THREE, M, COL, V, clamp, frustumX, glowSprite, ringLine, setupSky } from '../sky.js';

const DEG = Math.PI / 180, TAU = Math.PI * 2, P = 29.530589, YEAR = 365.2422, TN = 3, L0 = 60 * DEG;
const LIM_S = 1.52 * DEG, LIM_L = 1.37 * DEG;
const lam = (t) => L0 + (TAU * t) / YEAR;
const phi = (t) => lam(t) + (TAU * (t - TN)) / P;
function dirs(t, tilt) {
  const l = lam(t), f = phi(t), i = tilt * DEG;
  const n = [Math.cos(l), 0, Math.sin(l)], m = [Math.cos(f), Math.sin(f) * Math.sin(i), Math.sin(f) * Math.cos(i)];
  const dot = n[0] * m[0] + n[1] * m[1] + n[2] * m[2];
  return { n, m, solar: Math.acos(clamp(dot, -1, 1)), lunar: Math.acos(clamp(-dot, -1, 1)), lat: Math.asin(Math.sin(f) * Math.sin(i)) / DEG };
}
function halfWindow(tilt, lim) { const si = Math.sin(tilt * DEG); return si < 1e-6 ? Math.PI : Math.asin(clamp(Math.sin(lim) / si, 0, 1)); }
function count(t, tilt) {
  let sol = 0, lun = 0;
  for (let k = 0; TN + (k * P) / 2 <= t; k++) {
    const d = dirs(TN + (k * P) / 2, tilt);
    if (k % 2 === 0 ? d.solar < LIM_S : d.lunar < LIM_L) (k % 2 === 0 ? sol++ : lun++);
  }
  return { sol, lun };
}
const nodeDist = (t) => { const l = ((lam(t) / DEG) % 180 + 180) % 180; return Math.min(l, 180 - l); }; // degrees from the nearest node
const R = 7;

export default {
  id: 'season',
  short: 'Why not every month',
  title: 'Why not every month?',
  subtitle: 'The Moon’s orbit is tilted about 5 degrees, so most new moons miss the Sun.',
  view: { pos: [13, 19, 24], target: [0, 0, 0] },
  learn: `<p>The Moon passes between us and the Sun every <b>new moon</b>, about every 29.5 days. So why is there no eclipse each time? Because the Moon’s orbit is <b>tilted about 5.1 degrees</b> to the plane of Earth’s orbit, the <b>ecliptic</b>. At most new moons the Moon is a little above or below the Sun, and its shadow passes over or under Earth.</p>
    <p>The orbit crosses the ecliptic at two points, the <b>nodes</b>. An eclipse needs a new moon (or a full moon, for a lunar eclipse) when the Sun is close to a node. The Sun passes both nodes every year, so there are two <b>eclipse seasons</b>, each about <b>34.5 days</b> long. A season holds at least one solar eclipse, and often a lunar one two weeks off. That makes <b>at least four eclipses a year</b>, and as many as seven.</p>
    <p class="tip"><b>Try it:</b> set <b>Orbit tilt</b> to zero and play. The Moon crosses the Sun every month. Raise it to about 5° and the eclipses shrink to two seasons. The shaded wedges show where the Sun must be.</p>
    <p class="note">A simplified model: circular orbits and a fixed node line. In reality the nodes drift round once in 18.6 years, so the seasons slide earlier each year.</p>`,
  terms: [
    { t: 'Ecliptic', d: 'The plane of Earth’s orbit around the Sun. Seen from Earth it is the Sun’s yearly path across the sky.' },
    { t: 'Node', d: 'One of the two points where the Moon’s tilted orbit crosses the ecliptic.' },
    { t: 'Eclipse season', d: 'A window of about 34.5 days, twice a year, when the Sun is near a node and an eclipse is possible.' },
    { t: 'New moon', d: 'When the Moon is between Earth and the Sun. A solar eclipse can only happen then.' },
    { t: 'Orbital inclination', d: 'The tilt of an orbit. The Moon’s is about 5.1° to the ecliptic.' },
  ],
  defaults: { tilt: 5.14, t: 0, play: false, rate: 25 },
  controls: [
    { key: 'tilt', type: 'range', label: 'Orbit tilt', min: 0, max: 10, step: 0.02, ends: ['flat', '10°'], fmt: (v) => v.toFixed(1) + '°' },
    { key: 't', type: 'range', label: 'Time of year', min: 0, max: 365, step: 0.25, fmt: (v) => `day ${Math.floor(v)}` },
    { key: 'play', type: 'toggle', label: 'Play through the year' },
    { key: 'rate', type: 'seg', label: 'Speed', options: [{ v: 8, label: '8 days/s' }, { v: 25, label: '25' }, { v: 60, label: '60' }] },
  ],
  quiz: [
    { q: 'Why is there not an eclipse at every new moon?', options: ['The Moon is too far away', 'The Moon’s orbit is tilted, so it usually passes above or below the Sun', 'Clouds block the view', 'The Moon goes round too slowly'], answer: 1, why: 'The orbit is tilted about 5.1° to the ecliptic. Only near the nodes does the new moon line up with the Sun.' },
    { q: 'How many eclipse seasons are there each year?', options: ['One', 'Two', 'Four', 'Twelve'], answer: 1, why: 'The Sun crosses the line of nodes twice a year, so there are two seasons, about six months apart.' },
    { q: 'If the Moon’s orbit were exactly flat with Earth’s, how often would solar eclipses happen?', options: ['Once a year', 'Every new moon', 'Every full moon', 'Never'], answer: 1, why: 'With no tilt the Moon would cross in front of the Sun every month, and a lunar eclipse would follow at every full moon.' },
  ],
  reel: [
    { ms: 5600, caption: 'If the Moon’s orbit lay flat, every new moon would cover the Sun.', set: { tilt: 0, t: 0, play: false }, anim: { t: [0, 85] }, view: { pos: [13, 19, 24], target: [0, 0, 0] }, spin: 0 },
    { ms: 5600, caption: 'Only when the Sun is near a crossing point, twice a year, does an eclipse season begin.', set: { tilt: 5.14, play: false }, anim: { t: [95, 150] }, view: { pos: [12, 15, 20], target: [0, 0, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    const { dl } = setupSky(stage, { amb: 0.35, sunLight: 0 }); dl.intensity = 0;
    const root = new THREE.Group(); stage.root.add(root);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), M.plastic(0x2f78c4, { emissive: 0x0c2a55, emissiveIntensity: 0.5 }));
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16), M.matte(0xcfcac0, { emissive: 0x181818 }));
    const sun = new THREE.Group(); sun.add(new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 16), M.glow(0xffe29a)), glowSprite(0xffffff, 9), new THREE.PointLight(0xfff0d0, 1100, 0, 2));
    root.add(earth, moon, sun);
    // the ecliptic plane and the Moon's tilted orbit
    const plane = new THREE.Mesh(new THREE.RingGeometry(1.2, 16, 96), M.ghost(0x8ef0ff, 0.06)); plane.rotation.x = -Math.PI / 2; root.add(plane);
    root.add(ringLine(15, 0xffd37a, 0.45));
    const orbit = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: COL.umbra, transparent: true, opacity: 0.9 })); root.add(orbit);
    const nodeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-16, 0, 0), V(16, 0, 0)]), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })); root.add(nodeLine);
    const wedges = new THREE.Group(); root.add(wedges);
    const wm = new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
    const mkWedges = (tilt) => {
      wedges.children.forEach((w) => w.geometry.dispose()); wedges.clear();
      const h = halfWindow(tilt, LIM_S);
      for (const c of [0, Math.PI]) { const w = new THREE.Mesh(new THREE.RingGeometry(1.2, 15.4, 48, 1, c - h, 2 * h), wm); w.rotation.x = -Math.PI / 2; wedges.add(w); }
    };
    const shadowG = new THREE.Group(), shadow = frustumX(M.ghost(COL.umbra, 0.5)).set(0, R * 1.02, 0.42, 0.02); shadowG.add(shadow); root.add(shadowG);
    const eShadowG = new THREE.Group(), eShadow = frustumX(M.ghost(0x9a7bff, 0.28)).set(0, 24, 1, 0.55); eShadowG.add(eShadow); root.add(eShadowG);
    const sunRay = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(15, 0, 0)]), new THREE.LineBasicMaterial({ color: 0xffd37a, transparent: true, opacity: 0.3 })); root.add(sunRay);
    stage.label('Earth', [0, 1.6, 0], root);
    stage.label('Node', [R + 1.2, 0.4, 0], root); stage.label('Node', [-R - 1.2, 0.4, 0], root);
    const lSun = stage.label('Sun', [0, 2.3, 0], sun, 'hot'); void lSun;
    let tiltKey = -1;
    const X = V(1, 0, 0);
    return {
      update(dt, st) {
        if (st.play) st.t = (st.t + dt * st.rate) % 365;
        if (tiltKey !== st.tilt) {
          tiltKey = st.tilt; mkWedges(st.tilt);
          const i = st.tilt * DEG, pts = []; for (let k = 0; k < 120; k++) { const a = (k / 120) * TAU; pts.push(V(R * Math.cos(a), R * Math.sin(a) * Math.sin(i), R * Math.sin(a) * Math.cos(i))); }
          orbit.geometry.setFromPoints(pts);
        }
        const d = dirs(st.t, st.tilt), n = V(...d.n), m = V(...d.m);
        sun.position.copy(n).multiplyScalar(15); moon.position.copy(m).multiplyScalar(R);
        shadowG.position.copy(moon.position); shadowG.quaternion.setFromUnitVectors(X, n.clone().negate());
        eShadowG.quaternion.setFromUnitVectors(X, n.clone().negate());
        const sp = sunRay.geometry.attributes.position; sp.setXYZ(1, sun.position.x, 0, sun.position.z); sp.needsUpdate = true;
        const on = d.solar < LIM_S || d.lunar < LIM_L;
        wm.opacity = 0.14 + (nodeDist(st.t) < halfWindow(st.tilt, LIM_S) / DEG ? 0.16 : 0);
        moon.material.emissive.setHex(d.lunar < LIM_L ? 0x6a1c0c : 0x181818);
        void on;
      },
      readout(st) {
        const d = dirs(st.t, st.tilt), win = (2 * halfWindow(st.tilt, LIM_S)) / TAU * YEAR, nd = nodeDist(st.t), c = count(st.t, st.tilt);
        const now = d.solar < LIM_S ? 'A solar eclipse is happening' : d.lunar < LIM_L ? 'A lunar eclipse is happening' : nd < halfWindow(st.tilt, LIM_S) / DEG ? 'Eclipse season: watch the new and full moons' : 'No eclipses possible now';
        return `<div class="big">${now}</div>
          <div class="row"><span>Moon above or below the ecliptic</span><b>${d.lat >= 0 ? '+' : '−'}${Math.abs(d.lat).toFixed(1)}°</b></div>
          <div class="row"><span>Sun from the nearest node</span><b>${nd.toFixed(0)}°</b></div>
          <div class="row"><span>Season length</span><b>${st.tilt < 0.3 ? 'the whole year' : win.toFixed(0) + ' days'}</b></div>
          <div class="row"><span>Eclipses so far this year</span><b>${c.sol} solar, ${c.lun} lunar</b></div>`;
      },
    };
  },
};
