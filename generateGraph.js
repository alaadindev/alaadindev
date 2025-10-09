const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const git = simpleGit();

// CONFIG
const AUTHOR_NAME = "Your Name"; // Replace with your git author name
const OUTPUT_FILE = path.join(__dirname, "graph.svg");
const DAYS = 365;  // last year
const SQUARE_SIZE = 12;
const PADDING = 2;

(async () => {
    // Get commit history
    const log = await git.log({ "--author": AUTHOR_NAME, "--date": "short" });
    const commitCounts = {};
    log.all.forEach(commit => {
        const date = commit.date.split("T")[0]; // YYYY-MM-DD
        commitCounts[date] = (commitCounts[date] || 0) + 1;
    });

    // Prepare calendar data
    const today = new Date();
    const graphData = [];
    for (let i = DAYS - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const iso = day.toISOString().split("T")[0];
        graphData.push({ date: iso, count: commitCounts[iso] || 0 });
    }

    // Generate SVG
    const width = 53 * (SQUARE_SIZE + PADDING);
    const height = 7 * (SQUARE_SIZE + PADDING);
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;

    graphData.forEach((d, i) => {
        const week = Math.floor(i / 7);
        const weekday = i % 7;
        let color = "#ebedf0";
        if (d.count > 0 && d.count < 3) color = "#9be9a8";
        else if (d.count >= 3 && d.count < 6) color = "#40c463";
        else if (d.count >= 6) color = "#30a14e";

        const x = week * (SQUARE_SIZE + PADDING);
        const y = weekday * (SQUARE_SIZE + PADDING);
        svg += `<rect x="${x}" y="${y}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" fill="${color}">\n`;
        svg += `<title>${d.date}: ${d.count} commits</title>\n`;
        svg += `</rect>\n`;
    });

    svg += `</svg>`;
    fs.writeFileSync(OUTPUT_FILE, svg);
    console.log(`Custom graph saved as ${OUTPUT_FILE}`);
})();
