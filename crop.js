const statSync = require('fs').statSync;
const execSync = require('child_process').execSync;

function cropOption(input, start, duration, x, y, w, h, fps, scale) {
  const option = `-y -ss ${start} -t ${duration} -i ${input} \
                 -filter_complex "crop=${w}:${h}:${x}:${y},fps=${fps},yadif,scale=${scale}:-1"`;
  return option;
}

function cropExec(option, output) {
  const command = `ffmpeg ${option} ${output}`
  execSync(command);
}

function getFileSize(filepath) {
  const stat = statSync(filepath);
  return stat.size;
}
