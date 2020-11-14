var timeExec;
function perfTest(name) {
  let newTimeExec = performance.now();
  if (name != "x") console.log(`${name}: ${newTimeExec - timeExec} ms`);
  timeExec = newTimeExec;
}
