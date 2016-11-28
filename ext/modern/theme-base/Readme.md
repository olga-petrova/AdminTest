#Ext JS Modern Toolkit Theming Guidelines

##Variable Naming Conventions

Variables should generally begin with an xtype, and end with the CSS property name being styled, for example:

    $button-font-family: helvetica !dynamic;
    $button-color: #fff !dynamic;
    $button-background-color: red !dynamic;

If the component has various states such as over, focus, and pressed, the name of the state should come immediately after the xtype, but before the CSS property name in question.  Components should use the following state names: “over”, “focus”, “pressed”, “over-focus”, “pressed-focus”, and “disabled”.

    $button-over-background-color: blue !dynamic;

If the components has variables that control the styling of sub-elements, the name of the sub-element being styled should be included after the xtype, and state if present.  For example, when styling the button’s “badge” element:

    $button-badge-color: #fff !dynamic;
    $button-over-badge-color: green !dynamic;

If however, the “state” refers to a sub-element, it should come after that element’s name.  For example, if a tab has a close icon that has a separate hover state from the tab:

    $tab-close-icon-over-background-color: red !dynamic;

Components should have separate variables for border-width, border-color, and border-style, and all three properties should accept either a single value or a list of values so that 4 sides can be specified separately if needed:

    // BAD
    $button-border: 1px solid green !dynamic;

    // GOOD
    $button-border-color: red yellow green blue !dynamic;
    $button-border-width: 1px 3px !dynamic;
    $button-border-style: dotted !dynamic;

##Component UIs

Every component should have a UI mixin for generating multiple visual renditions of that component.   The mixin should be named “[xtype]-ui”.  For example “button-ui” or “panel-ui”.  

UI mixins should have a parameter for each of the component’s global variables, and the parameter names should be the same as the global variable names with the exception that the mixin parameters should not contain the xtype in their names.  For example, a global variable named $button-border-radius, would correspond to a parameter of the button-ui() mixin named $border-radius.

The parameters to the UI mixin should all default to null, and should not produce any output if unspecified by the caller.  This means that when the mixin is invoked it should produce a set of styling that represents a delta from the default UI.  This minimizes the number of css rules required to create new UIs since the mixin automatically eliminates any null values from the output.

The styling for the default UI should be applied using CSS class names that do not contain a UI name, for example “x-button”, not “x-button-default”.  This is the key to minimizing the number of rules required to create additional UIs, since all buttons will have the “x-button” class in addition to a “x-button-[ui]” class.  It allows the default UI to serve as a base set of styles for all other UIs.

A typical UI mixin should look something like this:

    @mixin button-ui(
        $ui: null
        $background-color: null,
        $border-radius: null
    ) {
        // returns '' if $ui is null, otherwise prefixes $ui with "-"
        // To generate default UI we will not pass the $ui parameter
        $ui-suffix: ui-suffix($ui);
        
        .x-button#{$ui-suffix} {
            // Fashion compiler removes null values from output
            // If all values are null, the entire rule is eliminated.
            // This means there is usually no need to check == null
            background-color: $background-color;
            border-radius: $border-radius;
        }
    }

Since all UI mixin parameters default to null, the default UI invocation must explicitly pass all the global variables for the component.  This generates the set of base styling rules for the component that all other UIs build upon.  Note that this invocation does not pass $ui so that the base styles are applied to the base “x-button” class, not a UI-specific one:

    @include button-ui(
        $background-color: $button-background-color,
        $border-radius: $button-border-radius
    );

To generate additional UIs, invoke the mixin again, passing only the parameters that are different from the default UI.  For example, the following mixin call generates a UI named “action” that builds upon the default UI by changing the background-color to red, but inherits all other properties from the default UI via the cascade.  The output from this UI invocation is very minimal - it only contains the rule or rules needed to set the background-color, nothing else.

    @include button-ui(
        $ui: 'action',
        $background-color: red
    );

##Configuring Theme UIs in Derived Themes

In the classic toolkit additional UIs provided with a theme typically were accompanied by a complete set of global variables for configuring that UI in derived themes.  This resulted in massive amounts of duplication (variable count = total component vars * number of UIs).  The modern toolkit takes a simpler approach - additional UIs provided by a theme are NOT configurable via global variables.  Instead, these UIs are wrapped in a mixin of their own, which can be overridden by derived themes to change the parameters:

    @mixin button-action-ui() {
        @include button-ui(
            $ui: 'action',
            $background-color: red
        );
    }

Themes should also provide a single variable for each additional UI that defaults to “true” but can be overridden to “false” in derived themes to completely disable generation of the UI.  This variable should have the same name as the corresponding mixin:

    @if $button-action-ui {
        @include button-action-ui;
    }

##Composable UIs

UIs should be composable where possible.  For example if 2 separate button renditions are required, a red “action” button, and a rounded red “action” button, simply create an “action” UI and  “round” UI:

    @mixin button-action-ui() {
        @include button-ui(
            $ui: 'action',
            $background-color: red
        );
    }

    @mixin button-round-ui() {
        @include button-ui(
            $ui: 'round',
            $border-radius: 10000px
        );
    }

    @if $button-action-ui {
        @include button-action-ui
    }

    @if $button-round-ui {
        @include button-round-ui
    }

To compose UIs simply use any number of UI names, space separated, in your component config:

    ui: 'action round'

Note, that if multiple UIs set the same properties, the winner is the last one in the cascade, i.e. the one whose mixin was invoked last.  To avoid confusion, composable UIs should typically strive to limit their area of concern to separate aspects of styling (colors, sizing, border-radius, etc), so that there is little or no ambiguity when combining them.

Using composable UIs ensures that the generated CSS code remains very DRY, by avoiding unnecessary duplication of CSS rules.  In the example above, we avoid duplication of the background-color rules for every UI that may optionally need roundness, since any UI can be combined with the “round” UI to add roundness.

##Size Optimizing Mixins

Some css properties (like border-width, border-color, and border-style) can sometimes be collapsed in to a single property (border).  Themes should use mixins that intelligently collapse these properties if possible to optimize CSS file size.

Pass border variables to the “border” mixin to collapse them into a single border declaration if possible.  If any values are null or if any values are a list then it will output separate border-width, border-color, and border-style properties, otherwise it will output a single border property

    .x-foo {
        @include border($border-width, $border-style, $border-color);
    }

Likewise the “font” mixin should always be used for generating a font declaration from variables, since it also collapses properties into a single “font” property if possible

    .x-foo {
      @include font($font-weight, $font-size, $line-height, $font-family);
    }
