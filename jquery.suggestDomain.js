;(function ($, undefined) {
  
  'use strict';

  var pluginName = 'suggestDomain';
  
  var defaults = {
    'class': 'suggest-domain',
    'domains': []
  };
  
  var Plugin = function (element, options) {
    this.element = element;
    if ($.isArray(options)) {
      options = { domains: options };
    }
    this.options = $.extend({}, defaults, options, $(element).data());
    this.init();
  };
  
  Plugin.prototype.init = function () {
    var $input = $(this.element);
    var $wrapper = $('<div>', { 'class': this.options.class });
    $input.attr('autocomplete', 'off')
      .attr('spellcheck', 'false')
      .wrap($wrapper);
    var $list = this.$list = $('<ul>').addClass('hide').insertAfter($input);
    $.each(this.options.domains, function (index, text) {
      $('<li>').text(text).appendTo($list);
    });
    this.on($input, 'keydown', this.onKeydown);
    this.on($input, 'keyup', this.onKeyup);
    this.on($input, 'keypress', this.onKeypress);
    this.on($list, 'click', this.onClick);
  };
  
  Plugin.prototype.on = function (elements, eventType, eventHandler) {
    var matches = eventType.match(/^(\S+)(\s+(.+))?$/);
    $(elements).on(matches[1], matches[3], $.proxy(eventHandler, this));
  };
  
  Plugin.prototype.onKeydown = function (e) {
    switch (e.keyCode) {
      case 13: // Enter
        this.onEnterKey(e);
        break;
      case 27: // Esc
        this.onEscKey(e);
        break;
      case 38: // Up
        this.onUpKey(e);
        break;
      case 40: // Down
        this.onDownKey(e);
        break;
    }
  };

  Plugin.prototype.onKeyup = function (e) {
    if (e.keyCode === 13 || e.keyCode === 27) {
      return;
    }
    var value = this.element.value;
    var signPos = value.indexOf('@');
    var signIsPresent = signPos !== -1;
    if (signIsPresent) {
      var re = new RegExp(value.slice(signPos + 1));
      this.$list.children().each(function () {
        $(this).toggleClass('hide', !re.test(this.innerText));
      });
    }    
    this.$list.toggleClass('hide', !signIsPresent);
  };

  Plugin.prototype.onKeypress = function (e) {
    var char = String.fromCharCode(e.keyCode);
    var value = this.element.value;
    var signWasPresent = value.indexOf('@') !== -1;
    if (char === '@' && (signWasPresent || !value)) {
      e.preventDefault();
    }
    if (char === ' ') {
      e.preventDefault();
    }
  };

  Plugin.prototype.onClick = function (e) {
    e.preventDefault();
    this.set(e.target);
  };

  Plugin.prototype.onEnterKey = function (e) {
    e.preventDefault();
    this.set(this.selected());
  };

  Plugin.prototype.onEscKey = function (e) {
    e.preventDefault();
    this.$list.addClass('hide');
  };

  Plugin.prototype.onUpKey = function (e) {
    if (this.$list.is(':not(.hide)')) {
      e.preventDefault();
      var $prevOption = this.prev();
      if ($prevOption.length) {
        this.select($prevOption)
      } else {
        this.select(this.last());
      }
    }
  };

  Plugin.prototype.onDownKey = function (e) {
    if (this.$list.is(':not(.hide)')) {
      e.preventDefault();
      var $nextOption = this.next();
      if ($nextOption.length) {
        this.select($nextOption)
      } else {
        this.select(this.first());
      }
    }
  };

  Plugin.prototype.first = function () {
    return this.$list.children(':not(.hide)').first();
  };

  Plugin.prototype.last = function () {
    return this.$list.children(':not(.hide)').last();
  };

  Plugin.prototype.selected = function () {
    return this.$list.children('.selected').first();
  };

  Plugin.prototype.prev = function () {
    return this.selected().prevAll(':not(.hide)').first();
  };

  Plugin.prototype.next = function () {
    return this.selected().nextAll(':not(.hide)').first();
  };

  Plugin.prototype.select = function (option) {
    $(option).addClass('selected').siblings().removeClass('selected');
  };
  
  Plugin.prototype.set = function (option) {
    var domain = $(option).text();
    var user = this.element.value.split('@')[0];
    $(this.element).val(user + '@' + domain).focus();
    this.$list.addClass('hide');
  };

  var pluginHandler = function (options) {
    return this.each(function () {
      if (!$(this).data('plugin_' + pluginName)) {
        $(this).data('plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };
  
  $.fn[pluginName] = pluginHandler;
  
 
}(jQuery));
