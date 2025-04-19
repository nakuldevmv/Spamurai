import readline from 'readline';

export function getUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(prompt, (answer) => {
      rl.close(); // this avoids input duplication
      resolve(answer.trim());
    });
  });
}
