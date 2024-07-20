// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mysql = require("mysql2");

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "express",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Fungsi untuk membuat jendela
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");
}

// Menangani CRUD Operations
ipcMain.handle("fetch-data", async () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users", (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
});

ipcMain.handle("add-data", async (event, data) => {
  return new Promise((resolve, reject) => {
    db.query("INSERT INTO user SET ?", data, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
});

ipcMain.handle("update-data", async (event, data) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE user SET ? WHERE id = ?",
      [data, data.id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
});

ipcMain.handle("delete-data", async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM user WHERE id = ?", [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
