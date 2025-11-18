'use client';

import { useState } from 'react';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const checkWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 dark:bg-white/5 rounded-lg backdrop-blur-sm">
      <h3 className="text-xl font-semibold text-white">Tic-Tac-Toe</h3>
      
      {winner && (
        <div className="text-lg font-bold text-green-400">
          Player {winner} wins! 🎉
        </div>
      )}
      
      {isDraw && !winner && (
        <div className="text-lg font-bold text-yellow-400">
          It's a draw! 🤝
        </div>
      )}
      
      {!winner && !isDraw && (
        <div className="text-base text-blue-300">
          Current Player: <span className="font-bold">{currentPlayer}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 hover:bg-slate-700 disabled:hover:bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-3xl md:text-4xl font-bold transition-colors"
            disabled={!!cell || !!winner}
          >
            {cell && (
              <span className={cell === 'X' ? 'text-blue-400' : 'text-red-400'}>
                {cell}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Reset Game
      </button>
    </div>
  );
}
