export function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Climatora. Built for sustainable impact.</p>
      <div className="footer-links">
        <a href="https://github.com/krishnakatekhaye10/carbon" target="_blank" rel="noreferrer">GitHub</a>
        <a href="/carbon/robots.txt">Robots</a>
        <a href="/carbon/sitemap.xml">Sitemap</a>
      </div>
    </footer>
  );
}
