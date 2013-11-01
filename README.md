# [jTypes: IDE](http://www.jTypes.com/develop) - Work In Progress

## JavaScript Console

The jTypes JavaScript console was built for the upcoming jTypes interactive development environment (IDE). It provides an organized and easily customizable interface that is completely browser-independent. By utilizing jTypes 2.1.7, it demonstrates for developers the many benefits of using a class-based design pattern when working on large scale applications and libraries.

This console can be quite useful for bloggers or on documentation pages to provide your users with the ability to not just read your code or have it highlighted, but also to actually execute it and experiment with it (when applicable).

## How does the JavaScript console work?

The console is instantiated just like any other jTypes class. The first parameter is a reference to the window object that will be wrapped by the console. The second is the jQuery wrapper or DOM element where the console will be inserted. The next two arguments specify the width and height of the console, respectively. These values can be either numbers or strings, and support both percent and pixel values. The next argument is the initial position of the grid slider, which is specified as a percent value of the height. This argument is optional. The final argument is also optional and specifies a unique name for the console. When this value is provided, the console will remember the location of the grid slider and the console history. This information is retained in localStorage and is available even if the browser is closed.

The following code sample shows how to instantiate the console class:

```javascript
jQuery(function($)
{
    window.demo = new $$.dev.Console(window, $('body'), '100%', '100%', 75, 'demo');
});
```
