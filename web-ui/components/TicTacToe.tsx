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
    <div className="flex flex-col items-center gap-3 p-4 bg-transparent border border-white/10 rounded-lg">
      {winner && (
        <div className="text-base font-bold text-green-400">
          Player {winner} wins! 🎉
        </div>
      )}
      
      {isDraw && !winner && (
        <div className="text-base font-bold text-yellow-400">
          It's a draw! 🤝
        </div>
      )}
      
      {!winner && !isDraw && (
        <div className="text-sm text-gray-400">
          Current Player: <span className="font-bold text-white">{currentPlayer}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 bg-white/5 p-2 rounded">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-14 h-14 bg-black border border-white/20 hover:bg-white/10 disabled:hover:bg-black flex items-center justify-center text-2xl font-bold transition-colors"
            disabled={!!cell || !!winner}
          >
            {cell && (
              <span className={cell === 'X' ? 'text-gray-300' : 'text-gray-400'}>
                {cell}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded border border-white/20 transition-colors"
      >
        Reset Game
      </button>
    </div>
  );
}
