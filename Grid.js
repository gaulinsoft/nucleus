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

    // Create the grid class
    var $_grid = $$.dev.Grid = $$('abstract', function($rows, $columns, $width, $height)
    {
        // FORMAT $rows
        // FORMAT $columns
        $rows    = $$.asInt($rows);
        $columns = $$.asInt($columns);

        // If the row and column counts are finite
        if (isFinite($rows) && isFinite($columns))
        {
            // Set the row and column counts (greater than or equal to one)
            this._c = Math.max($columns, 1);
            this._r = Math.max($rows, 1);
        }

        // Set the width and height
        this.height = $height;
        this.width  = $width;

        // Calculate the column width and row height
        var $columnWidth = (this._w / this._c) + (this._wIsP ? '%' : 'px' );
        var $rowHeight   = (this._h / this._r) + (this._hIsP ? '%' : 'px' );

        // Store the self reference
        var $self = this.__self;

        for (var $c = 0, $i = this._c, $j = this._r; $c < $i; $c++)
        {
            // Create the column
            var $column = $('<div />')
                // Add the column and column-instance classes to the column
                .addClass($_grid.columnClass)
                .addClass($_grid.columnClassPrefix + $c)
                // Set the column width
                .css('width', $columnWidth);

            for (var $r = 0; $r < $j; $r++)
                $column
                    // Append the row to the column
                    .append
                    (
                        // Create the row element
                        $('<div />')
                            // Add the row and row-instance classes to the row
                            .addClass($_grid.rowClass)
                            .addClass($_grid.rowClassPrefix + $r)
                            // Set the row height
                            .css('height', $rowHeight)
                    );

            // Set the column in the grid
            $self[$c] = $column[0];
        }

        // Set the grid length
        $self.length = this._c;
    },
    {
        // WIDTH/HEIGHT
        _h: $$.protected(100),
        _w: $$.protected(100),

        // PERCENTAGE
        _hIsP: $$.protected(true),
        _wIsP: $$.protected(true),

        // WIDTH/HEIGHT ACCESSORS
        height: $$.public('abstract',
        {
            'get': function()
            {
                // If the height is a percentage, return the percent string
                if (this._hIsP)
                    return this._h + '%';

                // Return the height
                return this._h;
            },
            'set': function($v)
            {
                // Get the value type
                var $type = $$.type($v);

                // If the value is a string
                if ($type === 'string')
                {
                    // Trim the value
                    $v = $v.trim();

                    // If a value was provided
                    if ($v)
                    {
                        // Set a flag if the height is a percentage
                        this._hIsP = $v.charAt($v.length - 1) === '%';

                        // If the height is not a percentage
                        if (!this._hIsP)
                        {
                            // If the value ends with "px", remove it from the value
                            if ($v.length > 1 && $v.substr($v.length - 2) === 'px')
                                $v = $v.substr(0, $v.length - 2);
                        }
                        // Remove the percent sign from the value
                        else
                            $v = $v.substr(0, $v.length - 1);

                        // Cast the value as an integer
                        $v = $$.asInt($v.trim());
                    }
                    // Reset the value
                    else
                        $v = 0;

                    // Set the height (greater than or equal to zero)
                    this._h = isFinite($v) ? Math.max($v, 0) : 0;
                }
                else
                {
                    // Set the height (greater than or equal to zero)
                    this._h    = $type === 'number' ? Math.max($v, 0) : 0;
                    this._hIsP = false;
                }
            }
        }),
        width: $$.public('abstract',
        {
            'get': function()
            {
                // If the width is a percentage, return the percent string
                if (this._wIsP)
                    return this._w + '%';

                // Return the width
                return this._w;
            },
            'set': function($v)
            {
                // Get the value type
                var $type = $$.type($v);

                // If the value is a string
                if ($type === 'string')
                {
                    // Trim the value
                    $v = $v.trim();

                    // If a value was provided
                    if ($v)
                    {
                        // Set a flag if the width is a percentage
                        this._wIsP = $v.charAt($v.length - 1) === '%';

                        // If the width is not a percentage
                        if (!this._wIsP)
                        {
                            // If the value ends with "px", remove it from the value
                            if ($v.length > 1 && $v.substr($v.length - 2) === 'px')
                                $v = $v.substr(0, $v.length - 2);
                        }
                        // Remove the percent sign from the value
                        else
                            $v = $v.substr(0, $v.length - 1);

                        // Cast the value as an integer
                        $v = $$.asInt($v.trim());
                    }
                    // Reset the value
                    else
                        $v = 0;
                    
                    // Set the width (greater than or equal to zero)
                    this._w = isFinite($v) ? Math.max($v, 0) : 0;
                }
                else
                {
                    // Set the width (greater than or equal to zero)
                    this._w    = $type === 'number' ? Math.max($v, 0) : 0;
                    this._wIsP = false;
                }
            }
        }),
        
        // ROWS/COLUMNS
        _c: $$.protected(1),
        _r: $$.protected(1),

        // ROWS/COLUMNS ACCESSORS
        columns: $$.public(
        {
            'get': function()
            {
                // Return the column count
                return this._c;
            }
        }),
        rows: $$.public(
        {
            'get': function()
            {
                // Return the row count
                return this._r;
            },
        }),
        
        'static columnClass':       'column',
        'static rowClass':          'row',
        'static columnClassPrefix': 'C',
        'static rowClassPrefix':    'R',
    });
})(window, jQuery, jTypes);