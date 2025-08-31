export type ParsedErrors = string[];

export default {
  parseError: (err: any): Promise<ParsedErrors> => {
    return new Promise((resolve, reject) => {
      let errors: string[] = [];
      try {
        if (err && err.error && typeof err.error.stderr === 'string') {
          errors = err.error.stderr.split("\n")
            .filter((v: string) => v.indexOf("user_app.cpp") > -1)
            .map((v: string) => v.split("user_app.cpp:")[1]);
          if (typeof window !== 'undefined' && (window as any).getApp && (window as any).getApp.$global && typeof (window as any).getApp.$global.$emit === 'function') {
            (window as any).getApp.$global.$emit("compiler-error", errors);
          }
          resolve(errors);
          return;
        }
      } catch(e) {}
      reject(new Error('no err.error'));
    });
  },
};


