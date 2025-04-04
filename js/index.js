"use strict";

function startGame() {
    const board = document.getElementById("game-board");
    const restartButton = document.getElementById("restart-btn");
    const toggleAnimationButton = document.getElementById("toggle-animation-btn");
    const timeCounter = document.getElementById("time-counter");
    const moveCounter = document.getElementById("move-counter");
    const size = 4;

    let hasAnimated = false;
    let boardArray = generateShuffledBoard(size);
    let isMoving = false;
    let animationEnabled = true;
    let startTime = null;
    let moveCount = 0;
    let timerInterval = null;
    let gameWon = false;

    function generateShuffledBoard(size) {
        const numbers = Array.from(
            { length: size * size - 1 },
            (_, index) => index + 1
        );
        numbers.push(" ");
        return shuffle(numbers);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderBoard() {
        board.innerHTML = '';

        boardArray.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.textContent = cell === " " ? "" : cell;
            cellElement.classList.toggle("empty", cell === " ");
            cellElement.setAttribute("data-index", index);

            if (index + 1 == cell) cellElement.classList.add("target");

            cellElement.classList.add(cell % 2 == 0 ? "red" : "white");

            const row = Math.floor(index / size);
            const col = index % size;
            cellElement.style.top = `${row * 100}px`;
            cellElement.style.left = `${col * 100}px`;

            cellElement.addEventListener("mousedown", handleClick);
            cellElement.addEventListener("touchstart", (event) => {
                event.preventDefault();
                handleClick(event);
            }, { passive: false });

            board.appendChild(cellElement);
        });

        if (!hasAnimated) {
            const cells = document.querySelectorAll(".cell");
            setTimeout(() => {
                cells.forEach(cell => {
                    cell.classList.add("animated");
                });
            }, 10);

            setTimeout(() => {
                cells.forEach(cell => {
                    cell.classList.remove("animated");
                });
            }, 500);

            hasAnimated = true;
        }
    }

    function handleClick(event) {
        if (gameWon || isMoving) return;

        const index = parseInt(event.target.getAttribute("data-index"));
        const emptyIndex = boardArray.indexOf(" ");
        const emptyRow = Math.floor(emptyIndex / size);
        const emptyCol = emptyIndex % size;
        const clickedRow = Math.floor(index / size);
        const clickedCol = index % size;

        const isAdjacent =
            (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
            (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow);

        if (isAdjacent) {
            moveCell(index, emptyIndex);
            moveCount++;

            if (moveCount == 1) {
                startTime = Date.now();
                timerInterval = setInterval(() => {
                    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                    timeCounter.textContent = elapsedTime;
                }, 1000);
            }
            moveCounter.textContent = moveCount;
        }
    }

    function moveCell(fromIndex, toIndex) {
        isMoving = true;

        const fromRow = Math.floor(fromIndex / size);
        const fromCol = Math.floor(fromIndex % size);
        const toRow = Math.floor(toIndex / size);
        const toCol = Math.floor(toIndex % size);

        const fromCellElement = board.querySelector(`[data-index="${fromIndex}"]`);

        if (animationEnabled) {
            fromCellElement.style.transition = 'transform 0.3s ease';
            fromCellElement.style.transform = `
                translate(${(toCol - fromCol) * fromCellElement.offsetWidth}px,
                ${(toRow - fromRow) * fromCellElement.offsetHeight}px)
            `;
        }

        setTimeout(() => {
            boardArray[fromIndex] = " ";
            boardArray[toIndex] = Number(fromCellElement.textContent.trim());
            renderBoard();
            isMoving = false;

            if (checkVictory()) {
                clearInterval(timerInterval);
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                alert(`You won in ${elapsedTime} seconds and ${moveCount} moves!`);
                gameWon = true;
            }
        }, animationEnabled ? 150 : 0);
    }

    function checkVictory() {
        return boardArray.every((cell, index) => {
            return cell === " " ? index === boardArray.length - 1 : cell === index + 1;
        });
    }

    function handleKeyPress(event) {
        if (gameWon || isMoving) return;

        const emptyIndex = boardArray.indexOf(" ");
        const emptyRow = Math.floor(emptyIndex / size);
        const emptyCol = emptyIndex % size;

        let targetIndex;

        switch (event.key.toLowerCase()) {
            case 'w':
            case "arrowup":
                targetIndex = (emptyRow < size - 1) ? emptyIndex + size : null;
                break;

            case 's':
            case "arrowdown":
                targetIndex = (emptyRow > 0) ? emptyIndex - size : null;
                break;

            case 'a':
            case "arrowleft":
                targetIndex = (emptyCol < size - 1) ? emptyIndex + 1 : null;
                break;

            case 'd':
            case "arrowright":
                targetIndex = (emptyCol > 0) ? emptyIndex - 1 : null;
                break;

            default:
                return;
        }

        if (targetIndex) {
            moveCell(targetIndex, emptyIndex);
            moveCount++;

            if (moveCount == 1) {
                startTime = Date.now();
                timerInterval = setInterval(() => {
                    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                    timeCounter.textContent = elapsedTime;
                }, 1000);
            }

            moveCounter.textContent = moveCount;
        }
    }

    if (toggleAnimationButton) {
        toggleAnimationButton.addEventListener("click", () => {
            animationEnabled = !animationEnabled;
            toggleAnimationButton.textContent = animationEnabled ? "Disable Animation" : "Activate Animation";
        });
    }

    if (restartButton) {
        restartButton.addEventListener("click", () => {
            gameWon = false;
            hasAnimated = false;
            boardArray = generateShuffledBoard(size);
            renderBoard();
            clearInterval(timerInterval);
            moveCount = 0;
            moveCounter.textContent = moveCount;
            timeCounter.textContent = 0;
        });
    }

    renderBoard();
    document.addEventListener("keydown", handleKeyPress);
}

document.documentElement.setAttribute("translate", "no");
document.body.setAttribute("translate", "no");

// Prevent text selection
document.getElementById("game-container").addEventListener("selectstart", (e) => e.preventDefault());

startGame();