export function clonableIterator(it : AsyncGenerator) {
    var vals : any[] = [];
  
    return function make(n) {
      return {
        next(arg : any) {
          const len = vals.length;
          if (n >= len) vals[len] = it.next(arg);
          return vals[n++];
        },
        clone()   { return make(n); },
        throw(e: any)  { if (it.throw) it.throw(e); },
        return(v : any) { if (it.return) it.return(v); },
        [Symbol.iterator]() { return this; }
      };
    }(0);
  }