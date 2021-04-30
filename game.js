var w = window.innerWidth;
var h = window.innerHeight;
rate=5;

var singles=[-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9];
var wholes=[0,1,2,3,4,5,6,7,8,9];
var types=["Lined","Boxed","Circled"];
var turtles=[];
var skiller=[1];

for(var i = 0;i<20;i++){
    skiller.push(0);
}

var rgb=[];
for(var i = 0;i<256;i++){
    rgb.push(i)
}


class turtle{
    constructor(x,y,type){
        this.x = x;
        this.y = y;
        this.xi=[];
        this.r=random(rgb);
        this.g=random(rgb);
        this.b=random(rgb);
        this.type=type;
    
    }

    move(){

        for(var i=0;i<5;i++){
            this.xi.push(0);
            this.xi.push(1);
            this.xi.push(2);
        }

        stroke(this.r,this.g,this.b)//(random(wholes)*random(wholes))*2);
        fill(this.r,this.g,this.b,(random(wholes)*random(wholes)/2));
        switch(this.type){
            case "Lined":
                var dir=random(this.xi);
                var newx=this.x+(random(singles)*random(singles));
                var newy=this.y+(random(singles)*random(singles));

                switch (dir) {
                    case 0: 
                        line(this.x, this.y, newx,this.y);
                        this.x=newx;
                        break;
                    case 1:
                        line(this.x,this.y,this.x,newy);
                        this.y=newy;
                        break;
                    case 2:
                        line(this.x,this.y,newx,newy);
                        this.x=newx;
                        this.y=newy;
                        break;
                    
                }
                if(random(skiller)==1) this.type=random(types);
            break;
            case "Boxed":
                var dir=random(this.xi);
                var neww=random(singles)*random(singles);
                var newh=random(singles)*random(singles);

                rect(this.x,this.y,neww,newh);
                switch(dir){
                    case 0:
                        this.x+=neww;
                        break;
                    case 1:
                        this.y+=newh;
                        break;
                    case 2:
                        this.x+=neww;
                        this.y+=newh;
                        break;
                }
                if(random(skiller)==1) this.type=random(types);

            break
            case "Circled":
                var newr=random(singles)*random(singles);
                var dir = random(this.xi);

                circle(this.x,this.y,newr);
                switch(dir){
                    case 0:
                        this.x+=newr/2;
                        break;
                    case 1:
                        this.y+=newr/2;
                        break;
                    case 2:
                        this.x+=newr/2;
                        this.y+=newr/2;
                        break;    
                }
                if(random(skiller)==1) this.type=random(types);
            break;
        }

        this.r+=(random(wholes)*random(wholes));
        this.g+=(random(wholes)*random(wholes));
        this.b+=(random(wholes)*random(wholes));

        if(this.x>w) this.x=0;
        else if(this.x<0) this.x=w;
        if(this.y>h) this.y=0;
        else if(this.y<0) this.y=h;
        if(this.r>255) this.r=0;
        else if(this.r<0) this.r=255;
        if(this.g>255) this.g=0;
        else if(this.g<0) this.g=255;
        if(this.b>255) this.b=0;
        else if(this.b<0) this.b=255;
        if(random(skiller)==1) {
           
            turtles.push(new turtle(this.x,this.y,random(types)));
            if(turtles.length>100) skiller=[];
        }
    }
}

function setup() {
    createCanvas(w,h);
    

    frameRate(rate);
}

function draw(){
    for(var i=0;i<turtles.length;i++){
        turtles[i].move();
    }

}

function mousePressed(){
    

    let tempt = new turtle(mouseX,mouseY,random(types));
    turtles.push(tempt);
    
}