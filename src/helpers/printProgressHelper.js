const getFilledAndRemaining = (current, total) => {
  const progress = Math.ceil((current / total) * 100);
  const scaledProgress = Math.ceil(progress / 4);

  return {
    filled: scaledProgress,
    remaining: 25 - scaledProgress,
  };
};

const shouldRender = (current, total) => {
  const { filled } = getFilledAndRemaining(current, total);
  const { filled: oldFilled } = getFilledAndRemaining(current - 1, total);

  return filled !== oldFilled;
};

const getBar = (filled, remaining) => {
  const equStr = '='.repeat(filled);
  const spaceStr = ' '.repeat(remaining);
  return `[${equStr}${spaceStr}]`;
};

const printProgress = (desc, current, total, newLine = false) => {
  const { filled, remaining } = getFilledAndRemaining(current, total);

  if (shouldRender(current, total) === false && newLine === false) {
    return;
  }

  const bar = getBar(filled, remaining);

  const paddedDesc = `${desc}:${' '.repeat(25 - desc.length)}`;

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${paddedDesc} ${bar}`);

  if (newLine) {
    process.stdout.write('\r\n');
  }
};

export default printProgress;
