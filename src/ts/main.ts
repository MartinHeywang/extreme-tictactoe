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
let nextPlayerConstraints: Constraints | null = null;

resetModel();

const mainGrid = document.querySelector<HTMLDivElement>(".main-grid")!;

mainGrid.addEventListener("click", evt => {
    if (!((evt.target as any) instanceof HTMLButtonElement)) return;

    const button = evt.target as HTMLButtonElement;
    const dataset = button.dataset as unknown as {
        coordX1: number; // those are in fact strings but to avoid parsing int
        coordY1: number; // I make believe TS think there are actual numbers
        coordX2: number; // because the only use we make of them is as index of the model
        coordY2: number; // which in pure JS, works with strings as well as numbers
    };
    const { coordX1: x1, coordY1: y1, coordX2: x2, coordY2: y2 } = dataset;

    if(nextPlayerConstraints !== null && (x1 === nextPlayerConstraints.x1 || y1 === nextPlayerConstraints.y1)) return;
    if (m.subgrids[x1][y1].cells[x2][y2] !== "-") return;

    m.subgrids[x1][y1].cells[x2][y2] = players[currentPlayerIndex].value;

    // lookForWinnerInSubgrid(m.subgrids[x1][y1], [x2, y2]);

    // the next player must play in the sub-grid indicated by the cell the current player chose
    // e.g the current plays in 0-0-2-1 -> the next player will be forced to play in 2-1-x2-y2
    nextPlayerConstraints = { x1: x2, y1: y2 }
    // but if there is already a winner in the indicated sub-grid, then the next player can play anywhere
    if(m.subgrids[x2][y2].winner !== "-") nextPlayerConstraints = null;

    const img = document.createElement("img");
    img.src = players[currentPlayerIndex].image;
    img.classList.add(players[currentPlayerIndex].value);

    button.appendChild(img);

    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
});

// function lookForWinnerInSubgrid(subgrid: Subgrid, [x2, y2]: [number, number]) {
//     // info : to be done
// }

function resetModel() {
    // initialize all cells with '-' meaning empty
    // (thanks multi-cursor feature for writing this)
    m = {
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
}

export {};
