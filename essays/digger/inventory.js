'use strict';

module.exports = Inventory;

function Inventory() {
    this.active = null;
    this.delegate = null;
}

Inventory.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope);
    } else if (id === 'items:iteration') {
        this.hookupItem(component, scope);
    }
};

Inventory.prototype.hookupThis = function hookupThis(scope) {
    this.items = scope.components.items;
    this.items.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    this.setActiveItem(1);
};

Inventory.prototype.hookupItem = function hookupItem(item, scope) {
    scope.components.label.value = item.value;
    scope.components.item.classList.add('pal' + item.value);
};

Inventory.prototype.setActiveItem = function setActiveItem(value) {
    if (this.active != null) {
        this.active.scope.components.item.classList.remove('active');
    }
    var index = (value + 9) % 10;
    this.active = this.items.iterations[index];
    this.active.scope.components.item.classList.add('active');

    if (this.delegate && this.delegate.handleActiveItemChange) {
        this.delegate.handleActiveItemChange(value);
    }
};
