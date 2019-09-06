const execSync = require('child_process').execSync;

function cropOption(input, start, duration, x, y, w, h) {
  const option = `-y -i ${input} -ss ${start} -t ${duration} \
                 -filter_complex "crop=${w}:${h}:${x}:${y}"`;
  return option;
}

function cropExec(option, output) {
  const command = `ffmpeg ${option} ${output}`
  execSync(command);
  console.log('Done.');
}
