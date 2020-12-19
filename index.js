const robot = require('./robots/catolicoorante');


async function main(){
    const res = await robot.main();
    console.log(res);
}
 main();