import { PieceInfo } from "../types/chess";

// Генерираме дъска NxN с редове и колони които или са празни `undefined` или имат фигура `PieceInfo`
export const generateEmptyChessboard = (
  size = 8
): (PieceInfo | undefined)[][] => {
  const board: (PieceInfo | undefined)[][] = [];

  for (let row = 0; row < size; row++) {
    board[row] = [];

    for (let column = 0; column < size; column++) {
      board[row][column] = undefined;
    }
  }

  return board;
};

// Предсатяме позицията като наредена двойка числа (ред, колона)
export type Position = [row: number, column: number];

// Декларираме параметрите които валидиращата функция ще приема
// figures - Всички царици поставени на дъската.
// allowedIntersectionCount - брой позволени засичания по ред / диагонали / колона
// (0 - без засичания, 1 - най-много 2 на ред / колона / диагонал)
interface IsBoardStateValidProps {
  figures: readonly Position[];
  allowedIntersectionCount: number;
}

// Функция проверяваща дали текущото състояние на дъската е валидно (дали отговаря на параметърът за засичане по-горе)
export const isBoardStateValid = ({
  figures,
  allowedIntersectionCount,
}: IsBoardStateValidProps) => {
  // Използваме асоциативен масив (речник) който държи ред като ключ и брой фигури на текущият ред
  const rows = new Map<number, number>();
  // Държим най-голямата бройка фигури на един ред. (с цел да не обхождаме Map-a на горният ред)
  let maxRows = 0;
  // Същото прилагаме и за колони, диагонали от ляво надясно (leftDiagonals) и дясно наляво (rightDiagonals)
  const columns = new Map<number, number>();
  let maxColumns = 0;
  const leftDiagonals = new Map<number, number>();
  let maxLeftDiagonal = 0;
  const rightDiagonals = new Map<number, number>();
  let maxRightDiagonal = 0;

  // Обхождаме всички поставени фигури
  for (const [row, column] of figures) {
    // Взимаме вече записаните фигури за текущият ред и добавяме 1
    const rowCount = (rows.get(row) ?? 0) + 1;
    // Присвояваме по-голямата стойност за максимален брой фигури на ред
    maxRows = Math.max(maxRows, rowCount);
    // Накрая, добавяме новата бройка фигури на текущият ред към асоциативният масив
    rows.set(row, rowCount);

    // Взимаме вече записаните фигури за текущиата колона и добавяме 1
    const columnCount = (columns.get(column) ?? 0) + 1;
    // Присвояваме по-голямата стойност за максимален брой фигури на колона
    maxColumns = Math.max(maxColumns, columnCount);
    // Накрая, добавяме новата бройка фигури на текущата колона към речника
    columns.set(column, columnCount);

    // Използваме свойството на диагоналите от ляво надясно
    // като съберем реда и колоната на който и да е елемент
    // принадлежащ на съответния диагонал винаги получаваме едно и също число,
    // което ползваме като ключ в речника
    const leftDiagonalIndex = row + column;
    // Прилагаме същата логика и за диагоналите използвайки идентификатора
    const leftDiagonalCount = (leftDiagonals.get(leftDiagonalIndex) ?? 0) + 1;
    maxLeftDiagonal = Math.max(maxLeftDiagonal, leftDiagonalCount);
    leftDiagonals.set(leftDiagonalIndex, leftDiagonalCount);

    // Използваме свойството на диагоналите от дясно наляво
    // като извадим реда от колоната на който и да е елемент
    // принадлежащ на съответния диагонал винаги получаваме едно и също число,
    // което ползваме като ключ в речника
    const rightDiagonalIndex = row - column;
    // Прилагаме същата логика и за диагоналите използвайки идентификатора
    const rightDiagonalCount =
      (rightDiagonals.get(rightDiagonalIndex) ?? 0) + 1;
    maxRightDiagonal = Math.max(maxRightDiagonal, rightDiagonalCount);
    rightDiagonals.set(rightDiagonalIndex, rightDiagonalCount);
  }

  // Тъй като една фигура не може да се засича сама със себе си, започваме броят засичания от 2 фигури на ред / колона / диагонал.
  // ако някой от максималните стойности е по-голяма от позволеното -> дъската е в невалидно състояние.
  return (
    maxRows - 1 <= allowedIntersectionCount &&
    maxColumns - 1 <= allowedIntersectionCount &&
    maxLeftDiagonal - 1 <= allowedIntersectionCount &&
    maxRightDiagonal - 1 <= allowedIntersectionCount
  );
};

// Дефинираме променливи които ще използваме, за да решим задачата.
// boardSize - размер на дъската n
// figures - вече поставените фигури на дъската
// targetCount - брой поставени фигури на дъската
// allowedIntersectionCount - брой позволени засичания по ред / колона / диагонал
// startRow / startColumn - откъде функцията да започне да поставя фигури рекурсивно докато не намери решение.
// Използва се като метод за оптимизация за да не се повтарят едни и същи позиции.
interface SolveProps {
  boardSize: number;
  figuresOnBoard: readonly Position[];
  targetCount: number;
  allowedIntersectionCount: number;
  startRow?: number;
  startColumn?: number;
}

export const getSolution = ({
  boardSize,
  figuresOnBoard,
  targetCount,
  allowedIntersectionCount,
  startRow = 0,
  startColumn = 0,
}: SolveProps): readonly Position[] | null => {
  // Проверяваме дали дъската вече не е във валидно състояние ако не е във валидно състояние връщаме null -> т.е. не е решение.
  if (
    !isBoardStateValid({ figures: figuresOnBoard, allowedIntersectionCount })
  ) {
    return null;
  }

  // Ако дъската е във валидно състояние и вече са поставени достатъчен брой фигури (царици).
  // Задачата е изпълнена и връщаме масив от наредени двойки позиции на дъската.
  if (figuresOnBoard.length === targetCount) {
    return figuresOnBoard;
  }

  // Ако дъската е във валидно състояние но не е достигнала броят фигури (царици),
  // продължаваме да поставяме фигури на дъската, като започваме от зададеният параметър.
  for (let row = startRow; row < boardSize; row++) {
    for (
      // Тук само на първият ред е нужно да започваме от n-тата колона,
      // по-нататък вече колоните се започват от начало, за да бъде обходена цялата дъска
      let column = row === startRow ? startColumn : 0;
      column < boardSize;
      column++
    ) {
      // Ако вече има поставена фигура на това място продължаваме напред.
      if (
        figuresOnBoard.some(
          (figure) => figure[0] === row && figure[1] === column
        )
      ) {
        continue;
      }

      // правим копие на масивът т.к. той е нарочно readonly за да не може да се
      // мутира от различни функции и да не се допуска бъг при решаването на задачата
      const clone = [...figuresOnBoard];

      // Добавяме текущият (ред, колона) като фигура т.е. поставяме фигура на текущият ред / колона
      clone.push([row, column]);

      // извикваме отново същата функция, като идеята е да поставяме фигури
      // докато не достигнем до дъното -> или невалидно състояние, или решение.
      // задаваме на програмата да започне да поставя фигури от следващата колона
      // или ако е последната колона -> следващият ред, за да избегнем повторения на фигури.
      const solution = getSolution({
        boardSize,
        figuresOnBoard: clone,
        allowedIntersectionCount,
        targetCount,
        startRow: column + 1 >= boardSize ? row + 1 : row,
        startColumn: column + 1 >= boardSize ? 0 : column + 1,
      });

      // Ако решение е намерено го връщаме.
      if (solution !== null) {
        return solution;
      }
    }
  }

  // Ако след всичко това решение не е намерено -> връщаме null т.е. няма решение.
  return null;
};
