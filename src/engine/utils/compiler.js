// Simple stub for compiler utils
export default {
  parseError: (err) => {
    return Promise.resolve({
      errors: [],
      warnings: []
    });
  }
};
