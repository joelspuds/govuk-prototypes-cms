;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.MOJFrontend = factory();
    }
}(this, function() {
    var MOJFrontend = {};
    MOJFrontend.removeAttributeValue = function(el, attr, value) {
        var re, m;
        if (el.getAttribute(attr)) {
            if (el.getAttribute(attr) == value) {
                el.removeAttribute(attr);
            } else {
                re = new RegExp('(^|\\s)' + value + '(\\s|$)');
                m = el.getAttribute(attr).match(re);
                if (m && m.length == 3) {
                    el.setAttribute(attr, el.getAttribute(attr).replace(re, (m[1] && m[2])?' ':''))
                }
            }
        }
    }

    MOJFrontend.addAttributeValue = function(el, attr, value) {
        var re;
        if (!el.getAttribute(attr)) {
            el.setAttribute(attr, value);
        }
        else {
            re = new RegExp('(^|\\s)' + value + '(\\s|$)');
            if (!re.test(el.getAttribute(attr))) {
                el.setAttribute(attr, el.getAttribute(attr) + ' ' + value);
            }
        }
    };

    MOJFrontend.nodeListForEach = function(nodes, callback) {
        if (window.NodeList.prototype.forEach) {
            return nodes.forEach(callback)
        }
        for (var i = 0; i < nodes.length; i++) {
            callback.call(window, nodes[i], i, nodes)
        }
    };

    MOJFrontend.initAll = function (options) {
        // Set the options to an empty object by default if no options are passed.
        options = typeof options !== 'undefined' ? options : {};

        // Allow the user to initialise MOJ Frontend in only certain sections of the page
        // Defaults to the entire document if nothing is set.
        var scope = typeof options.scope !== 'undefined' ? options.scope : document;


        var $sortableTables = scope.querySelectorAll('[data-module="moj-sortable-table"]');
        MOJFrontend.nodeListForEach($sortableTables, function ($table) {
            new MOJFrontend.SortableTable({
                table: $table
            });
        });

        var $sortableTables = scope.querySelectorAll('[data-module="moj-sortable-table"]');
        MOJFrontend.nodeListForEach($sortableTables, function ($table) {
            new MOJFrontend.SortableTable({
                table: $table
            });
        });
    }


    MOJFrontend.SortableTable = function(params) {
        this.table = $(params.table);

        if (this.table.data('moj-search-toggle-initialised')) {
            return
        }

        this.table.data('moj-search-toggle-initialised', true);

        this.setupOptions(params);
        this.body = this.table.find('tbody');
        this.createHeadingButtons();
        this.createStatusBox();
        this.table.on('click', 'th button', $.proxy(this, 'onSortButtonClick'));
    };

    MOJFrontend.SortableTable.prototype.setupOptions = function(params) {
        params = params || {};
        this.statusMessage = params.statusMessage || 'Sort by %heading% (%direction%)';
        this.ascendingText = params.ascendingText || 'ascending';
        this.descendingText = params.descendingText || 'descending';
    };

    MOJFrontend.SortableTable.prototype.createHeadingButtons = function() {
        var headings = this.table.find('thead th');
        var heading;
        for(var i = 0; i < headings.length; i++) {
            heading = $(headings[i]);
            if(heading.attr('aria-sort')) {
                this.createHeadingButton(heading, i);
            }
        }
    };

    MOJFrontend.SortableTable.prototype.createHeadingButton = function(heading, i) {
        var text = heading.text();
        var button = $('<button type="button" data-index="'+i+'">'+text+'</button>');
        heading.text('');
        heading.append(button);
    };

    MOJFrontend.SortableTable.prototype.createStatusBox = function() {
        this.status = $('<div aria-live="polite" role="status" aria-atomic="true" class="govuk-visually-hidden" />');
        this.table.parent().append(this.status);
    };

    MOJFrontend.SortableTable.prototype.onSortButtonClick = function(e) {
        var columnNumber = e.currentTarget.getAttribute('data-index');
        var sortDirection = $(e.currentTarget).parent().attr('aria-sort');
        var newSortDirection;
        if(sortDirection === 'none' || sortDirection === 'descending') {
            newSortDirection = 'ascending';
        } else {
            newSortDirection = 'descending';
        }
        var rows = this.getTableRowsArray();
        var sortedRows = this.sort(rows, columnNumber, newSortDirection);
        this.addRows(sortedRows);
        this.removeButtonStates();
        this.updateButtonState($(e.currentTarget), newSortDirection);
    };

    MOJFrontend.SortableTable.prototype.updateButtonState = function(button, direction) {
        button.parent().attr('aria-sort', direction);
        var message = this.statusMessage;
        message = message.replace(/%heading%/, button.text());
        message = message.replace(/%direction%/, this[direction+'Text']);
        this.status.text(message);
    };

    MOJFrontend.SortableTable.prototype.removeButtonStates = function() {
        this.table.find('thead th').attr('aria-sort', 'none');
    };

    MOJFrontend.SortableTable.prototype.addRows = function(rows) {
        for(var i = 0; i < rows.length; i++) {
            this.body.append(rows[i]);
        }
    };

    MOJFrontend.SortableTable.prototype.getTableRowsArray = function() {
        var rows = [];
        var trs = this.body.find('tr');
        for (var i = 0; i < trs.length; i++) {
            rows.push(trs[i]);
        }
        return rows;
    };

    MOJFrontend.SortableTable.prototype.sort = function(rows, columnNumber, sortDirection) {
        var newRows = rows.sort($.proxy(function(rowA, rowB) {
            var tdA = $(rowA).find('td').eq(columnNumber);
            var tdB = $(rowB).find('td').eq(columnNumber);
            var valueA = this.getCellValue(tdA);
            var valueB = this.getCellValue(tdB);
            if(sortDirection === 'ascending') {
                if(valueA < valueB) {
                    return -1;
                }
                if(valueA > valueB) {
                    return 1;
                }
                return 0;
            } else {
                if(valueB < valueA) {
                    return -1;
                }
                if(valueB > valueA) {
                    return 1;
                }
                return 0;
            }
        }, this));
        return newRows;
    };

    MOJFrontend.SortableTable.prototype.getCellValue = function(cell) {
        var val = cell.attr('data-sort-value');
        val = val || cell.html();
        if($.isNumeric(val)) {
            val = parseInt(val, 10);
        }
        return val;
    };

    return MOJFrontend;
}));
