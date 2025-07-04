import express from "express";
import cors from "cors";
import pkg from "pg";
import bodyParser from "body-parser";

const { Pool } = pkg;

const app = express();
const port = 3000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', './views');


// ✅ PostgreSQL config
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pdfuplod",   // ✅ Replace with your DB name
  password: "Chandu@123", // ✅ Replace with your DB password
  port: 5000,
});

// ✅ Test DB connection
pool.connect((err) => {
  if (err) {
    console.error("❌ DB connection error:", err.stack);
  } else {
    console.log("✅ Connected to PostgreSQL");
  }
});


app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    console.log("Todos:", result.rows);

    res.render('todo', { todos: result.rows }); // 🔥 Pass todos to EJS
  } catch (err) {
    res.status(500).send('Error loading todos');
  }
});



app.post('/add', async (req, res) => {
  const { task } = req.body;
  try {
    await pool.query('INSERT INTO todos (task) VALUES ($1)', [task]);
    res.redirect('/');
  } catch (err) {
    res.send('Error adding todo');
  }
});

app.post('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    res.send('Error deleting todo');
  }
});

// GET: Show edit form
app.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

    const todo = result.rows[0];
    res.render('edit', { todo });
  } catch (err) {
    res.send('Error loading edit form');
  }
});

// POST: Update the todo
app.post('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  try {
    await pool.query('UPDATE todos SET task = $1 WHERE id = $2', [task, id]);
    res.redirect('/');
  } catch (err) {
    res.send('Error updating task');
  }
});




// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});