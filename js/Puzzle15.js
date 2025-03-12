"use strict";

class Puzzle15 {
    constructor(boardId, restartButtonId, toggleAnimationButtonId, timeCounterId, moveCounterId, size = 4) {
        this.board = document.getElementById(boardId);
        this.restartButton = document.getElementById(restartButtonId);
        this.toggleAnimationButton = document.getElementById(toggleAnimationButtonId);
        this.timeCounter = document.getElementById(timeCounterId);
        this.moveCounter = document.getElementById(moveCounterId);
        this.size = size;

        this.hasAnimated = false;
        this.boardArray = this.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        this.isMoving = false;
        this.animationEnabled = true;
        this.startTime = null;
        this.moveCount = 0;
        this.timerInterval = null;
        this.gameWon = false;

        this.initialize();
    }

    initialize() {
        this.renderBoard();
        this.setupEventListeners();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderBoard() {
        this.board.innerHTML = '';

        this.boardArray.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.textContent = cell === 0 ? "" : cell;
            cellElement.classList.toggle("empty", cell === 0);
            cellElement.setAttribute("data-index", index);

            if (index + 1 == cell) cellElement.classList.add("target");

            cellElement.classList.add(cell % 2 == 0 ? "red" : "white");

            const row = Math.floor(index / this.size);
            const col = index % this.size;
            cellElement.style.top = `${row * 100}px`;
            cellElement.style.left = `${col * 100}px`;

            cellElement.addEventListener("mousedown", (event) => this.handleClick(event));
            cellElement.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this.handleClick(event);
            }, { passive: false });

            this.board.appendChild(cellElement);
        });

        if (!this.hasAnimated) {
            const cells = document.querySelectorAll(".cell");
            setTimeout(() => {
                cells.forEach(cell => cell.classList.add("animated"));
            }, 10);

            setTimeout(() => {
                cells.forEach(cell => cell.classList.remove("animated"));
            }, 500);

            this.hasAnimated = true;
        }
    }

    handleClick(event) {
        if (this.gameWon || this.isMoving) return;

        const index = parseInt(event.target.getAttribute("data-index"));
        const emptyIndex = this.boardArray.indexOf(0);
        const emptyRow = Math.floor(emptyIndex / this.size);
        const emptyCol = emptyIndex % this.size;
        const clickedRow = Math.floor(index / this.size);
        const clickedCol = index % this.size;

        const isAdjacent =
            (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
            (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow);

        if (isAdjacent) {
            this.moveCell(index, emptyIndex);
            this.moveCount++;

            if (this.moveCount === 1) {
                this.startTimer();
            }
            this.moveCounter.textContent = this.moveCount;
        }
    }

    moveCell(fromIndex, toIndex) {
        this.isMoving = true;

        const fromRow = Math.floor(fromIndex / this.size);
        const fromCol = Math.floor(fromIndex % this.size);
        const toRow = Math.floor(toIndex / this.size);
        const toCol = Math.floor(toIndex % this.size);

        const fromCellElement = this.board.querySelector(`[data-index="${fromIndex}"]`);

        if (this.animationEnabled) {
            fromCellElement.style.transition = 'transform 0.3s ease';
            fromCellElement.style.transform = `translate(${(toCol - fromCol) * fromCellElement.offsetWidth}px, ${(toRow - fromRow) * fromCellElement.offsetHeight}px)`;
        }

        setTimeout(() => {
            this.boardArray[fromIndex] = 0;
            this.boardArray[toIndex] = Number(fromCellElement.textContent.trim());
            this.renderBoard();
            this.isMoving = false;

            if (this.checkVictory()) {
                this.stopTimer();
                const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                alert(`You won in ${elapsedTime} seconds and ${this.moveCount} moves!`);
                this.gameWon = true;
            }
        }, this.animationEnabled ? 150 : 0);
    }

    checkVictory() {
        return this.boardArray.every((cell, index) => cell === (index < 15 ? index + 1 : 0));
    }

    handleKeyPress(event) {
        if (this.gameWon || this.isMoving) return;

        const emptyIndex = this.boardArray.indexOf(0);
        const emptyRow = Math.floor(emptyIndex / this.size);
        const emptyCol = emptyIndex % this.size;

        let targetIndex;

        switch (event.key.toLowerCase()) {
            case 'w':
            case "arrowup":
                targetIndex = (emptyRow < this.size - 1) ? emptyIndex + this.size : null;
                break;
            case 's':
            case "arrowdown":
                targetIndex = (emptyRow > 0) ? emptyIndex - this.size : null;
                break;
            case 'a':
            case "arrowleft":
                targetIndex = (emptyCol < this.size - 1) ? emptyIndex + 1 : null;
                break;
            case 'd':
            case "arrowright":
                targetIndex = (emptyCol > 0) ? emptyIndex - 1 : null;
                break;
            default:
                return;
        }

        if (targetIndex !== null && targetIndex >= 0 && targetIndex < this.boardArray.length) {
            this.moveCell(targetIndex, emptyIndex);
            this.moveCount++;

            if (this.moveCount === 1) {
                this.startTimer();
            }
            this.moveCounter.textContent = this.moveCount;
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.timeCounter.textContent = elapsedTime;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    setupEventListeners() {
        if (this.toggleAnimationButton) {
            this.toggleAnimationButton.addEventListener("click", () => {
                this.animationEnabled = !this.animationEnabled;
                this.toggleAnimationButton.textContent = this.animationEnabled ? "Disable Animation" : "Activate Animation";
            });
        }

        if (this.restartButton) {
            this.restartButton.addEventListener("click", () => {
                this.gameWon = false;
                this.hasAnimated = false;
                this.boardArray = this.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                this.renderBoard();
                this.stopTimer();

                this.moveCount = 0;
                this.moveCounter.textContent = this.moveCount;
                this.timeCounter.textContent = 0;
            });
        }

        document.addEventListener("keydown", (event) => this.handleKeyPress(event));
    }
}

export default Puzzle15;