function Randomizer(){
    
}
Randomizer.nextInt = function(low, high){
    low = Math.floor(low);
    var r = Math.random();
    return low + Math.floor(r * (high - low + 1));
}
Randomizer.nextDouble = function(low, high){
    return low + (high - low) * Math.random();
}

Randomizer.nextFloat = function(low, high){
    return low + (high - low) * Math.random();
}

Randomizer.getHexDigit = function(num){
    if(num < 10) return num + "";
    switch(num){
        case 10: return 'A';
        case 11: return 'B';
        case 12: return 'C';
        case 13: return 'D';
        case 14: return 'E';
        case 15: return 'F';
    }
    return 0;
}

Randomizer.toHex = function(val){
    var first = Math.floor(val / 16);
    var second = val % 16;
    return Randomizer.getHexDigit(first) + Randomizer.getHexDigit(second); 
}

Randomizer.nextHex = function(){
    var val = Randomizer.nextInt(0, 255);
    return Randomizer.toHex(val);
}

Randomizer.nextColor = function(){
    var r = Randomizer.nextHex();
    var g = Randomizer.nextHex();
    var b = Randomizer.nextHex(); 
    return "#" + r + g + b;
}

Randomizer.nextBoolean = function(){
    return Math.random() > 0.5;
}