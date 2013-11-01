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
/// <reference path="SplitGrid.js" />
(function(window, $, $$, undefined)
{
    // Create the helper functions
    var $_icon  = function($icon)
    {
        // Return the icon path
        return 'img/' + $icon + '.svg';
    };
    var $_pad   = function($string, $length, $character)
    {
        // FORMAT $string
        // FORMAT $character
        $string    = $$.asString($string);
        $character = $$.asString($character) || '0';

        // Pad the string to the provided length
        while ($string.length < $length)
            $string = $character[0] + $string;

        // Return the padded string
        return $string;
    };
    var $_stack = function($stack, $trim)
    {
        // Format the stack trace
        $stack = $stack.replace($stack.match(/^\s*(Error|TypeError)/) ? /^[^\r\n]*(\r?\n)?[^\r\n]+(\r?\n)?[^\r\n]+/ : /^[^\r\n]*(\r?\n)?[^\r\n]+/, 'console.trace()');
        $stack = $stack.replace(/\r?\n\s*/g, '\n    ');
        $stack = $stack.replace(/http\:\/\/(localhost\:?|(www\.)?jtypes\.(com|azurewebsites\.net)|([a-z0-9]+\.)?gaulinsoft\.com\:?)[^\:]+\:?/g, '');

        // If the stack trace is being trimmed, perform further formats on the stack trace
        if ($trim)
            $stack = $stack.replace(/(\r?\n)?[^\r\n]+(\r?\n)?[^\r\n]+(virtual evaluate)[\s\S]*?$/, '');

        // Return the stack trace
        return $stack;
    };

    // Create the console class
    $$.dev.Console = $$.dev.Console || $$($$.dev.SplitGrid, function($window, $parent, $width, $height, $position, $name)
    {
        // FORMAT $window
        // FORMAT $parent
        // FORMAT $name
        $window = $$.isWindowLikeObject($window) ? $window : {};
        $parent = $($parent);
        $name   = $$.asString($name);

        // Create the console element
        var $console = $('<div />')
            // Add the grid class to the console wrapper
            .addClass(this.__type.gridClass)
            // Append the console element to the parent element
            .appendTo($parent);

        // Call the base constructor
        this.__base($console, 'b', $width, $height, $position, $name);

        // Store the console, output, and window references
        this._console = $$.asObject($window.console);
        this._input   = this._absolute;
        this._output  = this._relative;
        this._window  = $window;

        this._output
            // Bind the scroll event handler to the output element
            .on('scroll', this.__data, this.__type._output_scroll)

        // Create the groups and history arrays along with the profiles and timers lookups
        this._groups   = [];
        this._history  = [];
        this._profiles = $$.flat();
        this._timers   = $$.flat();

        // If local storage is supported and a name was provided
        if (localStorage && $name)
        {
            // Get the console history cache from the local storage
            var $cacheHistory = localStorage.getItem(this.__type.cachePrefix + $name + '.history');

            // If a cache was found, parse the cache into the history array
            if ($$.isValueType($cacheHistory))
                this._history = $$.asArray(JSON.parse($cacheHistory));
        }

        // Set the default maximum and minimum positions
        this.maximum = this.__type.gridMaximum;
        this.minimum = this.__type.gridMinimum;

        // Create the controls element
        this._controls = $('<div />')
            // Add the controls class to the controls wrapper
            .addClass(this.__type.controlsClass)
            // Append the controls element to the input element
            .appendTo(this._input[0]);

        // Create the controls clear button
        this._controlsClear = $('<a />')
            // Add the button clear class to the controls clear button
            .addClass(this.__type.buttonClassClear)
            // Append the image element to the controls clear button
            .append
            (
                $('<img />')
                    // Set the image source
                    .attr('src', this.__type.buttonIconClear)
            )
            // Append the controls clear button to the controls element
            .appendTo(this._controls[0])
            // Bind the click event handler to the controls clear button
            .on('click', this.__data, this.__type._controls_clear_click);

        // Create the controls eval button
        this._controlsEval = $('<a />')
            // Add the button eval class to the controls eval button
            .addClass(this.__type.buttonClassEval)
            // Append the image element to the controls eval button
            .append
            (
                $('<img />')
                    // Set the image source
                    .attr('src', this.__type.buttonIconEval)
            )
            // Append the controls eval button to the controls element
            .appendTo(this._controls[0])
            // Bind the click event handler to the controls eval button
            .on('click', this.__data, this.__type._controls_eval_click);

        // Create the code editor
        this._editor = CodeMirror(this._input[0],
        {
            lineNumbers:   false,
            indentUnit:    4,
            matchBrackets: true
        });

        // Bind the keydown and keyup event handlers to the code editor
        this._editor.on('keydown', this._keydown);
        this._editor.on('keyup', this._keyup);

        // Set the console wrapper in the window
        $window.console = (
        {
            assert:         this.$assert,
            clear:          this.$clear,
            debug:          this.$debug,
            dir:            this.$dir,
            error:          this.$error,
            group:          this.$group,
            groupCollapsed: this.$groupCollapsed,
            groupEnd:       this.$groupEnd,
            info:           this.$info,
            log:            this.$log,
            profile:        this.$profile,
            profileEnd:     this.$profileEnd,
            time:           this.$time,
            timeEnd:        this.$timeEnd,
            timeStamp:      this.$timeStamp,
            trace:          this.$trace,
            warn:           this.$warn
        });
    },
    // ----- PRIVATE -----
    {
        // REFERENCES
        '_console': null,
        '_editor':  null,
        '_window':  null,

        // ELEMENTS
        '_controls':        $(),
        //'_controlsBack':    $(),
        '_controlsClear':   $(),
        '_controlsEval':    $(),
        //'_controlsForward': $(),

        // FLAGS
        '_dumping':    false,
        '_evaluating': false,
        '_locked':     false,
        '_scrolling':  false,
        '_tracing':    false,
        '_throwing':   false,

        // STORES
        '_groups':   [],
        '_profiles': null,
        '_timers':   null,

        // DUMP
        'dump': function($object)
        {
            // Create the code element
            var $code = $('<pre />');

            // If the object is a primitive value
            if ($$.isPrimitive($object))
            {
                $code
                    // Add the primitive class to the code element
                    .addClass(this.__type.primitiveClass)
                    // Set the code to the string representation of the primitive
                    .text($object + '');

                // If the object is a primitive string
                if ($$.isString($object))
                    $code
                        // Add the primitive string class to the code element
                        .addClass(this.__type.primitiveStringClass);

                // Return the code element
                return $code;
            }

            // Get the object type (using the jTypes instance in the window context, if available) and global reference name
            var $type   = this._window.jTypes ? this._window.jTypes.type($object) : $$.type($object);
            var $global = $type !== 'regexp' ? $type[0].toUpperCase() + $type.substr(1) : 'RegExp';
            
            switch ($type)
            {
                case 'array':
                case 'class':
                case 'instance':
                case 'object':
                case 'window':

                    // Get the casting function (from the window context)
                    var $cast = $type !== 'class' && $type !== 'instance' ? this._window[$global].prototype.toString : null;
                    
                    // If the object is a class, set the casting function to the default class "toString()" method
                    if ($type === 'class')
                        $cast = this._window.jTypes ? this._window.jTypes.__class.toString : $$.__class.toString;
                    // If the object is an instance, set the casting function to the default instance "toString()" method
                    else if ($type === 'instance')
                        $cast = this._window.jTypes ? this._window.jTypes.__proto.toString : $$.__proto.toString;

                    // If the object has a self "toString()" function and it is not the casting function
                    if ($$.isFunction($object.toString) && $object.toString !== $cast)
                    {
                        // Get the object text
                        var $text = $object.toString();

                        // If the object text is a string and it is not a generic object string
                        if ($$.isString($text) && !$text.match(/^\[(object)\s[_\$a-zA-Z]+[_\$a-zA-Z0-9]*\]$/))
                        {
                            $code
                                // Set the code element text to the object text
                                .text(' ' + $text);

                            break;
                        }
                    }

                    // ########## UNFINISHED ##########

                    var $array  = $type === 'array';
                    var $cutoff = false;
                    var $index  = 0;
                    var $length = 0;
                    var $substr = false;

                    $code
                        .append
                        (
                            $('<span />')
                                .text($array ? ' [' : ' {')
                        );

                    for (var $key in $object)
                    {
                        // If the object is an array and the current key is not the current array index, continue
                        if ($array && $key != $index)
                            continue;
                        
                        var $text  = null;
                        var $value = $object[$key];

                        var $textKey       = JSON.stringify($key);
                        var $textPrimitive = $$.isPrimitive($value);
                        var $textType      = this._window.jTypes ? this._window.jTypes.type($value) : $$.type($value);

                        if ($textPrimitive)
                            $text = $textType === 'string' ? JSON.stringify($value) : $value + '';
                        else if ($textType === 'regexp')
                            $text = 'RegExp';
                        else
                            $text = $textType[0].toUpperCase() + $textType.substr(1);

                        if ($length !== 0)
                        {
                            $code
                                .append
                                (
                                    $('<span />')
                                        .text(', ')
                                );

                            $length += 2;
                        }

                        // TRIM KEY

                        if (!$array)
                            $code
                                .append
                                (
                                    $('<span />')
                                        .text($textKey + ': ')
                                );

                        // TRIM VALUE (ONLY IF IT IS A STRING PRIMITIVE)

                        $code
                            .append
                            (
                                $($textPrimitive ? '<span />' : '<i />')
                                    .text($text)
                            );

                        $length += $textKey.length;
                        $length += $text.length;

                        // SET CUTOFF FLAG

                        $index++;
                    }

                    if ($cutoff)
                        $code
                            .append
                            (
                                $('<i />')
                                    .text(($substr ? '' : ' ') + '... ')
                            );
                    
                    $code
                        .append
                        (
                            $('<span />')
                                .text($array ? ']' : '}')
                        );

                    // ########## UNFINISHED ##########

                    break;
                    
                case 'boolean':
                case 'date':
                case 'number':
                case 'regexp':
                case 'string':

                    // Get the string representation of the object
                    var $string = this._window[$global].prototype.toString.call($object);

                    // If the string is a string
                    if ($$.isString($string))
                        $code
                            // Set the code element text to the string representation of the object
                            .text(' ' + $string);

                    break;

                case 'error':

                    // Get the error message
                    var $message = $object.message;

                    // If the error message is a string
                    if ($$.isString($message))
                        $code
                            // Set the code element text to the error message
                            .text(' ' + $message);

                    break;

                case 'function':

                    // Get the casting function (from the window context), check if the object has a self "toString()" function, and get the object text
                    var $cast = this._window[$global].prototype.toString;
                    var $self = $$.isFunction($object.toString);
                    var $text = $self ? $object.toString() : $cast.call($object);

                    // If the object text is not a string, break
                    if (!$$.isString($text))
                        break;
                    
                    // If no self "toString()" function was found or it was the casting function
                    if (!$self || $object.toString === $cast)
                    {
                        // Format the function header in the text (and remove the function keyword)
                        $text = $text.replace(/^\s*(function)\s*([_\$a-zA-Z]*[_\$a-zA-Z0-9]*)?\s*/, '$2').trim();
                        
                        // If the function does not have a name, set the function as anonymous
                        if ($text[0] === '(')
                            $text = '<anonymous>' + $text;
                    }

                    $code
                        // Set the code element text to the string representation of the function
                        .text(' ' + $text);

                    break;

                default:

                    // Return the code element
                    return $code;
            }

            $code
                // Prepend the global reference name to the code element
                .prepend
                (
                    $('<i />')
                        // Set the text to the global reference name
                        .text($global + ':')
                );
            
            // Return the code element
            return $code;
        },

        // SCROLL
        'scroll': function()
        {
            // Set the scrolling flag
            this._scrolling = true;

            this._output
                // Set the output scrollbar to the bottom
                .scrollTop($$.asInt(Math.max(0, $$.asFloat(this._output.prop('scrollHeight')) - $$.asFloat(this._output.height())), true));

            // Reset the scrolling flag
            this._scrolling = false;
        },

        // KEYDOWN/KEYUP
        '_keydown': function(editor, e)
        {
            // Fix the event argument
            e = $.event.fix(e);

            // Call the keydown method
            this.keydown(e);
        },
        '_keyup':   function(editor, e)
        {
            // Fix the event argument
            e = $.event.fix(e);

            // Call the keyup method
            this.keyup(e);
        },

        // WRAPPERS
        '$assert':         function($expression)
        {
            // FORMAT $expression
            $expression = $$.asBool($expression);

            // If the expression is true, return
            if ($expression)
                return;

            // Write the assert output
            this.write(this.__type.writeAssertClass, this.__type.iconAssert, this.__type.textAssert, arguments, 1);

            // Call the native console function
            if ($$.isFunction(this._console.assert))
                return this._console.assert.apply(this._console, arguments);
        },
        '$clear':          function()
        {
            // Clear the console
            this.clear();

            // Call the native console function
            if ($$.isFunction(this._console.clear))
                return this._console.clear.apply(this._console, arguments);
        },
        '$debug':          function()
        {
            // Write the debug output
            this.write(this.__type.writeDebugClass, this.__type.iconDebug, null, arguments, 0);

            // Call the native console function
            if ($$.isFunction(this._console.debug))
                return this._console.debug.apply(this._console, arguments);
        },
        '$dir':            function()
        {
            // Set the dumping flag
            this._dumping = true;

            // Write the dir output
            this.write(this.__type.writeDirClass, null, null, arguments, 0);

            // Reset the dumping flag
            this._dumping = false;

            // Call the native console function
            if ($$.isFunction(this._console.dir))
                return this._console.dir.apply(this._console, arguments);
        },
        '$error':          function()
        {
            // Write the error output
            this.write(this.__type.writeErrorClass, this.__type.iconError, null, arguments, 0);

            // Call the native console function
            if ($$.isFunction(this._console.error))
                return this._console.error.apply(this._console, arguments);
        },
        '$group':          function($name)
        {
            // Push the group into the console
            this.groupPush($name, false);

            // Call the native console function
            if ($$.isFunction(this._console.group))
                return this._console.group.apply(this._console, arguments);
        },
        '$groupCollapsed': function($name)
        {
            // Push the collapsed group into the console
            this.groupPush($name, true);

            // Call the native console function
            if ($$.isFunction(this._console.groupCollapsed))
                return this._console.groupCollapsed.apply(this._console, arguments);
        },
        '$groupEnd':       function()
        {
            // Pop the current group from the console
            this.groupPop();

            // Call the native console function
            if ($$.isFunction(this._console.groupEnd))
                return this._console.groupEnd.apply(this._console, arguments);
        },
        '$info':           function()
        {
            // Write the info output
            this.write(this.__type.writeInfoClass, this.__type.iconInfo, null, arguments, 0);

            // Call the native console function
            if ($$.isFunction(this._console.info))
                return this._console.info.apply(this._console, arguments);
        },
        '$log':            function()
        {
            // If the trace function is being called
            if (this._tracing)
            {
                // Write the trace output
                this.write(this.__type.writeTraceClass, this.__type.iconTrace, null, [$_stack($$.asString(arguments[0]), this._evaluating)], 0);

                // Reset the tracing flag
                this._tracing = false;
            }
            // Write the log output
            else
                this.write(this.__type.writeLogClass, null, null, arguments, 0);

            // Call the native console function
            if ($$.isFunction(this._console.log))
                return this._console.log.apply(this._console, arguments);
        },
        '$profile':        function($name)
        {
            // FORMAT $name
            $name = $$.asString($name);

            // If a native console function is found
            if ($$.isFunction(this._console.profile))
            {
                // Set the profile flag in the profiles lookup
                this._profiles[$name] = true;

                // Write the profile output
                this.write(this.__type.writeProfileClass, this.__type.iconProfile, $$.format(this.__type.textProfile, $name), [], 0);

                // Call the native console function
                return this._console.profile.apply(this._console, arguments);
            }
            // Write the unsupported profile output
            else
                this.write(this.__type.writeProfileClass + ' ' + this.__type.unsupportedClass, this.__type.iconProfile, this.__type.textProfileUnsupported, [], 0);
        },
        '$profileEnd':     function($name)
        {
            // FORMAT $name
            $name = $$.asString($name);

            // If a native console function is found
            if ($$.isFunction(this._console.profileEnd))
            {
                // If a profile flag was set in the profiles lookup, write the profile output
                if (this._profiles[$name])
                    this.write(this.__type.writeProfileEndClass, this.__type.iconProfile, $$.format(this.__type.textProfileEnd, $name), [], 0);

                // Reset the profile flag in the profiles lookup
                this._profiles[$name] = false;

                // Call the native console function
                return this._console.profileEnd.apply(this._console, arguments);
            }
        },
        '$time':           function($name)
        {
            // FORMAT $name
            $name = $$.asString($name);

            // If any arguments were provided and a timer was not already set
            if (arguments.length && !$$.isFinite(this._timers[$name]))
            {
                // Set the timer ticks
                this._timers[$name] = Date.now();

                // Write the time output
                this.write(this.__type.writeTimeClass, this.__type.iconTime, this.__type.textTime, [$name], 0);
            }

            // Call the native console function
            if ($$.isFunction(this._console.time))
                return this._console.time.apply(this._console, arguments);
        },
        '$timeEnd':        function($name)
        {
            // FORMAT $name
            $name = $$.asString($name);

            // If any arguments were provided
            if (arguments.length)
            {
                // Get the timer ticks
                var $timestamp = this._timers[$name];

                // If the timer ticks were set
                if ($$.isFinite($timestamp))
                {
                    // Write the time output
                    this.write(this.__type.writeTimeEndClass, this.__type.iconTime, this.__type.textTimeEnd, [$name], 0);

                    // Write the timer output
                    this.write(this.__type.writeTimerClass, this.__type.iconTimer, $$.format(this.__type.textTimer, Date.now() - $timestamp), [], 0);

                    // Reset the timer
                    this._timers[$name] = null;
                }
            }

            // Call the native console function
            if ($$.isFunction(this._console.timeEnd))
                return this._console.timeEnd.apply(this._console, arguments);
        },
        '$timeStamp':      function()
        {
            // Get the current date and time
            var $date = new Date();

            // Get the hours, minutes, seconds, and milliseconds from the date
            var $hours        = $_pad($date.getHours(), 2);
            var $minutes      = $_pad($date.getMinutes(), 2);
            var $seconds      = $_pad($date.getSeconds(), 2);
            var $milliseconds = $_pad($date.getMilliseconds(), 3);

            // Write the timestamp output
            this.write(this.__type.writeTimeStampClass, this.__type.iconTime, $hours + ':' + $minutes + ':' + $seconds + '.' + $milliseconds, [], 0);

            // Call the native console function
            if ($$.isFunction(this._console.timeStamp))
                return this._console.timeStamp.apply(this._console, arguments);
        },
        '$trace':          function()
        {
            // Create an error and get the stack trace
            var $error  = new Error();
            var $stack  = $$.asString($error.stack);
            var $return = undefined;

            // Set the tracing flag
            this._tracing = true;

            // Call the native console function
            if ($$.isFunction(this._console.trace))
                $return = this._console.trace.apply(this._console, arguments);

            // If no stack trace was found and a trace log was not intercepted
            if (!$stack && this._tracing)
            {
                try
                {
                    // Throw an error
                    undefined();
                }
                catch(e)
                {
                    // Get the stack trace
                    $stack = $$.asString(e.stack);
                }
            }

            // If a stack trace was found, write the trace output
            if ($stack)
                this.write(this.__type.writeTraceClass, this.__type.iconTrace, null, [$_stack($stack, this._evaluating)], 0);
            // If a trace log was not intercepted, write the unsupported trace output
            else if (this._tracing)
                this.write(this.__type.writeTraceClass + ' ' + this.__type.unsupportedClass, this.__type.iconTrace, this.__type.textTraceUnsupported, [], 0);

            // Reset the tracing flag
            this._tracing = false;

            // Return the native console function return value
            return $return;
        },
        '$warn':           function()
        {
            // Write the warn output
            this.write(this.__type.writeWarnClass, this.__type.iconWarn, null, arguments, 0);

            // Call the native console function
            if ($$.isFunction(this._console.warn))
                return this._console.warn.apply(this._console, arguments);
        }
    },
    // ----- PROTECTED -----
    {
        // CACHE + HISTORY
        '_cache':   '',
        '_history': [],
        '_index':   -1,

        // INPUT/OUTPUT
        '_input':  $(),
        '_output': $(),

        // GROUPS
        'groupPop':  function()
        {
            // If no groups are cached, return
            if (this._groups.length === 0)
                return;

            this._groups[0]
                // Get the group
                .parent()
                    // Add the groupEnd class to the current group
                    .addClass(this.__type.groupEndClass);

            // Shift the current group from the groups array
            this._groups.shift();
        },
        'groupPush': function($name, $collapsed)
        {
            // FORMAT $name
            // FORMAT $collapsed
            $name      = $$.asString($name);
            $collapsed = $$.asBool($collapsed);

            // Create the group, output, and title elements
            var $group  = $('<div />');
            var $output = $('<div />');
            var $title  = $('<p />');

            $group
                // Add the group class to the group
                .addClass(this.__type.groupClass)
                // Append the title to the group
                .append
                (
                    $title
                        // Set the title text
                        .text($name)
                        // Prepend the icon to the title
                        .prepend
                        (
                            $('<img />')
                                // Set the image source
                                .attr('src', this.__type.iconGroup)
                        )
                        // Bind the click event handler to the title
                        .on('click', this, this.__type._group_click)
                )
                // Append the output to the group
                .append($output);

            // If the group is initially collapsed
            if ($collapsed)
                $group
                    // Add the collapsed class to the group
                    .addClass(this.__type.groupCollapsedClass);

            // If any groups are cached
            if (this._groups.length > 0)
                this._groups[0]
                    // Append the group to the current group
                    .append($group);
            else
                this._output
                    // Append the group to the output
                    .append($group);

            // If the group is initially collapsed
            if ($collapsed)
                $output
                    // Collapse the output
                    .slideUp(0);

            // Unshift the output into the groups array
            this._groups.unshift($output);
        },

        // KEYDOWN/KEYUP
        'virtual keydown': function(e)
        {
            // If either the up or down arrows were pressed
            if (e.which == 38 || e.which == 40)
            {
                // Get the cursor position
                var $cursor = this._editor.getCursor();

                // If the up arrow was pressed while on the first line
                if (e.which == 38 && $cursor.line == 0)
                {
                    // Prevent the default behavior of the key
                    e.preventDefault();

                    // Go back in the history
                    this.back();
                }
                // If the down arrow was pressed while on the last line
                else if (e.which == 40 && $cursor.line == this._editor.lineCount() - 1)
                {
                    // Prevent the default behavior of the key
                    e.preventDefault();

                    // Go forward in the history
                    this.forward();
                }
            }
            // If the control key and the enter key were pressed
            else if (e.ctrlKey && e.which == 13)
            {
                // Prevent the default behavior of the key
                e.preventDefault();

                // Call the evaluate method
                this.evaluate();
            }
            // If a non-arrow key was pressed and the code editor is currently at a valid history index, reset the history index (which will clear the cache)
            else if ((e.which < 37 || e.which > 40) && this._index >= 0)
                this._index = -1;
        },
        'virtual keyup':   $$.empty(),

        // WRITE
        'write': function($class, $icon, $title, $arguments, $index)
        {
            // FORMAT $class
            // FORMAT $icon
            // FORMAT $title
            // FORMAT $arguments
            // FORMAT $index
            $class     = $$.asString($class);
            $icon      = $$.asString($icon);
            $title     = $$.asString($title);
            $arguments = !$$.isArrayLikeObject($arguments) ? $$.asArray($arguments) : $arguments;
            $index     = $$.asInt($index, true);

            // Create the output element
            var $output = $('<p />')
                // Add the class to the output element
                .addClass($class);

            // If an icon was provided
            if ($icon)
                $output
                    // Append an image element to the output element
                    .append
                    (
                        $('<img />')
                            // Set the image element source to the icon
                            .attr('src', $icon)
                    );

            // If a title was provided
            if ($title)
                $output
                    // Append a title element to the output element
                    .append
                    (
                        $('<span />')
                            // Add the title class to the title element
                            .addClass(this.__type.titleClass)
                            // Set the title element text as the title
                            .text($title)
                    );

            for (var $i = $index, $j = $arguments.length; $i < $j; $i++)
            {
                // Get the current argument and its type (using the jTypes instance in the window context, if available)
                var $argument = $arguments[$i];
                var $type     = this._window.jTypes ? this._window.jTypes.type($argument) : $$.type($argument);

                $output
                    // Append the created dump element of the current argument to the output element
                    .append(this.dump($argument));

                // ########## UNFINISHED ##########

                // If the console is throwing an exception and the current argument is an error
                if (this._throwing && $type === 'error')
                {
                    // SHOW TRACE (AS PLUS SIGN WITH SLIDEDOWN)
                }
                // If the console is dumping or the current argument is an enumerable object
                else if (this._dumping || $type === 'array' || $type === 'class' || $type === 'instance' || $type === 'object' || $type === 'window')
                {
                    // SHOW KEY-VALUE DUMPS (AS PLUS SIGN WITH SLIDEDOWN)
                }

                // ########## UNFINISHED ##########
            }
            
            // If any groups exist
            if (this._groups.length > 0)
                this._groups[0]
                    // Append the output element to the current group
                    .append($output);
            else
                this._output
                    // Append the output element to the output
                    .append($output);

            // If the output is not locked, scroll the output element to the bottom
            if (!this._locked)
                this.scroll();
        }
    },
    // ----- PUBLIC -----
    {
        // CLEAR
        'virtual clear': function($value)
        {
            // Empty the output
            this._output
                .empty();

            // Reset the groups array
            this._groups = [];

            // If any arguments were provided
            if (arguments.length > 0)
            {
                // Get the current console value
                var $previous = this.value;

                // Set the new console value
                this.value = $$.asString($value);

                // Return the previous console value
                return $previous;
            }
        },

        // EVALUATE
        'virtual evaluate': function($value)
        {
            // Check if any arguments were provided and get the code
            var $args = arguments.length > 0;
            var $eval = $$.asString($args ? $value : this._editor.getValue());

            // If no code was provided, return
            if (!$eval)
                return;

            // Clear the console cache and reset the history index
            this._cache = '';
            this._index = -1;

            // If the code is different from the most recent history
            if (this._history[this._history.length - 1] !== $eval)
            {
                // Push the code into the history array
                this._history.push($eval);

                // If the history array exceeded the maximum, shift the oldest history from the history array
                if (this._history.length > this.__type.historyMaximum)
                    this._history.shift();

                // If local storage is supported and a name was provided
                if (localStorage && this.name)
                {
                    // Create a reference to the cache history array and JSON cache
                    var $history = this._history;
                    var $json    = $$.asString(JSON.stringify($history));

                    // While the JSON cache is too big for the local storage
                    while ($json.length > 2500000)
                    {
                        // Trim the oldest history from the cache history array and create the new JSON cache
                        $history = $$.asArray($history.slice(1));
                        $json    = $$.asString(JSON.stringify($history));
                    }

                    // Cache the JSON cache in the local storage
                    localStorage.setItem(this.__type.cachePrefix + this.name + '.history', $json);
                }
            }

            // Write the eval output
            this.write(this.__type.writeEvalClass, this.__type.iconEval, null, [$eval], 0);

            try
            {
                // Set the evaluating flag if no arguments were provided
                this._evaluating = !$args;

                // Evaluate the code in the window context and get the return value
                var $return = this._window.eval($eval);

                // Reset the evaluating flag
                this._evaluating = false;

                // Write the return output
                this.write(this.__type.writeReturnClass, this.__type.iconReturn, null, [$return], 0);
            }
            catch(e)
            {
                // Reset the evaluating flag and set the throwing flag
                this._evaluating = false;
                this._throwing   = true;

                // Write the error output
                this.write(this.__type.writeErrorClass, this.__type.iconError, null, [e], 0);

                // Reset the throwing flag
                this._throwing = false;
            }

            // If no arguments were provided
            if (!$args)
            {
                // Scroll the output element to the bottom
                this.scroll();

                // Reset the console value
                this.value = '';
            }
        },

        // VALUE
        'virtual value':
        {
            'get': function()
            {
                // Return the code editor value
                return $$.asString(this._editor.getValue());
            },
            'set': function($v)
            {
                // FORMAT $v
                $v = $$.asString($v);

                // Set the code editor value
                this._editor.setValue($v);
            }
        },

        // BACK/FORWARD
        'virtual back':    function($steps)
        {
            // FORMAT $steps
            $steps = $$.isObject($steps) ? Math.max(0, $$.asInt($steps, true)) : 1;

            // If no history exists, return
            if (!this._history.length)
                return;

            // If no history is being displayed
            if (this._index < 0)
            {
                // Cache the current code editor value and set the history index to the most recent history
                this._cache = this.value;
                this._index = this._history.length - 1;
            }
            // Go back in the history by the number of steps
            else
                this._index -= $steps;

            // Create the character position
            var $ch = 0;

            // If a valid history index was provided
            if (this._index >= 0)
            {
                // Set the code editor value
                this.value = this._history[this._index];

                // Set the character position to the end of the first line
                $ch = this._editor.getLine(0).length;
            }
            // Fix the history index
            else
                this._index = 0;

            // Set the code editor cursor position to the first line
            this._editor.setCursor(0, $ch);
        },
        'virtual forward': function($steps)
        {
            // FORMAT $steps
            $steps = $$.isObject($steps) ? Math.max(0, $$.asInt($steps, true)) : 1;

            // If the code editor is currently at a valid history index
            if (this._index >= 0)
            {
                // Go forward in the history by the number of steps
                this._index += $steps;

                // If going forward has no history left
                if (this._index >= this._history.length)
                {
                    // Reset the history index
                    this._index = -1;

                    // Set the code editor value to the cached value
                    this.value = this._cache;
                }
                // Set the code editor value
                else
                    this.value = this._history[this._index];

                // Get the last line index and last character position of the last line
                var $line = this._editor.lineCount() - 1;
                var $ch   = this._editor.getLine($line).length;

                // Set the code editor cursor position to the last line
                this._editor.setCursor($line, $ch);
            }
        }
    },
    // ----- STATIC -----
    {
        // EVENTS
        'static const _controls_clear_click': function(e)
        {
            // If the mouse key is not a left click, return
            if (e.which !== 1)
                return;

            // Get the private instance
            var $this = e.data;

            // Clear the console value
            $this.value = '';
        },
        'static const _controls_eval_click':  function(e)
        {
            // If the mouse key is not a left click, return
            if (e.which !== 1)
                return;

            // Get the private instance
            var $this = e.data;

            // Evaluate the console
            $this.evaluate();
        },
        'static const _group_click':          function(e)
        {
            // If the mouse key is not a left click, return
            if (e.which !== 1)
                return;

            // Get the private instance, the group element, and check if the group is collapsed
            var $this      = e.data;
            var $element   = $(this).parent();
            var $collapsed = !!$element.hasClass($this.__type.groupCollapsedClass);

            $element
                // Toggle the group collapsed class
                .toggleClass($this.__type.groupCollapsedClass)
                // Filter the output elements
                .children('div')
                    // Get the output element
                    .last()
                        // Toggle the slide
                        [$collapsed ? 'slideDown' : 'slideUp']($this.__type.durationGroupSlide);
        },
        'static const _output_scroll':        function(e)
        {
            // Get the private instance
            var $this = e.data;

            // If the console is internally scrolling, return
            if ($this._scrolling)
                return;

            // Set the locked flag
            $this._locked = $$.asInt($this._output.scrollTop(), true) < $$.asInt(Math.max(0, $$.asFloat($this._output.prop('scrollHeight')) - $$.asFloat($this._output.height())), true);
        },
        
        'static buttonClassClear':       'buttonClear',
        'static buttonIconClear':        $_icon('clear'),
        'static buttonClassEval':        'buttonEval',
        'static buttonIconEval':         $_icon('dir'),
        'static cachePrefix':            '~jT_Console:',
        'static controlsClass':          'controls',
        'static durationGroupSlide':     400,
        'static gridClass':              'console',
        'static gridMaximum':            90,
        'static gridMinimum':            15,
        'static groupClass':             'group',
        'static groupCollapsedClass':    'collapsed',
        'static groupEndClass':          'closed',
        'static historyMaximum':         50,
        'static iconAssert':             $_icon('error'),
        'static iconDebug':              $_icon('debug'),
        'static iconError':              $_icon('error'),
        'static iconEval':               $_icon('eval'),
        'static iconGroup':              $_icon('dir'),
        'static iconInfo':               $_icon('info'),
        'static iconProfile':            $_icon('profile'),
        'static iconReturn':             $_icon('return'),
        'static iconTime':               $_icon('time'),
        'static iconTimer':              $_icon('timer'),
        'static iconTrace':              $_icon('trace'),
        'static iconWarn':               $_icon('warn'),
        'static primitiveClass':         'primitive',
        'static primitiveStringClass':   'string',
        'static textAssert':             'Assertion Failed:',
        'static textProfile':            'Profile "{0}" started.',
        'static textProfileEnd':         'Profile "{0}" finished.',
        'static textProfileUnsupported': 'JavaScript profiling is not supported by this browser.',
        'static textTime':               'Timer Started:',
        'static textTimeEnd':            'Timer Stopped:',
        'static textTimer':              '{0} ms elapsed.',
        'static textTraceUnsupported':   'Stack tracing is not supported by this browser.',
        'static titleClass':             'prefix',
        'static unsupportedClass':       'unsupported',
        'static writeAssertClass':       'assert',
        'static writeDebugClass':        'debug',
        'static writeDirClass':          'dir',
        'static writeErrorClass':        'error',
        'static writeEvalClass':         'eval',
        'static writeInfoClass':         'info',
        'static writeLogClass':          'log',
        'static writeProfileClass':      'profile',
        'static writeProfileEndClass':   'profile',
        'static writeReturnClass':       'return',
        'static writeTimeClass':         'time',
        'static writeTimeEndClass':      'time',
        'static writeTimerClass':        'timer',
        'static writeTimeStampClass':    'timestamp',
        'static writeTraceClass':        'trace',
        'static writeWarnClass':         'warn'
    });
})(window, jQuery, jTypes);