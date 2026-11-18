// Chapter 4: lunar eclipses. Earth's umbra at the Moon's distance is about 4,600 km in radius, which is about
// 9,200 km across, or about 2.6 Moon widths (radius = Re - d (Rs - Re) / Dsun); its penumbra there is about
// 8,200 km in radius. The Moon crosses it at about 0.94 km/s relative to the shadow (about 1.01 km/s orbital
// speed minus the shadow's own sweep, about 0.08 km/s), so totality can last up to about 100 minutes. The Moon
// stays dim and turns copper red because sunlight bent by Earth's atmosphere (about 1 degree at the limb)
// reaches the umbra, with the blue scattered out on the way, like all the sunrises and sunsets at once.
// The umbra here ignores the small enlargement caused by the atmosphere. Drawn at true scale (1 unit = 1,000 km),
// except the Sun marker.
import { THREE, M, K, COL, V, clamp, umbraAt, penAt, moonSpeed, fmtKm, earthMesh, moonMesh, eclipsedMoonMaterial, frustumX, glowSprite, ringLine, lineBetween, setupSky } from '../sky.js';

const RE = K.Re / 1000, D = 384.4, DEG = Math.PI / 180;
const VIEWS = {
  moon: { pos: [D - 24, 17, 26], target: [D, 0, 0] },
  line: { pos: [190, 120, 250], target: [190, 0, 0] },
  night: { pos: [D - 18, 0.3, 0.3], target: [D, 0, 0] },
};
const vrel = () => moonSpeed(D * 1000) - D * 2 * Math.PI / (365.2422 * 86400); // km/s
const shadow = () => ({ ru: (K.Re - D * 1000 * (K.Rs - K.Re) / K.AU), rp: K.Re + D * 1000 * (K.Rs + K.Re) / K.AU });
const fmtT = (min) => `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, '0')} min`;

export default {
  id: 'lunar',
  short: 'Lunar eclipses',
  title: 'Lunar eclipses',
  subtitle: 'Earth’s shadow falls on the Moon, which turns red instead of black.',
  view: VIEWS.moon,
  learn: `<p>In a <b>lunar eclipse</b> the Moon passes into <b>Earth’s</b> shadow, at a full moon when Earth is between the Sun and the Moon. Earth’s umbra is about <b>9,200 km</b> across where the Moon crosses it, about 2.6 times the Moon’s width, so the Moon can sit inside it for up to about <b>100 minutes</b>.</p>
    <p>You might expect the Moon to go black. It turns <b>copper red</b>. Sunlight grazing Earth’s atmosphere is bent inward by about a degree, with the blue scattered away on the way, and it falls into the umbra. The Moon is lit by every sunrise and sunset on Earth at once.</p>
    <p>Anyone on the night side can see it, so it is visible from half the planet at once. It is also <b>safe to look at</b>: the Moon is no brighter than usual, and dimmer than ever during totality. Do not confuse it with a solar eclipse.</p>
    <p class="tip"><b>Try it:</b> press <b>From Earth’s night side</b> and slide the <b>time</b> to watch the shadow edge cross the Moon. Turn on the <b>bent sunlight</b> to see how it reaches the Moon.</p>
    <p class="note">At this scale the Sun is a marker, and Earth’s atmosphere is drawn thicker than real.</p>`,
  terms: [
    { t: 'Lunar eclipse', d: 'The Moon passes through Earth’s shadow. It can only happen at a full moon, near a node.' },
    { t: 'Blood Moon', d: 'A popular name for the red Moon in a total lunar eclipse.' },
    { t: 'Penumbral eclipse', d: 'The Moon passes through only the faint outer shadow and dims slightly. Many people do not notice it.' },
    { t: 'Refraction', d: 'The bending of light as it passes through air. Earth’s atmosphere bends sunlight into its own shadow.' },
  ],
  defaults: { tm: -2.2, play: false, b: 0.8, rays: true },
  controls: [
    { key: 'tm', type: 'range', label: 'Time', min: -3.3, max: 3.3, step: 0.005, fmt: (v) => `${v >= 0 ? '+' : '−'}${Math.floor(Math.abs(v))} h ${String(Math.round((Math.abs(v) % 1) * 60)).padStart(2, '0')} min` },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'b', type: 'range', label: 'Moon above or below the shadow’s centre', min: -10, max: 10, step: 0.05, fmt: (v) => `${fmtKm(Math.abs(v) * 1000)} km ${v === 0 ? '' : v > 0 ? 'north' : 'south'}`, hint: 'The tilt of the Moon’s orbit: more offset, a shorter eclipse.' },
    { key: 'rays', type: 'toggle', label: 'Show bent sunlight' },
    { key: 'v', type: 'buttons', label: 'Camera', items: [{ label: 'Moon and shadow', act: (s, i) => i.look('moon') }, { label: 'Whole line-up', act: (s, i) => i.look('line') }, { label: 'From Earth’s night side', act: (s, i) => i.look('night') }] },
  ],
  quiz: [
    { q: 'Why does the Moon turn red in a total lunar eclipse?', options: ['Earth’s shadow is red', 'Sunlight bent through Earth’s atmosphere reaches the Moon, with the blue scattered out', 'The Moon heats up', 'The Sun turns red'], answer: 1, why: 'Light grazing Earth’s edge is refracted into the umbra. Blue is scattered away, leaving red and orange, like all the world’s sunsets together.' },
    { q: 'Who can see a lunar eclipse?', options: ['Only people in a narrow path', 'Anyone on the night side of Earth with the Moon above the horizon', 'Only people near the equator', 'Nobody without special glasses'], answer: 1, why: 'The Moon really is dimmed, so everyone who can see the Moon sees it, about half the planet.' },
    { q: 'Why is it safe to watch a lunar eclipse without glasses?', options: ['It is too short to hurt', 'The Moon is only reflected light and gets no brighter', 'The red light is harmless', 'It is not safe'], answer: 1, why: 'The Moon never gets brighter than at full moon, and in an eclipse it is much dimmer. Only solar eclipses need filters.' },
  ],
  reel: [
    { ms: 5600, caption: 'In a lunar eclipse the Moon slides into Earth’s shadow, about 2.6 Moon-widths across.', set: { b: 0.8, play: false, rays: false }, anim: { tm: [-2.6, 0.2] }, view: VIEWS.moon, spin: 0 },
    { ms: 5600, caption: 'It does not go black. It turns red, lit by sunlight bent through Earth’s air.', set: { b: 0.8, play: false, rays: true, tm: 0 }, anim: { tm: [-0.3, 0.6] }, view: VIEWS.night, spin: 0 },
  ],
  build({ stage, s }) {
    setupSky(stage, { maxDist: 900 });
    const root = new THREE.Group(); stage.root.add(root);
    const earth = earthMesh(RE); earth.rotation.y = 2.2; root.add(earth);
    const atm = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.03, 40, 20), M.ghost(0x6fb4ff, 0.2)); root.add(atm);
    const sc = shadow(), rUm = sc.ru / 1000, rPen = sc.rp / 1000;
    const tip = (RE * K.AU) / (K.Rs - K.Re) / 1;
    const pen = frustumX(M.ghost(COL.pen, 0.035)).set(0, 560, RE, RE + (560000 * (K.Rs + K.Re)) / K.AU / 1000);
    const um = frustumX(M.ghost(COL.umbra, 0.12)).set(0, tip, RE, 0.02);
    root.add(pen, um);
    root.add(ringLine(D, 0xffffff, 0.25, 360));
    const moon = moonMesh(); const mat = eclipsedMoonMaterial(moon.userData.tex);
    mat.uniforms.rUm.value = rUm; mat.uniforms.rPen.value = rPen; moon.material = mat; root.add(moon);
    const sun = new THREE.Group(); sun.position.set(-90, 0, 0); sun.add(new THREE.Mesh(new THREE.SphereGeometry(10, 24, 12), M.glow(0xffe29a)), glowSprite(0xffffff, 60)); root.add(sun);
    stage.label('Sun, not to scale →', [-90, 14, 0], root);
    stage.label('Earth', [0, RE + 2, 0], root);
    stage.label('Moon', [0, 3.4, 0], moon);
    stage.label('Earth’s umbra', [D - 10, 0.5, -rUm - 1.2], root, 'hot');
    stage.label('Penumbra', [D - 10, 0.5, rPen + 1.2], root);
    // sunlight bent by the atmosphere: about 1 degree at the limb, so rays cross the axis near the Moon
    const rays = new THREE.Group(); root.add(rays);
    const bend = Math.tan(1.0 * DEG);
    for (const sgn of [1, -1]) {
      const y0 = sgn * (RE * 1.03), xe = D + 12;
      const pts = [V(-40, 0, y0), V(0, 0, y0), V(xe, 0, y0 - sgn * xe * bend)];
      rays.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: COL.red, transparent: true, opacity: 0.9 })));
    }
    void lineBetween;
    return {
      look(k) { stage.setView(VIEWS[k].pos, VIEWS[k].target, 1.1); },
      update(dt, st) {
        if (st.play) { st.tm += dt * 0.35; if (st.tm > 3.3) st.tm = -3.3; }
        moon.position.set(D, st.b, (vrel() * 3600 * st.tm) / 1000);
        rays.visible = st.rays;
        mat.uniforms.ax.value.set(0, 0);
      },
      readout(st) {
        const z = (vrel() * 3600 * st.tm), c = Math.hypot(st.b * 1000, z), { ru, rp } = shadow(), Rm = K.Rm;
        const mag = (ru + Rm - c) / (2 * Rm);
        let head, say;
        if (c >= rp + Rm) { head = 'Moon outside the shadow'; say = 'A bright full moon, just as always.'; }
        else if (c >= ru + Rm) { head = 'Penumbral phase'; say = 'The Moon dims a little. You would hardly notice.'; }
        else if (c > ru - Rm) { head = 'Partial eclipse'; say = 'A dark bite with a curved edge is taken out of the Moon.'; }
        else { head = 'Total eclipse'; say = 'The whole Moon is in the umbra. It glows dim copper red.'; }
        const dt = ru - Rm > Math.abs(st.b * 1000) ? (2 * Math.sqrt((ru - Rm) ** 2 - (st.b * 1000) ** 2)) / vrel() / 60 : 0;
        return `<div class="big">${head}</div><p class="r-say">${say}</p>
          <div class="row"><span>Umbra at the Moon</span><b>${fmtKm(ru * 2)} km across (${(ru / Rm).toFixed(1)} Moon widths)</b></div>
          <div class="row"><span>Umbral magnitude</span><b>${mag > 0 ? mag.toFixed(2) : '–'}</b></div>
          <div class="row"><span>Totality in this pass</span><b>${dt > 0 ? fmtT(dt) : 'none: the Moon never fits inside'}</b></div>`;
      },
    };
  },
};
