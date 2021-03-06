/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2012-2013 Canonical Ltd.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License version 3, as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranties of MERCHANTABILITY,
SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';


YUI.add('charm-details-view', function(Y) {
  var browserViews = Y.namespace('juju.browser.views'),
      ns = Y.namespace('juju.viewlets'),
      templates = Y.namespace('juju.views').Templates,
      models = Y.namespace('juju.models');

  var name = 'charm-details';

  ns.charmDetails = Y.Base.create(name, Y.View, [ns.ViewletBaseView], {
    slot: 'left-hand-panel',
    templateWrapper: templates['left-breakout-panel'],

    /**
      Renders the BrowserCharmView to the panel

      @method render
      @param {Object} charm the charm model to display the details of.
      @param {Object} viewletManagerAttrs the attributes passed to the
        viewlet manager.
    */
    render: function(charm, viewletManagerAttrs) {
      var container,
          store = viewletManagerAttrs.store,
          panel = Y.one('.charmbrowser'),
          activeTab = viewletManagerAttrs.activeTab;
      container = this.get('container');

      var cfg = {
        forInspector: true,
        store: store,
        activeTab: activeTab
      };

      if (this.get('rendered')) {
        // The cfg.entity settings is being commented out because it will
        // need to be re-enabled in a shortly upcoming branch.
        // cfg.entity = this.charmView.get('entity');
        this.charmView.setAttrs(cfg);
      } else {
        container.delegate('click', this.close, '.close-slot', this);
        panel.removeClass('animate-in');
        container.hide();

        store.charm(charm.get('storeId'), {
          'success': function(data, storeCharm) {
            // We must set renderTo in the callback--it doesn't exist before
            // then.
            cfg.renderTo = container.one('.content');
            // The cfg.entity settings is being commented out because it will
            // need to be re-enabled in a shortly upcoming branch.
            // cfg.entity = storeCharm;
            this.charmView = new browserViews.BrowserCharmView(cfg);
            this.charmView.render();
          },
          'failure': function(data) {
            // We must set renderTo in the callback--it doesn't exist before
            // then.
            cfg.renderTo = container.one('.content');
            // The cfg.entity settings is being commented out because it will
            // need to be re-enabled in a shortly upcoming branch.
            // cfg.entity = charm;
            this.charmView = new browserViews.BrowserCharmView(cfg);
            this.charmView.render();
          }
        }, this, viewletManagerAttrs.db.charms);
        container.setHTML(this.templateWrapper({ initial: 'Loading...'}));
        panel.addClass('animate-in');
        container.show();
        this.set('rendered', true);
      }
    },

    /**
       Handles animation and url cleanup and destroys the view on close.

       @method close
       @param {Event} ev The event.
     */
    close: function(ev) {
      ev.halt();
      var panel = Y.one('.charmbrowser'),
          container = this.get('container');
      panel.removeClass('animate-in');
      if (window.location.hash) {
        window.location.hash = '';
      }
      this.fire('changeState', { sectionA: { metadata: { charm: false }}});
      this.viewletManager.hideSlot(ev);
      container.empty();
      this.destroy();
    },
    /**
      Removes the class from the left breakout panel saying there is a charm.
      Destroys the charmView tabview instance.

      @method destructor
    */
    destructor: function() {
      var breakout = this.get('container').one('.left-breakout');
      // Tests don't have this element.
      if (breakout) { breakout.removeClass('with-charm'); }
      // If the view is never rendered then charmView will not exist.
      if (this.charmView) { this.charmView.destroy(); }
      // XXX j.c.sackett Aug 11, 2014 The viewlet/slot stuff doesn't properly
      // destroy charm details and create a new one, so we have to set rendered
      // to false here to ensure "destruction" works.
      this.set('rendered', false);
    }
  }, {
    ATTRS: {
      /**
         Whether or not the viewlet has been rendered.

         @attribute rendered
         @default undefined
         @type {Boolean}
       */
      rendered: {}
    }
  });

}, '0.0.1', {
  requires: [
    'node',
    'subapp-browser-charmview',
    'subapp-browser-bundleview',
    'juju-charm-models',
    'juju-view',
    'viewlet-view-base'
  ]
});
