// SHADOW VAULT — keyboard input handler
export function createInput() {
  const pressed = new Set();
  const onKey = (e, down) => { pressed[down ? 'add' : 'delete'](e.code); e.preventDefault(); };
  window.addEventListener('keydown', e => onKey(e, true));
  window.addEventListener('keyup',   e => onKey(e, false));

  return {
    get left()  { return pressed.has('ArrowLeft')  || pressed.has('KeyA'); },
    get right() { return pressed.has('ArrowRight') || pressed.has('KeyD'); },
    get up()    { return pressed.has('ArrowUp')    || pressed.has('KeyW'); },
    get down()  { return pressed.has('ArrowDown')  || pressed.has('KeyS'); },
    get crawl() { return pressed.has('ShiftLeft')  || pressed.has('ShiftRight'); },
    isPressed: (code) => pressed.has(code),
  };
}
