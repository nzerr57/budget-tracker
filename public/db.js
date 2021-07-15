let db;
let budgetVersion;

// Creates a new requrest for budgetdb
const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
  db = e.target.result;

  db.createObjectStore('BudgetStore', { autoIncrement: true });

};

request.onerror = function (e) {
  console.log(error);
};

function checkDatabase() {
  console.log('check db invoked');

  // Open a transaction on BudgetStore db
  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Accesses BudgetStore object
  const store = transaction.objectStore('BudgetStore');

  // Retrieves all variables from store and sets to getAll variable
  const getAll = store.getAll();

  // If request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we bulk add them when back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            transaction = db.transaction(['BudgetStore'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('BudgetStore');

            // Clear existing entries because bulk add was successful
            currentStore.clear();
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Access BudgetStore object store
  const store = transaction.objectStore('BudgetStore');

  // Add record to store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
