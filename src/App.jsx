import { useEffect, useRef, useState } from 'react';
import './confetti.css';

const INITIAL_ROWS = 4;
const REVEAL_DELAY = 5000;

function makeRows(count = INITIAL_ROWS) {
  return Array.from({ length: count }, () => ({ first: '', last: '' }));
}

function getDisplayName(person) {
  return [person.first.trim(), person.last.trim()].filter(Boolean).join(' ');
}

function makeDraw(names) {
  // A random permutation with no fixed points is a derangement: nobody draws themselves.
  // Re-shuffling also guarantees every recipient is assigned exactly once.
  const recipients = [...names];
  do {
    for (let i = recipients.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
    }
  } while (recipients.some((recipient, index) => recipient === names[index]));

  return names.map((giver, index) => ({ giver, recipient: recipients[index] }));
}

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 44 }, (_, index) => (
        <span
          className={`confetti-piece confetti-piece-${index % 8}`}
          key={index}
          style={{ '--piece': index, '--delay': `${(index % 11) * 0.045}s` }}
        />
      ))}
    </div>
  );
}

function App() {
  const [rows, setRows] = useState(makeRows);
  const [error, setError] = useState('');
  const [draw, setDraw] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  const updateRow = (index, field, value) => {
    setRows((current) => current.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
    if (error) setError('');
  };

  const startReveal = (pairings) => {
    window.clearInterval(timerRef.current);
    setDraw(pairings);
    setRevealedCount(0);
    setIsRevealing(true);
    timerRef.current = window.setInterval(() => {
      setRevealedCount((current) => {
        if (current + 1 >= pairings.length) {
          window.clearInterval(timerRef.current);
          setIsRevealing(false);
          return pairings.length;
        }
        return current + 1;
      });
    }, REVEAL_DELAY);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const enteredNames = [];
    for (let index = 0; index < rows.length; index += 1) {
      const first = rows[index].first.trim().replace(/\s+/g, ' ');
      const last = rows[index].last.trim().replace(/\s+/g, ' ');
      if (!first && last) {
        setError(`Please add a first name for row ${index + 1}, or clear its last name.`);
        return;
      }
      if (first) enteredNames.push({ first, last });
    }

    const names = enteredNames.map(getDisplayName);
    if (names.length < 2) {
      setError('Add at least two people to make a Christmas draw.');
      return;
    }

    const normalizedNames = names.map((name) => name.toLocaleLowerCase());
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setError('Every name must be unique. Check for duplicate names and try again.');
      return;
    }

    startReveal(makeDraw(names));
  };

  const handleRedraw = () => startReveal(makeDraw(draw.map((pair) => pair.giver)));

  const handleRestart = () => {
    window.clearInterval(timerRef.current);
    setRows(makeRows());
    setDraw([]);
    setRevealedCount(0);
    setIsRevealing(false);
    setError('');
  };

  const showResults = draw.length > 0 && !isRevealing && revealedCount === draw.length;

  return (
    <main className="page-shell">
      <div className="snow snow-one" aria-hidden="true">❄</div>
      <div className="snow snow-two" aria-hidden="true">✦</div>
      <div className="snow snow-three" aria-hidden="true">❄</div>
      <header className="topline"><span>✦</span> A LITTLE CHRISTMAS MAGIC <span>✦</span></header>

      <section className="card" aria-labelledby="page-title">
        {isRevealing && revealedCount > 0 && <Confetti />}
        <div className="hero-art" aria-hidden="true">
          <span className="hero-star">✦</span>
          <span className="hero-tree tree-left">🎄</span>
          <span className="hero-snowman">☃️</span>
          <span className="hero-gift">🎁</span>
          <span className="hero-tree tree-right">🎄</span>
        </div>
        <h1 id="page-title">The Christmas<br className="mobile-break" /> Name Draw</h1>
        <p className="subtitle">A little surprise, a lot of holiday cheer.</p>

        {draw.length === 0 ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="section-heading">
              <div>
                <h2>Who's joining the fun?</h2>
                <p>Enter each person's name below.</p>
              </div>
              <span className="heading-gift" aria-hidden="true">🎁</span>
            </div>

            <div className="name-list">
              {rows.map((row, index) => (
                <div className="name-row" key={index}>
                  <span className="row-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <label className="visually-hidden" htmlFor={`first-${index}`}>First name, person {index + 1}</label>
                  <input
                    id={`first-${index}`}
                    autoComplete="given-name"
                    placeholder="First name *"
                    value={row.first}
                    onChange={(event) => updateRow(index, 'first', event.target.value)}
                  />
                  <label className="visually-hidden" htmlFor={`last-${index}`}>Last name, person {index + 1} (optional)</label>
                  <input
                    id={`last-${index}`}
                    autoComplete="family-name"
                    placeholder="Last name (optional)"
                    value={row.last}
                    onChange={(event) => updateRow(index, 'last', event.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              className="add-button"
              type="button"
              onClick={() => setRows((current) => [...current, { first: '', last: '' }])}
            >
              <span aria-hidden="true">＋</span> Add another name
            </button>

            {error && <p className="error-message" role="alert">🎄 {error}</p>}

            <button className="primary-button" type="submit">Draw Names <span aria-hidden="true">✨</span></button>
            <p className="privacy-note">Names stay right here in your browser.</p>
          </form>
        ) : (
          <div className="results-area" aria-live="polite">
            {isRevealing ? (
              <>
                <div className="reveal-progress">THE BIG REVEAL <span aria-hidden="true">✨</span></div>
                <p className="reveal-intro">{revealedCount === 0 ? 'The elves are mixing up the names…' : 'And the next lucky pair is…'}</p>
                {revealedCount > 0 && (
                  <div className="pairing-card" key={revealedCount}>
                    <div className="pairing-emoji" aria-hidden="true">🎄</div>
                    <p className="giver-name">{draw[revealedCount - 1].giver}</p>
                    <span className="gets-label">is gifting to</span>
                    <p className="recipient-name">{draw[revealedCount - 1].recipient}</p>
                    <div className="pairing-emoji bottom-emoji" aria-hidden="true">🎁</div>
                  </div>
                )}
                <p className="reveal-count">{revealedCount} of {draw.length} pairings revealed</p>
              </>
            ) : showResults ? (
              <>
                <div className="success-icon" aria-hidden="true">🎅</div>
                <h2 className="results-title">The secret’s out!</h2>
                <p className="results-subtitle">Here are this year’s gift-giving pairs.</p>
                <ul className="final-list">
                  {draw.map(({ giver, recipient }) => (
                    <li className="final-pair" key={giver}>
                      <span className="final-giver">{giver}</span>
                      <span className="pair-arrow" aria-label="gives a gift to">→</span>
                      <span className="final-recipient">{recipient}</span>
                      <span className="pair-gift" aria-hidden="true">🎁</span>
                    </li>
                  ))}
                </ul>
                <div className="result-actions">
                  <button className="primary-button" type="button" onClick={handleRedraw}>Re-Draw <span aria-hidden="true">🔀</span></button>
                  <button className="restart-button" type="button" onClick={handleRestart}>Re-Start <span aria-hidden="true">↻</span></button>
                </div>
                <p className="privacy-note">Keep the list secret until gift day! 🤫</p>
              </>
            ) : null}
          </div>
        )}
      </section>

      <footer className="footer-note">Made with <span aria-label="love">♥</span> and a sprinkle of Christmas magic</footer>
    </main>
  );
}

export default App;
