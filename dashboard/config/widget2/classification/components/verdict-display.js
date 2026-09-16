/**
 * The verdict display
 */

export function createVerdictDisplay() {
  const verdictEl = document.getElementById("verdict");
  const barYes = document.getElementById("bar-yes");
  const barNo = document.getElementById("bar-no");
  const pctYes = document.getElementById("pct-yes");
  const pctNo = document.getElementById("pct-no");

  return {
    update(pYes) {
      const yesPct = Math.round(pYes * 100);
      const noPct = 100 - yesPct;

      barYes.style.width = `${pYes * 100}%`;
      barNo.style.width = `${(1 - pYes) * 100}%`;
      pctYes.textContent = `${yesPct}%`;
      pctNo.textContent = `${noPct}%`;

      const yes = pYes >= 0.5;
      verdictEl.textContent = yes ? "Yes" : "No";
      verdictEl.className = `verdict ${yes ? "yes" : "no"}`;
    },
  };
}
