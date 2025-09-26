let devicesCache = [];

function showLoader(show = true) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
}

// CSRF token pour POST
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}
const CSRF_TOKEN = getCookie('csrftoken');

// Récupère les devices
async function fetchDevices() {
  showLoader(true);
  try {
    const resp = await fetch('/api/devices/');
    devicesCache = await resp.json();

    // Séparer les devices par statut
    const upDevices = devicesCache.filter(device => device.status === 'UP');
    const downDevices = devicesCache.filter(device => device.status === 'DOWN');

    // Diviser les devices UP en deux groupes égaux
    const midPoint = Math.ceil(upDevices.length / 2);
    const upDevices1 = upDevices.slice(0, midPoint);
    const upDevices2 = upDevices.slice(midPoint);

    // Remplir les tableaux UP (divisés en deux groupes)
    fillTable('up1-tbody', upDevices1, 'success');
    fillTable('up2-tbody', upDevices2, 'success');
    
    // Remplir le tableau DOWN (tous les devices DOWN)
    fillTable('down-tbody', downDevices, 'danger');

    // Mettre à jour les compteurs
    document.getElementById('total-count').textContent = devicesCache.length;
    document.getElementById('up-count').textContent = upDevices.length;
    document.getElementById('down-count').textContent = downDevices.length;
    
    // Mettre à jour les badges des tableaux
    document.getElementById('up1-count-badge').textContent = upDevices1.length;
    document.getElementById('up2-count-badge').textContent = upDevices2.length;
    document.getElementById('down-count-badge').textContent = downDevices.length;

    // Mise à jour de l'heure de dernière mise à jour
    const now = new Date();
    document.getElementById('last-update').innerHTML = 
      `<i class="bi bi-clock me-1"></i>Dernière mise à jour: ${now.toLocaleTimeString()}`;
  } catch (err) {
    console.error(err);
  } finally {
    showLoader(false);
  }
}

// Fonction pour remplir un tableau
function fillTable(tbodyId, devices, statusClass) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = '';

  if (devices.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="text-muted text-center">Aucun device</td>`;
    tbody.appendChild(tr);
    return;
  }

  devices.forEach(device => {
    const tr = document.createElement('tr');
    const statusIcon = device.status === 'UP' ? 
      '<div class="status-badge bg-success text-white"><i class="bi bi-check-circle-fill me-1"></i>UP</div>' : 
      '<div class="status-badge bg-danger text-white"><i class="bi bi-x-circle-fill me-1"></i>DOWN</div>';
    
    tr.innerHTML = `
      <td class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <span class="status-indicator status-${device.status.toLowerCase()} me-2"></span>
          <span class="device-name">${device.name}</span>
        </div>
        ${statusIcon}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Fonction pour actualiser manuellement
function refreshData() {
  showLoader(true);
  fetch('/api/devices/update/', { method: 'POST', headers: { 'X-CSRFToken': CSRF_TOKEN } })
    .then(() => fetchDevices());
}

// Mets à jour les devices toutes les 60s
setInterval(async () => {
  showLoader(true);
  await fetch('/api/devices/update/', { method: 'POST', headers: { 'X-CSRFToken': CSRF_TOKEN } });
  fetchDevices();
}, 300000);

// Premier fetch
fetchDevices();


// Export CSV
function exportCSV() {
  let rows = [['Nom','Status']];
  devicesCache.forEach(d=>rows.push([d.name,d.status]));
  let csv = rows.map(r=>r.join(',')).join('\n');
  let blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'devices.csv';
  link.click();
}