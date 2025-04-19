import { response } from 'express';
import psl from 'psl';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,

})

export function getMail(email) {
    // let mail = email.toString().slice(email.indexOf('<') + 1, email.indexOf('>')).trim();
    return email.value[0].address;
}

export function getName(email) {
    // let name = email.slice(1, email.indexOf('<')).trim();
    // name = name.slice(0, name.length - 1);
    return email.value[0].name;
}

export function getDomain(link) {
    let hostname = new URL(link).hostname;
    const parsed = psl.parse(hostname);
    return parsed.domain;
}

export function getdate() {
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return formattedDate;

}


export async function getInput(msg) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(msg, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
