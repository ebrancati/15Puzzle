import Puzzle15 from "./Puzzle15.js";

document.documentElement.setAttribute("translate", "no");
document.body.setAttribute("translate", "no");

// Prevent text selection
document.getElementById("game-container").addEventListener("selectstart", (e) => e.preventDefault());

new Puzzle15("game-board", "restart-btn", "toggle-animation-btn", "time-counter", "move-counter");