//Simple comparision function to sort packs via their required levels
export function compare(a, b){
    let level1 = a.level;
    let level2 = b.level;
    let comparision = 0;

    if (level1 > level2){
        comparision = 1;
    } else {
        comparision = -1
    }
    return comparision;
  }
