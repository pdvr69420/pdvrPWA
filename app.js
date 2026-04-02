// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('SW Registered'))
      .catch(err => console.log('SW Registration Failed', err));
  });
}

let db;
const request = indexedDB.open('PWA_TaskDB', 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;
  displayTasks();
};

// CRUD: Create
function addTask() {
  const input = document.getElementById('taskInput');
  if (!input.value) return;

  const transaction = db.transaction(['tasks'], 'readwrite');
  const store = transaction.objectStore('tasks');
  store.add({ text: input.value });

  transaction.oncomplete = () => {
    input.value = '';
    displayTasks();
  };
}

// CRUD: Read
function displayTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  const transaction = db.transaction('tasks', 'readonly');
  const store = transaction.objectStore('tasks');
  store.getAll().onsuccess = (e) => {
    e.target.result.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${task.text}</span>
        <button onclick="deleteTask(${task.id})">Delete</button>
      `;
      list.appendChild(li);
    });
  };
}

// CRUD: Delete
function deleteTask(id) {
  const transaction = db.transaction(['tasks'], 'readwrite');
  transaction.objectStore('tasks').delete(id);
  transaction.oncomplete = displayTasks;
}
