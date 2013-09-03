/*! ------------------------------------------------------------------------
//                         jTypes Development Studio
//  ------------------------------------------------------------------------
//
//                   Copyright 2013 Gaulinsoft Corporation
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
(function(window, $, $$, undefined)
{
    // Create the development environment
    $$.dev = $$.dev || {};

    // Create the split grid class
    var $_grid      = $$.dev.Grid;
    var $_splitGrid = $$.dev.SplitGrid = $$($_grid, function($grid, $dock, $width, $height, $position, $name)
    {
        // Get the true context
        var $this = Object.getPrototypeOf(this);

        // FORMAT $position
        // FORMAT $name
        $position = $$.asFloat($position);
        $name     = $$.asString($name);

        // If local storage is supported and a name was provided
        if (localStorage && $name)
        {
            // Set the slide grid name
            $this._name = $name;

            // Get the slide grid cache from the local storage
            var $cacheDock = localStorage.getItem($_splitGrid.cachePrefix + $name + '.dock');
            var $cachePos  = localStorage.getItem($_splitGrid.cachePrefix + $name + '.position');

            // If a cache was found
            if ($$.isValueType($cacheDock) && $$.isValueType($cachePos))
            {
                // Extract the dock layout and divider position
                $dock     = $$.asString($cacheDock).substr(0, 1);
                $position = $$.asFloat($cachePos) * 100;
            }
        }

        // If the position is NaN, set it to 50%
        if (isNaN($position))
            $position = 50;
                
        // Ensure the value is between the minimum and maximum
        $position = Math.max($position, 1);
        $position = Math.min($position, 99);

        // Store the self reference
        var $self = $this.__self;

        // Adjust the position value
        $position /= 100;

        switch ($dock)
        {
            case 't':
            case 'b':
                
                // Set the dock layout type
                $this._dock = $dock === 'b' ? 'bottom' : 'top';

                // Construct the grid
                this.__base(2, 1, $width, $height);

                // Get the jQuery column wrapper
                var $columns = $($self[0]).children();
                
                // Set the jQuery row wrappers
                $this._absolute = $columns.eq($dock === 'b' ? 1 : 0);
                $this._relative = $columns.eq($dock === 't' ? 1 : 0);

                break;

            case 'l':
            case 'r':
            default:
                
                // Set the dock layout type
                $this._dock = $dock === 'r' ? 'right' : 'left';

                // Construct the grid
                this.__base(1, 2, $width, $height);
                
                // Get the jQuery column wrappers
                $this._absolute = $($self[$dock === 'r' ? 1 : 0]);
                $this._relative = $($self[$dock === 'l' ? 1 : 0]);

                break;
        }

        // Create the divider jQuery wrapper
        $this._divider = $('<div />')
            // Add the divider class to the divider
            .addClass($_splitGrid.dividerClass)
            // Bind a mousedown event handler to the divider
            .on('mousedown.splitGrid', $this, $_splitGrid._mousedown);

        // Set the divider position and create the grid jQuery wrapper
        $this._pos  = $position;
        $this._grid = $($grid)
            // Add the dock class to the grid
            .addClass($this._dock)
            // Append the columns and divider to the grid
            .append($($self))
            .append($this._divider);

        // Refresh the grid and build the cache
        $this.refresh(true);
        $this.cache();
    },
    {
        // JQUERY WRAPPERS
        _absolute: $$.protected(null),
        _divider:  $$.protected(null),
        _grid:     $$.protected(null),
        _relative: $$.protected(null),
        
        // DRAG-STATE + DOCK LAYOUT
        _drag: $$.protected(null),
        _dock: $$.protected(''),

        // DRAGGING + DOCK ACCESSORS
        dragging: $$.public(
        {
            'get': function()
            {
                // Return true if a drag state object is found
                return !!this._drag;
            }
        }),
        dock: $$.public(
        {
            'get': function()
            {
                // Return the dock layout type
                return this._dock;
            }
        }),

        // NAME + POSITION
        _name: $$.protected(''),
        _pos:  $$.protected(0.5),

        // NAME + POSITION ACCESSORS
        name: $$.public(
        {
            'get': function()
            {
                // Return the split grid name
                return this._name;
            }
        }),
        position: $$.public(
        {
            'get': function()
            {
                // Return the position
                return this._pos * 100;
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = $$.asFloat($v) || 0;

                // Adjust the value
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
        }),

        // WIDTH/HEIGHT ACCESSOR OVERRIDES
        height: $$.public('override',
        {
            'set': function($v)
            {
                // Set the new height
                this.__base.height = $v;

                // If the split grid has not been initialized, return
                if (!this._grid)
                    return;
                
                // If the dock layout is left or right
                if (this._dock === 'left' || this._dock === 'right')
                    this._grid
                        // Set the new grid height
                        .css('height', this._h + (this._hIsP ? '%' : 'px'));
                // Refresh the grid
                else
                    this.refresh(true);
            }
        }),
        width: $$.public('override',
        {
            'set': function($v)
            {
                // Set the new width
                this.__base.width = $v;

                // If the split grid has not been initialized, return
                if (!this._grid)
                    return;
                
                // If the dock layout is top or bottom
                if (this._dock === 'top' || this._dock === 'bottom')
                    this._grid
                        // Set the new grid width
                        .css('width', this._w + (this._wIsP ? '%' : 'px'));
                // Refresh the grid
                else
                    this.refresh(true);
            }
        }),
        
        // MAXIMUM/MINIMUM
        _max: $$.protected(0.99),
        _min: $$.protected(0.01),

        // MAXIMUM/MINIMUM ACCESSORS
        maximum: $$.public(
        {
            'get': function()
            {
                // Return the max percentage
                return this._max * 100;
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = $$.asFloat($v) || 0;
                
                // Ensure the value is between 1% and 99%
                $v = Math.max($v, 1);
                $v = Math.min($v, 99);

                // Set the max value
                this._max = $v / 100;

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
        }),
        minimum: $$.public(
        {
            'get': function()
            {
                // Return the min percentage
                return this._min * 100;
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = $$.asFloat($v) || 0;
                
                // Ensure the value is between 1% and 99%
                $v = Math.max($v, 1);
                $v = Math.min($v, 99);

                // Set the min value
                this._min = $v / 100;

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
        }),

        // CACHE + REFRESH
        cache:   $$.protected('virtual', function()
        {
            // If local storage is supported and a name was provided
            if (localStorage && this._name)
            {
                // Cache the data in the local storage
                localStorage.setItem($_splitGrid.cachePrefix + this._name + '.dock', this._dock);
                localStorage.setItem($_splitGrid.cachePrefix + this._name + '.position', this._pos);
            }
        }),
        refresh: $$.protected('virtual', function($divider)
        {
            // Get the spacing
            var $spacing = this._pos;

            switch (this._dock)
            {
                // HORIZONTAL
                case 'bottom':
                case 'top':

                    // Convert the spacing to the proper units
                    $spacing *= this._hIsP ? 100 : this._h;

                    // If the layout is docked to the bottom
                    if (this._dock === 'bottom')
                    {
                        this._relative
                            // Set the relative height
                            .css('height', $spacing + (this._hIsP ? '%' : 'px'));

                        // Calculate the y-position from the bottom
                        $spacing = this._h - $spacing;
                    }
                    else
                        this._relative
                            // Set the relative height
                            .css('height', (this._h - $spacing) + (this._hIsP ? '%' : 'px'));

                    // Append the spacing units to the spacing
                    $spacing += this._hIsP ? '%' : 'px';

                    this._absolute
                        // Set the absolute height
                        .css('height', $spacing);

                    break;
                    
                // VERTICAL
                case 'left':
                case 'right':

                    // Convert the spacing to the proper units
                    $spacing *= this._wIsP ? 100 : this._w;

                    // If the layout is docked to the right
                    if (this._dock === 'right')
                    {
                        this._relative
                            // Set the relative width
                            .css('width', $spacing + (this._hIsP ? '%' : 'px'));

                        // Calculate the x-position from the right
                        $spacing = this._w - $spacing;
                    }
                    else
                        this._relative
                            // Set the relative width
                            .css('width', (this._w - $spacing) + (this._hIsP ? '%' : 'px'));

                    // Append the spacing units to the spacing
                    $spacing += this._wIsP ? '%' : 'px';

                    this._absolute
                        // Set the absolute width
                        .css('width', $spacing);

                    break;
            }

            // If the divider is being refreshed
            if ($divider)
            {
                // Create the CSS settings object
                var $css = {};

                // Set the divider position in the CSS settings object
                $css[this._dock] = $spacing;

                this._divider
                    // Set the divider position
                    .css($css);
            }
        }),

        // MOUSE EVENTS
        'static _mousedown': function(e)
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
            $drag.offsetX = $$.asInt(e.pageX) - $drag.left;
            $drag.offsetY = $$.asInt(e.pageY) - $drag.top;

            // If a drag timeout exists, create the drag timeout
            if ($_splitGrid.dragTimeout)
                $drag.timeout = setTimeout($_splitGrid._mousetimeout, $_splitGrid.dragTimeout);

            // Set the drag-state
            $this._drag = $drag;
            
            $this._grid
                // Add the "drag" class to the grid
                .addClass($_splitGrid.dragClass);

            $(window.document)
                // Bind the mousemove event handler to the document
                .on('mousemove.splitGrid', $this, $_splitGrid._mousemove)
                // Bind the mouseup event handler to the document
                .on('mouseup.splitGrid', $this, $_splitGrid._mouseup);

            return false;
        },
        'static _mousemove': function(e)
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
            $drag.timeout = setTimeout($_splitGrid._mousetimeout, $_splitGrid.dragTimeout);

            switch ($this._dock)
            {
                // HORIZONTAL
                case 'bottom':
                case 'top':

                    // Get the grid height and calculate the y-position
                    var $height    = $$.asFloat($this._grid.height());
                    var $positionY = $$.asInt(e.pageY) - $drag.offsetY;
                    
                    // Ensure the y-position is between the min and max
                    $positionY = Math.min($positionY, $this._max * $height);
                    $positionY = Math.max($positionY, $this._min * $height);

                    // Set the new position
                    $this._pos = $positionY / $height;

                    // Refresh the grid (but not the divider)
                    $this.refresh(false);

                    return false;
                    
                // VERTICAL
                case 'left':
                case 'right':
                    
                    // Calculate the x-position and get grid width
                    var $positionX = $$.asInt(e.pageX) - $drag.offsetX;
                    var $width     = $$.asFloat($this._grid.width());
                    
                    // Ensure the x-position is between the min and max
                    $positionX = Math.min($positionX, $this._max * $width);
                    $positionX = Math.max($positionX, $this._min * $width);

                    // Set the new position
                    $this._pos = $positionX / $width;

                    // Refresh the grid (but not the divider)
                    $this.refresh(false);

                    return false;
            }
        },
        'static _mousetimeout': function()
        {
            $(window.document)
                // Trigger the mouse up event handler on the document
                .triggerHandler('mouseup.splitGrid');
        },
        'static _mouseup': function(e)
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
                .removeClass($_splitGrid.dragClass);

            $(window.document)
                // Unbind the document event hanlders
                .unbind('mousemove.splitGrid')
                .unbind('mouseup.splitGrid');

            // Clear the drag-state object
            $this._drag = null;

            // Refresh the grid with the divider and build the cache
            $this.refresh(true);
            $this.cache();

            return false;
        },
        
        'static cachePrefix':  '~jT_SplitGrid:',
        'static dividerClass': 'separator',
        'static dragClass':    'drag',
        'static dragTimeout':  5000
    });
})(window, jQuery, jTypes);