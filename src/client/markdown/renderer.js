var Remarkable = require('remarkable');

var _ = require('../../shared/underscore');
var React = require('react');
var DocumentRendererComponent = require('../react_components/ComponentHTMLDisplay');

// TODO: Emit line numbers

var remarkable = new Remarkable({
    html: false, // TODO: Make simple html work
    linkify: true,
    typographer: true
});
remarkable.inline.ruler.enable([
    'sub',
    'sup'
]);
remarkable.core.ruler.enable([
    'abbr'
]);

/**
 * Makes a function that takes an array of tokens and a start index and returns a react element.
 * Presumes that a closing token follows.
 * This is used for simple tags without any additional required logic. (like divs, table, ul)
 * @param tagName
 * @param [tokenName] optional, defaults to tagName
 * @returns {Function}
 */
function basicContainerTag(tagName, tokenName) {
    var tokenNameS = tokenName || tagName;
    return function(tokens, startNum) {
        var ret = makeTags(tokens, startNum + 1, tokenNameS + '_close');
        return [React.createElement(tagName, null, ret[0]), ret[1] + 1]
    }
}

/**
 * Makes a function that takes an array of tokens and a start index and returns a react element.
 * Presumes that the tag is singular, without any content. It will not attempt to parse any other tokens than the one
 * at the index.
 * @param tagName
 * @returns {Function}
 */
function basicEmptyTag(tagName) {
    return function(tokens, startNum) {
        return [React.createElement(tagName, null, null), startNum + 1];
    }
}

var types = {
    inline: function(tokens, startNum, token) {
        var ret = makeTags(token.children, 0);
        return [ret[0], startNum + 1];
        // React.createElement('span', null, ret[0])
    },
    text: function(tokens, startNum) {
        return [tokens[startNum].content, startNum + 1];
    },
    paragraph: function(tokens, startNum, token) {
        var containing = makeTags(tokens, startNum + 1, 'paragraph_close');
        if (token.tight) {
            return [containing[0], containing[1] + 1];
            // React.createElement('span', {'line': token.lines[0]},
        } else {
            return [React.createElement('p', null, containing[0]), containing[1] + 1];
        }
    },
    heading: function(tokens, startNum, token) {
        var ret = makeTags(tokens, startNum + 1, 'heading_close');
        return [React.createElement('h' + token.hLevel, {'line': token.lines[0]}, ret[0]), ret[1] + 1];
    },

    fence: function(tokens, startNum, token) {
        return [React.createElement('pre', null, [React.createElement('code', null, [token.content])]), startNum + 1];
    },
    code: function(tokens, startNum, token) {
        var element = React.createElement('code', null, [token.content]);
        if (token.block) {
            element = React.createElement('pre', null, [element]);
        }
        return [element, startNum + 1];
    },

    htmlblock: function(tokens, startNum, token) {
        // TODO
        return [/*React.createElement(DocumentRendererComponent, {html: token.content})*/ null, startNum + 1];
    },
    htmltag: function(tokens, startNum, token) {
        // TODO
        return [null, startNum + 1];
    },

    blockquote: basicContainerTag('blockquote'),
    strong: basicContainerTag('b', 'strong'),
    em: basicContainerTag('em'),
    del: basicContainerTag('del'),
    sub: function(tokens, startNum, token) {
        return [React.createElement('sub', null, [token.content]), startNum + 1];
    },
    sup: function(tokens, startNum, token) {
        return [React.createElement('sup', null, [token.content]), startNum + 1];
    },
    abbr: function(tokens, startNum, token) {
        var containing = makeTags(tokens, startNum + 1, 'abbr_close');
        return [React.createElement('abbr', {title: token.title || ''}, containing[0]), containing[1] + 1];
    },

    link: function(tokens, startNum, token) {
        var containing = makeTags(tokens, startNum + 1, 'link_close');
        var element = React.createElement('a', {
                href: token.href,
                title: token.title ? token.title : ''
            }, [containing[0]]);
        return [element, containing[1] + 1];
    },
    image: function(tokens, startNum, token) {
        var element = React.createElement('img', {
            src: token.src,
            title: token.title || '',
            alt: token.alt || ''
        }, []);
        return [element, startNum + 1];
    },

    bullet_list: basicContainerTag('ul', 'bullet_list'),
    ordered_list: function(tokens, startNum, token) {
        var ret = makeTags(tokens, startNum + 1, 'ordered_list' + '_close');
        return [React.createElement('ol', {start: token.order}, ret[0]), ret[1] + 1];
    },
    list_item: basicContainerTag('li', 'list_item'),

    table: basicContainerTag('table'),
    thead: basicContainerTag('thead'),
    tbody: basicContainerTag('tbody'),
    th: basicContainerTag('th'),
    tr: basicContainerTag('tr'),
    td: basicContainerTag('td'),

    softbreak: basicEmptyTag('br', 'softbreak'),
    hr: basicEmptyTag('hr')
};

function getTypeInfo(type) {
    if (_.str.endsWith(type, '_open')) {
        var length = type.length;
        return type.substring(0, length - 5);
    } else {
        return type;
    }
}

/**
 * Takes an array of tokens and a start tag and returns a single element (or an array of elements to add to the parent)
 * @param tokens
 * @param startNum
 * @returns {*}
 */
function makeTag(tokens, startNum) {
    var openingTag = tokens[startNum];
    var tagType = openingTag.type;
    var typeMake = types[getTypeInfo(tagType)];
    if (!typeMake) {
        console.log("Markdown renderer: Unimplemented type: ", getTypeInfo(tagType));
    }
    return typeMake(tokens, startNum, openingTag);
}

/**
 * Takes an array of tokens and a start index and returns an array of elements.
 * Calls makeTag to make a tag.
 * Stops eating tokens at stopType.
 * @param tokens
 * @param startNum
 * @param stopType
 * @returns {*[]}
 */
function makeTags(tokens, startNum, stopType) {
    var i = startNum;
    var result = [];
    while(i < tokens.length && tokens[i].type !== stopType) {
        var ret = makeTag(tokens, i);
        if (_.isArray(ret[0])) {
            result = result.concat(ret[0]);
        } else {
            result.push(ret[0]);
        }
        i = ret[1];
    }

    return [result, i];
}

module.exports = {
    /**
     * Parses the markdown string into tokens and renders it to react virtual dom elements.
     * @param text
     * @returns {*}
     */
    renderText: function(text) {
        return this.renderTokens(remarkable.parse(text, {}));
    },

    /**
     * Takes a array of tokens and renders it to react virtual dom elements.
     * @param tokens
     * @returns {*}
     */
    renderTokens: function(tokens) {
        var tags = makeTags(tokens, 0, null);
        return React.createElement('div', null, tags[0]);
    }
};