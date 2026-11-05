/* =========================================================
   FONT
========================================================= */

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');


/* =========================================================
   ROOT
========================================================= */

:root {
  --bg: #030604;
  --bg-soft: #060c07;

  --green: #9cff9c;
  --green-bright: #caffca;
  --green-mid: #70d879;
  --green-dark: #1d6328;

  --text: #dcebdd;
  --text-soft: #a5bca7;
  --text-muted: #708271;

  --border: rgba(120, 190, 125, 0.14);
  --border-bright: rgba(145, 255, 145, 0.32);

  --card: rgba(4, 10, 6, 0.72);
  --card-hover: rgba(7, 16, 9, 0.84);

  --mono: "IBM Plex Mono", monospace;

  --radius: 7px;
}


/* =========================================================
   RESET
========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;

  background:
    radial-gradient(
      circle at 50% -15%,
      rgba(65, 125, 68, 0.08),
      transparent 42%
    ),
    var(--bg);

  color: var(--text);

  font-family: var(--mono);

  font-size: 14px;

  line-height: 1.55;

  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button,
input,
textarea,
select {
  font: inherit;
}


/* =========================================================
   MATRIX BACKGROUND
========================================================= */

#matrixCanvas {
  position: fixed;

  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  pointer-events: none;

  z-index: 0;

  opacity: 0.72;

  mix-blend-mode: screen;
}

body::before {
  content: "";

  position: fixed;

  inset: 0;

  z-index: 0;

  pointer-events: none;

  background:
    radial-gradient(
      circle at center,
      transparent 0%,
      rgba(0, 5, 2, 0.08) 45%,
      rgba(0, 3, 1, 0.30) 100%
    );
}

body::after {
  content: "";

  position: fixed;

  inset: 0;

  z-index: 0;

  pointer-events: none;

  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(55, 180, 65, 0.055),
      transparent 55%
    );

  opacity: 0.9;
}

.site-header,
.bento-grid,
.social-card,
footer {
  position: relative;

  z-index: 1;
}


/* =========================================================
   HEADER
========================================================= */

.site-header {
  width: min(
    calc(100% - 40px),
    1280px
  );

  margin: 0 auto;

  padding: 22px 0 18px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  position: relative;

  z-index: 10;
}

.brand {
  display: inline-flex;

  align-items: center;

  gap: 8px;

  color: var(--green-bright);

  font-size: 14px;

  font-weight: 500;

  letter-spacing: -0.025em;
}

.brand-dot {
  font-size: 9px;

  color: var(--green);

  text-shadow:
    0 0 7px rgba(130, 255, 130, 0.65);
}

.main-nav {
  display: flex;

  align-items: center;

  gap: 24px;
}

.main-nav a {
  position: relative;

  color: var(--text-muted);

  font-size: 12px;

  transition:
    color 160ms ease,
    opacity 160ms ease;
}

.main-nav a:hover,
.main-nav a.active {
  color: var(--green);
}

.main-nav a.active::after {
  content: "";

  position: absolute;

  left: 0;
  right: 0;

  bottom: -6px;

  height: 1px;

  background: var(--green);

  box-shadow:
    0 0 7px rgba(150, 255, 150, 0.4);
}


/* =========================================================
   BENTO GRID
========================================================= */

.bento-grid {
  width: min(
    calc(100% - 40px),
    1280px
  );

  margin: 0 auto;

  display: grid;

  grid-template-columns:
    repeat(12, minmax(0, 1fr));

  grid-template-areas:
    "whoami whoami whoami whoami data data data data spotify spotify spotify spotify"
    "likes likes likes likes toolkit toolkit toolkit toolkit posts posts posts posts"
    "journey journey journey journey journey journey journey journey certs certs certs certs"
    "journey journey journey journey journey journey journey journey projects projects projects projects"
    "github github github github github github github github coffee coffee visitors visitors";

  gap: 10px;

  padding-bottom: 10px;

  grid-template-rows:
    auto
    auto
    auto
    auto
    auto;

  align-items: stretch;
}


/* =========================================================
   CARD BASE
========================================================= */

.card,
.social-card,
.coffee-card {
  position: relative;

  min-width: 0;

  overflow: hidden;

  border: 1px solid var(--border);

  border-radius: var(--radius);

  background:
    linear-gradient(
      145deg,
      rgba(8, 18, 10, 0.74),
      rgba(2, 7, 4, 0.76)
    );

  box-shadow:
    inset 0 1px 0 rgba(180, 255, 180, 0.018),
    0 8px 30px rgba(0, 0, 0, 0.12);

  transition:
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.card:hover,
.social-card:hover,
.coffee-card:hover {
  border-color: var(--border-bright);

  background:
    linear-gradient(
      145deg,
      rgba(10, 21, 12, 0.8),
      rgba(3, 9, 5, 0.82)
    );

  box-shadow:
    inset 0 1px 0 rgba(180, 255, 180, 0.025),
    0 10px 34px rgba(0, 0, 0, 0.16);
}


/* =========================================================
   CARD HEADING
========================================================= */

.card-heading {
  min-height: 42px;

  padding:
    11px
    14px
    9px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-bottom: 1px solid
    rgba(110, 190, 116, 0.08);

  color: var(--text-muted);

  font-size: 12px;

  line-height: 1.3;

  letter-spacing: 0.035em;

  text-transform: lowercase;
}

.card-heading a {
  color: var(--green-mid);

  transition: color 160ms ease;
}

.card-heading a:hover {
  color: var(--green-bright);
}


/* =========================================================
   GRID POSITIONS
========================================================= */

.whoami-card {
  grid-area: whoami;
}

.data-card {
  grid-area: data;
}

.spotify-card {
  grid-area: spotify;
}

.likes-card {
  grid-area: likes;
}

.toolkit-card {
  grid-area: toolkit;
}

.posts-card {
  grid-area: posts;
}

.journey-card {
  grid-area: journey;
}

.certifications-card {
  grid-area: certs;
}

.projects-card {
  grid-area: projects;
}

.github-card {
  grid-area: github;
}

.coffee-card {
  grid-area: coffee;
}

.visitors-card {
  grid-area: visitors;
}


/* =========================================================
   WHOAMI
========================================================= */

.whoami-body {
  min-height: 250px;

  height: auto;

  padding: 18px;

  display: grid;

  grid-template-columns:
    125px minmax(0, 1fr);

  gap: 20px;

  align-items: center;
}

.profile-area {
  min-width: 0;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 9px;
}


/* =========================================================
   PROFILE IMAGE
========================================================= */

.profile-image {
  width: 112px;
  height: 112px;

  position: relative;

  overflow: hidden;

  flex-shrink: 0;

  border-radius: 50%;

  border: 2px solid
    rgba(105, 255, 120, 0.72);

  background:
    linear-gradient(
      135deg,
      #102013,
      #050a06
    );

  box-shadow:
    0 0 0 3px rgba(80, 210, 90, 0.07),
    0 0 18px rgba(65, 225, 85, 0.18),
    0 0 42px rgba(50, 180, 65, 0.08);

  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.profile-image:hover {
  border-color: var(--green-bright);

  box-shadow:
    0 0 0 3px rgba(80, 210, 90, 0.09),
    0 0 22px rgba(90, 255, 110, 0.26),
    0 0 48px rgba(50, 180, 65, 0.11);

  transform: translateY(-1px);
}

.profile-image img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  border-radius: 50%;
}

.image-fallback {
  position: absolute;

  inset: 0;

  display: none;

  align-items: center;

  justify-content: center;

  color: var(--green);

  font-size: 42px;
}

.profile-terminal {
  color: var(--text-muted);

  font-size: 10px;

  white-space: nowrap;
}


/* =========================================================
   WHOAMI TEXT
========================================================= */

.whoami-text {
  min-width: 0;

  max-width: 100%;

  padding-right: 2px;
}

.whoami-text p {
  margin:
    0
    0
    13px;

  color: var(--text-soft);

  font-size: 14px;

  line-height: 1.7;
}

.whoami-text .hello {
  margin-bottom: 6px;

  color: var(--green);

  font-size: 16px;
}

.whoami-text strong {
  color: var(--text);

  font-weight: 500;
}

.identity-row {
  margin-top: 15px;

  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;
}

.identity-row div {
  min-width: 0;

  min-height: 48px;

  padding: 8px;

  display: flex;

  flex-direction: column;

  justify-content: center;

  gap: 4px;

  border: 1px solid
    rgba(110, 190, 116, 0.1);

  border-radius: 5px;

  background:
    rgba(50, 120, 55, 0.025);
}

.identity-row small {
  color: var(--text-muted);

  font-size: 9px;

  text-transform: uppercase;

  letter-spacing: 0.07em;
}

.identity-row span {
  overflow: hidden;

  color: var(--green);

  font-size: 11px;

  white-space: nowrap;

  text-overflow: ellipsis;
}


/* =========================================================
   DATA
========================================================= */

.data-body {
  height: auto;

  min-height: 250px;

  padding: 18px;

  display: flex;

  flex-direction: column;

  justify-content: center;
}

.big-line {
  margin: 3px 0 14px;

  color: var(--green-bright);

  font-size: clamp(
    27px,
    2.5vw,
    36px
  );

  line-height: 1.05;

  letter-spacing: -0.065em;
}

.muted {
  color: var(--text-muted);

  font-size: 12px;

  line-height: 1.65;
}

.skill-mini-row {
  margin-top: 17px;

  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 6px;
}

.skill-mini-row span,
.likes-list span,
.toolkit-list span {
  min-width: 0;

  padding:
    8px
    8px;

  border: 1px solid
    rgba(110, 190, 116, 0.11);

  border-radius: 5px;

  color: var(--text-soft);

  background:
    rgba(50, 120, 55, 0.025);

  font-size: 11px;

  line-height: 1.35;

  text-align: center;
}


/* =========================================================
   SPOTIFY
========================================================= */

.spotify-body {
  height: auto;

  min-height: 250px;

  padding: 15px;

  display: flex;

  flex-direction: column;

  justify-content: center;
}

.spotify-body > .muted {
  margin:
    0
    0
    5px;
}

.song {
  min-height: 45px;

  padding: 6px 2px;

  display: grid;

  grid-template-columns:
    24px minmax(0, 1fr) 16px;

  align-items: center;

  gap: 7px;

  border-bottom: 1px solid
    rgba(110, 190, 116, 0.07);

  transition:
    padding 160ms ease,
    color 160ms ease;
}

.song:last-child {
  border-bottom: 0;
}

.song:hover {
  padding-left: 7px;

  color: var(--green);
}

.song-number {
  color: var(--text-muted);

  font-size: 10px;
}

.song-info {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;
}

.song-info strong {
  overflow: hidden;

  color: var(--text-soft);

  font-size: 11px;

  font-weight: 400;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.song-info small {
  color: var(--text-muted);

  font-size: 10px;
}


/* =========================================================
   LIKES
========================================================= */

.likes-card {
  display: flex;
  flex-direction: column;
}

.likes-card > .muted {
  margin: 0;
  padding: 13px 15px 2px;
  color: var(--green);
}

.likes-list {
  padding: 10px 14px 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  flex: 1;
  align-content: center;
}

.likes-list span {
  min-height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* =========================================================
   PLAY MY GAME — LIKES CARD
========================================================= */

.xp-game-link {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(57, 255, 102, 0.2);
  border-radius: 12px;
  background: rgba(0, 255, 65, 0.035);
  color: inherit;
  text-decoration: none;
  transition: all 0.25s ease;
}

.xp-game-link:hover {
  border-color: rgba(57, 255, 102, 0.65);
  background: rgba(0, 255, 65, 0.08);
  transform: translateY(-3px);
  box-shadow: 0 0 18px rgba(0, 255, 65, 0.08);
}

.xp-game-top,
.xp-game-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: inherit;
  font-size: 0.68rem;
  letter-spacing: 1px;
}

.xp-game-top {
  color: #7caa86;
}

.xp-game-content {
  display: flex;
  align-items: center;
  gap: 13px;
}

.xp-game-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 7px rgba(57, 255, 102, 0.3));
}

.xp-game-content strong {
  display: block;
  color: var(--green);
  font-size: 0.95rem;
  font-weight: 600;
}

.xp-game-content p {
  margin: 5px 0 0;
  color: #9aab9e;
  font-size: 0.72rem;
  line-height: 1.5;
}

.xp-game-bottom {
  padding: 9px 12px;
  border: 1px solid var(--border-bright);
  border-radius: 5px;
  background: rgba(80, 200, 90, 0.07);
  color: var(--green-bright);
  font-weight: 600;
  justify-content: center;
  gap: 8px;
}

.xp-game-link:hover .xp-game-bottom {
  background: rgba(80, 200, 90, 0.15);
  border-color: var(--green);
  box-shadow: 0 0 12px rgba(120, 255, 130, 0.12);
}

.xp-game-link:hover .xp-game-bottom span:last-child {
  transform: translateX(4px);
}

.xp-game-bottom span:last-child {
  transition: transform 0.2s ease;
}
/* =========================================================
   TOOLKIT
========================================================= */

.toolkit-card {
  display: flex;

  flex-direction: column;
}

.toolkit-list {
  flex: 1;

  padding: 12px;

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  grid-auto-rows: minmax(36px, 1fr);

  gap: 6px;

  align-content: stretch;
}

.toolkit-list span {
  min-height: 36px;

  padding: 7px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: 1px solid
    rgba(110, 190, 116, 0.12);

  border-radius: 5px;

  background:
    linear-gradient(
      145deg,
      rgba(50, 120, 55, 0.045),
      rgba(20, 60, 25, 0.018)
    );

  color: var(--text-soft);

  font-size: 11px;

  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.toolkit-list span:hover {
  color: var(--green-bright);

  border-color:
    rgba(145, 255, 145, 0.3);

  background:
    rgba(70, 150, 75, 0.07);

  transform: translateY(-1px);
}


/* =========================================================
   JOURNEY
========================================================= */

.journey-card {
  display: flex;

  flex-direction: column;
}

.journey-item {
  flex: 1;

  min-height: 0;

  padding:
    11px
    15px;

  display: flex;

  flex-direction: column;

  justify-content: center;

  border-bottom: 1px solid
    rgba(110, 190, 116, 0.07);
}

.journey-item:last-child {
  border-bottom: 0;
}

.journey-top {
  display: flex;

  align-items: baseline;

  justify-content: space-between;

  gap: 10px;
}

.journey-top strong {
  color: var(--text);

  font-size: 12px;

  font-weight: 500;
}

.journey-top small {
  color: var(--text-muted);

  font-size: 9px;

  white-space: nowrap;
}

.journey-item > a {
  display: inline-block;

  margin-top: 5px;

  color: var(--green-mid);

  font-size: 10px;
}

.journey-item > a:hover {
  color: var(--green);
}

.journey-item p {
  margin:
    5px
    0
    0;

  color: var(--text-muted);

  font-size: 11px;

  line-height: 1.6;
}


/* =========================================================
   PROJECTS
========================================================= */

.projects-card {
  display: flex;

  flex-direction: column;
}

.project-row {
  flex: 1;

  min-height: 47px;

  padding:
    9px
    14px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  border-bottom: 1px solid
    rgba(110, 190, 116, 0.07);

  transition:
    padding 160ms ease,
    background 160ms ease;
}

.project-row:last-child {
  border-bottom: 0;
}

.project-row:hover {
  padding-left: 18px;

  background:
    rgba(80, 150, 80, 0.035);
}

.project-row > span:first-child {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;
}

.project-row strong {
  overflow: hidden;

  color: var(--text);

  font-size: 11px;

  font-weight: 400;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.project-row small {
  color: var(--text-muted);

  font-size: 9px;
}


/* =========================================================
   SUBSTACK / RECENT POSTS
========================================================= */

.posts-card {
  display: flex;
  flex-direction: column;
}

.post-row {
  flex: 1;
  min-height: 44px;
  padding: 8px 14px;

  display: flex;
  align-items: center;
  gap: 14px;

  text-decoration: none;

  border-bottom: 1px solid
    rgba(110, 190, 116, 0.07);

  transition:
    background 160ms ease,
    padding 160ms ease;
}

.post-row:last-child {
  border-bottom: 0;
}

.post-row span {
  min-width: 24px;
  color: var(--text-muted);
  font-size: 9px;
}

.post-row strong {
  flex: 1;
  min-width: 0;

  color: var(--text-soft);
  font-size: 13px;
  font-weight: 400;

  transition: color 160ms ease;
}

.post-row .post-arrow {
  min-width: auto;
  color: var(--text-muted);
  font-size: 11px;

  opacity: 0;
  transform: translate(-4px, 4px);

  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.post-row:hover {
  background: rgba(110, 190, 116, 0.035);
  padding-left: 18px;
}

.post-row:hover strong {
  color: var(--green);
}

.post-row:hover .post-arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.post-row:focus-visible {
  outline: 1px solid var(--green);
  outline-offset: -2px;
}

/* =========================================================
   CERTIFICATIONS
========================================================= */

.certifications-card {
  display: flex;

  flex-direction: column;
}

.cert-list {
  flex: 1;

  padding: 12px;

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  grid-auto-rows: minmax(36px, 1fr);

  gap: 6px;

  align-content: stretch;
}

.cert-list span {
  min-height: 36px;

  padding:
    7px
    9px;

  display: flex;

  align-items: center;

  justify-content: center;

  text-align: center;

  border: 1px solid
    rgba(110, 190, 116, 0.12);

  border-radius: 5px;

  border-left:
    1px solid
    rgba(110, 190, 116, 0.23);

  color: var(--text-soft);

  background:
    linear-gradient(
      145deg,
      rgba(50, 120, 55, 0.04),
      rgba(20, 60, 25, 0.018)
    );

  font-size: 10px;

  line-height: 1.4;

  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.cert-list span:hover {
  color: var(--green-bright);

  border-color:
    rgba(145, 255, 145, 0.3);

  background:
    rgba(70, 150, 75, 0.065);

  transform: translateY(-1px);
}


/* =========================================================
   GITHUB
========================================================= */

/* =========================================================
   GITHUB ACTIVITY
========================================================= */

.github-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.github-terminal {
  margin: 11px 14px 6px;
  padding: 7px 10px;

  display: flex;
  align-items: center;
  gap: 8px;

  border: 1px solid
    rgba(110, 190, 116, 0.09);

  border-radius: 4px;

  background: rgba(0, 0, 0, 0.16);

  color: var(--text-muted);
  font-size: 10px;
}

.github-terminal > span:first-child {
  color: var(--green);
}

#github-status {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* SUMMARY */

.github-summary {
  margin: 0;
  padding: 0 14px;

  color: var(--text-muted);

  font-size: 10px;
  line-height: 1.6;
}

/* ACTIVITY LIST */

.github-activity-list {
  flex: 1;
  min-height: 0;

  padding: 4px 14px 6px;
}

.github-event {
  padding: 8px 0;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  border-bottom: 1px solid
    rgba(110, 190, 116, 0.06);

  color: var(--text-soft);

  font-size: 10px;
  line-height: 1.5;

  transition:
    color 160ms ease,
    background 160ms ease;
}

.github-event:last-child {
  border-bottom: 0;
}

.github-event > span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.github-event small {
  flex-shrink: 0;

  color: var(--text-muted);
  font-size: 9px;
  white-space: nowrap;
}

/* EVENT LINKS */

.github-event a {
  color: var(--text-soft);
  text-decoration: none;

  transition: color 160ms ease;
}

.github-event a:hover {
  color: var(--green);
}

/* CONTROLS */

.github-controls {
  margin-top: auto;

  padding: 6px 14px 10px;

  display: flex;
  gap: 6px;
}

.github-controls button {
  padding: 5px 10px;

  border: 1px solid
    rgba(110, 190, 116, 0.13);

  border-radius: 4px;

  background: transparent;

  color: var(--text-muted);

  font-family: inherit;
  font-size: 9px;

  cursor: pointer;

  transition:
    border-color 160ms ease,
    color 160ms ease,
    background 160ms ease;
}

.github-controls button:hover:not(:disabled) {
  border-color:
    rgba(145, 255, 145, 0.3);

  background: rgba(110, 190, 116, 0.04);

  color: var(--green);
}

.github-controls button:disabled {
  cursor: default;
  opacity: 0.25;
}

/* LOADING / ERROR STATES */

.github-loading,
.github-error,
.github-empty {
  padding: 12px 0;

  color: var(--text-muted);

  font-size: 10px;
  line-height: 1.6;
}

.github-error {
  color: #d98b8b;
}

/* RESPONSIVE */

@media (max-width: 480px) {

  .github-event {
    gap: 8px;
    font-size: 9px;
  }

  .github-event small {
    font-size: 8px;
  }

  .github-terminal {
    margin-left: 10px;
    margin-right: 10px;
  }

  .github-summary {
    padding-left: 10px;
    padding-right: 10px;
  }

  .github-activity-list {
    padding-left: 10px;
    padding-right: 10px;
  }

  .github-controls {
    padding-left: 10px;
    padding-right: 10px;
  }

}
/* =========================================================
   VISITORS
========================================================= */

.visitors-card {
  display: flex;

  flex-direction: column;
}

.visitor-number {
  padding:
    12px
    14px
    6px;

  display: flex;

  align-items: baseline;

  gap: 7px;
}

.visitor-number > span {
  color: var(--green-bright);

  font-size: 28px;

  line-height: 1;

  letter-spacing: -0.06em;
}

.visitor-number small {
  color: var(--text-muted);

  font-size: 9px;
}

.live {
  color: var(--green);

  font-size: 9px;
}

.visitor-map {
  flex: 1;

  min-height: 80px;

  margin:
    6px
    14px
    8px;

  position: relative;

  overflow: hidden;

  border: 1px solid
    rgba(110, 190, 116, 0.09);

  background:
    rgba(20, 60, 25, 0.035);
}

.map-grid {
  position: absolute;

  inset: 0;

  opacity: 0.28;

  background-image:
    linear-gradient(
      rgba(110, 190, 116, 0.08)
      1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(110, 190, 116, 0.08)
      1px,
      transparent 1px
    );

  background-size:
    16px 16px;
}

.map-dot {
  width: 4px;
  height: 4px;

  position: absolute;

  border-radius: 50%;

  background: var(--green);

  box-shadow:
    0 0 9px
    rgba(140, 255, 140, 0.65);

  animation:
    pulse-dot 2s infinite;
}

.d1 {
  left: 24%;
  top: 37%;
}

.d2 {
  left: 45%;
  top: 55%;

  animation-delay: 0.4s;
}

.d3 {
  left: 63%;
  top: 32%;

  animation-delay: 0.8s;
}

.d4 {
  left: 72%;
  top: 65%;

  animation-delay: 1.2s;
}

.d5 {
  left: 35%;
  top: 73%;

  animation-delay: 1.6s;
}

.map-label {
  position: absolute;

  right: 7px;
  bottom: 6px;

  color: var(--text-muted);

  font-size: 8px;

  letter-spacing: 0.1em;
}

.visitor-info {
  display: block;

  padding:
    0
    14px
    11px;

  color: var(--text-muted);

  font-size: 9px;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 0.4;

    transform: scale(0.8);
  }

  50% {
    opacity: 1;

    transform: scale(1.5);
  }
}


/* =========================================================
   BUY ME A COFFEE
========================================================= */

.coffee-card {
  padding: 13px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.coffee-card > .card-heading {
  margin: -13px -13px 13px;
  min-height: 42px;
  padding: 11px 14px 9px;
}

.coffee-eyebrow {
  display: block;
  margin-bottom: 7px;
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.coffee-card h3 {
  margin: 0 9px 0;
  color: var(--green-bright);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.04em;
}

.coffee-content {
  width: calc(100% + 12px);
  min-height: 80px;
  padding: 9px 12px;
  margin-left: -6px;

  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;

  border: 1px solid rgba(145, 255, 145, 0.15);
  border-radius: 6px;
  background: rgba(70, 150, 75, 0.035);

  text-decoration: none;

  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.coffee-content:hover {
  border-color: rgba(145, 255, 145, 0.36);
  background: rgba(70, 150, 75, 0.07);
  transform: translateY(-1px);
}

.coffee-icon {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(0, 255, 102, 0.25);
  border-radius: 5px;
  background: rgba(0, 255, 102, 0.06);

  color: #00ff66;
  font-family: 'Share Tech Mono', monospace;
  font-size: 19px;
  font-weight: bold;

  transition: all 160ms ease;
}

.coffee-content:hover .coffee-icon {
  border-color: rgba(0, 255, 102, 0.55);
  background: rgba(0, 255, 102, 0.12);
  transform: scale(1.08);
}

.coffee-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.coffee-text strong {
  overflow: hidden;
  color: var(--text);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.coffee-text span {
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.4;
}

.coffee-arrow {
  color: var(--green);
  font-size: 14px;
  text-align: right;
  transition: transform 160ms ease;
}

.coffee-content:hover .coffee-arrow {
  transform: translate(2px, -2px);
}
/* =========================================================
   FIND ME ELSEWHERE
========================================================= */

.social-card {
  width: min(
    calc(100% - 40px),
    1280px
  );

  margin:
    0
    auto
    10px;
}

.social-content {
  padding:
    15px
    18px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 24px;
}

.social-text {
  min-width: 0;

  max-width: 650px;

  margin: 0;

  color: var(--text-muted);

  font-size: 12px;

  line-height: 1.7;
}

.social-links {
  display: flex;

  align-items: center;

  gap: 6px;

  flex-shrink: 0;
}

.social-links a {
  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: 1px solid
    rgba(110, 190, 116, 0.13);

  border-radius: 5px;

  background:
    rgba(50, 120, 55, 0.025);

  color: var(--text-muted);

  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.social-links a:hover {
  color: var(--green-bright);

  border-color:
    rgba(145, 255, 145, 0.3);

  background:
    rgba(70, 150, 75, 0.065);

  transform:
    translateY(-1px);
}

.social-links svg {
  width: 15px;
  height: 15px;

  display: block;

  fill: currentColor;
}


/* =========================================================
   LETTERBOXD
========================================================= */

.social-links .letterboxd-logo {
  width: 17px;
  height: 17px;

  display: block;

  overflow: visible;

  color: var(--text-muted);

  filter: none;

  transition:
    color 180ms ease,
    transform 180ms ease;
}

.social-links a:hover .letterboxd-logo {
  color: var(--green);

  filter: none;

  transform: translateY(-1px);
}

.social-links .letterboxd-logo circle {
  fill: currentColor;

  stroke: none;
}

.social-links .letterboxd-logo path,
.social-links .letterboxd-logo rect {
  fill: currentColor;

  stroke: none;
}


/* =========================================================
   FOOTER
========================================================= */

footer {
  width: min(
    calc(100% - 40px),
    1280px
  );

  margin:
    0
    auto;

  padding:
    12px
    0
    22px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  color: var(--text-muted);

  font-size: 9px;
}

footer span {
  white-space: nowrap;
}


/* =========================================================
   SELECTION
========================================================= */

::selection {
  color: #021004;

  background: var(--green);
}


/* =========================================================
   SCROLLBAR
========================================================= */

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #020402;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;

  background:
    rgba(100, 180, 105, 0.22);
}

::-webkit-scrollbar-thumb:hover {
  background:
    rgba(120, 220, 125, 0.38);
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1050px) {

  .site-header {
    width: min(
      calc(100% - 32px),
      1000px
    );
  }

  .bento-grid {
    width: min(
      calc(100% - 32px),
      1000px
    );

    grid-template-columns:
      repeat(6, minmax(0, 1fr));

    grid-template-rows: auto;

    grid-template-areas:
      "whoami whoami whoami data data data"
      "whoami whoami whoami data data data"
      "spotify spotify likes likes toolkit toolkit"
      "posts posts posts posts posts posts"
      "journey journey journey certs certs certs"
      "journey journey journey projects projects projects"
      "github github github github github github"
      "coffee coffee coffee visitors visitors visitors";
  }

  .whoami-body {
    min-height: 250px;

    grid-template-columns:
      120px minmax(0, 1fr);

    gap: 18px;

    padding: 17px;
  }

  .profile-image {
    width: 104px;
    height: 104px;
  }

  .whoami-text p {
    font-size: 13px;
  }

  .data-body,
  .spotify-body {
    min-height: 250px;
  }

  .social-card {
    width: min(
      calc(100% - 32px),
      1000px
    );
  }

  footer {
    width: min(
      calc(100% - 32px),
      1000px
    );
  }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 720px) {

  body {
    font-size: 13px;
  }

  #matrixCanvas {
    opacity: 0.58;
  }

  .site-header {
    width: min(
      calc(100% - 26px),
      1380px
    );

    padding:
      18px
      0
      15px;
  }

  .brand {
    font-size: 13px;
  }

  .main-nav {
    gap: 14px;
  }

  .main-nav a {
    font-size: 10px;
  }

  .bento-grid {
    width: min(
      calc(100% - 26px),
      1380px
    );

    display: grid;

    grid-template-columns: 1fr;

    grid-template-rows: auto;

    grid-template-areas:
      "whoami"
      "data"
      "spotify"
      "likes"
      "toolkit"
      "posts"
      "journey"
      "certs"
      "projects"
      "github"
      "coffee"
      "visitors";

    gap: 8px;
  }

  .card,
  .whoami-card,
  .data-card,
  .spotify-card,
  .likes-card,
  .toolkit-card,
  .journey-card,
  .projects-card,
  .posts-card,
  .certifications-card,
  .github-card,
  .visitors-card,
  .coffee-card {
    grid-column: auto;
    grid-row: auto;
  }

  .whoami-body {
    height: auto;

    min-height: 0;

    padding: 19px;

    grid-template-columns: 1fr;

    gap: 17px;

    text-align: center;
  }

  .profile-area {
    gap: 8px;
  }

  .profile-image {
    width: 112px;
    height: 112px;
  }

  .whoami-text {
    max-width: none;

    padding-right: 0;
  }

  .whoami-text p {
    font-size: 12px;
  }

  .identity-row {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    gap: 6px;
  }

  .identity-row div {
    min-height: 48px;
  }

  .data-body {
    height: auto;

    min-height: 220px;

    padding: 18px;
  }

  .spotify-body {
    height: auto;

    min-height: 220px;

    padding: 15px;
  }

  .big-line {
    font-size: 28px;
  }

  .muted {
    font-size: 11px;
  }

  .likes-list {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .toolkit-list {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    grid-auto-rows: 40px;

    min-height: 200px;
  }

  .cert-list {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    grid-auto-rows: 40px;

    min-height: 180px;
  }

  .journey-item {
    min-height: 115px;
  }

  .journey-item p {
    font-size: 11px;
  }

  .project-row,
  .post-row {
    min-height: 51px;
  }

  .github-card {
    min-height: 250px;
  }

  .visitors-card {
    min-height: 250px;
  }

  .social-card {
    width: min(
      calc(100% - 26px),
      1380px
    );
  }

  .social-content {
    padding: 15px;

    flex-direction: column;

    align-items: flex-start;

    gap: 14px;
  }

  .social-text {
    font-size: 11px;
  }

  .social-links {
    width: 100%;

    flex-wrap: wrap;
  }

  .social-links a {
    width: 34px;
    height: 34px;
  }

  .coffee-card {
    padding: 14px;
  }

  .coffee-card > .card-heading {
    margin:
      -14px
      -14px
      14px;
  }

  footer {
    width: min(
      calc(100% - 26px),
      1380px
    );

    flex-direction: column;

    align-items: flex-start;

    gap: 6px;
  }
}


/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 430px) {

  .site-header {
    align-items: flex-start;
  }

  .main-nav {
    gap: 9px;
  }

  .main-nav a:nth-child(3),
  .main-nav a:nth-child(4) {
    display: none;
  }

  .card-heading {
    min-height: 40px;

    padding:
      11px
      13px
      9px;
  }

  .whoami-body {
    padding: 17px;
  }

  .profile-image {
    width: 105px;
    height: 105px;
  }

  .data-body,
  .spotify-body {
    padding: 15px;
  }

  .big-line {
    font-size: 26px;
  }

  .post-row {
    flex-direction: column;

    align-items: flex-start;

    gap: 4px;
  }

  .post-row span {
    min-width: 0;
  }

  .journey-top {
    flex-direction: column;

    gap: 4px;
  }

  .identity-row {
    grid-template-columns: 1fr;
  }

  .toolkit-list,
  .cert-list {
    grid-template-columns: 1fr;
  }

  .toolkit-list {
    grid-auto-rows: 40px;
  }

  .cert-list {
    grid-auto-rows: auto;
  }

  .cert-list span {
    min-height: 42px;
  }

  .coffee-content {
    grid-template-columns:
      30px minmax(0, 1fr) 16px;

    gap: 8px;
  }
}


/* =========================================================
   ACCESSIBILITY / REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  html {
    scroll-behavior: auto;
  }

  *,
  *::before {
    animation-duration: 0.01ms !important;

    animation-iteration-count: 1 !important;

    transition-duration: 0.01ms !important;
  }
}


/* =========================================================
   LITTLE HEART UNDER PROFILE
========================================================= */

.profile-area {
  position: relative;
}

.heart-trigger {
  position: relative;

  display: flex;

  align-items: center;

  justify-content: center;

  width: 30px;
  height: 30px;

  margin: 8px auto 0;

  padding: 0;

  border: 0;

  background: transparent;

  color: rgba(120, 255, 135, 0.55);

  cursor: pointer;

  transition:
    transform 0.25s ease,
    color 0.25s ease,
    filter 0.25s ease;
}

.heart-trigger:hover {
  color: rgba(160, 255, 170, 0.95);

  transform:
    translateY(-2px)
    scale(1.12);

  filter:
    drop-shadow(
      0 0 8px
      rgba(80, 255, 100, 0.5)
    );
}

.heart-trigger:active {
  transform:
    translateY(0)
    scale(0.92);
}

.heart-symbol {
  display: block;

  font-size: 19px;

  line-height: 1;

  text-shadow:
    0 0 6px
    rgba(80, 255, 100, 0.25);
}


/* =========================================================
   LETTER OVERLAY
========================================================= */

.heart-letter {
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 24px;

  background:
    rgba(0, 5, 2, 0.72);

  backdrop-filter:
    blur(8px);

  -webkit-backdrop-filter:
    blur(8px);

  opacity: 0;

  visibility: hidden;

  pointer-events: none;

  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.heart-letter.open {
  opacity: 1;

  visibility: visible;

  pointer-events: auto;
}


/* =========================================================
   LETTER PAPER
========================================================= */

.letter-paper {
  position: relative;

  width: min(
    440px,
    calc(100vw - 48px)
  );

  padding:
    38px
    34px
    34px;

  background:
    rgba(8, 20, 11, 0.97);

  border:
    1px solid
    rgba(105, 255, 125, 0.34);

  box-shadow:
    0 0 0 1px
      rgba(40, 255, 70, 0.05),
    0 25px 80px
      rgba(0, 0, 0, 0.65),
    0 0 40px
      rgba(45, 255, 80, 0.08);

  color:
    rgba(220, 255, 224, 0.88);

  font-family:
    var(--mono);

  line-height: 1.75;

  transform:
    translateY(20px)
    scale(0.94)
    rotate(-1deg);

  opacity: 0;

  transition:
    transform 0.4s
      cubic-bezier(.2,.8,.2,1),
    opacity 0.3s ease;
}

.heart-letter.open .letter-paper {
  transform:
    translateY(0)
    scale(1)
    rotate(0);

  opacity: 1;
}


/* =========================================================
   LETTER TOP DECORATION
========================================================= */

.letter-line {
  margin-bottom: 24px;

  color:
    rgba(100, 255, 120, 0.25);

  letter-spacing: 4px;

  font-size: 11px;
}

.letter-greeting {
  margin-top: 0;

  color:
    rgba(150, 255, 160, 0.95);

  font-size: 18px;
}


/* =========================================================
   LETTER TEXT
========================================================= */

.letter-paper p {
  margin:
    0
    0
    17px;

  font-size: 14px;
}

.letter-paper p:not(.letter-greeting) {
  color:
    rgba(210, 235, 214, 0.72);
}

.letter-signoff {
  margin-top: 28px !important;

  text-align: right;

  color:
    rgba(130, 255, 145, 0.9) !important;
}


/* =========================================================
   CLOSE BUTTON
========================================================= */

.letter-close {
  position: absolute;

  top: 12px;
  right: 15px;

  width: 30px;
  height: 30px;

  padding: 0;

  border: 0;

  background: transparent;

  color:
    rgba(180, 220, 185, 0.45);

  font-family:
    inherit;

  font-size: 23px;

  line-height: 1;

  cursor: pointer;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.letter-close:hover {
  color:
    rgba(190, 255, 195, 0.95);

  transform:
    rotate(90deg);
}


/* =========================================================
   BODY WHEN LETTER IS OPEN
========================================================= */

body.letter-open {
  overflow: hidden;
}


/* =========================================================
   HEART PULSE
========================================================= */

.heart-trigger[aria-expanded="true"] {
  color:
    rgba(145, 255, 155, 0.95);

  animation:
    heartPulse 1.4s ease-in-out infinite;
}

@keyframes heartPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.12);
  }

}


/* =========================================================
   HEART / LETTER MOBILE
========================================================= */

@media (max-width: 600px) {

  .heart-letter {
    padding: 16px;
  }

  .letter-paper {
    width:
      calc(100vw - 32px);

    padding:
      32px
      24px
      26px;
  }

  .letter-paper p {
    font-size: 13px;
  }

}
