//  this is unfinished program and is just a very basic form of simulator
// the yellow bar on the left is for power supply where pins can be added and their states // toggled.
// the NAND gate can be dragged along

// a total of 10 pins allowed at max (both input and output bar)
// clicking on the yellow bar will create pins (10 at max)
// clicking on the grey pins will start a wire which can be connected to the and gate's pins
// I plan on adding more features iA
// enjoy (:

var pwr_pins = [];
var out_pins = [];
//var total_pins = 0;
var wires = [];
var draw_wire = false;
var draw_ext = false;

var last_pos = {
  x: 0,
  y: 0
};

var pin = function(x, y, r, togglable)
{
    this.x = x;
    this.y = y;
    this.r = r;
    this.togglable = togglable;
    this.state = 0;
    this.connection = false;
    this.extension = false;
};

pin.prototype.draw_pin = function()
{
    if(this.state === 1)
    {
        fill(255, 0, 0);
    }
    else
    {
        fill(0, 0, 0);
    }
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    
    if(this.togglable)
    {
        fill(166, 139, 166);
        ellipse(this.x + this.r * 3, this.y, this.r * 2, this.r * 2);
    }
};

pin.prototype.toggle_inp = function(x, y)
{
    
    if( x >= this.x - this.r &&
        x <= this.x + this.r &&
        y >= this.y - this.r &&
        y <= this.y + this.r && this.togglable)
    {
        if(this.state === 0)
        {
            this.state = 1;
        }
        else
        {
            this.state = 0;
        }
    }
};

pin.prototype.at_inp = function(x, y)
{
    
    if(x >= this.x - this.r &&
        x <= this.x + this.r &&
        y >= this.y - this.r &&
        y <= this.y + this.r)
    {
        return true;
    }
    
    return false;
};

pin.prototype.at_wire_junc = function(x, y)
{
    if(x >= this.x + this.r * 3 - this.r &&
       x <= this.x + this.r * 3 + this.r &&
       y >= this.y - this.r &&
       y <= this.y + this.r)
      {
          //background(255, 0, 0);
          return true;
      }
};

var wire = function(pin_s, pin_e, passed_pin)
{
    this.pin_s = pin_s;
    this.pin_e = pin_e;
    this.connection = true;
    this.passed_pin = passed_pin;
};

wire.prototype.draw_wire = function()
{
    if(this.pin_s.state === 1)
    {
        stroke(255, 0, 0);
    }
    else
    {
        stroke(0, 0, 0);
    }
    
    line(this.pin_s.x, this.pin_s.y, this.pin_e.x, this.pin_e.y);
};  

wire.prototype.transmit_signal = function()
{
    this.passed_pin.state = this.pin_s.state;
};

wire.prototype.extend = function(x, y)
{
    var slope = (this.pin_e.y - this.pin_s.y) / (this.pin_e.x - this.pin_s.x);
    var c = this.pin_s.y - (slope * this.pin_s.x);
    
    //slope = slope < 0 ? floor(slope) : ceil(slope);
    //c = floor(c);
    //println("c: " + c + ", slope: " + slope +", mX: " + x + ", mY: " + y);
    
    if(y === floor(slope * x + c)
)
    {
        //draw_ext = true;
        last_pos.x = x;
        last_pos.y = y;
    }
};

var power_supply = function(x, y)
{
    this.x = x;
    this.y = y;
    this.w = 16;
    this.h = height;
    this.total_pins = 0;
};

power_supply.prototype.disp = function()
{
    rectMode(CORNER);
    noStroke();
    fill(212, 212, 26);
    rect(this.x, this.y, this.w, this.h);
};

power_supply.prototype.add_pin = function(x, y, toggle, arr)
{
    if(x >= this.x &&
        x <= this.x + this.w &&
        y >= this.y &&
        y <= this.y + this.h &&
        this.total_pins < 10)
    {
        var add_new_pin = true;
        for(var i = 0; i < this.total_pins; i++)
        {
            var cx = arr[i].x;
            var cy = arr[i].y;
            var cr = arr[i].r;
            
            if( x >= cx - cr &&
                x <= cx + cr &&
                y >=  cy - cr&&
                y <= cy + cr)
                {
                    add_new_pin = false;
                    break;
                }
        }
        
        if(add_new_pin)
        {
            var p = new pin(this.x + this.w/2, 20 + this.total_pins * 40 , 5, toggle);
            arr.push(p);
            this.total_pins++;
        }
    }
};

var output_supply = function(x, y)
{
    power_supply.call(this, x, y);
};

output_supply.prototype = Object.create(power_supply.prototype);

var and_gate = function(x, y)
{
    this.x = x;
    this.y = y;
    this.out = 0;
    this.w = 70;
    this.h = 40;
    
    this.pins_r = 5;

    this.pin1_x = this.x - this.w/2;
    this.pin1_y = this.y - this.h/2;
    
    this.pin2_x = this.x - this.w/2;
    this.pin2_y = this.y + this.h/2;
    
    this.pin_out_x = this.x + this.w/2;
    this.pin_out_y = this.y;
    
    this.p1 = new pin(this.pin1_x, this.pin1_y, this.pins_r, 0, false); // input pin 1
    this.p2 = new pin(this.pin2_x, this.pin2_y, this.pins_r, 0, false); // input pin 2
    
    this.out_pin = new pin(this.pin_out_x, this.pin_out_y, this.pins_r, 0, false);
    
    this.c1 = false;
    this.c2 = false;
    
    this.input2 = true;
    this.input1 = true;
};

and_gate.prototype.draw_gate = function()
{
    if(this.p1.state && this.p2.state)
    {
        this.out_pin.state = 0;
    }
    else
    {
        this.out_pin.state = 1;
    }
    
    //println(this.p1.state + " " + this.p2.state);
    rectMode(CENTER);
    
    fill(172, 247, 228);
    stroke(0);
    rect(this.x, this.y, this.w, this.h, 4);
    
    this.p1.draw_pin();
    this.p2.draw_pin();
    
    textAlign(CENTER);
    textSize(23);
    fill(130, 31, 31);
    text("NAND", this.x, this.y + 10);

    this.out_pin.draw_pin();
};


and_gate.prototype.at_input = function(x, y, pin)
{
    if( x >= pin.x - pin.r &&
        x <= pin.x + pin.r &&
        y >= pin.y - pin.r &&
        y <= pin.y + pin.r)
    {
        return true;
    }
    else
    {
        return false;
    }
};

and_gate.prototype.drag = function(x, y)
{
    if(x >= this.x - this.w/2 &&
        x <= this.x + this.w/2 &&
        y >= this.y - this.h/2 &&
        y <= this.y + this.h/2)
    {
        draw_ext = false;
        draw_wire = false;
        this.x = x;
        this.y = y;
        this.p1.x = this.x - this.w/2;
        this.p1.y = this.y - this.h/2;
        
        this.p2.x = this.x - this.w/2;
        this.p2.y = this.y + this.h/2;
        
        this.out_pin.x = this.x + this.w/2;
        this.out_pin.y = this.y;
    }
};

var and = new and_gate(width/2, height/2, 0, 0);
var pwr = new power_supply(0, 0);
var out = new output_supply(width-59, 0);

var start_p;
var end_p;

var draw = function()
{
    background(150, 134, 134, 100);

    and.draw_gate();
    pwr.disp();
    out.disp();
    
    for(var i = 0; i < pwr_pins.length; i++)
    {
        pwr_pins[i].draw_pin();
        if(pwr_pins[i].at_wire_junc(mouseX, mouseY) && mouseIsPressed)
        {
            draw_wire = true;
            start_p = pwr_pins[i];
        }
    }
    
    for(var i = 0; i < out_pins.length; i++)
    {
        out_pins[i].draw_pin();
        if(out_pins[i].at_wire_junc(mouseX, mouseY) && mouseIsPressed)
        {
            draw_wire = true;
            start_p = out_pins[i];
        }
    }
    
    if(draw_ext)
    {
        stroke(0, 0, 0);
        line(last_pos.x, last_pos.y, mouseX, mouseY);
        
            if(and.at_input(mouseX, mouseY, and.p1) && mouseIsPressed) 
            {
                var c = start_p.state;
                var w = new wire(c, and.p1, and.p1);
                w.connection = true;
                wires.push(w);
                draw_ext = false;
            }
            
            if (and.at_input(mouseX, mouseY, and.p2) && mouseIsPressed)
            {
                var c = new pin(last_pos.x, last_pos.y, 5, false);
                c.state = start_p.state;
                
                var w = new wire(c, and.p2, and.p2);
                w.connection = true;
                wires.push(w);
                draw_wire = false;
            }
            
            if (and.at_input(mouseX, mouseY, and.out_pin) && mouseIsPressed)
            {
                var w = new wire(and.out_pin, start_p, start_p);
                wires.push(w);
                draw_wire = false;
            }
    }
    
    if(draw_wire)
    {
        stroke(0, 0, 0);
        line(start_p.x, start_p.y, mouseX, mouseY);
    
            if(and.at_input(mouseX, mouseY, and.p1) && mouseIsPressed && and.input1) 
            {
                and.input1 = false;
                var w = new wire(start_p, and.p1, and.p1);
                w.connection = true;
                wires.push(w);
                draw_wire = false;
            }
            
            if (and.at_input(mouseX, mouseY, and.p2) && mouseIsPressed && and.input2)
            {
                and.input2 = false;
                var w = new wire(start_p, and.p2, and.p2);
                w.connection = true;
                wires.push(w);
                draw_wire = false;
            }
            
            if (and.at_input(mouseX, mouseY, and.out_pin) && mouseIsPressed)
            {
                and.input2 = false;
                var w = new wire(and.out_pin, start_p, start_p);
                wires.push(w);
                draw_wire = false;
            }
            
    }
    
    for(var i = 0; i < wires.length; i++)
    {
        wires[i].draw_wire();
        wires[i].transmit_signal();
        if(wires[i].connection && mouseIsPressed)
        {
            wires[i].extend(mouseX, mouseY);
        }
    }

};

var mouseReleased = function()
{
    pwr.add_pin(mouseX, mouseY, true, pwr_pins);
    out.add_pin(mouseX, mouseY, true, out_pins);
    for(var i = 0; i < pwr_pins.length; i++)
    {
        pwr_pins[i].toggle_inp(mouseX, mouseY);
    }
};

var mouseDragged = function()
{
    and.drag(mouseX, mouseY);
};

var mouseClicked = function()
{
    draw_wire = false;
    draw_ext = false;
};
