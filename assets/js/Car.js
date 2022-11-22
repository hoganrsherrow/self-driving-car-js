class Car {
/*
    Best Brain
{"levels":[{"inputs":[0.5511472285018602,0.1706282226038064,0,0,0],"outputs":[0,1,1,0,1,1],"biases":[0.4091156206655928,-0.1557846478756556,-0.2697046039407395,0.3787073258691913,-0.012061826716683238,-0.2830747099149371],"weights":[[0.050993867091795285,0.11372380369646347,-0.31499879050889606,-0.08299670473534604,0.19925426093232232,0.22909369774670013],[0.09445233574714577,-0.15646456367528147,-0.11768432617204164,0.2309950718480897,-0.0803682991908368,-0.3241281032240522],[-0.21107865393483233,-0.2781008013045706,-0.3009360787214644,-0.3377380604767533,-0.059102359220322954,0.19131457846984967],[-0.11045252802055762,-0.05045876624103311,0.09137720125619217,-0.1487743419434004,0.26156654450045363,-0.08190827362514551],[0.0852401876906613,-0.21304461579098935,-0.0894731934743375,-0.1889650733297636,-0.04663840058787638,-0.06093879989515316]]},{"inputs":[0,1,1,0,1,1],"outputs":[1,0,0,0],"biases":[-0.30084487353546857,0.0520901141420015,0.05339319995399858,0.2779516941993158],"weights":[[0.16973811617761556,-0.25765714896456005,-0.20030919840134384,-0.27671301509937596],[-0.08160084597055489,-0.28713846205717786,-0.004855216477896954,-0.08402954353586599],[-0.15612362257488882,0.11598216573131295,-0.11677808524992443,0.20383417847928847],[0.2938840945638739,0.26482997618905213,0.007611858363821333,-0.09658296342557099],[0.3329744003621349,-0.08061454210138712,0.1276370870497772,0.34246761945322046],[0.14262779211018328,0.13403578075298675,-0.011330611197184759,-0.3152437390877337]]}]}
*/
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if(controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            );
        }

        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor ){
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if(this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for(let i = 0; i < roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for(let i = 0; i < traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle-alpha) * rad,
            y: this.y - Math.cos(this.angle-alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y:this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        return points;
    }

    #move() {
        if(this.controls.forward) {
            this.speed += this.acceleration;
        }
        if(this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if(this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed / 2) {
            this.speed =- this.maxSpeed / 2;
        }

        if(this.speed > 0) {
            this.speed-=this.friction;
        }
        if(this.speed < 0) {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if(this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if(this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx, color, drawSensor = false) {
        if(this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if(this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}