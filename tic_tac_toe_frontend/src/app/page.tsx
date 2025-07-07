"use client";
import React, { useState } from "react";

const COLORS = {
  accent: "#34a853",
  primary: "#1a73e8",
  secondary: "#e8eaed",
  text: "#171717",
  bg: "#fff",
};

type Player = "X" | "O";
type SquareValue = Player | null;

type HistoryEntry = {
  player: Player;
  move: [number, number]; // [row, col]
  board: SquareValue[][];
};

function getInitialBoard(): SquareValue[][] {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

function calculateWinner(board: SquareValue[][]) {
  const lines = [
    // Rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Columns
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }
  return null;
}

function isDraw(board: SquareValue[][]): boolean {
  return board.flat().every((cell) => cell !== null) && !calculateWinner(board);
}

// PUBLIC_INTERFACE
function TicTacToeGame() {
  /**
   * Main stateful component for the Tic Tac Toe game.
   * Handles game board, player turns, history, win/draw detection and restart.
   */
  const [board, setBoard] = useState<SquareValue[][]>(getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [draw, setDraw] = useState<boolean>(false);

  // Handle a square click
  function handleSquareClick(row: number, col: number) {
    if (winner || draw || board[row][col]) return;
    const newBoard = board.map((rowArr) => [...rowArr]) as SquareValue[][];
    newBoard[row][col] = currentPlayer;

    const nextHistory = [
      ...history,
      {
        player: currentPlayer,
        move: [row, col],
        board: newBoard.map((r) => [...r]),
      },
    ];

    const newWinner = calculateWinner(newBoard);
    const gameDraw = isDraw(newBoard);

    setBoard(newBoard);
    setHistory(nextHistory);
    setWinner(newWinner);
    setDraw(gameDraw);
    if (!newWinner && !gameDraw) {
      setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
    }
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    /**Restart the game state to the initial state. */
    setBoard(getInitialBoard());
    setCurrentPlayer("X");
    setWinner(null);
    setDraw(false);
    setHistory([]);
  }

  // PUBLIC_INTERFACE
  function renderSquare(row: number, col: number) {
    /**
     * Renders a single game square.
     * Applies accent color for player's move on click.
     */
    const value = board[row][col];
    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleSquareClick(row, col)}
        className="w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 bg-white border border-[var(--ttt-border)] flex items-center justify-center text-3xl sm:text-4xl font-bold rounded transition-colors select-none focus:outline-none"
        aria-label={`Row ${row + 1}, Column ${col + 1}. ${value ? (value === "X" ? "X" : "O") : "Empty"}`}
        style={{
          color:
            value === "X"
              ? COLORS.primary
              : value === "O"
              ? COLORS.accent
              : COLORS.text,
          background: COLORS.secondary,
          borderColor: "#dedede",
          cursor: value || winner || draw ? "not-allowed" : "pointer",
        }}
        disabled={Boolean(value) || Boolean(winner) || draw}
      >
        {value}
      </button>
    );
  }

  // PUBLIC_INTERFACE
  function renderBoard() {
    /**
     * Renders the 3x3 tic tac toe game board.
     */
    return (
      <div
        className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 mx-auto"
        style={{ background: COLORS.secondary, borderRadius: "1.2rem", padding: 8, maxWidth: 320 }}
        tabIndex={0}
      >
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => renderSquare(row, col))
        )}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderMoveHistory() {
    /**
     * Renders the list of past moves in order.
     */
    if (history.length === 0) return null;
    return (
      <ol className="text-xs sm:text-sm text-[var(--ttt-sub)] px-1 mx-auto w-full max-w-xs flex flex-col gap-1" aria-label="Move history">
        {history.map((h, i) => (
          <li key={i}>
            <span>
              <span style={{color: h.player === "X" ? COLORS.primary : COLORS.accent, fontWeight: 600}}>
                {h.player}
              </span>{" "}
              to ({h.move[0] + 1}, {h.move[1] + 1})
            </span>
          </li>
        ))}
      </ol>
    );
  }

  // PUBLIC_INTERFACE
  function renderStatus() {
    /**
     * Renders the game status: showing whose turn, winner, or draw.
     */
    let text = "";
    if (winner) {
      text = `Winner: ${winner}`;
    } else if (draw) {
      text = "Draw! Nobody wins.";
    } else {
      text = `Turn: ${currentPlayer}`;
    }
    return (
      <span
        className="text-base sm:text-lg font-semibold"
        style={{
          color: winner
            ? COLORS.accent
            : draw
            ? "#999"
            : currentPlayer === "X"
            ? COLORS.primary
            : COLORS.accent,
        }}
      >
        {text}
      </span>
    );
  }

  // PUBLIC_INTERFACE
  function renderRestartButton() {
    /**
     * Renders the restart button.
     */
    return (
      <button
        onClick={restartGame}
        className="rounded px-4 py-2 mt-2 bg-white border-2 border-[var(--ttt-btn)] text-sm font-medium transition-colors hover:bg-[var(--ttt-btn)] hover:text-white"
        style={{
          background: COLORS.primary,
          borderColor: COLORS.primary,
          color: "#fff",
          minWidth: 90,
        }}
        aria-label="Restart game"
      >
        Restart
      </button>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-2 py-8
     bg-[var(--color-background)] transition-colors"
      style={{
        background: COLORS.bg,
        color: COLORS.text,
      }}
      suppressHydrationWarning
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <header className="mb-1 flex flex-col items-center">
          <h1
            className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight"
            style={{
              color: COLORS.primary,
              letterSpacing: ".045em",
              userSelect: "none",
            }}
          >
            Tic Tac Toe
          </h1>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#bdbdbd" }}
          >
            Modern PvP Edition
          </span>
        </header>
        {renderStatus()}
        {renderBoard()}
        {renderMoveHistory()}
        {renderRestartButton()}
      </div>
      <footer className="mt-10 text-xs text-gray-400 text-center tracking-wide">
        © {new Date().getFullYear()} Modern Tic Tac Toe
      </footer>
      <style>
        {`
        :root {
          --ttt-border: #d5d5d5;
          --ttt-sub: #606770;
          --ttt-btn: ${COLORS.primary};
        }
        `}
      </style>
    </main>
  );
}

export default function Home() {
  return <TicTacToeGame />;
}
