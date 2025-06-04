// https://stackfull.dev/heaps-in-javascript

type comparatorFunction = (a: any, b: any) => boolean;

export class MinHeap<Type> {
  items: Type[] = [];
  // Comparator that returns true if one item is less than other item
  comparator: comparatorFunction = (a, b) => a < b;

  constructor(comparator: comparatorFunction) {
    this.comparator = comparator;
  }

  deepcopy(): MinHeap<Type> {
    let copy = new MinHeap<Type>(this.comparator);
    copy.items = this.items.slice();
    return copy;
  }

  heappush(value: Type) {
    this.items.push(value); // Add value to the end
    this._percolateUp(); // Restore heap property by moving it up
  }

  heappop() {
    if (this.items.length === 0) throw new Error("Can't pop from empty heap");

    const n = this.items.length;
    [this.items[0], this.items[n - 1]] = [this.items[n - 1], this.items[0]]; // Swap root with last
    const min = this.items.pop(); // Remove the real root
    this._percolateDown(0); // Restore heap property

    return min;
  }

  // Maintains the heap property while moving the item downwards.
  _percolateDown(index: number) {
    let curr = index;
    while (2 * curr + 1 < this.items.length) {
      const leftIndex = 2 * curr + 1;
      const rightIndex = 2 * curr + 2;
      const minChildIndex =
        rightIndex < this.items.length &&
        this.comparator(this.items[rightIndex], this.items[leftIndex])
          ? rightIndex
          : leftIndex;
      if (this.comparator(this.items[minChildIndex], this.items[curr])) {
        // quick swap, if smaller of two children is smaller than the parent (min-this.items)
        [this.items[minChildIndex], this.items[curr]] = [
          this.items[curr],
          this.items[minChildIndex],
        ];
        curr = minChildIndex;
      } else {
        break;
      }
    }
  }

  // takes the last item in heap array and pushes it up, till heap property is restored.
  _percolateUp() {
    let curr = this.items.length - 1;
    // keep going till atleast left child is possible for current node
    while (curr > 0) {
      let parent = Math.floor((curr - 1) / 2);
      if (this.comparator(this.items[curr], this.items[parent])) {
        // quick swap
        [this.items[curr], this.items[parent]] = [
          this.items[parent],
          this.items[curr],
        ];
        // update the index of newKey
        curr = parent;
      } else {
        // if no swap, break, since we heap is stable now
        break;
      }
    }
  }
}
