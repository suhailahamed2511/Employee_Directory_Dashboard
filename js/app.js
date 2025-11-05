let currentSearch = '';
let currentDept = 'All';
let viewMode = 'cards';

const cardsView = qs('#cardsView');
const tableView = qs('#tableView');
const employeeTableBody = qs('#employeeTable tbody');
const searchInput = qs('#searchInput');
const deptFilter = qs('#deptFilter');
const summaryRow = qs('#summaryRow');
const emptyState = qs('#emptyState');
const exportBtn = qs('#exportBtn');

const employeeModalEl = qs('#employeeModal');
const employeeModal = new bootstrap.Modal(employeeModalEl, {keyboard:true});
const modalTitle = qs('#modalTitle');
const employeeForm = qs('#employeeForm');
const employeeIdInput = qs('#employeeId');
const nameInput = qs('#name');
const departmentInput = qs('#department');
const emailInput = qs('#email');
const phoneInput = qs('#phone');
const designationInput = qs('#designation');
const joiningDateInput = qs('#joiningDate');
const profileImageInput = qs('#profileImageInput');
const imagePreview = qs('#imagePreview');
const removeImageBtn = qs('#removeImageBtn');

let currentImageData = null;

function init(){
  if (typeof seedDemoData === 'function') seedDemoData();
  bindEvents();
  render();
}

function bindEvents(){
  searchInput.addEventListener('input', (e)=>{ currentSearch = e.target.value; render(); });
  deptFilter.addEventListener('change', (e)=>{ currentDept = e.target.value; render(); });
  qs('#viewCardsBtn').addEventListener('click', ()=>{ setView('cards'); });
  qs('#viewTableBtn').addEventListener('click', ()=>{ setView('table'); });
  qs('#addEmployeeBtn').addEventListener('click', ()=>{ openAddModal(); });
  if (profileImageInput) profileImageInput.addEventListener('change', handleImageInput);
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      currentImageData = null;
      if (imagePreview) {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
      }
      if (profileImageInput) profileImageInput.value = '';
      removeImageBtn.style.display = 'none';
    });
  }
  if (employeeForm) employeeForm.addEventListener('submit', handleFormSubmit);
  if (exportBtn) exportBtn.addEventListener('click', ()=>{
    const all = loadEmployees();
    if(all.length===0){ showToast('No employees to export', 'Warning'); return; }
    const exportData = all.map(e => ({
      id: e.id,
      name: e.name,
      department: e.department,
      designation: e.designation || '',
      email: e.email || '',
      phone: e.phone || '',
      joiningDate: e.joiningDate || ''
    }));
    const csv = toCSV(exportData);
    downloadFile('employees.csv', csv);
    showToast('Export started', 'Export');
  });
}

function handleImageInput(e){
  const file = e.target.files && e.target.files[0];
  if(!file){
    currentImageData = null;
    if (imagePreview) { imagePreview.style.display='none'; imagePreview.src=''; }
    if (removeImageBtn) removeImageBtn.style.display = 'none';
    return;
  }
  if(file.size > 200 * 1024){ alert('Please choose an image smaller than 200 KB'); profileImageInput.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function(ev){
    currentImageData = ev.target.result;
    if (imagePreview) {
      imagePreview.src = currentImageData;
      imagePreview.style.display = 'inline-block';
    }
    if (removeImageBtn) removeImageBtn.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

function handleFormSubmit(e){
  e.preventDefault();
  const name = nameInput.value.trim();
  const dept = departmentInput.value;
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const designation = designationInput.value.trim();
  const joiningDate = joiningDateInput.value || '';
  let isValid = true;
  if(!name){ nameInput.classList.add('is-invalid'); isValid = false; } else { nameInput.classList.remove('is-invalid'); }
  if(email && !isValidEmail(email)){ emailInput.classList.add('is-invalid'); isValid = false; } else { emailInput.classList.remove('is-invalid'); }
  if(phone && !isValidPhone(phone)){ phoneInput.classList.add('is-invalid'); isValid = false; } else { phoneInput.classList.remove('is-invalid'); }
  if(!isValid) { showToast('Please fix validation errors', 'Validation'); return; }
  const id = employeeIdInput.value;
  if(id){
    updateEmployee(id, { name, department:dept, email, phone, designation, joiningDate, profileImage: currentImageData });
    showToast('Employee updated', 'Saved');
  } else {
    const emp = { id: generateId(), name, department:dept, email, phone, designation, joiningDate, profileImage: currentImageData };
    const arr = loadEmployees(); arr.push(emp); saveEmployees(arr);
    showToast('Employee added', 'Saved');
  }
  employeeModal.hide();
  resetModal();
  render();
}

function openAddModal(){
  modalTitle.textContent = 'Add Employee';
  employeeIdInput.value = '';
  resetModal();
  setTimeout(()=> nameInput.focus(), 200);
}

function resetModal(){
  if (employeeForm) employeeForm.reset();
  currentImageData = null;
  if (imagePreview) { imagePreview.src=''; imagePreview.style.display='none'; }
  if (profileImageInput) profileImageInput.value = '';
  if (removeImageBtn) removeImageBtn.style.display = 'none';
  qsa('.is-invalid').forEach(el=>el.classList.remove('is-invalid'));
}

function openEditModal(id){
  const arr = loadEmployees();
  const emp = arr.find(e=>e.id===id);
  if(!emp) return showToast('Employee not found', 'Error');
  modalTitle.textContent = 'Edit Employee';
  employeeIdInput.value = emp.id;
  nameInput.value = emp.name || '';
  departmentInput.value = emp.department || 'HR';
  emailInput.value = emp.email || '';
  phoneInput.value = emp.phone || '';
  designationInput.value = emp.designation || '';
  joiningDateInput.value = emp.joiningDate || '';
  currentImageData = emp.profileImage || null;
  if(currentImageData){
    if (imagePreview) { imagePreview.src = currentImageData; imagePreview.style.display='inline-block'; }
    if (removeImageBtn) removeImageBtn.style.display = 'inline-block';
  } else {
    if (imagePreview) { imagePreview.style.display='none'; imagePreview.src=''; }
    if (removeImageBtn) removeImageBtn.style.display = 'none';
  }
  employeeModal.show();
}

function updateEmployee(id, updated){
  const arr = loadEmployees();
  const idx = arr.findIndex(e=>e.id===id);
  if(idx===-1) return showToast('Employee not found', 'Error');
  arr[idx] = { ...arr[idx], ...updated };
  saveEmployees(arr);
}

function deleteEmployee(id){
  if(!confirm('Delete this employee?')) return;
  let arr = loadEmployees();
  arr = arr.filter(e=>e.id!==id);
  saveEmployees(arr);
  showToast('Employee deleted', 'Deleted');
  render();
}

function setView(mode){
  viewMode = mode;
  if(mode === 'cards'){
    cardsView.parentElement.style.display = '';
    tableView.style.display = 'none';
  } else {
    cardsView.parentElement.style.display = 'none';
    tableView.style.display = '';
  }
  render();
}

function filterEmployees(){
  const all = loadEmployees();
  const q = currentSearch.trim().toLowerCase();
  return all.filter(e => {
    const matchesText = !q || ((e.name||'').toLowerCase().includes(q) || (e.email||'').toLowerCase().includes(q));
    const matchesDept = currentDept === 'All' || e.department === currentDept;
    return matchesText && matchesDept;
  });
}

function render(){
  const all = loadEmployees();
  const filtered = filterEmployees();
  renderSummary(all);
  if(all.length === 0){ emptyState.style.display = ''; cardsView.innerHTML=''; employeeTableBody.innerHTML=''; return; }
  else { emptyState.style.display = 'none'; }
  renderCards(filtered);
  renderTable(filtered);
}

function renderSummary(all){
  const total = all.length;
  const per = { HR:0, IT:0, Finance:0, Admin:0 };
  all.forEach(e=>{ if(e.department && per.hasOwnProperty(e.department)) per[e.department]++; });
  summaryRow.innerHTML = `
    <div class="col-md-3">
      <div class="card p-3">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0">${total}</h5>
            <small class="small-muted">Total Employees</small>
          </div>
          <div><i class="bi bi-people-fill fs-2 text-primary"></i></div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card p-3">
        <h5 class="mb-0">${per.HR}</h5>
        <small class="small-muted">HR</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card p-3">
        <h5 class="mb-0">${per.IT}</h5>
        <small class="small-muted">IT</small>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card p-3">
        <h5 class="mb-0">${per.Finance}</h5>
      <small class="small-muted">Finance / Admin</small>
      </div>
    </div>
  `;
}

function renderCards(arr){
  cardsView.innerHTML = '';
  if(arr.length===0){ cardsView.innerHTML = '<div class="col-12 text-center text-muted">No results.</div>'; return; }
  for(const e of arr){
    const col = document.createElement('div'); col.className = 'col-md-4';
    const card = document.createElement('div'); card.className = 'card p-3 card-emp';
    const imgSrc = e.profileImage || 'https://via.placeholder.com/120?text=Avatar';
    card.innerHTML = `
      <div class="d-flex gap-3">
        <img src="${imgSrc}" alt="${e.name}" class="profile-avatar shadow-sm" />
        <div class="flex-grow-1">
          <h5 class="mb-1">${e.name}</h5>
          <div class="small-muted">${e.department} • ${e.designation || ''}</div>
          <div class="mt-2 small">${e.email || ''}</div>
        </div>
      </div>
      <div class="mt-3 d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${e.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${e.id}">Delete</button>
      </div>
    `;
    col.appendChild(card);
    cardsView.appendChild(col);
  }
  qsa('button[data-action="edit"]', cardsView).forEach(btn => btn.addEventListener('click', ()=> openEditModal(btn.dataset.id)));
  qsa('button[data-action="delete"]', cardsView).forEach(btn => btn.addEventListener('click', ()=> deleteEmployee(btn.dataset.id)));
}

function renderTable(arr){
  employeeTableBody.innerHTML = '';
  if(arr.length===0){ employeeTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No results.</td></tr>'; return; }
  for(const e of arr){
    const tr = document.createElement('tr');
    const imgSrc = e.profileImage || 'https://via.placeholder.com/64?text=Avatar';
    tr.innerHTML = `
      <td><img src="${imgSrc}" alt="${e.name}" class="profile-avatar" style="width:48px;height:48px" /></td>
      <td>${e.name}</td>
      <td>${e.department}</td>
      <td>${e.designation || ''}</td>
      <td>${e.email || ''}</td>
      <td>${e.phone || ''}</td>
      <td>${formatDate(e.joiningDate)}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${e.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${e.id}">Delete</button>
        </div>
      </td>
    `;
    employeeTableBody.appendChild(tr);
  }
  qsa('button[data-action="edit"]', employeeTableBody).forEach(btn => btn.addEventListener('click', ()=> openEditModal(btn.dataset.id)));
  qsa('button[data-action="delete"]', employeeTableBody).forEach(btn => btn.addEventListener('click', ()=> deleteEmployee(btn.dataset.id)));
}

init();
