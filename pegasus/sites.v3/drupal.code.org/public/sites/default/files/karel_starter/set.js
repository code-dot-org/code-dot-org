function Set(){
    this.set = {};
}

Set.prototype.getKey = function(elem){
    var name = elem;
    if(typeof elem == "object")
        name = elem.toString();
    return name; 
}

Set.prototype.add = function(elem){
    var key = this.getKey(elem);
    this.set[key] = elem;
}

Set.prototype.remove = function(elem){
    var key = this.getKey(elem);
    delete this.set[key];
}

Set.prototype.contains = function(elem){
    var key = this.getKey(elem);
    return typeof this.set[key] != "undefined";
}

Set.prototype.elems = function(){
    return this.set;
}