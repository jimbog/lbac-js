/*global define*/

define([
    'jquery',
    'backbone',
    'templates',
    'collections/pager'
], function ($, Backbone, JST, Pager) {
    'use strict';

    // Pager view
    var PagerView = Backbone.View.extend({
        template: JST['app/scripts/templates/pagerItem.ejs'],

        events: {
            'click a': 'itemClicked'
        },

        initialize: function () {
            this.collection = new Pager();
            this.listenTo(this.collection, 'reset', this.render);
        },

        render: function () {
            var that = this;
            this.$el.empty();
            this.collection.each(function (item) {
                that.$el.append(that.template(item.attributes));
            });
            this.$el.find('a').tooltip();
        },

        // Update the pager collection
        update: function (ch, sec) {
            this.collection.update(ch, sec);
        },

        // Extra work to remedy the flicker when switching to chapter
        itemClicked: function (e) {
            var href = $(e.target).attr('href');
            this.trigger('click:item', href);
            e.preventDefault();
        }
    });

    return PagerView;
});
