var Remarkable = require('remarkable');
var remarkable = new Remarkable({});

var _ = require('../../shared/underscore');
var React = require('react');

function basicContainerTag(tagName, tokenName) {
    var tokenName = tokenName || tagName;
    return function(tokens, startNum) {
        var ret = makeTags(tokens, startNum + 1, tokenName + '_close');
        return [React.createElement(tagName, null, ret[0]), ret[1] + 1]
    }
}

function basicEmptyTag(tagName) {
    return function(tokens, startNum) {
        return [React.createElement(tagName, null, null), startNum + 1];
    }
}

var types = {
    inline: function(tokens, startNum) {
        var openingTag = tokens[startNum];
        var ret = makeTags(openingTag.children, 0);
        return [React.createElement('span', null, ret[0]), startNum + 1];
    },
    text: function(tokens, startNum) {
        return [tokens[startNum].content, startNum + 1];
    },
    heading: function(tokens, startNum) {
        var openingTag = tokens[startNum];
        var ret = makeTags(tokens, startNum + 1, 'heading_close');
        return [React.createElement('h' + openingTag.hLevel, null, ret[0]), ret[1] + 1];
    },
    fence: function(tokens, startNum) {
        var openingTag = tokens[startNum];
        return [React.createElement('pre', null, [React.createElement('code', null, [openingTag.content])]), startNum + 1];
    },

    blockquote: basicContainerTag('blockquote'),
    paragraph: basicContainerTag('p', 'paragraph'),
    strong: basicContainerTag('b', 'strong'),
    em: basicContainerTag('em'),

    bullet_list: basicContainerTag('ul', 'bullet_list'),
    ordered_list: function(tokens, startNum) {
        var ret = makeTags(tokens, startNum + 1, 'ordered_list' + '_close');
        return [React.createElement('ol', {start: tokens[startNum].order}, ret[0]), ret[1] + 1];
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

function makeTag(tokens, startNum) {
    var openingTag = tokens[startNum];
    var tagType = openingTag.type;
    var typeMake = types[getTypeInfo(tagType)];
    if (!typeMake) {
        console.log("Markdown renderer: Unimplemented type: ", getTypeInfo(tagType));
    }
    return typeMake(tokens, startNum);
}

function makeTags(tokens, startNum, stopType) {
    var i = startNum;
    var result = [];
    while(i < tokens.length && tokens[i].type !== stopType) {
        var ret = makeTag(tokens, i);
        result.push(ret[0]);
        i = ret[1];
    }

    return [result, i];
}

module.exports = {
    renderText: function(text) {
        return this.renderTokens(remarkable.parse(text, {}));
    },
    renderTokens: function(tokens) {
        var tags = makeTags(tokens, 0, null);
        return React.createElement('div', null, tags[0]);
    }
};