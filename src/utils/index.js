export function withOptionAccessors(cls, options) {
  Object.entries(options).forEach(([key, initialValue]) => {
    /* eslint-disable-next-line no-param-reassign */
    cls.prototype[key] = function accessor(newValue) {
      if (newValue) {
        this.options[key] = newValue || initialValue;
        return this;
      }
      return this.options[key] || initialValue;
    };
  });
  return cls;
}

export function resolveSequentially(promises) {
  return promises.reduce((acc, promise) => acc.then(promise), Promise.resolve());
}
