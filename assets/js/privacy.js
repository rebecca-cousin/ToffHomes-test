function switchTab(tab, btn) {
  document.querySelectorAll('.policy-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.policy-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  btn.classList.add('active');
}
