export default {
  parseError: (err) => {
    return new Promise((resolve, reject) => {
      let errors = [];
      if (err.error) {
        errors = err.error.stderr.split("\n").
        filter(v => v.indexOf("user_app.cpp") > -1).
        map(v => v.split("user_app.cpp:")[1]);
        if (typeof window !== 'undefined' && window.getApp && window.getApp.$global && typeof window.getApp.$global.$emit === 'function') {
          window.getApp.$global.$emit("compiler-error", errors);
        }
        resolve(errors);
      } else {
        reject(`no err.error`, err);
      }
    });
  },
};
