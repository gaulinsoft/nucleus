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
    $$.dev = $$.asObject($$.dev);

    // Create the set helper function
    var $_set = function($this, $k, $v)
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
                // Set a flag if the value is a percentage
                var $isP = $this['_' + $k + 'IsP'] = $v[$v.length - 1] === '%';

                // If the width is not a percentage
                if (!$isP)
                {
                    // If the value ends with "px", remove it from the value
                    if ($v.length > 1 && $v.substr($v.length - 2) === 'px')
                        $v = $v.substr(0, $v.length - 2);
                }
                // Remove the percent sign from the value
                else
                    $v = $v.substr(0, $v.length - 1);

                // Cast the value as a float
                $v = Math.max(0, $$.asFloat($v.trim(), true));
            }
            // Reset the value
            else
                $v = 0;

            // Set the value (greater than or equal to zero)
            $this['_' + $k] = Math.max($v, 0);
        }
        else
        {
            // Set the value (greater than or equal to zero)
            $this['_' + $k]         = Math.max(0, $$.asFloat($v, true));
            $this['_' + $k + 'IsP'] = false;
        }
    };

    // Create the grid class
    $$.dev.Grid = $$.dev.Grid || $$('abstract', function($rows, $columns, $width, $height)
    {
        // FORMAT $rows
        // FORMAT $columns
        $rows    = $$.asInt($rows, true);
        $columns = $$.asInt($columns, true);

        // Set the row and column counts (greater than or equal to one)
        this.columns = Math.max($columns, 1);
        this.rows    = Math.max($rows, 1);

        // If a width and height were provided
        if ($$.isObject($width) && $$.isObject($height))
        {
            // Set the width and height
            this.height = $height;
            this.width  = $width;
        }

        // Calculate the column width and row height
        var $columnWidth = 100 / this.columns + '%';
        var $rowHeight   = 100 / this.rows + '%';

        for (var $i = 0, $c = this.columns, $r = this.rows; $i < $c; $i++)
        {
            // Create the column
            var $column = $('<div />')
                // Add the column and column-instance classes to the column
                .addClass(this.__type.columnClass)
                .addClass(this.__type.columnClassPrefix + $i)
                // Set the column width
                .css('width', $columnWidth);

            for (var $j = 0; $j < $r; $j++)
                $column
                    // Append the row to the column
                    .append
                    (
                        // Create the row element
                        $('<div />')
                            // Add the row and row-instance classes to the row
                            .addClass(this.__type.rowClass)
                            .addClass(this.__type.rowClassPrefix + $j)
                            // Set the row height
                            .css('height', $rowHeight)
                    );

            // Set the column in the grid
            this.__self[$i] = $column[0];
        }

        // Set the grid length
        this.__self.length = this.columns;
    },
    // ----- PRIVATE -----
    {},
    // ----- PROTECTED -----
    {
        // WIDTH/HEIGHT
        '_h': 100,
        '_w': 100,

        // PERCENTAGE
        '_hIsP': true,
        '_wIsP': true
    },
    // ----- PUBLIC -----
    {
        // WIDTH/HEIGHT ACCESSORS
        'abstract height':
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
                // Set the height
                $_set(this, 'h', $v);
            }
        },
        'abstract width':
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
                // Set the width
                $_set(this, 'w', $v);
            }
        },

        // ROWS/COLUMNS
        'columns': ['get', 'private set', 1],
        'rows':    ['get', 'private set', 1]
    },
    // ----- STATIC -----
    {
        'static columnClass':       'column',
        'static rowClass':          'row',
        'static columnClassPrefix': 'C',
        'static rowClassPrefix':    'R'
    });
})(window, jQuery, jTypes);