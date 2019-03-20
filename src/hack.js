// for N3
window.setImmediate = function setImmediate(cb, ...args) {
  window.setTimeout(cb, 0, ...args);
};
