const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1;
const cars = generateCars(N);
let bestCar = cars[0];
// if(localStorage.getItem("bestBrain")) {
//     for(let i = 0; i < cars.length; i++) {
//         cars[i].brain = JSON.parse(
//             localStorage.getItem("bestBrain"));
//         if(i != 0) {
//             NeuralNetwork.mutate(cars[i].brain,0.1);
//         }
//     }
// }

bestCar.brain = {"levels":
                    [{"inputs":
                        [0.5511472285018602,0.1706282226038064,0,0,0],
                      "outputs":[0,1,1,0,1,1],
                      "biases":[0.4091156206655928,-0.1557846478756556,-0.2697046039407395,0.3787073258691913,-0.012061826716683238,-0.2830747099149371],
                      "weights":[[0.050993867091795285,0.11372380369646347,-0.31499879050889606,-0.08299670473534604,0.19925426093232232,0.22909369774670013],
                                 [0.09445233574714577,-0.15646456367528147,-0.11768432617204164,0.2309950718480897,-0.0803682991908368,-0.3241281032240522],
                                 [-0.21107865393483233,-0.2781008013045706,-0.3009360787214644,-0.3377380604767533,-0.059102359220322954,0.19131457846984967],
                                 [-0.11045252802055762,-0.05045876624103311,0.09137720125619217,-0.1487743419434004,0.26156654450045363,-0.08190827362514551],
                                 [0.0852401876906613,-0.21304461579098935,-0.0894731934743375,-0.1889650733297636,-0.04663840058787638,-0.06093879989515316]]},
                    {"inputs":[0,1,1,0,1,1],
                     "outputs":[1,0,0,0],
                     "biases":[-0.30084487353546857,0.0520901141420015,0.05339319995399858,0.2779516941993158],
                     "weights":[[0.16973811617761556,-0.25765714896456005,-0.20030919840134384,-0.27671301509937596],
                                [-0.08160084597055489,-0.28713846205717786,-0.004855216477896954,-0.08402954353586599],
                                [-0.15612362257488882,0.11598216573131295,-0.11677808524992443,0.20383417847928847],
                                [0.2938840945638739,0.26482997618905213,0.007611858363821333,-0.09658296342557099],
                                [0.3329744003621349,-0.08061454210138712,0.1276370870497772,0.34246761945322046],
                                [0.14262779211018328,0.13403578075298675,-0.011330611197184759,-0.3152437390877337]]}]};


const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-900,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-900,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-1100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-1100,30,50,"DUMMY",2),
];

animate();

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars=[];
    for(let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time) {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    bestCar=cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        ));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx,"red");
    }
    carCtx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}