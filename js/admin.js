// Secure Admin Logic with Silent Decryption
const SECRET_KEY = "hw2nQV69@uXb8aV@66S@4d&3*5!%MNdLPMd^fWiqJ9g#u52cgEEH2AY9%u*36zucSxt3msBSkt7Zw3oi!x7i@acJDcHNuB*zM$H*$4u7JaWi%7K4DiwD8$Yxa5DmDj6z";

let projectsData = [];
let positionsData = [];
let certsData = [];
let recsData = [];
let eduData = [];

const datasets = {
    'projects': () => projectsData,
    'positions': () => positionsData,
    'certs': () => certsData
};

function decrypt(encObj) {
    if (!encObj || !encObj.ct || !encObj.iv) return [];
    try {
        const key = CryptoJS.SHA256(SECRET_KEY);
        const iv = CryptoJS.enc.Base64.parse(encObj.iv);
        const ciphertext = CryptoJS.enc.Base64.parse(encObj.ct);
        
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        return result ? JSON.parse(result) : null;
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
}

// Auto-run decryption on load
window.addEventListener('load', () => {
    silentLogin();
});

function silentLogin() {
    projectsData = decrypt(projectsDataEnc) || [];
    positionsData = decrypt(positionsDataEnc) || [];
    certsData = decrypt(certsDataEnc) || [];
    recsData = decrypt(recsDataEnc) || [];
    eduData = decrypt(eduDataEnc) || [];

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    initAdmin();
}

// Global state tracking for editor
let activeDatasetKey = '';
let activeRowIndex = -1;

function initAdmin() {
    renderTable('projects', projectsData);
    renderTable('positions', positionsData);
    renderTable('certs', certsData);
}

function getHeaders(dataArray) {
    if (!dataArray || dataArray.length === 0) return [];
    return Object.keys(dataArray[0]);
}

function renderTable(tableId, data) {
    const tableEl = document.getElementById(`${tableId}-table`);
    if (!data || data.length === 0) {
        tableEl.innerHTML = '<tr><td>No data available.</td></tr>';
        return;
    }

    const headers = getHeaders(data);
    let html = '<thead><tr>';
    headers.forEach(h => { html += `<th>${h}</th>`; });
    html += '<th class="text-end">Actions</th></tr></thead><tbody>';

    data.forEach((row, rowIndex) => {
        html += '<tr>';
        headers.forEach(h => {
            let val = row[h] || '';
            if (typeof val === 'string' && val.length > 40) val = val.substring(0, 40) + '...';
            html += `<td>${val}</td>`;
        });
        html += `
            <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openModal('${tableId}', ${rowIndex})"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('${tableId}', ${rowIndex})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    });
    html += '</tbody>';
    tableEl.innerHTML = html;
}

function openModal(datasetKey, rowIndex = -1) {
    activeDatasetKey = datasetKey;
    activeRowIndex = rowIndex;
    const data = datasets[datasetKey]();
    const headers = getHeaders(data);
    let rowData = {};

    if (rowIndex >= 0) {
        rowData = data[rowIndex];
        document.getElementById('modal-title').innerText = `Edit Entry`;
    } else {
        document.getElementById('modal-title').innerText = `Add New Entry`;
        headers.forEach(h => rowData[h] = ''); 
    }

    let formHtml = '<form id="edit-form">';
    headers.forEach(h => {
        formHtml += `<div class="mb-3"><label class="form-label">${h}</label><textarea class="form-control" name="${h}" rows="${h === 'Description' || h === 'Text' ? '3' : '1'}">${rowData[h] || ''}</textarea></div>`;
    });
    formHtml += '</form>';
    document.getElementById('modal-body-form').innerHTML = formHtml;
    new bootstrap.Modal(document.getElementById('editModal')).show();
}

function saveModalChanges() {
    const form = document.getElementById('edit-form');
    const formData = new FormData(form);
    const data = datasets[activeDatasetKey]();
    const headers = getHeaders(data);
    let updatedRow = {};
    headers.forEach(h => { updatedRow[h] = formData.get(h) || ''; });

    if (activeRowIndex >= 0) data[activeRowIndex] = updatedRow;
    else data.unshift(updatedRow); 

    renderTable(activeDatasetKey, data);
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
}

function deleteRow(datasetKey, rowIndex) {
    if (confirm('Are you sure? Save changes by downloading CSV.')) {
        datasets[datasetKey]().splice(rowIndex, 1);
        renderTable(datasetKey, datasets[datasetKey]());
    }
}

function exportCSV(datasetKey, filename) {
    const data = datasets[datasetKey]();
    if (!data || data.length === 0) return alert('No data to export.');
    const csvString = Papa.unparse(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Downloaded ${filename}!\n\nMove to Root and run 'update_data.bat'.`);
}
