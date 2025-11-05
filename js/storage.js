const STORAGE_KEY = 'employeeDirectory_v1';

function loadEmployees(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw);
  }catch(e){
    console.error('Failed to parse employees from localStorage', e);
    return [];
  }
}

function saveEmployees(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function generateId(){
  return 'emp_' + Date.now();
}

function seedDemoData(){
  const cur = loadEmployees();
  if(cur.length > 0) return;
  const demo = [
    { id: generateId(), name: 'Asha Patel', department: 'IT', email: 'asha.patel@example.com', phone: '9876501234', designation: 'Frontend Dev', joiningDate: '2023-02-15', profileImage: null },
    { id: generateId(), name: 'Ravi Kumar', department: 'HR', email: 'ravi.kumar@example.com', phone: '9876505678', designation: 'HR Manager', joiningDate: '2022-11-01', profileImage: null },
    { id: generateId(), name: 'Neha Singh', department: 'Finance', email: 'neha.singh@example.com', phone: '9876509999', designation: 'Accountant', joiningDate: '2021-09-23', profileImage: null }
  ];
  saveEmployees(demo);
}
