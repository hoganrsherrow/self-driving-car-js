//stretch the road
const canvas = document.getElementById("canvas");
canvas.width = 200;

//Define animation
const animate = () => {
    car.update();
    canvas.height = window.innerHeight;
    car.draw(ctx);
    requestAnimationFrame(animate);
}

const ctx = canvas.getContext("2d");
const car = new Car(100, 100, 30, 50);
car.draw(ctx);

animate();

