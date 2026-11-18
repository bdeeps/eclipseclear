// Chapter 3: the path of totality. The Moon's umbra is a spot roughly 100 to 270 km wide that sweeps across Earth
// while the planet turns beneath it. The shadow axis moves across Earth's disc at the Moon's orbital speed
// (about 1.0 km/s, from the vis-viva equation), Earth's surface moves the same way at up to 0.465 km/s
// (1,674 km/h at the equator), so at the equator the shadow crosses the ground at roughly 0.55 to 0.65 km/s,
// or 2,000 to 2,300 km/h; higher in latitude and near sunrise and sunset it is faster. Totality lasts the
// umbra's width divided by that ground speed: up to about 7.5 minutes. The Moon's distance (356,500 to
// 406,700 km) and the Sun's (147.1 to 152.1 million km) decide whether the umbra reaches the ground (total)
// or stops short (annular). The umbra spot on the globe is enlarged so you can see it. Earth's axis is tilted
// 8 degrees toward the Sun, as in April. A simplified geometric model, not an ephemeris.
import { THREE, M, K, COL, V, clamp, umbraAt, penAt, moonSpeed, angDiam, fmtKm, fmtMin, earthMesh, moonMesh, frustumX, capMesh, setupSky, hud, SkyView } from '../sky.js';
import { tube } from '../kit.js';

const DEG = Math.PI / 180, RE = K.Re / 1000, EPS = 8 * DEG;
const VIEW = { pos: [-24, 11, -13], target: [0, 0, 0] };

export default {
  id: 'path',
  short: 'The path of totality',
  title: 'The path of totality',
  subtitle: 'A shadow about 100 to 270 km wide races across a turning Earth.',
  view: VIEW,
  learn: `<p>Totality is not visible everywhere. The umbra touches Earth as a small dark spot, <b>about 100 to 270 km wide</b>. As the Moon moves along its orbit, the spot sweeps across the planet, drawing the <b>path of totality</b>. Around it, in a much bigger circle, the penumbra gives a partial eclipse.</p>
    <p>The Moon travels at about <b>1 km a second</b> and Earth turns the same way, so the shadow crosses the ground at <b>1,700 km/h or more</b> at the equator, and faster further north or south. Dividing the umbra’s width by that speed gives the time of totality, which is <b>up to about 7.5 minutes</b>. Most last two or three.</p>
    <p>The Moon’s orbit is not a circle. At <b>perigee</b> it is about 356,500 km away and looks larger than the Sun, so the umbra reaches the ground. At <b>apogee</b>, about 406,700 km, it looks smaller and the umbra falls short. Then you see a ring of Sun, an <b>annular eclipse</b>.</p>
    <p class="tip"><b>Try it:</b> play the shadow across Earth. Then move <b>Moon distance</b> to the far end for an annular eclipse, and stand off the centre line to see how totality shortens and then vanishes.</p>
    <p class="note">The dark spot is drawn larger than life so you can see it. Earth’s tilt and the sizes are real.</p>`,
  terms: [
    { t: 'Path of totality', d: 'The narrow strip of Earth where the umbra passes, so the Sun is totally covered.' },
    { t: 'Perigee and apogee', d: 'The Moon’s closest and farthest points from Earth, about 356,500 and 406,700 km.' },
    { t: 'Annular eclipse', d: 'The Moon is too far away to cover the Sun. A bright ring, the “ring of fire”, is left around it.' },
    { t: 'Greatest duration', d: 'The longest totality is up to about 7 minutes 32 seconds, when the Moon is near perigee and the Sun is far away.' },
  ],
  defaults: { tm: -1.7, play: false, d: 362, off: 0.5, side: 0, sun: 149.6 },
  controls: [
    { key: 'tm', type: 'range', label: 'Time', min: -1.9, max: 1.9, step: 0.005, fmt: (v) => `${v >= 0 ? '+' : '−'}${Math.floor(Math.abs(v))} h ${Math.round((Math.abs(v) % 1) * 60)} min` },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'd', type: 'range', label: 'Moon distance', min: 356.5, max: 406.7, step: 0.1, ends: ['perigee', 'apogee'], fmt: (v) => `${fmtKm(v * 1000)} km` },
    { key: 'sun', type: 'seg', label: 'Earth’s distance from the Sun', options: [{ v: 147.1, label: 'January' }, { v: 149.6, label: 'April, October' }, { v: 152.1, label: 'July' }], hint: 'Earth is farthest from the Sun in July. A smaller Sun is easier to cover.' },
    { key: 'off', type: 'range', label: 'Path north or south', min: -4, max: 4, step: 0.05, fmt: (v) => `${v > 0 ? '+' : ''}${fmtKm(v * 1000)} km` },
    { key: 'side', type: 'range', label: 'Where you stand: off the centre line', min: -0.8, max: 0.8, step: 0.005, fmt: (v) => `${fmtKm(Math.abs(v) * 1000)} km ${v === 0 ? '' : v > 0 ? 'north' : 'south'}` },
  ],
  quiz: [
    { q: 'About how wide is the umbra where it touches Earth?', options: ['About 3 km', 'About 100 to 270 km', 'About 3,000 km', 'All of Earth'], answer: 1, why: 'The dark spot is small. The partial-eclipse region around it is thousands of kilometres across.' },
    { q: 'Why can totality last up to about 7.5 minutes but no longer?', options: ['The Sun burns out', 'The umbra is narrow and sweeps over the ground fast', 'Clouds always arrive', 'Earth stops turning'], answer: 1, why: 'Totality is the umbra’s width divided by its speed over the ground. Even in the best case that is only a few hundred seconds.' },
    { q: 'When the Moon is at apogee, what happens?', options: ['It looks bigger than the Sun', 'It looks smaller, so an eclipse is annular', 'There is no eclipse ever', 'The Moon turns red'], answer: 1, why: 'At apogee the Moon looks about 8% smaller than the Sun at its mean distance, so the umbra stops short of the ground.' },
  ],
  reel: [
    { ms: 5600, caption: 'The Moon’s shadow races over Earth at more than 1,700 kilometres an hour.', set: { d: 362, off: 0.5, side: 0, sun: 149.6, play: false }, anim: { tm: [-1.8, 1.8] }, view: VIEW, spin: 0 },
  ],
  build({ stage, s }) {
    setupSky(stage);
    const root = new THREE.Group(); stage.root.add(root);
    const tilt = new THREE.Group(); tilt.rotation.z = EPS; root.add(tilt);
    const globe = earthMesh(RE); tilt.add(globe);
    const moon = moonMesh(); root.add(moon);
    const cones = new THREE.Group(); root.add(cones);
    const pen = frustumX(M.ghost(COL.pen, 0.1)), um = frustumX(M.ghost(COL.umbra, 0.5)); cones.add(pen, um);
    const capP = capMesh(RE, M.ghost(0x000000, 0.4)), capU = capMesh(RE, M.ghost(0x000000, 0.8));
    root.add(capP, capU);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 8), M.glow(0xffffff)); root.add(dot);
    const me = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 8), M.glow(COL.anti)); globe.add(me);
    stage.label('You', [0, 0.35, 0], me, 'hot');
    const pathMat = M.glow(COL.anti, { transparent: true, opacity: 0.7 });
    let path = null, key = '', obs = V(0, 0, 0), L = {};
    const sky = new SkyView(); hud(stage, sky.mesh, { size: 0.36 });
    const mat = new THREE.Matrix4(), inv = new THREE.Matrix4();
    const speed = (st) => moonSpeed(st.d * 1000);
    const axisAt = (st, tm) => V(0, st.off, (speed(st) * 3600 * tm) / 1000);
    const hit = (st, tm) => { const a = axisAt(st, tm), r2 = a.y * a.y + a.z * a.z; return r2 < RE * RE * 0.9985 ? V(-Math.sqrt(RE * RE - r2), a.y, a.z) : null; };
    const toLocal = (p, tm) => { mat.makeRotationZ(EPS).multiply(new THREE.Matrix4().makeRotationY(K.wE * tm * 3600)); return p.clone().applyMatrix4(inv.copy(mat).invert()); };
    const solve = (st) => {
      const dms = st.sun * 1e6 - st.d * 1000, h0 = hit(st, 0);
      const x0 = h0 ? h0.x : -RE, ru = umbraAt((x0 + st.d) * 1000, dms), rp = penAt((x0 + st.d) * 1000, dms);
      const g = (tm) => { const h = hit(st, tm); return h && toLocal(h, tm); };
      const a = g(-0.002), b = g(0.002), sp = a && b ? (a.distanceTo(b) * 1000) / (0.004 * 3600) : 0; // km/s on the ground
      return { dms, ru, rp, sp, ok: !!h0, v: speed(st) };
    };
    return {
      update(dt, st) {
        if (st.play) { st.tm += dt * 0.22; if (st.tm > 1.9) st.tm = -1.9; }
        const dms = st.sun * 1e6 - st.d * 1000, tmS = st.tm;
        globe.rotation.y = K.wE * tmS * 3600; tilt.updateMatrixWorld(true);
        const ax = axisAt(st, tmS), k = [st.d, st.off, st.side, st.sun].join();
        if (k !== key) {
          key = k; L = solve(st);
          const pts = []; for (let i = 0; i <= 90; i++) { const tm = -2 + (4 * i) / 90, h = hit(st, tm); if (h) pts.push(toLocal(h, tm).multiplyScalar(1.006)); }
          if (path) { globe.remove(path); path.geometry.dispose(); path = null; }
          if (pts.length > 3) { path = tube(pts, 0.05, pathMat, false, 160); path.castShadow = false; globe.add(path); }
          const ph = V(-Math.sqrt(Math.max(1, RE * RE - (st.off + st.side) ** 2)), st.off + st.side, 0);
          obs = toLocal(ph, 0); me.position.copy(obs).multiplyScalar(1.01);
        }
        moon.position.set(-st.d, ax.y, ax.z); cones.position.set(0, ax.y, ax.z);
        pen.set(-st.d, 0, K.Rm / 1000, penAt(st.d * 1000, dms) / 1000);
        const ue = Math.min(-st.d + (dms * K.Rm) / (K.Rs - K.Rm) / 1000, 0);
        um.set(-st.d, ue, K.Rm / 1000, Math.max(0, umbraAt((ue + st.d) * 1000, dms) / 1000));
        const h = hit(st, tmS);
        capP.visible = capU.visible = dot.visible = !!h;
        if (h) {
          const reach = (h.x + st.d) * 1000, ru = umbraAt(reach, dms), rp = penAt(reach, dms);
          capP.setAlpha(rp / K.Re).pointTo(h); capU.setAlpha(Math.max(0.045, Math.abs(ru) / K.Re)).pointTo(h); capU.material.color.setHex(ru > 0 ? 0x000000 : 0xffb547);
          dot.position.copy(h).multiplyScalar(1.01);
        }
        // the view of the sky from where you stand
        const O = me.getWorldPosition(V(0, 0, 0)), D = O.x + st.d, ths = K.Rs / st.sun / 1e6, day = O.x < 0;
        const sx = -((ax.z - O.z) / D) / ths, sy = ((ax.y - O.y) / D) / ths, q = (K.Rm / (D * 1000)) / ths;
        sky.show({ sep: day ? sx : 4, dy: day ? sy : 0, q, title: day ? 'What you see where you stand' : 'It is night where you stand' });
        sky.mesh.userData.update();
      },
      readout(st) {
        const c = solve(st), mid = c.ok ? (c.ru > 0 ? 'total' : 'annular') : 'none', cen = Math.abs(st.side) * 1000, ra = Math.abs(c.ru);
        const head = { total: 'Total eclipse path', annular: 'Annular eclipse path', none: 'The shadow misses Earth’s middle' }[mid];
        const dur = mid === 'none' ? '' : cen >= ra ? 'Partial eclipse only, outside the path' : fmtMin((2 * Math.sqrt(ra * ra - cen * cen)) / c.sp);
        const spKm = c.sp * 3600;
        return `<div class="big">${head}</div>
          <p class="r-say">${mid === 'total' ? 'The umbra reaches the ground and sweeps a narrow strip.' : mid === 'annular' ? 'The Moon looks too small, so the strip sees a ring of Sun.' : 'Move the path toward the middle of Earth.'}</p>
          <div class="row"><span>Moon looks</span><b>${angDiam(K.Rm, st.d * 1000).toFixed(2)}° (Sun ${angDiam(K.Rs, st.sun * 1e6).toFixed(2)}°)</b></div>
          ${mid === 'none' ? '' : `<div class="row"><span>${c.ru > 0 ? 'Path of totality' : 'Path of the ring'}</span><b>${fmtKm(ra * 2)} km wide</b></div>
          <div class="row"><span>Shadow speed on the ground</span><b>${fmtKm(spKm)} km/h</b></div>
          <div class="row"><span>${c.ru > 0 ? 'Totality' : 'The ring'} where you stand</span><b>${dur}</b></div>`}
          <div class="row"><span>Partial eclipse region</span><b>${c.ok ? fmtKm(c.rp * 2) + ' km wide' : '–'}</b></div>`;
      },
    };
  },
};
