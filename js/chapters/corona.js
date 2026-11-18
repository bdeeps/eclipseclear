// Chapter 6: totality up close, and seeing it safely. As the Moon covers the Sun the sky dims only a little until
// the last sliver; during totality the Sun's faint outer atmosphere, the corona, becomes visible (it is far
// fainter than the bright disc, which hides it the rest of the time). Just before and after, sunlight shines
// through valleys at the Moon's edge as Baily's beads; the last bead against the corona is the diamond ring.
// The lunar edge relief is exaggerated in the picture so the beads can be seen. The Moon's apparent size against the
// Sun's is q = (1,737.4 / d) / (695,700 / 149.6 million). Eclipse glasses must meet ISO 12312-2.
// The line-up drawn here is not to scale.
import { THREE, M, K, COL, V, clamp, skyState, fmtKm, frustumX, glowSprite, lineBetween, setLine, setupSky, hud, SkyView } from '../sky.js';

const XM = 2.4, XO = 20.4, XS = -31.6, RM = 0.7, XE = 26;
const qOf = (d) => (K.Rm / (d * 1000)) / (K.Rs / K.AU);
const VIEW = { pos: [-8, 26, 46], target: [-8, 0, 0] };

export default {
  id: 'corona',
  short: 'Totality up close',
  title: 'Totality up close, and seeing it safely',
  subtitle: 'Baily’s beads, the diamond ring and the corona, and when you may look.',
  view: VIEW,
  learn: `<p>As the Moon slides over the Sun, the world dims slowly at first. Even when 90 percent is covered, the sky is still bright, and the thin crescent can <b>burn your eyes</b>. In the last moments sunlight pours through valleys on the Moon’s edge as <b>Baily’s beads</b>. The last bead against the pale halo is the <b>diamond ring</b>.</p>
    <p>Then comes <b>totality</b>. The sky turns twilight dark. The Sun’s outer atmosphere, the <b>corona</b>, shows as a pearly halo with streamers, with pink <b>prominences</b> at the edge. It is far fainter than the Sun’s disc, so you can only see it when the disc is fully hidden.</p>
    <p><b>Safety:</b> look at any partial phase, and at an annular eclipse, only through <b>eclipse glasses that meet ISO 12312-2</b>. Ordinary sunglasses are not safe, and nor are cameras, binoculars or telescopes without a proper solar filter. Only during <b>total</b> totality may you look with bare eyes. Put the glasses back on at the first returning bead.</p>
    <p class="tip"><b>Try it:</b> slide <b>Moon crossing</b>, or use the jump buttons. Switch on <b>eclipse glasses</b> to see why they are needed. Then put the Moon at its farthest and see the ring.</p>
    <p class="note">The Moon’s edge relief is exaggerated so you can see the beads. The line-up is not to scale.</p>`,
  terms: [
    { t: 'Corona', d: 'The Sun’s outer atmosphere, millions of degrees hot. It is only visible when the bright disc is hidden.' },
    { t: 'Baily’s beads', d: 'Points of sunlight shining through valleys on the Moon’s edge just before and after totality.' },
    { t: 'Diamond ring', d: 'The last bead of sunlight next to the glowing corona, just before or after totality.' },
    { t: 'Prominence', d: 'A loop or jet of glowing gas rising from the Sun’s edge, pink in totality.' },
    { t: 'ISO 12312-2', d: 'The international standard for eclipse glasses. Look for it printed on them.' },
  ],
  defaults: { sep: 0.9, dist: 362, glasses: true, play: false },
  controls: [
    { key: 'sep', type: 'range', label: 'Moon crossing the Sun', min: -2.4, max: 2.4, step: 0.002, ends: ['Moon arrives', 'Moon leaves'], fmt: (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)} Sun radii` },
    { key: 'play', type: 'toggle', label: 'Play the crossing' },
    { key: 'dist', type: 'range', label: 'Moon distance', min: 356.5, max: 406.7, step: 0.1, ends: ['perigee: total', 'apogee: annular'], fmt: (v) => `${fmtKm(v * 1000)} km` },
    { key: 'glasses', type: 'toggle', label: 'Eclipse glasses on' },
    { key: 'j', type: 'buttons', label: 'Jump to', items: [
      { label: 'Partial', act: (s) => { s.sep = 0.7; } },
      { label: 'Baily’s beads', act: (s) => { s.sep = Math.max(0.05, qOf(s.dist) - 1 + 0.014); s.glasses = false; } },
      { label: 'Totality', act: (s) => { s.sep = 0; } },
      { label: 'Annular', act: (s) => { s.dist = 406.7; s.sep = 0; } },
    ] },
  ],
  quiz: [
    { q: 'What do you need to look at a partial solar eclipse?', options: ['Sunglasses', 'Eclipse glasses meeting ISO 12312-2', 'Nothing, it is dim', 'A camera'], answer: 1, why: 'Even a thin crescent of Sun can burn the retina. Only certified solar filters are safe.' },
    { q: 'When may you look at a solar eclipse with bare eyes?', options: ['Whenever the Sun looks dim', 'Only during total totality', 'Any time at sunrise', 'Never'], answer: 1, why: 'Only when the bright disc is completely covered is it safe. Put your glasses back on at the first returning bead of light.' },
    { q: 'Why can you only see the corona during totality?', options: ['It is far fainter than the Sun’s disc', 'It disappears otherwise', 'It is cold', 'It is on the Moon'], answer: 0, why: 'The disc is far brighter. The Moon hides it, and the pale corona shows.' },
  ],
  reel: [
    { ms: 5600, caption: 'Until the very last moment the Sun is still dangerous. Only look through eclipse glasses.', set: { dist: 362, glasses: true, play: false }, anim: { sep: [1.6, 0.3] }, view: VIEW, spin: 0 },
    { ms: 5600, caption: 'In totality, and only then, take your glasses off. The corona appears.', set: { dist: 360, glasses: false, play: false }, anim: { sep: [0.02, -0.02] }, view: VIEW, spin: 0 },
  ],
  build({ stage, s }) {
    setupSky(stage, { amb: 0.5, sunLight: 1.2, sun: [-1, 0.6, 0.3] });
    const root = new THREE.Group(); stage.root.add(root);
    const sunG = new THREE.Group(); sunG.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), M.glow(0xffe29a)), glowSprite(0xffffff, 7)); root.add(sunG);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(RM, 32, 16), M.matte(0x4a4a50)); moon.position.x = XM; root.add(moon);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 16), M.plastic(0x2f78c4)); earth.position.x = 22; root.add(earth);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8), M.glow(COL.anti)); eye.position.set(XO, 0, 0); root.add(eye);
    const pen = frustumX(M.ghost(COL.pen, 0.1)), um = frustumX(M.ghost(COL.umbra, 0.5)), ant = frustumX(M.ghost(COL.anti, 0.3));
    const cones = new THREE.Group(); cones.add(pen, um, ant); root.add(cones);
    const sight = lineBetween(V(XO, 0, 0), V(XS, 0, 0), 0xffffff, 0.45); root.add(sight);
    stage.label('Sun, not to scale', [XS, 4.4, 0], root);
    stage.label('Moon', [XM, 1.7, 0], root);
    stage.label('You', [XO, 1.1, 0], root, 'hot');
    const sky = new SkyView(); hud(stage, sky.mesh, { size: 0.42 });
    return {
      update(dt, st) {
        if (st.play) { st.sep -= dt * 0.35; if (st.sep < -2.4) st.sep = 2.4; }
        const q = qOf(st.dist), ths = RM / (XO - XM) / q, rs = ths * (XO - XS), dms = XM - XS;
        sunG.position.x = XS; sunG.scale.setScalar(rs);
        const z = st.sep * ths * (XO - XM);
        moon.position.z = z; cones.position.z = z;
        pen.set(XM, XE, RM, RM + ((XE - XM) * (rs + RM)) / dms);
        const apex = (dms * RM) / (rs - RM), ue = Math.min(XM + apex, XE);
        um.set(XM, ue, RM, Math.max(0, RM - ((ue - XM) * (rs - RM)) / dms));
        ant.set(XM + apex, Math.max(XM + apex, XE), 0, ((XE - XM - apex) * (rs - RM)) / dms); ant.visible = XM + apex < XE;
        setLine(sight, V(XO, 0, 0), V(XS, 0, 0));
        sky.show({ sep: st.sep, q, glasses: st.glasses, title: st.glasses ? 'Through eclipse glasses' : 'Bare eyes: not in partial phases' });
        sky.mesh.userData.update();
      },
      readout(st) {
        const q = qOf(st.dist), c = Math.abs(st.sep), k = skyState(q, c), gap = c - (q - 1);
        const name = k.kind === 'none' ? 'Before or after the eclipse' : k.kind === 'total' ? 'Totality' : k.kind === 'annular' ? 'Annular: ring of fire' : q > 1 && gap < 0.012 ? 'Diamond ring' : q > 1 && gap < 0.04 ? 'Baily’s beads' : 'Partial eclipse';
        const safe = k.kind === 'total' ? '<span class="ok">Bare eyes are safe, only in totality</span>' : k.kind === 'none' ? '<span class="ok">No eclipse in progress</span>' : st.glasses ? '<span class="ok">Safe: filter on</span>' : '<span class="no">Never look without a filter</span>';
        return `<div class="big">${name}</div>
          <div class="row"><span>Sun still shining</span><b>${(k.f * 100).toFixed(k.f < 0.01 ? 2 : 0)}%</b></div>
          <div class="row"><span>Moon looks</span><b>${(q * 100).toFixed(0)}% as wide as the Sun</b></div>
          <div class="row"><span>Eyes</span><b>${safe}</b></div>`;
      },
    };
  },
};
