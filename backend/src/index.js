// ============================================================
// FILE: index.js
// Entry point — menjalankan server Express di port yang ditentukan
// ============================================================

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
