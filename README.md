Vault for Chrome - Leap Motion Controller Integration for Chrome
=========================

A simple extension for using the Leap Motion Controller with Chrome.

The idea is to add little features to Chrome that take advantage of the Leap Motion Controller.

Obviously, this extension requires a Leap Motion Controller to function.

Current features:
* One Hand Scrolling: Put a hand over the Leap Motion Controller and 
extend four or more fingers (five is the most comfortable position). The
extension will then use the orientation of your hand to scroll horizontally
or vertically.
* Swipe left to navigate back, and swipe right to navigate forward
* Circle clockwise to move to next tab, and circle counter clockwise to move to previous tab

**Known Limitations**:
* The scroll currently does not work on PDFs, chrome:// sites, and may not work on other particular pages.
This is in part because of a limitation of the permissions that you can get for an extension, and the way that
you have to perform scroll on a page. It may be fixed in the future, but is not easy, so it may take a while.
* The scroll also does not work properly on pages that have an "inner" scroll. For example, gmail, or docs editor.
This is because those pages can't be scrolled with the window.scrollBy method of JavaScript. A fix that could work
is to fake a "mouseScroll" event on the page, using the current position of the mouse. That should allow for a more
versatile scroll.
