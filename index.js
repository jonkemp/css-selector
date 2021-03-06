/**
 * Module dependencies.
 */

const parser = require('slick').parse;

/**
* Parses a selector and returns the tokens.
*
* @param {String} selector
* @api private.
*/

function parse(text) {
    try {
        return parser(text)[0];
    } catch (e) {
        return [];
    }
}

/**
* Returns specificity based on selector text and tokens.
*
* @param {String} selector
* @param {Array} tokens
* @api private.
*/

function getSpecificity(text, parsed) {
    const expressions = parsed || parse(text);
    const spec = [ 0, 0, 0, 0 ];
    const nots = [];
    let i;
    let expression;
    let pseudos;
    let p;
    let ii;
    let not;
    let jj;

    for (i = 0; i < expressions.length; i++) {
        expression = expressions[i];
        pseudos = expression.pseudos;

        // id awards a point in the second column
        if (expression.id) {
            spec[1]++;
        }

        // classes and attributes award a point each in the third column
        if (expression.attributes) {
            spec[2] += expression.attributes.length;
        }
        if (expression.classList) {
            spec[2] += expression.classList.length;
        }

        // tag awards a point in the fourth column
        if (expression.tag && expression.tag !== '*') {
            spec[3]++;
        }

        // pseudos award a point each in the fourth column
        if (pseudos) {
            spec[3] += pseudos.length;

            for (p = 0; p < pseudos.length; p++) {
                if (pseudos[p].key === 'not') {
                    nots.push(pseudos[p].value);
                    spec[3]--;
                }
            }
        }
    }

    for (ii = nots.length; ii--;) {
        not = getSpecificity(nots[ii]);
        for (jj = 4; jj--;) {
            spec[jj] += not[jj];
        }
    }

    return spec;
}

/**
 * CSS selector constructor.
 *
 * @param {String} selector text
 * @param {Array} optionally, precalculated specificity
 * @api public
 */

module.exports = (text, spec) => {
    let tokens;
    let _spec = spec;

    /**
     * Get parsed selector.
     *
     * @api public
     */

    const parsed = () => {
        if (!tokens) {
            tokens = parse(text);
        }
        return tokens;
    };

    /**
     * Lazy specificity getter
     *
     * @api public
     */

    const specificity = () => {
        if (!spec) {
            _spec = getSpecificity(text, parsed());
        }
        return _spec;
    };

    return {
        text: text,

        spec: _spec,

        parsed: parsed,

        specificity: specificity
    };
};
