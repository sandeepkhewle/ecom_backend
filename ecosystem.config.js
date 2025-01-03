module.exports = {
    apps: [
      {
        name: 'app',
        script: 'app.js', // Replace with your entry point file
        instances: 'max',
        exec_mode: 'cluster',
      },
    ],
  };
  