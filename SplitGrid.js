/*! ------------------------------------------------------------------------
//                         jTypes Development Studio
//  ------------------------------------------------------------------------
//
//                   Copyright 2014 Gaulinsoft Corporation
//
//       Licensed under the Apache License, Version 2.0 (the "License");
//      you may not use this file except in compliance with the License.
//                   You may obtain a copy of the License at
//
//                 http://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
//      distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
//                       limitations under the License.
*/
/// <reference path="Grid.js" />
(function(window, $, $$, undefined)
{
    // If the SplitGrid class is already defined, return
    if ($$.SplitGrid)
        return;

    // Create the split grid class
    $$('SplitGrid : Grid', function($grid, $dock, $width, $height, $position, $name)
    {
        // FORMAT $grid
        // FORMAT $dock
        // FORMAT $position
        // FORMAT $name
        $grid     = $($grid);
        $dock     = $$.asString($dock).toLowerCase();
        $position = Math.max(0, $$.asFloat($position, true));
        $name     = $$.asString($name);

        // If local storage is supported and a name was provided
        if (localStorage && $name)
        {
            // Set the split grid name
            this.name = $name;

            // Get the split grid cache from the local storage
            var $cacheDock = localStorage.getItem(this.__type.cachePrefix + $name + '.dock');
            var $cachePos  = localStorage.getItem(this.__type.cachePrefix + $name + '.position');

            // If a cache was found
            if ($$.isValueType($cacheDock) && $$.isValueType($cachePos))
            {
                // Extract the dock layout and divider position
                $dock     = $$.asString($cacheDock);
                $position = $$.asFloat($cachePos, true) * 100;
            }
        }

        // If the position is NaN, set it to the midpoint
        if (isNaN($position))
            $position = 50;

        // Ensure the position is between the minimum and maximum
        $position = Math.max($position, 1);
        $position = Math.min($position, 99);

        // Convert the position from a percentage
        $position /= 100;

        switch ($dock.trim())
        {
            case 't':
            case 'top':
            case 'b':
            case 'bottom':

                // Set the dock layout type
                this.dock = $dock[0] === 'b' ? 'bottom' : 'top';

                // Construct the grid
                this.__base(2, 1, $width, $height);

                // Get the rows jQuery wrapper
                var $rows = $(this.__self[0]).children();

                // Set the row jQuery wrappers
                this._absolute = $rows.eq($dock[0] === 'b' ? 1 : 0);
                this._relative = $rows.eq($dock[0] === 't' ? 1 : 0);

                break;

            case 'l':
            case 'left':
            case 'r':
            case 'right':
            default:

                // Set the dock layout type
                this.dock = $dock[0] === 'r' ? 'right' : 'left';

                // Construct the grid
                this.__base(1, 2, $width, $height);

                // Get the column jQuery wrappers
                this._absolute = $(this.__self[$dock[0] === 'r' ? 1 : 0]);
                this._relative = $(this.__self[$dock[0] === 'l' ? 1 : 0]);

                break;
        }

        // Create the divider jQuery wrapper
        this._divider = $('<div />')
            // Add the divider class to the divider
            .addClass(this.__type.dividerClass)
            // Bind a mousedown event handler to the divider
            .on('mousedown.' + this.__type.eventNamespace, this.__data, this.__type._mousedown);

        // Set the divider position and create the grid jQuery wrapper
        this._pos  = $position;
        this._grid = $grid
            // Add the dock class to the grid
            .addClass(this.dock)
            // Set the grid height
            .css('height', this._h + (this._hIsP ? '%' : 'px'))
            // Set the grid width
            .css('width', this._w + (this._wIsP ? '%' : 'px'))
            // Append the columns and divider to the grid
            .append($(this.__self))
            .append(this._divider);

        // Refresh the grid and build the cache
        this.refresh(true);
        this.cache();
    },
    // ----- PRIVATE -----
    {
        // DRAG-STATE
        '_drag': null
    },
    // ----- PROTECTED -----
    {
        // POSITION
        '_pos': 0.5,

        // MAXIMUM/MINIMUM
        '_max': 0.99,
        '_min': 0.01,

        // CACHE + REFRESH
        'virtual cache':   function()
        {
            // If local storage is supported and a name was provided
            if (localStorage && this.name)
            {
                // Cache the data in the local storage
                localStorage.setItem(this.__type.cachePrefix + this.name + '.dock', this.dock);
                localStorage.setItem(this.__type.cachePrefix + this.name + '.position', this._pos);
            }
        },
        'virtual refresh': function($divider)
        {
            // FORMAT $divider
            $divider = $$.asBool($divider);

            // Get the spacing
            var $spacing = this._pos * 100;

            switch (this.dock)
            {
                // HORIZONTAL
                case 'bottom':
                case 'top':

                    // If the layout is docked to the bottom
                    if (this.dock === 'bottom')
                    {
                        this._relative
                            // Set the relative height
                            .css('height', $spacing + '%');

                        // Calculate the y-position from the bottom
                        $spacing = 100 - $spacing;
                    }
                    else
                        this._relative
                            // Set the relative height
                            .css('height', 100 - $spacing + '%');

                    this._absolute
                        // Set the absolute height
                        .css('height', $spacing + '%');

                    break;

                // VERTICAL
                case 'left':
                case 'right':

                    // If the layout is docked to the right
                    if (this.dock === 'right')
                    {
                        this._relative
                            // Set the relative width
                            .css('width', $spacing + '%');

                        // Calculate the x-position from the right
                        $spacing = 100 - $spacing;
                    }
                    else
                        this._relative
                            // Set the relative width
                            .css('width', 100 - $spacing + '%');

                    this._absolute
                        // Set the absolute width
                        .css('width', $spacing + '%');

                    break;
            }

            // If the divider is being refreshed
            if ($divider)
            {
                // Create the CSS settings object
                var $css = {};

                // Set the divider position in the CSS settings object
                $css[this.dock] = $spacing + '%';

                this._divider
                    // Set the divider position
                    .css($css);
            }
        },

        // ELEMENTS
        '_absolute': $(),
        '_divider':  $(),
        '_grid':     $(),
        '_relative': $()
    },
    // ----- PUBLIC -----
    {
        // DOCK + NAME
        'dock': ['get', 'private set', ''],
        'name': ['get', 'private set', ''],

        // POSITION
        'position':
        {
            'get': function()
            {
                // Return the position
                return this._pos * 100;
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = Math.max(0, $$.asFloat($v, true));

                // Convert the value from a percentage
                $v /= 100;

                // Ensure the value is between the minimum and maximum
                $v = Math.max($v, this._min);
                $v = Math.min($v, this._max);

                // Set the new position
                this._pos = $v;

                // Refresh the grid and build the cache
                this.refresh(true);
                this.cache();
            }
        },

        // MAXIMUM/MINIMUM
        'maximum':
        {
            'get': function()
            {
                // Return the max percentage
                return this._max * 100;
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = Math.max(0, $$.asFloat($v, true));

                // Ensure the value is between 1% and 99%
                $v = Math.max($v, 1);
                $v = Math.min($v, 99);

                // Set the max value
                this._max = $v / 100;

                // If the minimum value is greater than the maximum value, return
                if (this._min > this._max)
                    return;

                // If the position is greater than the maximum value
                if (this._pos > this._max)
                {
                    // Set the current position to the maximum position
                    this._pos = this._max;

                    // Refresh the grid and build the cache
                    this.refresh(true);
                    this.cache();
                }
            }
        },
        'minimum':
        {
            'get': function()
            {
                // Return the min percentage
                return this._min * 100;
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = Math.max(0, $$.asFloat($v, true));

                // Ensure the value is between 1% and 99%
                $v = Math.max($v, 1);
                $v = Math.min($v, 99);

                // Set the min value
                this._min = $v / 100;

                // If the maximum value is less than the minimum value, return
                if (this._max < this._min)
                    return;

                // If the position is less than the minimum value
                if (this._pos < this._min)
                {
                    // Set the current position to the minimum position
                    this._pos = this._min;

                    // Refresh the grid and build the cache
                    this.refresh(true);
                    this.cache();
                }
            }
        },

        // WIDTH/HEIGHT OVERRIDES
        'override height':
        {
            'set': function($v)
            {
                // Set the new height
                this.__base.height = $v;

                // If the split grid has not been initialized, return
                if (!this._grid)
                    return;

                this._grid
                    // Set the new grid height
                    .css('height', this._h + (this._hIsP ? '%' : 'px'));

                // If the dock layout is top or bottom, refresh the grid
                if (this.dock === 'top' || this.dock === 'bottom')
                    this.refresh(true);
            }
        },
        'override width':
        {
            'set': function($v)
            {
                // Set the new width
                this.__base.width = $v;

                // If the split grid has not been initialized, return
                if (!this._grid)
                    return;

                this._grid
                    // Set the new grid width
                    .css('width', this._w + (this._wIsP ? '%' : 'px'));

                // If the dock layout is left or right, refresh the grid
                if (this.dock === 'left' || this.dock === 'right')
                    this.refresh(true);
            }
        },

        // DRAGGING
        'dragging':
        {
            'get': function()
            {
                // Return true if a drag state object is found
                return !!this._drag;
            }
        }
    },
    // ----- STATIC -----
    {
        // MOUSE EVENTS
        'static const _mousedown':    function(e)
        {
            // If the mouse key is not a left click, return
            if (e.which !== 1)
                return;

            // Get the private instance
            var $this = e.data;

            // If a drag-state object was found, return
            if ($this._drag)
                return;

            // Prevent the default behavior of the key
            e.preventDefault();

            // Create the drag-state and position objects
            var $drag     = {};
            var $position = $this._divider.position();

            // Set the position data in the drag-state object
            $drag.left = $this._wIsP ? ($this._pos * $$.asFloat($this._grid.width())) : $$.asFloat($position.left);
            $drag.top  = $this._hIsP ? ($this._pos * $$.asFloat($this._grid.height())) : $$.asFloat($position.top);

            // Set the offset data in the drag-state object
            $drag.offsetX = $$.asInt(e.pageX, true) - $drag.left;
            $drag.offsetY = $$.asInt(e.pageY, true) - $drag.top;

            // If a drag timeout exists, create the drag timeout
            if ($this.__type.dragTimeout)
                $drag.timeout = setTimeout($this.__type._mousetimeout, $this.__type.dragTimeout);

            // Set the drag-state
            $this._drag = $drag;

            $this._grid
                // Add the "drag" class to the grid
                .addClass($this.__type.dragClass);

            $(window.document)
                // Bind the mousemove event handler to the document
                .on('mousemove.' + $this.__type.eventNamespace, $this, $this.__type._mousemove)
                // Bind the mouseup event handler to the document
                .on('mouseup.' + $this.__type.eventNamespace, $this, $this.__type._mouseup);

            return false;
        },
        'static const _mousemove':    function(e)
        {
            // Get the private instance and the drag-state object
            var $this = e.data;
            var $drag = $this._drag;

            // If no drag-state object was found, return
            if (!$drag)
                return;

            // Prevent the default behavior of the move
            e.preventDefault();

            // If a previous drag timeout was found, clear it
            if ($drag.timeout)
                clearTimeout($drag.timeout);

            // Create the drag timeout
            $drag.timeout = setTimeout($this.__type._mousetimeout, $this.__type.dragTimeout);

            switch ($this.dock)
            {
                // HORIZONTAL
                case 'bottom':
                case 'top':

                    // Get the grid height and calculate the y-position
                    var $height    = $$.asFloat($this._grid.height());
                    var $positionY = $$.asInt(e.pageY, true) - $drag.offsetY;

                    // If the max and min are valid
                    if ($this._max >= $this._min)
                    {
                        // Ensure the y-position is between the min and max
                        $positionY = Math.min($positionY, $this._max * $height);
                        $positionY = Math.max($positionY, $this._min * $height);
                    }

                    // Set the new position
                    $this._pos = $positionY / $height;

                    // Refresh the grid (but not the divider)
                    $this.refresh(false);

                    return false;

                // VERTICAL
                case 'left':
                case 'right':

                    // Calculate the x-position and get grid width
                    var $positionX = $$.asInt(e.pageX, true) - $drag.offsetX;
                    var $width     = $$.asFloat($this._grid.width());

                    // If the max and min are valid
                    if ($this._max >= $this._min)
                    {
                        // Ensure the x-position is between the min and max
                        $positionX = Math.min($positionX, $this._max * $width);
                        $positionX = Math.max($positionX, $this._min * $width);
                    }

                    // Set the new position
                    $this._pos = $positionX / $width;

                    // Refresh the grid (but not the divider)
                    $this.refresh(false);

                    return false;
            }
        },
        'static const _mousetimeout': function()
        {
            $(window.document)
                // Trigger the mouse up event handler on the document
                .triggerHandler('mouseup.' + $this.__type.eventNamespace);
        },
        'static const _mouseup':      function(e)
        {
            // Get the private instance and the drag-state object
            var $this = e.data;
            var $drag = $this._drag;

            // If no drag-state object was found, return
            if (!$drag)
                return;

            // Prevent the default behavior of the key
            e.preventDefault();

            // Get the private instance
            var $this = e.data;

            // If a previous drag timeout was found, clear it
            if ($drag.timeout)
                clearTimeout($drag.timeout);

            $this._grid
                // Remove the "drag" class from the grid
                .removeClass($this.__type.dragClass);

            $(window.document)
                // Unbind the document event hanlders
                .unbind('mousemove.' + $this.__type.eventNamespace)
                .unbind('mouseup.' + $this.__type.eventNamespace);

            // Clear the drag-state object
            $this._drag = null;

            // Refresh the grid (along with the divider) and build the cache
            $this.refresh(true);
            $this.cache();

            return false;
        },

        'static cachePrefix':    '~jT_SplitGrid:',
        'static dividerClass':   'separator',
        'static dragClass':      'drag',
        'static dragTimeout':    5000,
        'static eventNamespace': 'splitGrid'
    });
})(window, jQuery, jTypes);