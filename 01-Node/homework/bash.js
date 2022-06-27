const commands = require("./comands/index");

const print = function (output) {
  process.stdout.write(output);
  process.stdout.write("\nprompt>");
};

// Output un prompt
process.stdout.write("prompt > ");
// El evento stdin 'data' se dispara cuando el user escribe una línea
process.stdin.on("data", function (data) {
  let args = data.toString().trim().split(" "); // remueve la nueva línea
  process.stdout.write("You typed: " + cmd);
  let cmd = args.shift();
  if (commands[cmd]) {
    commands[cmd](args, print);
  } else {
    print("cmd not found");
  }
});
