import cross from "../cross.svg";
import circle from "../circle.svg";

import * as model from "./model";

const mainGrid = document.querySelector<HTMLDivElement>(".main-grid")!;
const nextPlayerImage = document.getElementById(
    "next-player-image"
) as HTMLImageElement;
const newGameBtn = document.getElementById("new-game-btn") as HTMLButtonElement;

const playersImages = { x: cross, o: circle };

mainGrid.addEventListener("click", (evt) => {
    if (!((evt.target as any) instanceof HTMLButtonElement)) return;

    const button = evt.target as HTMLButtonElement;
    const { coordX1, coordY1, coordX2, coordY2 } = button.dataset;

    const x1 = parseInt(coordX1!);
    const y1 = parseInt(coordY1!);
    const x2 = parseInt(coordX2!);
    const y2 = parseInt(coordY2!);

    model.playCell(x1, y1, x2, y2);
    updateCell(x1, y1, x2, y2);
    updateSubgrid(x1, y1); // for checking winner and removing constraints indicator
    updateSubgrid(x2, y2); // for adding constraints indicator
    updateMainGrid(); // update constraints
    updateNextPlayerIndication();
});

newGameBtn.addEventListener("click", () => {
    model.resetModel();
    updateAll();
});

/**
 * Syncs everything element in the DOM using the current model
 */
export function updateAll() {
    for (let y1 = 0; y1 <= 2; y1++) {
        for (let x1 = 0; x1 <= 2; x1++) {
            for (let y2 = 0; y2 <= 2; y2++) {
                for (let x2 = 0; x2 <= 2; x2++) {
                    updateCell(x1, y1, x2, y2);
                }
            }
            updateSubgrid(x1, y1);
        }
    }
    updateMainGrid();
    updateNextPlayerIndication();
}

function updateCell(x1: number, y1: number, x2: number, y2: number) {
    const value = model.getCellValue(x1, y1, x2, y2);
    const htmlCell = mainGrid.querySelector(
        `button[data-coord-x1='${x1}'][data-coord-y1='${y1}'][data-coord-x2='${x2}'][data-coord-y2='${y2}']`
    )!;

    if (!htmlCell) return;

    htmlCell.innerHTML = "";

    if (value === null) return;

    const img = document.createElement("img");
    img.src = playersImages[value];
    img.classList.add(value);

    htmlCell.appendChild(img);
}

function updateSubgrid(x1: number, y1: number) {
    // detect winner
    // detect constraints

    const htmlSubgrid = mainGrid.querySelector(
        `.sub-grid[data-coord-x1='${x1}'][data-coord-y1='${y1}']`
    )!;
    if (!htmlSubgrid) return;

    const { winner } = model.getSubgridData(x1, y1);
    const htmlSubgridWinner = htmlSubgrid.querySelector(".sub-grid__winner");

    detectWinner: if (winner !== null) {
        console.log("update subgrid adding winner");
        // if we already took care of the displaying winner of this subgrid
        if (htmlSubgridWinner != undefined) break detectWinner;

        console.log("update subgrid not added yet");
        const div = document.createElement("div");
        div.classList.add("sub-grid__winner");

        const img = document.createElement("img");
        img.src = winner === "x" ? cross : circle;

        div.appendChild(img);
        htmlSubgrid.appendChild(div);
    } else {
        htmlSubgridWinner?.remove();
    }

    const constraints = model.getNextPlayerConstraints();
    console.log(constraints);

    detectConstraints: if (x1 == constraints?.x1 && y1 == constraints?.y1) {
        console.log(`adding constraints indication in subgrid (${x1}, ${y1})`);
        htmlSubgrid.classList.add("sub-grid--playable");
    } else {
        htmlSubgrid.classList.remove("sub-grid--playable");
    }
}

function updateNextPlayerIndication() {
    const nextPlayer = model.getNextPlayer();

    nextPlayerImage.src = playersImages[nextPlayer];
}

function updateMainGrid() {
    // set all cells playable based on the constraints

    const constraints = model.getNextPlayerConstraints();
    console.log(constraints);

    if (constraints == null) {
        mainGrid.classList.remove("no-hover");
    } else {
        mainGrid.classList.add("no-hover");
    }
}
