exports.init = function (runtime) {
    runtime.register({
        get_color: function (variableName, useValue) {
            var rt = this.getRuntime(),
                value = rt.unbox(rt.get('$' + Fashion.getJsName(rt.unbox(variableName)))),
                useCSSVariables = rt.unbox(rt.get('$enable_css_color_variables')),
                useCSSVariablesFallback = rt.unbox(rt.get('$enable_css_color_variables_fallback'));

            if (useCSSVariables && !useValue) {
                return new Fashion.Literal('var(--' + rt.unbox(variableName) + (useCSSVariablesFallback ? ', ' + value : '') + ')');
            } else {
                return value;
            }
        }
    });
};