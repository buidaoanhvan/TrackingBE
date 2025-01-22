const express = require('express')
const sqlite3 = require('sqlite3');
const app = express()
const port = 3000
const bodyParser = require('body-parser')

// Kết nối đến cơ sở dữ liệu SQLite
const db = new sqlite3.Database('db.sqlite', (err) => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err.message);
    } else {
        console.log('Đã kết nối tới cơ sở dữ liệu SQLite.');
    }
});

// Khởi tạo bảng `locations` nếu chưa có
db.run(
    `CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceName TEXT UNIQUE,
        lat REAL,
        lng REAL
    )`
);

app.use(bodyParser.json({ type: 'application/*+json' }))
app.set('view engine', 'ejs');

app.post('/', (req, res) => {
    const { deviceName, latitude, longitude } = req.body;
    if(!deviceName || !latitude || !longitude) {
        return res.status(400).json({ message: 'Thiếu thông tin' })
    }
    db.get('SELECT * FROM locations WHERE deviceName = ?', [deviceName], (err, row) => {
        if (!row) {
            const stmt = db.prepare('INSERT INTO locations (deviceName, lat, lng) VALUES (?, ?, ?)');
            stmt.run(deviceName, latitude, longitude, function (err) {
                // console.log(`Vị trí được thêm mới: ${deviceName}`);
            });
        } else {
            const stmt = db.prepare('UPDATE locations SET lat = ?, lng = ? WHERE deviceName = ?');
            stmt.run(latitude, longitude, deviceName, function (err) {
                // console.log(`Vị trí được cập nhật: ${deviceName}`);
            });
        }
    });
    res.status(200).json({ message: 'ok' })
})

app.get('/', (req, res) => {
    db.all('SELECT * FROM locations', [], (err, rows) => {
        if (err) {
            return console.error('Lỗi truy vấn:', err.message);
        }
        res.status(200).json(rows)
    });
})

app.get('/tracking', (req, res) => {
    res.render('tracking')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})