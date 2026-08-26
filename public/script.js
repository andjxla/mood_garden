const moodColors = {
    great: "#268700",
    good: "#8fd694",
    okay: "#a8b5c4",
    bad: "#7d8ba1",
};
const petalColors = {
    great: "#e63946",
};

const leafShape = [
  [0,0,1,1,0,0],
  [0,1,1,1,1,0],
  [1,1,1,1,1,1],
  [1,1,1,1,1,1],
  [0,1,1,1,1,0],
  [0,0,1,1,0,0],
];

function pixelLeaf(x, y, color, pixelSize = 3) {
    let rects = "";
    leafShape.forEach((row, rowIndex) => {
        row.forEach((pixel,colIndex) => {
            if (pixel === 1) {
                const px = x+ colIndex * pixelSize;
                const py = y + rowIndex * pixelSize;
                rects += `<rect x="${px}" y="${py}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`; 
            }
        });
    });
    return rects;
}

const flowerShape = [
  [0,0,0,1,0,0,0],
  [0,1,1,1,1,1,0],
  [0,1,1,2,1,1,0],
  [1,1,2,2,2,1,1],
  [0,1,1,2,1,1,0],
  [0,1,1,1,1,1,0],
  [0,0,0,1,0,0,0],
];

function pixelFlower(x, y, petalColor, pixelSize = 3) {
  const centerColor = "#ffd23f"; // žuti centar, uvek ista boja
  let rects = "";
  flowerShape.forEach((row, rowIndex) => {
    row.forEach((pixel, colIndex) => {
      if (pixel === 0) return;
      const px = x + colIndex * pixelSize;
      const py = y + rowIndex * pixelSize;
      const fill = pixel === 2 ? centerColor : petalColor;
      rects += `<rect x="${px}" y="${py}" width="${pixelSize}" height="${pixelSize}" fill="${fill}" />`;
    });
  });
  return rects;
}

function renderPlant(streak, mood) {
    const garden = document.getElementById("garden");
    const color = moodColors[mood] || "#8fd694";
    const leafCount = Math.min(streak, 6);

    let leaves = "";
    for (let i = 0; i < leafCount; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const y = 180 - i * 22;
        const x = 100 + side * 18;
        leaves += `
        <g class="leaf" style="animation-delay:${i * 0.15}s">
        ${pixelLeaf(x - 9, y - 9, color)}
        </g>
        `;
    }

    const flowerY = 180 - leafCount * 22;
    const petalColor = petalColors[mood] || color;
    const flower = streak >= 5
    ? `<g class="flower">${pixelFlower(100 - 10, flowerY - 10, petalColor)}</g>`
    : "";

    garden.innerHTML = `
    <svg width="200" height="220" viewBox="0 0 200 229">
    <line x1="100" y1="220" x2="100" y2="60" stroke="#5b7c4f" stroke-width="4" />
    ${leaves}
    ${flower}
    </svg>
    `;

    document.getElementById("streak-text").textContent = `🔥 ${streak} day streak`;
}


renderPlant(window.initialStreak, window.initialMood);

document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", async() => {
        const mood = btn.dataset.mood;

        const response = await fetch("/entries", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `mood=${encodeURIComponent(mood)}`
        })
        const data = await response.json();
        console.log("Streak:", data.streak, "Mood:", data.last_mood)

        renderPlant(data.streak, data.last_mood);
    })
})