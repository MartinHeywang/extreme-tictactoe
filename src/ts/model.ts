// all cells are described by four coordinates :
// the x and y of the main grid
// the x and y in the containing "main" cell
// thus the 4-dimensional tuple here
type Values = "x" | "o";
type Tuple3<T> = [T, T, T];

type Subgrid = { winner: Values | null; cells: Tuple3<Tuple3<Values | null>> };
type Model = {
    winner: Values | null;
    nextPlayerConstraints: { x1: number; y1: number } | null;
    subgrids: Tuple3<Tuple3<Subgrid>>;
    currentPlayer: Values;
};

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

const LOCAL_STORAGE_MODEL = "extreme-tictactoe-model";

let model: Model;

export function playCell(x1: number, y1: number, x2: number, y2: number) {
    // if the click does not respect the constraints
    if (
        model.nextPlayerConstraints !== null &&
        (x1 !== model.nextPlayerConstraints.x1 ||
            y1 !== model.nextPlayerConstraints.y1)
    )
        return;

    const subgrid = model.subgrids[x1][y1];

    // if someone already played in this cell
    if (subgrid.cells[x2][y2] !== null) return;

    subgrid.cells[x2][y2] = model.currentPlayer;
    model.currentPlayer = model.currentPlayer === "x" ? "o" : "x";
    
    const winner = lookForWinnerInSubgrid(x1, y1);
    subgrid.winner = winner;

    model.nextPlayerConstraints = getSubgridData(x2, y2).winner === null ? { x1: x2, y1: y2 } : null;
    saveSnapshotToLocalStorage();
}

export function getCellValue(x1: number, y1: number, x2: number, y2: number) {
    return model.subgrids[x1][y1].cells[x2][y2];
}
export function getSubgridData(x1: number, y1: number) {
    return { ...model.subgrids[x1][y1], cells: undefined };
}

export function getNextPlayerConstraints() {
    return model.nextPlayerConstraints;
}

export function getNextPlayer() {
    return model.currentPlayer;
}

export function lookForWinnerInSubgrid(x1: number, y1: number) {
    const subgrid = model.subgrids[x1][y1];
    const cells = subgrid.cells;

    // can't use array.some() here because we want to know who actual won
    const winningLine = winningLines.find((line) => {
        // check si le premier symbole est le même que le deuxième et que le premier est le même que le troisième
        // = les trois cases de la ligne ont le même symbole
        const sameSymbol =
            cells[line[0][0]][line[0][1]] !== null &&
            cells[line[0][0]][line[0][1]] === cells[line[1][0]][line[1][1]] &&
            cells[line[0][0]][line[0][1]] === cells[line[2][0]][line[2][1]];

        // retourne le symbole vérifié en question si la ligne est complète, sinon null pour pas de gagnant
        return sameSymbol;
    });

    if (winningLine == null) return null; // no line is completed

    const winningPlayer = cells[winningLine[0][0]][winningLine[0][1]]!;

    return winningPlayer;
}

export function resetModel() {
    // initialize all cells with '-' meaning empty
    // (thanks multi-cursor feature for writing this)
    model = {
        nextPlayerConstraints: null,
        winner: null,
        currentPlayer: "x",
        subgrids: [
            [
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
            ],
            [
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
            ],
            [
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
                {
                    winner: null,
                    cells: [
                        [null, null, null],
                        [null, null, null],
                        [null, null, null],
                    ],
                },
            ],
        ],
    };

    saveSnapshotToLocalStorage();
}

export function loadSnapshotFromLocalStorage() {
    const modelStr = localStorage.getItem(LOCAL_STORAGE_MODEL);
    if (modelStr == null) return false;

    model = JSON.parse(modelStr) as Model;
    return true;
}

export function saveSnapshotToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_MODEL, JSON.stringify(model));
}
