export function Header() {
  return (
    <header className="header">
      <a className="header__mark" href="#top">
        The Book
      </a>

      <nav className="header__nav" aria-label="Primary">
        <a href="#episodes">Episodes</a>
        <a href="#timeline">Timeline</a>
        <a href="#about">About</a>
      </nav>

      <div className="header__meta">
        <span className="header__ep">Ep. 04</span>
        <button type="button" className="header__menu">
          <span className="header__menu-label">Menu</span>
          <span className="header__menu-glyph" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>
    </header>
  );
}
