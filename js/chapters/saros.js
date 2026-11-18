// Chapter 5: the saros. Three lunar "months" run at different speeds: synodic 29.530589 d (new moon to new moon),
// draconic 27.212221 d (node to node) and anomalistic 27.554550 d (perigee to perigee). After 223 synodic months
// (6,585.32 days, 18 years 11 days 8 hours) the Moon has also completed about 242 draconic and 239 anomalistic
// months, so the Sun, Moon and node line, and the Moon's distance, almost repeat: a similar eclipse returns. The extra
// 8 hours turns Earth by about 120 degrees, so the next eclipse falls about a third of the way round the world
// to the west. Three saros (about 54 years 34 days, the exeligmos) return to nearly the same longitude.
// Start: the total eclipse of 21 August 2017, greatest eclipse about 18:26 UTC near 37 N, 88 W. The later dates are
// computed from the cycle length, so they are approximate; the latitude drift of each path is not drawn.
import { THREE, M, V, clamp, latlon, earthMesh, setupSky } from '../sky.js';

const TAU = Math.PI * 2, SAROS = 6585.3211, SYN = 29.530589, DRA = 27.212221, ANO = 27.55455, YR = 365.2422;
const T0 = Date.UTC(2017, 7, 21, 18, 26);
const WHEELS = [
  { n: 'Phase', sub: 'new moon to new moon', P: SYN, r: 3.3, y: 0, col: 0xffb547 },
  { n: 'Nodes', sub: 'node to node', P: DRA, r: 2.4, y: 0.32, col: 0xc49bff },
  { n: 'Distance', sub: 'perigee to perigee', P: ANO, r: 1.5, y: 0.64, col: 0x8ef0ff },
];
const wrap = (a) => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
const dateStr = (n) => { const d = new Date(T0 + n * SAROS * 86400000); return `${d.getUTCDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const deg = (days, P) => wrap((TAU * days) / P) * (180 / Math.PI);

export default {
  id: 'saros',
  short: 'The saros cycle',
  title: 'The saros: eclipses repeat',
  subtitle: 'Every 18 years 11 days 8 hours, three Moon clocks line up again.',
  view: { pos: [0, 9, 14], target: [0.5, 0.5, 0] },
  learn: `<p>Eclipses look random, but they repeat. Early Babylonian astronomers found that after <b>6,585⅓ days</b>, which is <b>18 years, 11 days and 8 hours</b>, a very similar eclipse returns. The Greeks later called this the <b>saros</b>. Today it still helps predict eclipses.</p>
    <p>It works because three kinds of lunar month happen to fit together. In <b>223 phase cycles</b> (new moon to new moon) the Moon also makes about <b>242 trips from node to node</b> and about <b>239 from nearest point to nearest point</b>. So the Sun, Moon and node line, and the Moon’s distance, all come round to nearly the same set-up.</p>
    <p>The extra <b>8 hours</b> matter. Earth turns a third of the way round in 8 hours, so the next eclipse falls about <b>120° of longitude to the west</b>. After three saros, about 54 years, it is back near the same place.</p>
    <p class="tip"><b>Try it:</b> drag the <b>saros cycles</b> slider to 1. All three pointers return to the white marks, and a new pin appears a third of the way round Earth. Go on to 3.</p>
    <p class="note">Each saros series lasts about 1,300 years and drifts north or south on Earth. The drift is not drawn.</p>`,
  terms: [
    { t: 'Saros', d: 'A period of about 6,585.3 days (18 years 11 days 8 hours) after which similar eclipses repeat.' },
    { t: 'Synodic month', d: 'New moon to new moon: 29.53 days.' },
    { t: 'Draconic month', d: 'The Moon’s return to the same node: 27.21 days.' },
    { t: 'Anomalistic month', d: 'The Moon’s return to its closest point to Earth: 27.55 days.' },
    { t: 'Exeligmos', d: 'Three saros, about 54 years 34 days. It brings an eclipse back to nearly the same longitude.' },
  ],
  defaults: { cyc: 0.35, play: false },
  controls: [
    { key: 'cyc', type: 'range', label: 'Saros cycles', min: 0, max: 3, step: 0.001, fmt: (v) => `${v.toFixed(2)}  (${Math.floor((v * SAROS) / YR)} years ${Math.floor(((v * SAROS) / YR % 1) * YR)} days)` },
    { key: 'play', type: 'toggle', label: 'Play' },
  ],
  quiz: [
    { q: 'How long is a saros?', options: ['About 1 year', 'About 18 years 11 days 8 hours', 'Exactly 19 years', 'About 100 years'], answer: 1, why: 'It is 223 synodic months, about 6,585.3 days.' },
    { q: 'Why does the next eclipse in a saros fall farther west?', options: ['The Moon moves west', 'The extra 8 hours let Earth turn about 120° more', 'The Sun moves', 'Earth’s axis flips'], answer: 1, why: 'The cycle is not a whole number of days. The extra third of a day turns Earth by about 120°.' },
    { q: 'Why does the saros work at all?', options: ['It is a coincidence of how three lunar months fit together', 'The Moon is a clock', 'Planets pull on it', 'It does not work'], answer: 0, why: '223 phase months, about 242 node months and about 239 distance months all come to nearly the same length.' },
  ],
  reel: [
    { ms: 5600, caption: 'After 6,585 days, 18 years 11 days 8 hours, all three line up again. That is the saros.', set: { play: false }, anim: { cyc: [0.55, 1.0] }, view: { pos: [-2, 8, 12], target: [0, 0.5, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    setupSky(stage, { amb: 0.7, sunLight: 1.6, sun: [-0.3, 0.8, 0.8] });
    const root = new THREE.Group(); stage.root.add(root);
    const wheels = new THREE.Group(); wheels.position.x = -5; root.add(wheels);
    const rots = WHEELS.map((w) => {
      const g = new THREE.Group(); g.position.y = w.y;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(w.r, w.r, 0.22, 64), M.plastic(w.col, { emissive: w.col, emissiveIntensity: 0.18 }));
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(w.r - 0.8, w.r - 0.8, 0.26, 48), M.matte(0x0d0f16)); hole.position.y = 0.0;
      const tick = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 8), M.glow(0xffffff)); tick.position.set(w.r - 0.4, 0.2, 0);
      g.add(disc, hole, tick); wheels.add(g);
      const ref = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.08), M.glow(0xffffff)); ref.position.set(w.r + 0.15, w.y + 0.13, 0); wheels.add(ref);
      stage.label(`<b>${w.n}</b> ${w.P.toFixed(2)} d`, [w.r + 1.5, w.y + 0.2, 0], wheels);
      return g;
    });
    const tilt = new THREE.Group(); tilt.position.x = 5.2; root.add(tilt);
    const globe = earthMesh(3.1); tilt.add(globe);
    stage.label('Earth, seen from above the pole', [0, 3.9, 0], tilt);
    const pins = [0, 1, 2, 3].map((n) => {
      const lon = -87.7 - 120 * n, lat = 37;
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 8), M.glow(n === 0 ? 0xffffff : 0xffb547));
      p.position.copy(latlon(3.12, lat, lon)); globe.add(p);
      const l = stage.label(n === 0 ? `${dateStr(0)}` : `about ${dateStr(n)}`, [0, 0.35, 0], p, n === 0 ? 'hot' : ''); void l;
      return { p, lon };
    });
    let ang = -Math.PI / 2 + (87.7 * Math.PI) / 180, last = 0;
    return {
      update(dt, st) {
        if (st.play) { st.cyc += dt * 0.12; if (st.cyc > 3) st.cyc = 0; }
        const days = st.cyc * SAROS;
        WHEELS.forEach((w, i) => { rots[i].rotation.y = -(TAU * days) / w.P; });
        const n = Math.floor(st.cyc + 0.02);
        pins.forEach((p, i) => { p.p.visible = i <= n; });
        last = Math.min(3, n);
        const target = -Math.PI / 2 - ((-87.7 - 120 * last) * Math.PI) / 180;
        ang += wrap(target - ang) * (1 - Math.exp(-3 * dt));
        globe.rotation.y = ang;
      },
      readout(st) {
        const days = st.cyc * SAROS, ds = deg(days, SYN), dd = deg(days, DRA), da = deg(days, ANO);
        const ok = Math.abs(ds) < 5 && Math.abs(dd) < 5 && Math.abs(da) < 5 && st.cyc > 0.5;
        const sg = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '°';
        const n = Math.round(st.cyc);
        return `<div class="big">${ok ? 'In step: a similar eclipse returns' : 'Out of step'}</div>
          <div class="row"><span>Phase pointer from its mark</span><b>${sg(ds)}</b></div>
          <div class="row"><span>Node pointer</span><b>${sg(dd)}</b></div>
          <div class="row"><span>Distance pointer</span><b>${sg(da)}</b></div>
          <div class="row"><span>Phase months so far</span><b>${(days / SYN).toFixed(1)}</b></div>
          ${ok ? `<div class="row"><span>Earth’s extra turn</span><b>${n * 8} hours: ${n * 120}° west</b></div>` : ''}`;
      },
    };
  },
};
