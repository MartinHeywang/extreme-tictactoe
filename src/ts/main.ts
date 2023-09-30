import cross from "../cross.svg";
import circle from "../circle.svg";

type Values = "-" | "x" | "o";
type Tuple3<T> = [T, T, T];

// the model is just all the cells' values
// all cells are described by four coordinates :
// the x and y of the main grid
// the x and y in the containing "main" cell
// thus the 4-dimensional tuple here
type Subgrid = { winner: Values; cells: Tuple3<Tuple3<Values>> };
type Model = {
    winner: Values;
    nextPlayerConstraints: Constraints | null;
    subgrids: Tuple3<Tuple3<Subgrid>>;
};

type Player = { value: Values; image: string };

let m: Model;

const players: Player[] = [
    { value: "x", image: cross },
    { value: "o", image: circle },
];
let currentPlayerIndex = 0;

type Constraints = { x1: number; y1: number };

const LOCAL_STORAGE_MODEL = "extreme-tictactoe-model";
const LOCAL_STORAGE_PLAYER = "extreme-tictactoe-player";

const mainGrid = document.querySelector<HTMLDivElement>(".main-grid")!;
const nextPlayerImage = document.getElementById(
    "next-player-image"
) as HTMLImageElement;
const newGameBtn = document.getElementById("new-game-btn") as HTMLButtonElement;

mainGrid.addEventListener("click", (evt) => {
    if (!((evt.target as any) instanceof HTMLButtonElement)) return;

    const button = evt.target as HTMLButtonElement;
    const dataset = button.dataset as unknown as {
        coordX1: number; // those are in fact strings but to avoid parsing int
        coordY1: number; // I make believe TS think there are actual numbers
        coordX2: number; // because the only use we make of them is as index of the model
        coordY2: number; // which in pure JS, works with strings as well as numbers
    };
    const { coordX1: x1, coordY1: y1, coordX2: x2, coordY2: y2 } = dataset;

    if (
        m.nextPlayerConstraints !== null &&
        (x1 !== m.nextPlayerConstraints.x1 || y1 !== m.nextPlayerConstraints.y1)
    )
        return;
    if (m.subgrids[x1][y1].cells[x2][y2] !== "-") return;

    m.subgrids[x1][y1].cells[x2][y2] = players[currentPlayerIndex].value;

    const oldSubgrid = mainGrid.querySelector(
        `.sub-grid[data-coord-x1='${x1}'][data-coord-y1='${y1}']`
    )!;
    oldSubgrid.classList.remove("sub-grid--playable");

    const winner = lookForWinnerInSubgrid(m.subgrids[x1][y1]);
    if (winner !== "-") {
        const div = document.createElement("div");
        div.classList.add("sub-grid__winner");

        const img = document.createElement("img");
        img.src = winner === "x" ? cross : circle;

        div.appendChild(img);
        oldSubgrid.appendChild(div);
    }

    // the next player must play in the sub-grid indicated by the cell the current player chose
    // e.g the current plays in 0-0-2-1 -> the next player will be forced to play in 2-1-x2-y2
    m.nextPlayerConstraints = { x1: x2, y1: y2 };
    // but if there is already a winner in the indicated sub-grid, then the next player can play anywhere
    if (
        m.subgrids[m.nextPlayerConstraints.x1][m.nextPlayerConstraints.y1]
            .winner !== "-"
    ) {
        m.nextPlayerConstraints = null;
        mainGrid.classList.remove("no-hover");
    }

    if (m.nextPlayerConstraints !== null) {
        const newSubgrid = mainGrid.querySelector(
            `.sub-grid[data-coord-x1='${m.nextPlayerConstraints.x1}'][data-coord-y1='${m.nextPlayerConstraints.y1}']`
        )!;
        newSubgrid.classList.add("sub-grid--playable");
        mainGrid.classList.add("no-hover");
    }

    const img = document.createElement("img");
    img.src = players[currentPlayerIndex].image;
    img.classList.add(players[currentPlayerIndex].value);

    button.appendChild(img);

    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    nextPlayerImage.src = players[currentPlayerIndex].image;

    localStorage.setItem(LOCAL_STORAGE_MODEL, JSON.stringify(m));
    localStorage.setItem(
        LOCAL_STORAGE_PLAYER,
        JSON.stringify(currentPlayerIndex)
    );
});

newGameBtn.addEventListener("click", () => {
    resetModel();
    syncDomWithModel();
});

type Coords = [number, number];
const winningLines: Tuple3<Coords>[] = [
    [
        [0, 0], // 0th vertical
        [0, 1],
        [0, 2],
    ],
    [
        [1, 0], // 1st vertical
        [1, 1],
        [1, 2],
    ],
    [
        [2, 0], // 2nd vertical
        [2, 1],
        [2, 2],
    ],
    [
        [0, 0], // 0th horizontal
        [1, 0],
        [2, 0],
    ],
    [
        [0, 1], // 1th horizontal
        [1, 1],
        [2, 1],
    ],
    [
        [0, 2], // 2th horizontal
        [1, 2],
        [2, 2],
    ],
    [
        [0, 0], // diagonal (direction : \)
        [1, 1],
        [2, 2],
    ],
    [
        [0, 2], // diagonal (direction : /)
        [1, 1],
        [2, 0],
    ],
];

function lookForWinnerInSubgrid(subgrid: Subgrid) {
    const cells = subgrid.cells;

    const winner = winningLines.reduce((prev: Values, line) => {
        if (prev !== "-") return prev; // a previous line has already made someone win the subgrid

        // check si le premier symbole est le même que le deuxième et que le premier est le même que le troisième
        // = les trois cases de la ligne ont le même symbole
        const sameSymbol =
            cells[line[0][0]][line[0][1]] === cells[line[1][0]][line[1][1]] &&
            cells[line[0][0]][line[0][1]] === cells[line[2][0]][line[2][1]];

        // retourne le symbole vérifié en question si la ligne est complète, sinon '-' pour pas de gagnant
        return sameSymbol ? cells[line[0][0]][line[0][1]] : "-";
    }, "-");

    console.log(`Winner ? '${winner}'`);

    subgrid.winner = winner;
    return winner;
}

function resetModel() {
    // initialize all cells with '-' meaning empty
    // (thanks multi-cursor feature for writing this)
    m = {
        nextPlayerConstraints: null,
        winner: "-",
        subgrids: [
            [
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
            ],
            [
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
            ],
            [
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
                {
                    winner: "-",
                    cells: [
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                        ["-", "-", "-"],
                    ],
                },
            ],
        ],
    };
    currentPlayerIndex = 0;

    localStorage.setItem(LOCAL_STORAGE_MODEL, JSON.stringify(m));
    localStorage.setItem(
        LOCAL_STORAGE_PLAYER,
        JSON.stringify(currentPlayerIndex)
    );
}

function loadGameFromLocalStorage() {
    const modelStr = localStorage.getItem(LOCAL_STORAGE_MODEL);
    const playerStr = localStorage.getItem(LOCAL_STORAGE_PLAYER);

    if (modelStr == null || playerStr == null) return resetModel();

    const model = JSON.parse(modelStr) as Model;
    m = model;

    const playerIndex = JSON.parse(playerStr) as 0 | 1;
    currentPlayerIndex = playerIndex;

    syncDomWithModel();
}

function syncDomWithModel() {
    // 4-level deep for-each, to loop through every cell of the grid
    m.subgrids.forEach((mainLine, x1) => {
        mainLine.forEach((subgrid, y1) => {
            subgrid.cells.forEach((subLine, x2) => {
                subLine.forEach((cell, y2) => {
                    const htmlCell = mainGrid.querySelector(
                        `button[data-coord-x1='${x1}'][data-coord-y1='${y1}'][data-coord-x2='${x2}'][data-coord-y2='${y2}']`
                    )!;
                    if (!htmlCell) return;

                    if (cell === "-") return (htmlCell.innerHTML = "");

                    const img = document.createElement("img");
                    const player = players.find((p) => p.value === cell)!;
                    img.src = player.image;
                    img.classList.add(player.value);

                    htmlCell.appendChild(img);
                });
            });

            const winner = lookForWinnerInSubgrid(subgrid);
            if (winner === "-") return;

            const htmlSubgrid = mainGrid.querySelector(
                `.sub-grid[data-coord-x1='${x1}'][data-coord-y1='${y1}']`
            )!;

            const div = document.createElement("div");
            div.classList.add("sub-grid__winner");

            const img = document.createElement("img");
            img.src = winner === "x" ? cross : circle;

            div.appendChild(img);
            htmlSubgrid.appendChild(div);
        });
    });

    nextPlayerImage.src = players[currentPlayerIndex].image;

    if (m.nextPlayerConstraints != null) {
        const newSubgrid = mainGrid.querySelector(
            `.sub-grid[data-coord-x1='${m.nextPlayerConstraints.x1}'][data-coord-y1='${m.nextPlayerConstraints.y1}']`
        )!;
        newSubgrid.classList.add("sub-grid--playable");
        mainGrid.classList.add("no-hover");
    } else {
        mainGrid.classList.remove("no-hover");
        Array.from(mainGrid.children).forEach((subgrid) =>
            subgrid.classList.remove("sub-grid--playable")
        );
    }
}

// loads a previous game if one was stored, else initializes an empty game model
loadGameFromLocalStorage();
