const execSync = require('child_process').execSync;

function cropOption(input, start, duration, x, y, w, h, fps=30, scale=-1) {
  const option = `-y -i ${input} -ss ${start} -t ${duration} \
                 -filter_complex "crop=${w}:${h}:${x}:${y},fps=${fps},scale=${scale}:-1"`;
  return option;
}

function cropExec(option, output) {
  const command = `ffmpeg ${option} ${output}`
  execSync(command);
  console.log('Done.');
}
