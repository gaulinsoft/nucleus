# [jTypes: IDE](http://www.jTypes.com/develop) - Work In Progress

## JavaScript Console

The jTypes JavaScript console was built for the upcoming jTypes interactive development environment (IDE). It provides an organized and easily customizable interface that is completely browser-independent. By utilizing jTypes 2.1.7, it demonstrates for developers the many benefits of using a class-based design pattern when working on large scale applications and libraries.

This console can be quite useful for bloggers or on documentation pages to provide your users with the ability to not just read your code or have it highlighted, but also to actually execute it and experiment with it (when applicable).

### How does the JavaScript console work?

The console is instantiated just like any other jTypes class. The first parameter is a reference to the window object that will be wrapped by the console. The second is the jQuery wrapper or DOM element where the console will be inserted. The next two arguments specify the width and height of the console, respectively. These values can be either numbers or strings, and support both percent and pixel values. The next argument is the initial position of the grid slider, which is specified as a percent value of the height. This argument is optional. The final argument is also optional and specifies a unique name for the console. When this value is provided, the console will remember the location of the grid slider and the console history. This information is retained in localStorage and is available even if the browser is closed.

The following code sample shows how to instantiate the console class:

```javascript
jQuery(function($)
{
    window.demo = new $$.dev.Console(window, $('body'), '100%', '100%', 75, 'demo');
});
```

There are four public methods exposed by the console class, along with a public property as well.

#### console.value

The `value` property is a string that references the code in the editor of the console. This property is both readable and writable.

#### console.evaluate(value)

The `evaluate` method has two different ways of being called. When no arguments are provided, the code in the editor is evaluated and cleared. However, if an optional `value` argument is provided, this value will be evaluated instead, and the code inside the editor will not be modified.

#### console.clear(value)

The `clear` method erases the entire output section of the console, and is equivalent to evaluating `console.clear()`. If the optional `value` argument is provided, this value will replace the current code in the editor when the output is cleared.

#### console.back(steps) + console.forward(steps)

The `back` and `forward` methods navigate through the console history. If the optional `steps` argument is provided, the history will be skipped to the respective point in history of the console. If the `steps` argument exceeds the number of available history steps, it will automatically be rounded to the maximum step value. If the optional `name` argument was provided when the console was instantiated, this history will be retained even when the browser is closed.
