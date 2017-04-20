module.exports = {
  env: {
    getInt: (key, defaultValue) => {
      let result = parseInt(process.env[key]);
      return isNaN(result) ? defaultValue : result;
    },
    getString: (key, defaultValue) => {
      return process.env[key] || defaultValue;
    }
  }
};