/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'lbac',
    'io',
    'common',
    'tiny-console'  // a jQuery plugin
], function ($, _, Backbone, lbac, io, common) {
    'use strict';

    // Convert a chapter/section title to a camelcase identifier
    function titleToIdent(title) {
        var words;

        // Filter out unnecessory characters
        title = title.replace(/Chapter\s*\d*\s*/, '');
        title = title.replace(/\d+\.\d+\.?\d?\s*/, '');
        title = title.replace(/-/g, ' ');
        title = title.replace(/[,\/"]/g, '');
        words = title.split(' ');

        // convert title words to a camelcase identifier
        $.each(words, function (i, word) {
            if (i === 0) {
                words[0] = word.toLowerCase();
            } else {
                words[i] = word.substr(0, 1).toUpperCase() +
                        word.substr(1).toLowerCase();
            }
        });
        return words.join('');
    }

    // Get the bound main function
    function boundMain(obj) {
        return _.bind(obj.main, obj);
    }


    // Console view
    var ConsoleView = Backbone.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {

            // Initialize the tiny console
            this.$el.tinyConsole({
                editorElement: 'editor',
                runButtonElement: 'run-button',
                height: 350,
                // width: '80%',
                // tabSize: 4   // browser default: 8
                // prompt: 'Hi there>',
                highlight: 'output' // input, output or both
            });

            // Setup io routines for the lbac package
            io.set({
                read: this.$el.tinyConsole('getFunction', 'read'),
                readLn: this.$el.tinyConsole('getFunction', 'readLn'),
                write: this.$el.tinyConsole('getFunction', 'write'),
                writeLn: this.$el.tinyConsole('getFunction', 'writeLn'),
                halt: this.$el.tinyConsole('getFunction', 'halt')
            });
            return this;
        },

        // Update console prompt and execution method,
        // return true if success and false if fail
        update: function (ch, sec) {
            var chapterTitle = common.getTitle(ch),
                sectionTitle = common.getTitle(ch, sec),
                c = titleToIdent(chapterTitle),
                s = titleToIdent(sectionTitle);

            // Deal with lbac modules with secial names

            // 7.13 Merging scanner and parser
            if (s === 'judiciousCopying' ||
                    s === 'mergingScannerAndParser') {
                c = 'kiss';
            }
            // 11.6 Conclusion: Tiny v1.1
            if (c === 'lexicalScanRevisited' && s === 'conclusion') {
                c = 'tiny_11';
                s = 'run';
            }

            // Set the excute function and update the promput
            if (lbac[c] && lbac[c][s]) {
                this.$el.tinyConsole('setExecute', boundMain(lbac[c][s]));
                this.$el.tinyConsole('option', 'prompt', sectionTitle + '>');
                return true;
            }

            return false;
        }
    });

    return ConsoleView;
});
