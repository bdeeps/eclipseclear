<!-- glassbox:start -->
<!-- Generated from glassbox.json by the Glassbox hub (npm run readme -- eclipseclear). Edit glassbox.json, not this block. -->

<h1 align="center">EclipseClear</h1>

<p align="center"><b>How does an eclipse happen?</b><br>For about three minutes the Moon hides the Sun and day turns to night. Play with the shadow cone, tilt the Moon's orbit, race the umbra across a turning Earth, and find out why the Sun and Moon fit together so neatly.</p>

<p align="center"><a href="https://glassbox.how/eclipseclear/"><b>▶ Play with it</b></a> &nbsp;·&nbsp; <a href="https://glassbox.how/e/eclipseclear/">Read the 60-second explainer</a></p>

<p align="center">
  <a href="https://glassbox.how/e/eclipseclear/"><img alt="Glassbox No. 236" src="https://img.shields.io/badge/Glassbox-No.%20236-8ef0ff"></a>
  <a href="https://glassbox.how/e/eclipseclear/"><img alt="Space" src="https://img.shields.io/badge/field-Space-c49bff"></a>
  <a href="LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/code-MIT-3fb950"></a>
  <a href="LICENSE-CONTENT.md"><img alt="Content: CC BY 4.0" src="https://img.shields.io/badge/content-CC%20BY%204.0-ef9421"></a>
  <a href="#privacy"><img alt="Privacy: explained" src="https://img.shields.io/badge/privacy-explained-555"></a>
</p>

## In 60 seconds

1. **A shadow with a point.** The Moon's shadow is a cone. Inside the dark umbra the Moon hides the whole Sun. In the wider penumbra it hides part of it. Past the umbra's tip the shadow widens again as the antumbra, where the Moon looks too small and leaves a ring of Sun.
2. **A lucky coincidence.** The Sun is about 400 times wider than the Moon and about 390 times farther away, so both look about half a degree across. The umbra is about 375,000 km long, close to the Moon's distance from Earth, so its tip lands near the ground.
3. **Why not every month.** The Moon's orbit is tilted about 5.1 degrees to Earth's orbit. Most new moons the shadow passes above or below Earth. Only when the Sun is near one of the two crossing points, the nodes, can an eclipse happen. That gives two eclipse seasons a year, each about 34.5 days long.
4. **A narrow, fast path.** The umbra touches Earth as a spot about 100 to 270 km wide. It crosses the ground at 1,700 km/h or more, so totality lasts at most about 7.5 minutes. When the Moon is near apogee it looks smaller than the Sun, and the eclipse is annular.
5. **The red Moon.** In a lunar eclipse the Moon enters Earth's shadow, about 2.6 Moon-widths across. It turns copper red because Earth's air bends sunlight into the shadow and scatters away the blue. Everyone on the night side can see it, and it is safe to watch.
6. **The saros, and watching safely.** After 6,585 days, 18 years 11 days 8 hours, the Sun, Moon and nodes line up again and a similar eclipse returns, a third of the way round the world. Look at the partial phases only through glasses that meet ISO 12312-2. Remove them only in total totality.

## Words worth knowing

| Term | Meaning |
|---|---|
| **Umbra** | The darkest part of a shadow, where the Moon hides the whole Sun. |
| **Penumbra** | The paler outer shadow, where the Moon hides only part of the Sun. |
| **Antumbra** | The shadow beyond the umbra's tip, where the Moon looks smaller than the Sun and an annular eclipse is seen. |
| **Node** | One of the two points where the Moon's tilted orbit crosses the ecliptic. |
| **Eclipse season** | A window of about 34.5 days, twice a year, when the Sun is near a node. |
| **Path of totality** | The narrow strip of Earth where the umbra passes and the Sun is totally covered. |
| **Annular eclipse** | The Moon is too far to cover the Sun, so a bright ring is left around it. |
| **Saros** | About 6,585.3 days (18 years 11 days 8 hours) after which similar eclipses repeat. |
| **Corona** | The Sun's faint outer atmosphere, visible only when its bright disc is hidden. |
| **Baily's beads** | Points of sunlight shining through valleys on the Moon's edge just before and after totality. |

## A short history

**From scratched bones and clay diaries to a gear machine, a telescope test of Einstein, and a shadow crossing a continent.**

- **1200 BCE** · Eclipses scratched on oracle bones (Shang dynasty diviners, Anyang, China)
- **300 BCE** · Babylonian astronomers find the saros (Babylonian astronomers, Mesopotamia)
- **100 BCE** · The Antikythera mechanism predicts eclipses (Unknown Greek makers, Greek world; found off Antikythera)
- **1005** · Ibn Yunus gathers eclipse records in Cairo (Ibn Yunus, Cairo, Egypt)
- **1504** · Columbus uses a lunar eclipse to get food (Christopher Columbus, Jamaica)
- **1851** · First good photograph of the corona (Julius Berkowski, Königsberg, Prussia (now Kaliningrad, Russia))
- **1868** · Helium is found in sunlight (Jules Janssen; Norman Lockyer, Guntur, India; England)
- **1898** · Annie Maunder photographs the corona in India (Annie Maunder, Talini, India)

The full story, with 27 moments, charts, people and 36 sources: [glassbox.how/e/eclipseclear/history](https://glassbox.how/e/eclipseclear/history/). The data lives in [`history.json`](history.json).

## Privacy

This box has no accounts and no ads, and it ships its own fonts and libraries. When you run it yourself it sends nothing anywhere. On glassbox.how, the site's `/bar.js` also loads Glassbox's analytics: **Google Analytics** to count visits (it asks first in the EU, UK and Switzerland, and stays off when your browser sends Global Privacy Control or Do Not Track) and **ClickTrust** to detect bots.

It remembers a few things **in your own browser only**, and never sends them anywhere:

| Browser storage key | What it holds |
|---|---|
| `eclipseclear.v1` | Which chapters you have opened, your best quiz scores, and sound on or off. |

Exactly what each one sees is at [glassbox.how/privacy](https://glassbox.how/privacy/).

## Licences

- **Code:** [MIT](LICENSE). Use it, change it, ship it.
- **Explanations, text, images and videos** (`glassbox.json`, `glassbox/`): [CC BY 4.0](LICENSE-CONTENT.md). Credit “Glassbox, glassbox.how/e/eclipseclear”.
- **Third-party parts** keep their own licences: [three.js](https://threejs.org) (MIT), [Geist, Instrument Serif](https://openfontlicense.org) (SIL OFL 1.1).
- The Glassbox name and logo aren't covered by either licence. See the [terms](https://glassbox.how/terms/).

Found a mistake? [Open an issue](https://github.com/bdeeps/eclipseclear/issues). Corrections happen in public.
<!-- glassbox:end -->

## Run it

It's plain HTML, CSS and JavaScript. No build step and no dependencies. Run locally, it contacts no other website.

```bash
python3 -m http.server 8000
```

Three.js and the fonts ship in `vendor/` and `fonts/`, so it also works offline.

Then open http://localhost:8000.

## How it's built

| File | What |
|---|---|
| `index.html`, `css/app.css` | The page and its styles |
| `js/app.js`, `js/stage.js`, `js/ui.js`, `js/kit.js` | The shared Glassbox 3D engine: chapters, 3D stage, controls, quiz, video director |
| `js/chapters/*.js` | One file per chapter: the 3D model, controls, text, key terms, quiz and video scenes |
| `glassbox.json` | Title, question, explainer beats, key terms, browser storage and credits shown on glassbox.how |
| `reel` in each chapter | The storyboard the Glassbox studio records into short videos |
| `glassbox/` | The published video, slides, thumbnail and post copy |
| `fonts/`, `vendor/three/` | Self-hosted Geist and Instrument Serif (SIL OFL 1.1) and three.js (MIT) |
