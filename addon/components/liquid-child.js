import { Promise as EmberPromise } from 'rsvp';
import Component from '@ember/component';
import { getOwner } from '@ember/application';

export default Component.extend({
  classNames: ['liquid-child'],

  init() {
    this._super(...arguments);
    this._waitingFor = [];
  },

  didInsertElement() {
    this._super(...arguments);
    if (this.element) {
      this.element.style.visibility = 'hidden';
    }
    this._waitForAll().then(() => {
      if (!this.isDestroying) {
        this._waitingFor = null;
        const didRenderAction = this.liquidChildDidRender;
        if (typeof didRenderAction === 'function') {
          didRenderAction(this);
        }

        if (this.liquidChildId) this.element.id = this.liquidChildId;
      }
    });
  },

  _isLiquidChild: true,
  _waitForMe(promise) {
    if (!this._waitingFor) {
      return;
    }
    this._waitingFor.push(promise);
    let ancestor = this.nearestWithProperty('_isLiquidChild');
    if (ancestor) {
      ancestor._waitForMe(promise);
    }
  },
  _waitForAll() {
    const promises = this._waitingFor;
    this._waitingFor = [];
    return EmberPromise.all(promises).then(() => {
      if (this._waitingFor.length > 0) {
        return this._waitForAll();
      }
    });
  },
});
