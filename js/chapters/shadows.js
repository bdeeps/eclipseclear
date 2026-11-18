// Chapter 1: the Moon's shadow is a cone. The Sun is about 400 times wider than the Moon (2 x 695,700 km against
// 2 x 1,737.4 km) and about 390 times farther (mean 149.6 million km against 384,400 km; the ratio runs from about 360
// to 430), so the Moon covers almost exactly the Sun. The dark cone (umbra) is about 375,000 km long, close to the
// Moon-Earth distance, so its tip hovers around Earth's surface. Everything here is drawn at true scale
// (1 unit = 1,000 km) except the Sun marker. The caps on Earth are approximate near the edge of the disc.
import { THREE, M, K, COL, V, clamp, umbraAt, penAt, umbraLength, angDiam, fmtKm, earthMesh, moonMesh, frustumX, capMesh, glowSprite, setupSky, hud, SkyView } from '../sky.js';

const VIEWS = {
  line: { pos: [-190, 120, 330], target: [-190, 0, 0] },
  earth: { pos: [-26, 12, -14], target: [-4, 0, 0] },
  moon: { pos: [-372, 5, 14], target: [-384, 0, 0] },
};

export default {
  id: 'shadows',
  short: 'Shadows',
  title: 'A shadow with a sharp tip',
  subtitle: 'The Sun is 400 times wider than the Moon and 400 times farther, so the Moon just covers it.',
  view: VIEWS.earth,
  learn: `<p>Light from a big source makes a shadow with two parts. Inside the <b>umbra</b> the Moon hides the whole Sun, so it is dark: a total eclipse. In the wider <b>penumbra</b> it hides only part of the Sun, so you see a partial eclipse. The umbra is a cone that narrows to a point. Beyond the point it widens again as the <b>antumbra</b>, where the Moon looks smaller than the Sun and leaves a bright ring.</p>
    <p>Here is the coincidence. The Sun is about <b>400 times wider</b> than the Moon, and about <b>390 times farther away</b>. So both look about half a degree across. The umbra is about <b>375,000 km</b> long, almost exactly the distance to Earth, so its tip lands near the ground. Nothing makes this so. It is luck, and over hundreds of millions of years the Moon is drifting away, so it will not last.</p>
    <p class="tip"><b>Try it:</b> slide <b>Moon distance</b> and watch the umbra tip pass through Earth’s surface, from a total eclipse to an annular one. Then move the <b>shadow sideways</b>. Only the people under the dark spot see the Sun vanish.</p>
    <p class="note">Earth and the Moon are drawn to scale. The Sun is a marker: at true distance it would be 150 million units away.</p>`,
  terms: [
    { t: 'Umbra', d: 'The darkest part of a shadow, where the Moon hides the whole Sun. Under it you see totality.' },
    { t: 'Penumbra', d: 'The paler outer shadow, where the Moon hides only part of the Sun. Under it you see a partial eclipse.' },
    { t: 'Antumbra', d: 'The shadow beyond the umbra’s tip. The Moon looks smaller than the Sun there, so a ring of Sun shows: an annular eclipse.' },
    { t: 'Angular size', d: 'How wide something looks, as an angle. Both the Sun and the Moon span about half a degree.' },
  ],
  defaults: { d: 362, off: 0 },
  controls: [
    { key: 'd', type: 'range', label: 'Moon distance', min: 356.5, max: 406.7, step: 0.1, ends: ['perigee (closest)', 'apogee (farthest)'], fmt: (v) => `${fmtKm(v * 1000)} km` },
    { key: 'off', type: 'range', label: 'Shadow sideways', min: -10, max: 10, step: 0.05, hint: 'How far the middle of the shadow passes from the centre of Earth.', fmt: (v) => `${v > 0 ? '+' : ''}${fmtKm(v * 1000)} km` },
    { key: 'v', type: 'buttons', label: 'Camera', items: [{ label: 'Whole line-up', act: (s, i) => i.look('line') }, { label: 'Zoom on Earth', act: (s, i) => i.look('earth') }, { label: 'Zoom on the Moon', act: (s, i) => i.look('moon') }] },
  ],
  quiz: [
    { q: 'What is an annular eclipse?', options: ['The Moon is too far to reach the Sun', 'The Moon is too small to cover the Sun, leaving a ring', 'Earth’s shadow falls on the Moon', 'The Sun is behind a cloud'], answer: 1, why: 'When the Moon is far from Earth it looks a little smaller than the Sun. You are in the antumbra, past the umbra’s tip.' },
    { q: 'About how many times wider than the Moon is the Sun?', options: ['10', '40', '400', '4,000'], answer: 2, why: 'The Sun is about 1.39 million km across and the Moon about 3,475 km, a ratio of about 400. The Sun is also about 390 times farther.' },
    { q: 'Where do you see a partial eclipse?', options: ['Only in the umbra', 'In the penumbra, a few thousand kilometres around the umbra', 'Everywhere on Earth', 'Only at the poles'], answer: 1, why: 'The penumbra is about 7,000 km wide where it meets Earth, so a big region sees part of the Sun covered.' },
  ],
  reel: [
    { ms: 5600, caption: 'The Moon is 400 times smaller than the Sun and 400 times closer, so it covers it almost exactly.', set: { d: 384.4, off: 0 }, anim: { d: [356.5, 406.7] }, view: VIEWS.line, spin: 0 },
  ],
  build({ stage, s }) {
    setupSky(stage);
    const root = new THREE.Group(); stage.root.add(root);
    const earth = earthMesh(); root.add(earth);
    const moon = moonMesh(); root.add(moon);
    const sun = new THREE.Group(); sun.position.set(-520, 0, 0);
    sun.add(new THREE.Mesh(new THREE.SphereGeometry(22, 32, 16), M.glow(0xffe29a)), glowSprite(0xffffff, 120));
    root.add(sun);
    const mPen = M.ghost(COL.pen, 0.09), mUm = M.ghost(COL.umbra, 0.5), mAnt = M.ghost(COL.anti, 0.3);
    const pen = frustumX(mPen), um = frustumX(mUm), ant = frustumX(mAnt);
    const cones = new THREE.Group(); cones.add(pen, um, ant); root.add(cones);
    const capP = capMesh(K.Re / 1000, M.ghost(0x000000, 0.35)), capU = capMesh(K.Re / 1000, M.ghost(0x000000, 0.9)), capA = capMesh(K.Re / 1000, M.ghost(COL.anti, 0.7));
    root.add(capP, capU, capA);
    const sky = new SkyView(); hud(stage, sky.mesh, { size: 0.36 });
    stage.label('Earth', [0, 8, 0], root);
    const lMoon = stage.label('Moon', [0, 3.2, 0], moon);
    stage.label('Sun, not to scale: 150 million km away →', [-520, 30, 0], root);
    const lUm = stage.label('Umbra', [0, 0, 0], root, 'hot'), lPen = stage.label('Penumbra', [0, 0, 0], root), lAnt = stage.label('Antumbra', [0, 0, 0], root, 'hot');
    void lMoon;
    let calc = {};
    const solve = (st) => {
      const d = st.d * 1000, dms = K.AU - d, off = st.off, xm = -st.d;
      const hz = clamp(off, -K.Re / 1000 + 1e-3, K.Re / 1000 - 1e-3), xh = -Math.sqrt((K.Re / 1000) ** 2 - hz * hz);
      const reach = (xh - xm) * 1000, ru = umbraAt(reach, dms), rp = penAt(reach, dms);
      const hit = Math.abs(off) < K.Re / 1000 + rp / 1000;
      const L = umbraLength(dms) / 1000;
      return { d, dms, off, xm, xh, hz, ru, rp, L, hit, onEarth: Math.abs(off) < K.Re / 1000, q: (K.Rm / d) / (K.Rs / K.AU) };
    };
    return {
      look(k) { stage.setView(VIEWS[k].pos, VIEWS[k].target, 1.1); },
      update(dt, st) {
        const c = (calc = solve(st)), z = c.off, xEnd = 60;
        moon.position.set(c.xm, 0, z); cones.position.z = z;
        pen.set(c.xm, xEnd, K.Rm / 1000, penAt((xEnd - c.xm) * 1000, c.dms) / 1000);
        const tip = c.xm + c.L;
        const ue = Math.min(tip, xEnd); um.set(c.xm, ue, K.Rm / 1000, Math.max(0, umbraAt((ue - c.xm) * 1000, c.dms) / 1000));
        ant.set(tip, Math.max(tip, xEnd), 0, Math.max(0, (xEnd - tip) * 1000 * (K.Rs - K.Rm) / c.dms / 1000));
        ant.visible = tip < xEnd;
        lUm.position.set(c.xm + c.L * 0.55, 1.8, z); lPen.position.set(c.xm + 300, 5.5, z); lAnt.position.set(Math.min(tip + 25, 40), 2.4, z);
        // marks on Earth
        const dir = V(c.xh, 0, c.hz), show = c.onEarth;
        const aP = clamp(c.rp / K.Re, 0, 3.1), aU = clamp(Math.abs(c.ru) / K.Re, 0.004, 1);
        capP.visible = show; capU.visible = show && c.ru > 0; capA.visible = show && c.ru <= 0;
        if (show) { capP.setAlpha(aP).pointTo(dir); capU.setAlpha(Math.max(aU, 0.03)).pointTo(dir); capA.setAlpha(Math.max(aU, 0.03)).pointTo(dir); }
        sky.show({ sep: c.onEarth ? 0 : clamp((Math.abs(c.off) - K.Re / 1000) / (c.rp / 1000) * 2.4, 0.3, 3), q: c.q, title: 'What you see at the dot' });
        sky.mesh.userData.update();
      },
      readout(st) {
        const c = solve(st), ra = Math.abs(c.ru);
        const kind = !c.onEarth ? (c.hit ? 'partial' : 'none') : c.ru > 0 ? 'total' : 'annular';
        const head = { total: 'Total eclipse', annular: 'Annular eclipse', partial: 'Partial only', none: 'No eclipse' }[kind];
        const say = { total: 'The dark umbra reaches the ground, so under it the Moon hides the whole Sun.', annular: 'The umbra’s tip stops short. The Moon looks smaller than the Sun, so a ring of Sun is left.', partial: 'The dark spot misses Earth. Only the paler penumbra clips it, so the Sun is partly covered.', none: 'The shadow passes Earth by completely.' }[kind];
        return `<div class="big">${head}</div><p class="r-say">${say}</p>
          <div class="row"><span>Moon looks</span><b>${angDiam(K.Rm, c.d).toFixed(2)}°</b></div>
          <div class="row"><span>Sun looks</span><b>${angDiam(K.Rs, K.AU).toFixed(2)}°</b></div>
          <div class="row"><span>Umbra length</span><b>${fmtKm(c.L * 1000)} km</b></div>
          <div class="row"><span>Moon to Earth</span><b>${fmtKm(c.d)} km</b></div>
          ${c.onEarth ? `<div class="row"><span>${c.ru > 0 ? 'Umbra' : 'Antumbra'} on the ground</span><b>${fmtKm(ra * 2)} km wide</b></div>` : ''}
          <div class="row"><span>Penumbra on the ground</span><b>${c.onEarth || c.hit ? fmtKm(c.rp * 2) + ' km wide' : '–'}</b></div>`;
      },
    };
  },
};
