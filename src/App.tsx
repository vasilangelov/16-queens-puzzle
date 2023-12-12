import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Position,
  generateEmptyChessboard,
  getSolution,
  isBoardStateValid,
} from "./services/chess";

import appStyles from "./App.module.scss";
import { classNames } from "./utils/classNames";
import { ChessPiece, PIECE_SYMBOL_MAP } from "./settings/chess";

const DEFAULT_TILE_COUNT = 8;
const DEFAULT_QUEEN_COUNT = 16;
const DEFAULT_ALLOWED_INTERSECTING_QUEENS_COUNT = 1;

export default function App() {
  const chessboardRef = useRef<HTMLDivElement>(null);

  const [tileCount, setTileCount] = useState(DEFAULT_TILE_COUNT);
  const [queenCount, setQueenCount] = useState(DEFAULT_QUEEN_COUNT);
  const [allowedIntersectingQueensCount, setAllowedIntersectingQueensCount] =
    useState(DEFAULT_ALLOWED_INTERSECTING_QUEENS_COUNT);

  const [chessboard, setChessboard] = useState(() =>
    generateEmptyChessboard(tileCount)
  );

  const boardQueensCount = useMemo(
    () =>
      chessboard.reduce(
        (rowCount, row) =>
          rowCount +
          row.reduce(
            (count, column) => count + (column === undefined ? 0 : 1),
            0
          ),
        0
      ),
    [chessboard]
  );

  useLayoutEffect(() => {
    setChessboard(generateEmptyChessboard(tileCount));
  }, [tileCount]);

  const chessboardWidth =
    chessboardRef.current?.getBoundingClientRect().width ?? 0;

  return (
    <div className={appStyles["App"]}>
      <main className={appStyles["App__main"]}>
        <div
          className={appStyles["App__chessboard"]}
          ref={chessboardRef}
          style={{
            gridTemplateRows: `repeat(${chessboard.length}, 1fr)`,
            gridTemplateColumns: `repeat(${chessboard[0]?.length ?? 1}, 1fr)`,
            fontSize: `${Math.floor(chessboardWidth / chessboard.length)}px`,
            lineHeight: `${Math.floor(chessboardWidth / chessboard.length)}px`,
          }}
        >
          {chessboard.map((columns, row) =>
            columns.map((pieceInfo, column) => {
              const hasPiece = !!pieceInfo;

              return (
                <div
                  key={`tile-${row}-${column}`}
                  className={classNames(
                    appStyles["App__tile"],
                    row % 2 === 0
                      ? column % 2 === 0
                        ? appStyles["App__tile--black"]
                        : appStyles["App__tile--white"]
                      : column % 2 === 0
                      ? appStyles["App__tile--white"]
                      : appStyles["App__tile--black"],
                    appStyles["App__tile--clickable"]
                  )}
                  onClick={() => {
                    if (boardQueensCount >= queenCount && !hasPiece) {
                      return;
                    }

                    setChessboard((chessboard) => {
                      const chessboardCopy = [...chessboard];
                      const rowCopy = [...chessboard[row]];

                      rowCopy[column] =
                        rowCopy[column] === undefined
                          ? { piece: ChessPiece.Queen }
                          : undefined;

                      chessboardCopy[row] = rowCopy;

                      return chessboardCopy;
                    });
                  }}
                >
                  {hasPiece && PIECE_SYMBOL_MAP[pieceInfo.piece]}
                </div>
              );
            })
          )}
        </div>
      </main>
      <aside className={appStyles["App__sidebar"]}>
        <h1 className={appStyles["App__title"]}>Queens problem</h1>
        <div className={appStyles["App__settings-row"]}>
          <div className={appStyles["App__form-control"]}>
            <label htmlFor="tile-count">Tile count</label>

            <select
              id="tile-count"
              className={appStyles["App__input"]}
              defaultValue={tileCount}
              onChange={(event) => {
                const newValue = Number(event.target.value);

                if (!Number.isNaN(newValue)) {
                  setTileCount(newValue);
                }
              }}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
          <div className={appStyles["App__form-control"]}>
            <label htmlFor="queen-count">Queen count</label>
            <input
              id="queen-count"
              className={appStyles["App__input"]}
              type="number"
              min={1}
              defaultValue={queenCount}
              onChange={(event) => {
                const newValue = event.target.valueAsNumber;

                if (!Number.isNaN(newValue) && newValue >= 1) {
                  setQueenCount(newValue);
                }
              }}
            ></input>
          </div>
          <div className={appStyles["App__form-control"]}>
            <label htmlFor="queen-intersections-count">
              Allowed intersections
            </label>
            <input
              id="queen-intersections-count"
              className={appStyles["App__input"]}
              type="number"
              min={0}
              defaultValue={allowedIntersectingQueensCount}
              onChange={(event) => {
                const newValue = event.target.valueAsNumber;

                if (!Number.isNaN(newValue) && newValue >= 0) {
                  setAllowedIntersectingQueensCount(newValue);
                }
              }}
            ></input>
          </div>
        </div>

        <button
          className={appStyles["App__button"]}
          onClick={() => {
            const boardQueensPositions = chessboard.flatMap((columns, row) =>
              columns
                .map<Position | undefined>(
                  (piece, column) => piece && ([row, column] as const)
                )
                .filter(
                  (position): position is Position => position !== undefined
                )
            );

            const solution = getSolution({
              boardSize: tileCount,
              figuresOnBoard: boardQueensPositions,
              allowedIntersectionCount: allowedIntersectingQueensCount,
              targetCount: queenCount,
            });

            if (solution === null) {
              alert("There is no solution");
              return;
            }

            const solvedChessboard = generateEmptyChessboard(tileCount);

            for (const [row, col] of solution) {
              solvedChessboard[row][col] = { piece: ChessPiece.Queen };
            }

            setChessboard(solvedChessboard);
          }}
        >
          Autosolve current state
        </button>

        <button
          className={appStyles["App__button"]}
          onClick={() => setChessboard(generateEmptyChessboard(tileCount))}
        >
          Clear board
        </button>
        <button
          className={appStyles["App__button"]}
          onClick={() => {
            if (boardQueensCount < queenCount) {
              alert("This is not a solution to the problem");
              return;
            }

            const boardQueensPositions = chessboard.flatMap((columns, row) =>
              columns
                .map<Position | undefined>(
                  (piece, column) => piece && ([row, column] as const)
                )
                .filter(
                  (position): position is Position => position !== undefined
                )
            );

            if (
              !isBoardStateValid({
                figures: boardQueensPositions,
                allowedIntersectionCount: allowedIntersectingQueensCount,
              })
            ) {
              alert("This is not a solution to the problem");
              return;
            }

            alert("This is a valid solution.");
          }}
        >
          Check answer
        </button>
      </aside>
    </div>
  );
}
