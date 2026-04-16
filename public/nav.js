// nav.js — shared navigation injected into every page
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const current = window.location.pathname.replace('/', '') || 'index';
  const links = [
    { href: '/index',      label: '🏠 Home'       },
    { href: '/donors',     label: '🩸 Donors'      },
    { href: '/requests',   label: '📋 Requests'    },
    { href: '/stock',      label: '🏦 Blood Stock' },
    { href: '/hospitals',  label: '🏥 Hospitals'   },
    { href: '/camps',      label: '⛺ Camps'       },
    { href: '/volunteers', label: '🙋 Volunteers'  },
    { href: '/feedback',   label: '💬 Feedback'    },
    { href: '/history',    label: '📜 History'     },
  ];
  nav.innerHTML = `
    <a class="logo" href="/index">🩸 BloodBank <span>Management System</span></a>
    <div class="nav-links">
      ${links.map(l => `<a href="${l.href}" class="${current === l.href.replace('/','') ? 'active' : ''}">${l.label}</a>`).join('')}
    </div>
  `;
});

// Shared helper: show message
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg ' + type;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

// Shared helper: render table
function makeTable(headers, rows, emptyMsg = 'No records found.') {
  if (!rows.length) return `<p class="empty">${emptyMsg}</p>`;
  return `<div class="table-wrap"><table>
    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
    ${rows.join('')}
  </table></div>`;
}