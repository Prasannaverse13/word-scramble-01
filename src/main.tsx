import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Word Games',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Creating Word Games post - you'll navigate there shortly.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Word Games Challenge',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading Word Games...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Game Data
const WORDS = {
  easy: ['cat', 'dog', 'hat', 'run', 'sun'],
  medium: ['words', 'apple', 'brain', 'chase', 'dance'],
  hard: ['complex', 'rhythm', 'wizard', 'enigma', 'quantum']
};

const HANGMAN_WORDS = [
  'javascript', 'python', 'react', 'typescript', 'developer'
];

// Fill-in-the-Blanks Game Data
const SENTENCES = [
  { sentence: "The ___ jumped over the moon.", answer: "cow" },
  { sentence: "A stitch in time saves ___.", answer: "nine" },
  { sentence: "An apple a day keeps the ___ away.", answer: "doctor" },
  { sentence: "The early bird catches the ___.", answer: "worm" },
  { sentence: "A picture is worth a thousand ___.", answer: "words" }
];

type GameMode = 'menu' | 'wordScramble';

Devvit.addCustomPostType({
  name: 'Word Games',
  height: 'regular',
  render: (_context) => {
    const [currentGame, setCurrentGame] = useState<GameMode>('menu');
    const [scrambleWord, setScrambleWord] = useState('');
    const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
    const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
    const [scrambleScore, setScrambleScore] = useState(0);

    // Hangman Game State
    const [hangmanWord, setHangmanWord] = useState('');
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [remainingAttempts, setRemainingAttempts] = useState(6);

    // Typing Challenge State
    const [typingTarget, setTypingTarget] = useState('');
    const [typedText, setTypedText] = useState('');
    const [typingAccuracy, setTypingAccuracy] = useState(0);

    // Word Search Game State
    const [wordSearchGrid, setWordSearchGrid] = useState<string[][]>([]);
    const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);

    // Utility function to shuffle word
    const shuffleWord = (word: string) => {
      return word.split('').sort(() => Math.random() - 0.5);
    };

    // Start Word Scramble Game
    const startWordScramble = () => {
      const selectedWord = WORDS.medium[Math.floor(Math.random() * WORDS.medium.length)];
      setScrambleWord(selectedWord);
      setScrambledLetters(shuffleWord(selectedWord));
      setSelectedLetters([]);
    };

    // Start Hangman Game
    const startHangman = () => {
      const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
      setHangmanWord(word);
      setGuessedLetters([]);
      setRemainingAttempts(6);
    };

    // Start Typing Challenge
    const startTypingChallenge = () => {
      const words = [...WORDS.easy, ...WORDS.medium, ...WORDS.hard];
      const target = words[Math.floor(Math.random() * words.length)];
      setTypingTarget(target);
      setTypedText('');
      setTypingAccuracy(0);
    };

    // Create Word Search Grid
    const createWordSearchGrid = () => {
      const grid = Array(10).fill(0).map(() => 
        Array(10).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      );
      setWordSearchGrid(grid);
    };

    // Start Fill-in-the-Blanks Game
    const startFillInTheBlanks = () => {
      const randomSentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
      setCurrentSentence(randomSentence);
      setUserAnswer('');
    };

    // Render Menu
    const renderMenu = () => (
      <vstack 
        height="100%" 
        width="100%" 
        gap="medium" 
        alignment="center middle" 
        backgroundColor="#F0F4F8" 
        padding="medium"
      >
        <text 
          size="xlarge" 
          weight="bold" 
          color="#1A365D"
          style={{ 
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)', 
            marginBottom: '20px' 
          }}
        >
          Word Games
        </text>
        <vstack gap="medium" width="100%" alignment="center middle">
          <button 
            appearance="primary" 
            onPress={() => {
              setCurrentGame('wordScramble');
              startWordScramble();
            }}
            style={{ 
              backgroundColor: '#3182CE', 
              borderRadius: '12px',
              padding: '12px',
              width: '40%'
            }}
          >
            🔀 Word Scramble
          </button>
        </vstack>
      </vstack>
    );

    // Render Word Scramble
    const renderWordScramble = () => (
      <vstack 
        height="100%" 
        width="100%" 
        gap="medium" 
        alignment="center middle" 
        backgroundColor="#F0F4F8" 
        padding="medium"
      >
        <text 
          size="large" 
          weight="bold" 
          color="#1A365D"
          style={{ marginBottom: '10px' }}
        >
          Word Scramble
        </text>
        <vstack gap="small" alignment="center middle" width="100%">
          <hstack gap="small" alignment="center middle" width="100%" wrap={true}>
            {scrambledLetters.map((letter, index) => (
              <button 
                key={`scramble-${index}`}
                appearance="secondary"
                onPress={() => {
                  const newScrambledLetters = [...scrambledLetters];
                  const newSelectedLetters = [...selectedLetters, letter];
                  newScrambledLetters.splice(newScrambledLetters.indexOf(letter), 1);
                  setScrambledLetters(newScrambledLetters);
                  setSelectedLetters(newSelectedLetters);
                }}
                style={{ 
                  backgroundColor: '#3182CE', 
                  color: 'white',
                  borderRadius: '8px',
                  margin: '4px'
                }}
              >
                {letter}
              </button>
            ))}
          </hstack>
          <hstack gap="small" alignment="center middle" width="100%" wrap={true}>
            {selectedLetters.map((letter, index) => (
              <button 
                key={`selected-${index}`}
                appearance="secondary"
                onPress={() => {
                  const newSelectedLetters = [...selectedLetters];
                  const newScrambledLetters = [...scrambledLetters, letter];
                  newSelectedLetters.splice(newSelectedLetters.indexOf(letter), 1);
                  setScrambledLetters(newScrambledLetters);
                  setSelectedLetters(newSelectedLetters);
                }}
                style={{ 
                  backgroundColor: '#38A169', 
                  color: 'white',
                  borderRadius: '8px',
                  margin: '4px'
                }}
              >
                {letter}
              </button>
            ))}
          </hstack>
        </vstack>
        <vstack gap="small" alignment="center middle" width="100%">
          <button 
            appearance="primary"
            onPress={() => {
              if (selectedLetters.join('') === scrambleWord) {
                setScrambleScore(scrambleScore + 1);
                startWordScramble();
              } else {
                _context.ui.showToast('Incorrect! Try again.');
              }
            }}
            style={{ 
              backgroundColor: '#D69E2E', 
              borderRadius: '12px',
              padding: '12px',
              width: '60%'
            }}
          >
            Check Word
          </button>
          <text 
            color="#1A365D" 
            weight="bold"
          >
            {`Score: ${scrambleScore}`}
          </text>
          <button 
            appearance="secondary"
            onPress={() => setCurrentGame('menu')}
            style={{ 
              borderColor: '#4A5568',
              borderRadius: '12px',
              padding: '8px',
              width: '40%'
            }}
          >
            Back to Menu
          </button>
        </vstack>
      </vstack>
    );

    // Render Hangman
    const renderHangman = () => {
      const displayWord = hangmanWord.split('').map(
        letter => guessedLetters.includes(letter) ? letter : '_'
      ).join(' ');

      return (
        <vstack 
          height="100%" 
          width="100%" 
          gap="medium" 
          alignment="center middle" 
          backgroundColor="#F0F4F8" 
          padding="medium"
        >
          <text 
            size="large" 
            weight="bold" 
            color="#1A365D"
            style={{ marginBottom: '10px' }}
          >
            Hangman
          </text>
          <text size="medium" color="#1A365D">{displayWord}</text>
          <text color="#1A365D">{`Attempts Remaining: ${remainingAttempts}`}</text>
          <hstack gap="small" alignment="center middle" wrap={true}>
            {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
              <button
                key={letter}
                appearance={guessedLetters.includes(letter) ? 'secondary' : 'primary'}
                onPress={() => {
                  if (hangmanWord.includes(letter)) {
                    setGuessedLetters([...guessedLetters, letter]);
                  } else {
                    setRemainingAttempts(remainingAttempts - 1);
                  }
                }}
                disabled={guessedLetters.includes(letter)}
                style={{ 
                  backgroundColor: guessedLetters.includes(letter) ? '#CBD5E0' : '#3182CE', 
                  color: 'white',
                  borderRadius: '8px',
                  margin: '4px'
                }}
              >
                {letter}
              </button>
            ))}
          </hstack>
          <button 
            appearance="secondary"
            onPress={() => setCurrentGame('menu')}
            style={{ 
              borderColor: '#4A5568',
              borderRadius: '12px',
              padding: '8px',
              width: '40%'
            }}
          >
            Back to Menu
          </button>
        </vstack>
      );
    };

    // Render Typing Challenge
    const renderTypingChallenge = () => (
      <vstack 
        height="100%" 
        width="100%" 
        gap="medium" 
        alignment="center middle" 
        backgroundColor="#F0F4F8" 
        padding="medium"
      >
        <text 
          size="large" 
          weight="bold" 
          color="#1A365D"
          style={{ marginBottom: '10px' }}
        >
          Typing Challenge
        </text>
        <text size="medium" color="#1A365D">{typingTarget}</text>
        <text color="#1A365D">Accuracy: {typingAccuracy}%</text>
        <button 
          appearance="secondary"
          onPress={() => setCurrentGame('menu')}
          style={{ 
            borderColor: '#4A5568',
            borderRadius: '12px',
            padding: '8px',
            width: '40%'
          }}
        >
          Back to Menu
        </button>
      </vstack>
    );
    
    // Render Word Search
    const renderWordSearch = () => (
      <vstack 
        height="100%" 
        width="100%" 
        gap="medium" 
        alignment="center middle" 
        backgroundColor="#F0F4F8" 
        padding="medium"
      >
        <text 
          size="large" 
          weight="bold" 
          color="#1A365D"
          style={{ marginBottom: '10px' }}
        >
          Word Search
        </text>
        <vstack gap="small" alignment="center middle">
          {wordSearchGrid.map((row, rowIndex) => (
            <hstack key={`row-${rowIndex}`} gap="small" alignment="center middle">
              {row.map((cell, colIndex) => (
                <button
                  key={`cell-${rowIndex}-${colIndex}`}
                  appearance={
                    selectedCells.some(c => c.row === rowIndex && c.col === colIndex) 
                      ? 'primary' 
                      : 'secondary'
                  }
                  onPress={() => {
                    const cellCoords = { row: rowIndex, col: colIndex };
                    setSelectedCells([...selectedCells, cellCoords]);
                  }}
                  style={{ 
                    backgroundColor: selectedCells.some(c => c.row === rowIndex && c.col === colIndex) ? '#3182CE' : '#CBD5E0', 
                    color: 'white',
                    borderRadius: '8px',
                    margin: '4px'
                  }}
                >
                  {cell}
                </button>
              ))}
            </hstack>
          ))}
        </vstack>
        <button 
          appearance="secondary"
          onPress={() => setCurrentGame('menu')}
          style={{ 
            borderColor: '#4A5568',
            borderRadius: '12px',
            padding: '8px',
            width: '40%'
          }}
        >
          Back to Menu
        </button>
      </vstack>
    );

    // Main Render
    return (
      <vstack 
        height="100%" 
        width="100%" 
        alignment="center middle"
        backgroundColor="#F0F4F8"
      >
        {currentGame === 'menu' && renderMenu()}
        {currentGame === 'wordScramble' && renderWordScramble()}
        {currentGame === 'hangman' && renderHangman()}
        {currentGame === 'typingChallenge' && renderTypingChallenge()}
        {currentGame === 'wordSearch' && renderWordSearch()}
      </vstack>
    );
  },
});

export default Devvit;