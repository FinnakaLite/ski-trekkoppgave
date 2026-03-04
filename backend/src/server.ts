import app from './app.ts'; // Note the .js extension for ES Modules in NodeNext

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});
