const backToTop = document.querySelector(".back-to-top");
const internshipTabs = document.querySelectorAll(".internship-tab");
const internshipPanels = document.querySelectorAll("[data-panel]");
const circuitBoard = document.querySelector(".circuit-board");
const gameStatus = document.querySelector(".game-status");
const moveCount = document.querySelector(".move-count");
const resetGame = document.querySelector(".reset-game");
const directions = ["n", "e", "s", "w"];
const opposite = { n: "s", e: "w", s: "n", w: "e" };
const offsets = {
  n: [-1, 0],
  e: [0, 1],
  s: [1, 0],
  w: [0, -1],
};

const circuitTiles = [
  { type: "straight", rotation: 1, label: "PWR" },
  { type: "straight", rotation: 0 },
  { type: "corner", rotation: 3 },
  { type: "tee", rotation: 2 },
  { type: "corner", rotation: 1 },
  { type: "corner", rotation: 0 },
  { type: "straight", rotation: 0 },
  { type: "corner", rotation: 2 },
  { type: "tee", rotation: 1 },
  { type: "straight", rotation: 1 },
  { type: "corner", rotation: 0 },
  { type: "corner", rotation: 1 },
  { type: "corner", rotation: 3 },
  { type: "tee", rotation: 0 },
  { type: "straight", rotation: 0 },
  { type: "corner", rotation: 2, label: "OUT" },
];

const startingRotations = circuitTiles.map((tile) => tile.rotation);
let moves = 0;

const baseConnections = {
  straight: ["n", "s"],
  corner: ["n", "e"],
  tee: ["n", "e", "w"],
};

const setBackToTopVisibility = () => {
  if (backToTop) {
    backToTop.classList.toggle("is-visible", window.scrollY > 520);
  }
};

window.addEventListener("scroll", setBackToTopVisibility, { passive: true });

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

internshipTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selected = tab.dataset.internship;

    internshipTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    internshipPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === selected);
    });
  });
});

const rotateConnection = (connection, rotation) => {
  const index = directions.indexOf(connection);
  return directions[(index + rotation) % directions.length];
};

const getConnections = (tile) => {
  return baseConnections[tile.type].map((connection) => rotateConnection(connection, tile.rotation));
};

const drawTile = (tile, index, powered) => {
  const connections = getConnections(tile);
  const has = (direction) => connections.includes(direction);
  const stroke = powered ? "#14a36d" : "#126b5b";
  const glow = powered ? '<circle cx="50" cy="50" r="11" fill="#4bd7a8" opacity="0.22" />' : "";
  const paths = [
    has("n") ? `<path d="M50 50 V5" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />` : "",
    has("e") ? `<path d="M50 50 H95" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />` : "",
    has("s") ? `<path d="M50 50 V95" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />` : "",
    has("w") ? `<path d="M50 50 H5" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />` : "",
  ].join("");
  const label = tile.label ? `<span class="tile-label">${tile.label}</span>` : "";

  return `
<button
      class="circuit-tile${powered ? " is-powered" : ""}${index === 0 ? " is-source" : ""}${index === 15 ? " is-output" : ""}"
      type="button"
      data-tile="${index}"
      aria-label="Rotate circuit tile ${index + 1}"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        ${paths}
        <circle cx="50" cy="50" r="9" fill="${stroke}" />
        ${glow}
      </svg>
      ${label}
    </button>
  `;
};
const tracePower = () => {
  const powered = new Set([0]);
  const queue = [0];

  while (queue.length > 0) {
    const current = queue.shift();
    const row = Math.floor(current / 4);
    const col = current % 4;
    const connections = getConnections(circuitTiles[current]);

    connections.forEach((direction) => {
      const [rowOffset, colOffset] = offsets[direction];
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (nextRow < 0 || nextRow > 3 || nextCol < 0 || nextCol > 3) {
        return;
      }

      const nextIndex = nextRow * 4 + nextCol;
      const nextConnections = getConnections(circuitTiles[nextIndex]);

      if (nextConnections.includes(opposite[direction]) && !powered.has(nextIndex)) {
        powered.add(nextIndex);
        queue.push(nextIndex);
      }
    });
  }

return powered;
};

const renderCircuitGame = () => {
  const powered = tracePower();
  const isConnected = powered.has(15);

  circuitBoard.innerHTML = circuitTiles
    .map((tile, index) => drawTile(tile, index, powered.has(index)))
    .join("");

  gameStatus.textContent = isConnected ? "Connected" : "Not connected";
  gameStatus.classList.toggle("connected", isConnected);
  moveCount.textContent = moves;
};

if (circuitBoard) {
  circuitBoard.addEventListener("click", (event) => {
    const tile = event.target.closest(".circuit-tile");

    if (!tile) {
      return;
    }
  const index = Number(tile.dataset.tile);
    circuitTiles[index].rotation = (circuitTiles[index].rotation + 1) % 4;
    moves += 1;
    renderCircuitGame();
  });
}

if (resetGame) {
  resetGame.addEventListener("click", () => {
    circuitTiles.forEach((tile, index) => {
      tile.rotation = startingRotations[index];
    });

    moves = 0;
    renderCircuitGame();
  });
}

if (circuitBoard && gameStatus && moveCount) {
  renderCircuitGame();
}

setBackToTopVisibility();
