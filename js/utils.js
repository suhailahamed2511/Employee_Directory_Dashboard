function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function formatDate(iso){
  if(!iso) return '';
  try{ const d = new Date(iso); if(isNaN(d)) return iso; return d.toLocaleDateString(); }catch(e){ return iso; }
}

function isValidEmail(email){
  if(!email) return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone){
  if(!phone) return true; 
  return /^\d{10}$/.test(phone);
}

function toCSV(arr){
  if(!arr || !arr.length) return '';
  const keys = Object.keys(arr[0]);
  const lines = [keys.join(',')];
  for(const row of arr){
    const vals = keys.map(k => '"' + String(row[k] ?? '').replace(/"/g,'""') + '"');
    lines.push(vals.join('\n').includes('\n') ? vals.join(',') : vals.join(','));
  }
  return lines.join('\n');
}

function downloadFile(filename, content, type='text/csv'){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Simple toast helper using Bootstrap toasts
function showToast(message, title='Info', delay=2500){
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
  document.body.appendChild(wrapper);
  const toastEl = wrapper.firstElementChild;
  const toast = new bootstrap.Toast(toastEl, {delay});
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', ()=> wrapper.remove());
}
