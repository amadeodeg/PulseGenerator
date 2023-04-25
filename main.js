
let canvas
let canvas_context;
let canvas_width;
let canvas_height;

let listdiv;

let GRID_SIZE = 15; //px
let MARKER_OFFSET_X = GRID_SIZE/2;
let MARKER_OFFSET_Y = GRID_SIZE/2;

let marker_list = [];

let marker_selected;
let element_selected;
let listfield_selected;


let xmin,xmax,ymin,ymax;

function mainOnLoad() {
    console.log("hello world");

    listdiv = document.getElementById("listdivID");
    canvas=document.getElementById("canvasID");
    canvas_width = canvas.width;
    canvas_height = canvas.height;
    canvas_context = canvas.getContext("2d");
    updateCanvas();
    updateAxisLimit();
}

function updateCanvas() {
    drawBackground();
    drawSpecialLines();
    drawGrid();
    marker_list.sort((a,b)=> a.x - b.x);
    drawMarkerLines();
    updateListShown();
}


function drawBackground(){
    canvas_width = GRID_SIZE*document.getElementById("canvasSizediv").getElementsByClassName("input")[0].value;
    canvas_height = GRID_SIZE*document.getElementById("canvasSizediv").getElementsByClassName("input")[1].value;
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    canvas_context.clearRect(0, 0, canvas_width, canvas_height);
    canvas_context.fillStyle = "#f3f6f4";
    canvas_context.fillRect(0, 0, canvas_width, canvas_height);
}

function drawSpecialLines(){
    SPECIAL_LINES_COLORS = ["#bcbcbc"];

    SPECIAL_LINES_HORIZONTAL = [0, 5, 10, 15, 20, 25, 30];
    //SPECIAL_LINES_HORIZONTAL = [15]
    SPECIAL_LINES_HORIZONTAL =[];
    for (var aux=canvas_height/GRID_SIZE-1; aux>0; aux-=5){
        SPECIAL_LINES_HORIZONTAL.push(aux);
    }
    for (var j =0; j<SPECIAL_LINES_HORIZONTAL.length; j+=1){
        canvas_context.fillStyle = SPECIAL_LINES_COLORS[0];
        canvas_context.fillRect(0,SPECIAL_LINES_HORIZONTAL[j]*GRID_SIZE, canvas_width, GRID_SIZE);
    }

    //SPECIAL_LINES_VERTICAL = [0, 10, 20, 30, 40, 50, 60];
    SPECIAL_LINES_VERTICAL =[];
    for (var aux=0; aux<canvas_width/GRID_SIZE; aux+=10){
        SPECIAL_LINES_VERTICAL.push(aux);
    }
    for (var i =0; i<SPECIAL_LINES_VERTICAL.length; i+=1){
        canvas_context.fillStyle = SPECIAL_LINES_COLORS[0];
        canvas_context.fillRect(SPECIAL_LINES_VERTICAL[i]*GRID_SIZE,0, GRID_SIZE, canvas_height);
    }


}

function drawGrid(){
    canvas_context.beginPath(); // only for lineTO

    for (var i=0; i<=canvas_width; i+=GRID_SIZE){
        canvas_context.moveTo(i,0);
        canvas_context.lineTo(i,canvas_height);
    }

    for (var j=0; j<=canvas_height; j+=GRID_SIZE){
        canvas_context.moveTo(0,j);
        canvas_context.lineTo(canvas_width,j);
    }

    canvas_context.strokeStyle = "#999999"
    canvas_context.lineWidth = 1; //px
    canvas_context.stroke();
}

function drawMarkerLines(){
    canvas_context.beginPath();
    for(var i=0; i<marker_list.length-1; i++){
        canvas_context.moveTo(marker_list[i].x,marker_list[i].y);
        canvas_context.lineTo(marker_list[i+1].x,marker_list[i+1].y)
    }
    canvas_context.strokeStyle = "red";
    canvas_context.lineWidth =2;
    canvas_context.stroke();
}


function updateListShown(){
    listdiv.innerHTML="";
    for(var i=0; i<marker_list.length; i++){
        marker_list[i].rowidx=i;
        marker_list[i].createElementList();
        marker_list[i].element_marker.innerHTML=i;
    }
}


function canvasClick(event) {
    marker_list.push(new Marker(event.clientX, event.clientY));
    updateCanvas();
}

class Marker {
    constructor(posX, posY){
        this.x = Math.floor((posX + MARKER_OFFSET_X) /GRID_SIZE) * GRID_SIZE - MARKER_OFFSET_X;
        this.y = Math.floor((posY + MARKER_OFFSET_Y) /GRID_SIZE) * GRID_SIZE - MARKER_OFFSET_Y;
        this.xshown = this.x;
        this.yshown = this.y;
        this.updatexyshown();
        this.rowidx=marker_list.length;
        this.element_marker = null;
        this.element_list = null;
        this.createElementMarker();
        this.setPosition();
        this.createElementList();   
    }

    createElementMarker() {
        this.element_marker = document.createElement("div");
        this.element_marker.innerHTML = this.rowidx;
        this.element_marker.className = "marker"
        document.body.appendChild(this.element_marker);
        
        this.element_marker.addEventListener("click",
            (event)=> {
                if(marker_selected == this.element_marker){
                    marker_selected.classList.remove("mark_selected");
                    marker_selected = null;
                    element_selected.classList.remove("selected");
                }else{
                    if(marker_selected){
                        marker_selected.classList.remove("mark_selected");
                        element_selected.classList.remove("selected");
                    }
                    this.element_marker.classList.add("mark_selected");
                    marker_selected = this.element_marker;
                    this.element_list.classList.add("selected");
                    element_selected = this.element_list;
                }

            });

        this.element_marker.addEventListener("dblclick",
            (event)=> {
                console.log("double click")
            });
        this.element_marker.addEventListener("contextmenu",
            (event)=> {
                console.log("right click")
            });
    }

    setPosition() {
        this.element_marker.style.left = this.x + "px";
        this.element_marker.style.top = this.y + "px";
    }

    createElementList() {
        this.element_list = document.createElement("div");
        this.element_list.className = "elementList"
        this.element_list.innerHTML = `<div class="row">
                                <label id="rowidx">id:  ${this.rowidx} </label>
                                <label for="time">Time:</label>
                                <input class="input" name="time" type="text" value="${this.xshown}">
                                <label for="power">Power:</label>
                                <input class="input" name="power" type="text" value="${this.yshown}">
                                <button class="remove"> X </button>
                            </div>`;
        listdiv.appendChild(this.element_list);
        let remove_button = this.element_list.getElementsByClassName("remove")[0];
        remove_button.addEventListener("click",
            (event)=> {
                this.element_list.remove();
                this.element_marker.remove();
                marker_list.splice(marker_list.indexOf(this),1);//pop does not work
                updateCanvas();
            });
        let time_input = this.element_list.getElementsByClassName("input")[0];
        time_input.addEventListener("change",
            (event)=> {
                this.xshown = parseFloat(time_input.value);
                this.updatexyabs();
                this.setPosition();
                updateCanvas();
            });
        let power_input = this.element_list.getElementsByClassName("input")[1];
        power_input.addEventListener("change",
            (event)=> {
                this.yshown = parseFloat(power_input.value);
                this.updatexyabs();
                this.setPosition();
                updateCanvas();
            });
    }

    updatexyshown(){
        //only squares
        this.xshown = (this.x/GRID_SIZE -0.5);
        this.yshown = (canvas_height/GRID_SIZE) - (this.y/GRID_SIZE) -0.5;
        //update with limits
        this.xshown = this.xshown*(xmax-xmin)/(canvas_width/GRID_SIZE) + xmin;
        this.yshown = this.yshown*(ymax-ymin)/(canvas_height/GRID_SIZE) + ymin;
        if (this.xchecker()){
            this.xshown= this.xchecker()+parseFloat(document.getElementById("deltadiv").getElementsByClassName("input")[0].value);
        }
    }

    updatexyabs(){
        //update with limits
        var sqx = this.xshown/(xmax-xmin)*(canvas_width/GRID_SIZE);
        var sqy = this.yshown/(ymax-ymin)*(canvas_height/GRID_SIZE); 
        //only squares
        this.x = (sqx+0.5)* GRID_SIZE -xmin;
        this.y = canvas_height - (sqy+0.5)* GRID_SIZE -ymin;
    }

    xchecker(){
        var result=0;
        for(var i=marker_list.length-1; i>=0; i--){
            if (marker_list[i].x == this.x){
                result=marker_list[i].xshown;
                break;
            }
        }
        return result;
    }
}

function copyClip(){
    var result="0 0\n"
    var timeU = document.getElementById("timeUnitsID").value;
    var pwrU = document.getElementById("pwrUnitsID").value;
    for (var i=0; i<marker_list.length; i++){
        var e = marker_list[i];
        var aux= ""+e.xshown+timeU+" "+e.yshown+pwrU+"\n";
        result+=aux; 
    }
    navigator.clipboard.writeText(result);
    alert("Copied")
}

function updateAxisLimit(){
    xmin=parseFloat(document.getElementById("axislimitsID").getElementsByClassName("input")[0].value);
    xmax=parseFloat(document.getElementById("axislimitsID").getElementsByClassName("input")[1].value);
    ymin=parseFloat(document.getElementById("axislimitsID").getElementsByClassName("input")[2].value);
    ymax=parseFloat(document.getElementById("axislimitsID").getElementsByClassName("input")[3].value);
}