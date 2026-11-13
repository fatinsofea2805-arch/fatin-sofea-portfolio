let savedTheme;
try {
  savedTheme = localStorage.getItem('fatin-portfolio-theme');
} catch {
  savedTheme = null;
}
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
