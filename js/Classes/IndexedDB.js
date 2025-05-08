class IndexedDB {
    constructor(db) {
        this.DBName = db;
    }


    createTable(TABLES) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DBName, TABLES.version);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;

                for (let TBName in TABLES) {
                    if (TBName !== 'version') {
                        const config = TABLES[TBName];

                        if (!db.objectStoreNames.contains(TBName)) {
                            let objectStore = db.createObjectStore(TBName, {
                                keyPath: config.primaryKey
                            });
                            let { indices = [] } = config;
                            // Add '_timestamp_' to indices
                            indices.push({ name: '_timestamp_', unique: false });
                            config.indices = indices;

                            // Create additional indices
                            config.indices.forEach(index => {
                                objectStore.createIndex(index.name, index.name, { unique: index.unique });
                            });
                        }
                    }
                }
            };

            request.onsuccess = function (event) {
                event.target.result.close();
                resolve('Database initialized/updated successfully');
            };

            request.onerror = function (event) {
                reject('Error in initializing/updating database: ' + event.target.errorCode);
            };
        });
    }

    recreateTables(TABLES) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DBName, TABLES.version);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;

                // Delete existing object stores
                Array.from(db.objectStoreNames).forEach(storeName => {
                    db.deleteObjectStore(storeName);
                });

                // Create new object stores
                for (let TBName in TABLES) {
                    if (TBName !== 'version') {
                        const config = TABLES[TBName];
                        let objectStore = db.createObjectStore(TBName, {
                            keyPath: config.primaryKey
                        });
                        let { indices = [] } = config;
                        // Add '_timestamp_' to indices
                        indices.push({ name: '_timestamp_', unique: false });
                        config.indices = indices;

                        // Create indices
                        config.indices.forEach(index => {
                            objectStore.createIndex(index.name, index.name, { unique: index.unique });
                        });
                    }
                }
            };

            request.onsuccess = function (event) {
                event.target.result.close();
                resolve('Database recreated successfully');
            };

            request.onerror = function (event) {
                resolve('Error in recreating database: ' + event.target.errorCode);
            };
        });
    }


    get(TBName, primeryKey) {
        return new Promise(async (res, rej) => {
            if (!primeryKey) res(false);
            var request = indexedDB.open(this.DBName);
            request.onsuccess = function (e) {
                let database = e.target.result;
                let transaction = database.transaction([TBName]);
                let objectStore = transaction.objectStore(TBName);
                let read = objectStore.get(primeryKey);
                read.onerror = function (event) {
                    res("Unable to retrieve data from database!");
                };

                read.onsuccess = function (event) {
                    if (read.result) {
                        res(read.result);
                    } else {
                        res(false);
                    }
                };
                database.close();
            }
            request.onerror = event => res("Unable to retrieve from database!");

        });
    }

    matches(cursorValue, key, filter) {
        if (Array.isArray(filter)) {
            return filter.includes(cursorValue[key]);
        }
        if (typeof filter === 'object' && filter !== null) {
            if (filter.operator && filter.value !== undefined) {
                switch (filter.operator) {
                    case '=':
                        return cursorValue[key] == filter.value;
                    case '!=':
                        return cursorValue[key] != filter.value;
                    case '>':
                        return cursorValue[key] > filter.value;
                    case '<':
                        return cursorValue[key] < filter.value;
                    case '>=':
                        return cursorValue[key] >= filter.value;
                    case '<=':
                        return cursorValue[key] <= filter.value;
                    case 'LIKE':
                        return cursorValue[key].toLowerCase().includes(filter.value.toLowerCase());
                    case 'IN':
                        if (Array.isArray(filter.value)) {
                            return filter.value.includes(cursorValue[key]);
                        }
                        return false;
                    case 'BETWEEN': // Handle the 'BETWEEN' operator
                        if (Array.isArray(filter.value) && filter.value.length === 2) {
                            let [min, max] = filter.value;
                            min = parseDate(min);
                            max = parseDate(max);
                            let value = parseDate(cursorValue[key]);
                            return value >= min && value <= max;
                        }
                        return false;
                    case "INCLUDES":
                        if (Array.isArray(cursorValue[key])) {
                            let value = filter.value;
                            if (!Array.isArray(value)) value = [value];

                            return value.some(v => cursorValue[key].includes(v));
                        }
                        return false;
                    default:
                        return false;
                }
            }
        }
        // Default to equality check if filter is not an object
        return cursorValue[key] == filter;
    }

    // Get Data from table by filters
    get_(tableName, filters = {}, options = {}) {
        let self = this;

        // Extract offset, limit, and order from options, with defaults
        let { offset = null, limit = null, order = 'asc' } = options;
        let fetchDeleted = options.fetchDeleted || false;

        return new Promise(async (resolve, reject) => {
            if (!tableName.length) reject('Table Name is required');

            var request = indexedDB.open(this.DBName);

            request.onsuccess = function (e) {
                var database = e.target.result;
                if (!database.objectStoreNames.contains(tableName)) {
                    resolve([]);
                    return false;
                }
                var transaction = database.transaction([tableName], 'readonly');
                var store = transaction.objectStore(tableName);
                var index = store.index('_timestamp_');

                var resultData = [];
                let skippedRecords = 0;

                // Set cursor direction based on the order option
                var cursorDirection = order === 'desc' ? 'prev' : 'next';

                index.openCursor(null, cursorDirection).onsuccess = function (event) {
                    var cursor = event.target.result;

                    if (!cursor) {
                        resolve(resultData);
                        return;
                    }

                    // Filtering logic
                    let matchesFilter = true;
                    for (let key in filters) {
                        if (!self.matches(cursor.value, key, filters[key])) {
                            matchesFilter = false;
                            break;
                        }
                    }
                    if (matchesFilter) {
                        if (offset > skippedRecords) {
                            skippedRecords++;
                            cursor.continue();
                            return;
                        } else if (limit === null || resultData.length < limit) {
                            if (!fetchDeleted && cursor.value.is_deleted == 1) {
                                cursor.continue();
                                return;
                            }
                            resultData.push(cursor.value);
                        }
                    }

                    cursor.continue();
                };

                store.openCursor().onerror = function (event) {
                    console.log(event.target.error);
                    resolve([]);
                };
            };
        });
    }

    // Get one
    get_one(tableName, filters = {}, options = {}) {
        return new Promise(async (res, rej) => {
            let result = await this.get_(tableName, filters, options);
            if (result.length) res(result[0]);
            else res(false);
        });
    }

    // get count of records
    count(tableName, filters = {}) {
        let self = this;
        return new Promise(async (res, rej) => {
            self.get_(tableName, filters).then(data => {
                res(data.length);
            }).catch(() => {
                res(0);
            });
        });
    }

    insert(TBName, obj, primeryKey = 'id') {
        if (!obj[primeryKey]) return true;
        return new Promise(async (res, rej) => {
            let DBName = this.DBName;
            let request = indexedDB.open(DBName);
            request.onsuccess = function (e) {
                var database = e.target.result;
                if (!database.objectStoreNames.contains(TBName)) {
                    res(false);
                    return false;
                }
                obj._timestamp_ = new Date().getTime();
                var add = database.transaction([TBName], "readwrite").objectStore(TBName).put(obj);
                add.onsuccess = event => res(true);
                add.onerror = event => rej("Unable to add data records");
                database.close();
            };
        });
    }

    removeTable(primeryKey, TBName) {
        let DBName = this.DBName;
        let request = indexedDB.open(DBName);
        request.onsuccess = function (e) {
            var database = e.target.result;
            var remove = database.transaction([TBName], "readwrite").objectStore(TBName).delete(primeryKey);
            remove.onsuccess = event => console.log("record entry has been removed from your database.");
            database.close();
        };
    }

    delete(storeName, id = null, column = 'id') {
        return new Promise((res, rej) => {
            let request = indexedDB.open(this.DBName);
            request.onsuccess = function (e) {
                let database = e.target.result;
                let transaction = database.transaction([storeName], 'readwrite');
                let objectStore = transaction.objectStore(storeName);

                // If primaryKey is specified, use delete method
                if (!id || id == undefined || column == undefined) rej("Invalid parameters provided.");
                if (column === 'id') {
                    request = objectStore.delete(id);
                    request.onsuccess = function () {
                        res(true);
                    };
                    request.onerror = rej;
                } else {
                    // If condition is provided, use index on productId to delete matching records
                    let index = objectStore.index(column);
                    let request = index.openCursor(IDBKeyRange.only(id));

                    request.onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            objectStore.delete(cursor.primaryKey);
                            cursor.continue();
                        } else {
                            res(true);
                        }
                    };

                    request.onerror = rej;
                }
            };
        });
    }

    // Clear table
    truncate(tableName) {
        return new Promise((res, rej) => {
            let request = indexedDB.open(this.DBName);
            request.onsuccess = function (e) {
                let database = e.target.result;
                // Check if table not found
                if (!Object.values(database.objectStoreNames).includes(tableName)) {
                    res(true);
                    return true;
                }
                let transaction = database.transaction([tableName], 'readwrite');
                let objectStore = transaction.objectStore(tableName);
                let request = objectStore.clear();
                request.onsuccess = (e) => {
                    res(true);
                };
                request.onerror = res(false);
            };
        });
    }

    // Update Db records
    update(tableName, data, condition) {
        return new Promise(async (resolve, rej) => {

            let res = await this.insert(tableName, { ...data, ...condition });
            resolve(res);
        });
    }
    // Check if action can be done
    is(action) {
        return true;
        let data = localStorage.getItem("nbIndex_" + action);
        if (data) return false;
        localStorage.setItem("nbIndex_" + action, true);
        return true;
    }
    // Get setting
    get_setting(key) {
        return new Promise(async (res, rej) => {
            let result = await this.get_one('settings', { id: key });
            if (result) res(result.value);
            else res(false);
        });
    }
    // Save setting
    save_setting(key, value) {
        return new Promise(async (res, rej) => {
            let result = await this.insert('settings', { id: key, value: value });
            if (result) res(result);
            else res(false);
        });
    }

}

// Init TCIndexedDB
const DB = new IndexedDB("shirt_editor");


$(document).ready(async () => {
    const TABLES = {
        version: 10,
        templates: {
            primaryKey: 'id',
        },
    };

    // Create tables
    await DB.recreateTables(TABLES);
    $("body").trigger('dbready');
});
